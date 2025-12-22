import { ConstructionData, MetricSummary } from './types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const getAvailableMonths = (data: ConstructionData[]): string[] => {
  const months = Array.from(new Set(data.map(d => d.date))).sort();
  return months;
};

export const getAvailableCities = (data: ConstructionData[]): string[] => {
  return Array.from(new Set(data.map(d => d.city)));
};

export const getAvailableStores = (data: ConstructionData[], selectedCity: string): string[] => {
  if (selectedCity === '全部') {
    return Array.from(new Set(data.map(d => d.store)));
  }
  return Array.from(new Set(data.filter(d => d.city === selectedCity).map(d => d.store)));
};

export const calculateMetric = (
  data: ConstructionData[],
  metricKey: keyof ConstructionData,
  currentMonth: string,
  selectedCity: string,
  selectedStore: string
): MetricSummary => {
  // 1. Determine previous month
  const [year, month] = currentMonth.split('-').map(Number);
  let prevYear = year;
  let prevMonthVal = month - 1;
  if (prevMonthVal === 0) {
    prevMonthVal = 12;
    prevYear = year - 1;
  }
  const prevMonthStr = `${prevYear}-${prevMonthVal.toString().padStart(2, '0')}`;

  // 2. Filter functions
  const filterFn = (d: ConstructionData, targetMonth: string) => {
    const monthMatch = d.date === targetMonth;
    const cityMatch = selectedCity === '全部' || d.city === selectedCity;
    const storeMatch = selectedStore === '全部' || d.store === selectedStore;
    return monthMatch && cityMatch && storeMatch;
  };

  // 3. Aggregate
  const currentTotal = data
    .filter(d => filterFn(d, currentMonth))
    .reduce((sum, item) => sum + (item[metricKey] as number), 0);

  const prevTotal = data
    .filter(d => filterFn(d, prevMonthStr))
    .reduce((sum, item) => sum + (item[metricKey] as number), 0);

  // 4. Calculate Delta
  const delta = currentTotal - prevTotal;
  let deltaPercent = 0;
  if (prevTotal !== 0) {
    deltaPercent = delta / prevTotal;
  } else if (currentTotal !== 0) {
    deltaPercent = 1; // 100% increase if starting from 0
  }

  return {
    current: currentTotal,
    previous: prevTotal,
    delta,
    deltaPercent,
  };
};

// --- Data Import & Cleaning Logic ---

// Normalize store names to the 6 core stores
const normalizeStoreName = (rawName: string): string => {
  if (!rawName) return '未知门店';
  
  if (rawName.includes('南京') && rawName.includes('鲸匠')) return '南京鲸匠';
  if (rawName.includes('南京') && rawName.includes('华佑')) return '南京华佑';
  if (rawName.includes('无锡')) return '无锡';
  if (rawName.includes('苏州')) return '苏州';
  if (rawName.includes('合肥')) return '合肥';
  if (rawName.includes('徐州')) return '徐州';
  
  return rawName; // Return original if no match found
};

// Map CSV/Excel headers to internal keys
const CSV_HEADER_MAP: Record<string, keyof ConstructionData> = {
  '日期': 'date',
  '门店': 'store',
  '城市': 'city',
  '转单工地': 'transferSites',
  '总产值(万)': 'totalOutputValue',
  '待开工工地': 'pendingStartSites',
  '待开工产值(万)': 'pendingStartOutput',
  '在建工地': 'underConstructionSites',
  '在建产值(万)': 'underConstructionOutput',
  '完工工地': 'completedSites',
  '完工产值(万)': 'completedOutput',
  '已收工程款': 'receivedEngineering',
  '未收工程款': 'unpaidEngineering',
  '已付工人': 'paidWorker',
  '已付工长': 'paidForeman',
  '应付材料款': 'payableMaterial',
  '已付材料款': 'paidMaterial',
  '未付材料款': 'unpaidMaterial',
  '项目经理发': 'managerBonus',
  '应付项目经理': 'payableManager',
  '已收': 'received',
  '未付': 'unpaid',
  '总毛利': 'totalGrossProfit'
};

// Helper to convert a single raw row (from CSV or Excel) to ConstructionData
const processRow = (row: any, index: number): ConstructionData => {
  const safeFloat = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val || val === '--') return 0;
    const cleanVal = val.toString().replace(/,/g, '');
    return parseFloat(cleanVal) || 0;
  };

  const rawStore = row['门店'] || '';
  const normalizedStore = normalizeStoreName(rawStore);

  // Handle date conversion
  let dateStr = row['日期'];
  let monthVal = 0;
  
  // Heuristic for date
  if (!dateStr) {
      dateStr = '2023-01'; // Fallback
      monthVal = 1;
  } else if (typeof dateStr === 'number') {
      // Logic for Number formats
      
      if (dateStr <= 12) {
        // Case A: Just a month number (e.g. 1, 2, ... 12) -> Assume current year
        monthVal = dateStr;
        dateStr = `${new Date().getFullYear()}-${monthVal.toString().padStart(2, '0')}`;
        
      } else if (dateStr > 190000 && dateStr < 210012) {
        // Case B: YYYYMM format (e.g. 202406)
        // This fixes the "2454" bug where YYYYMM was treated as days since 1900
        const str = dateStr.toString();
        const y = str.substring(0, 4);
        const m = str.substring(4, 6);
        monthVal = parseInt(m, 10);
        dateStr = `${y}-${m}`;
        
      } else {
        // Case C: Excel Serial Date (e.g. 45444 for 2024-06-01)
        // This is a naive conversion, ideally use XLSX.SSF if needed, but for now assume Month Number
        const date = new Date((dateStr - (25567 + 2)) * 86400 * 1000);
        monthVal = date.getMonth() + 1;
        dateStr = `${date.getFullYear()}-${monthVal.toString().padStart(2, '0')}`;
      }
      
  } else if (/^\d+$/.test(dateStr)) {
      // String number "1" or "202406"
      const num = parseInt(dateStr, 10);
      if (num <= 12) {
         monthVal = num;
         dateStr = `${new Date().getFullYear()}-${num.toString().padStart(2, '0')}`;
      } else if (dateStr.length === 6) {
         const y = dateStr.substring(0, 4);
         const m = dateStr.substring(4, 6);
         monthVal = parseInt(m, 10);
         dateStr = `${y}-${m}`;
      } else {
         // Fallback
         monthVal = 1;
         dateStr = `${new Date().getFullYear()}-01`;
      }
  } else {
      // Try to parse standard date string like "2023-12-01" or "2023/12/1"
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        monthVal = d.getMonth() + 1;
        dateStr = `${d.getFullYear()}-${monthVal.toString().padStart(2, '0')}`;
      }
  }
  
  // Map known columns
  const dataObj: any = {
    id: `row-${index}-${Math.random()}`,
    date: dateStr,
    month: monthVal,
    store: normalizedStore,
    city: row['城市'] || normalizedStore.substring(0, 2), // Fallback city derivation
  };

  // Map numeric metrics
  Object.entries(CSV_HEADER_MAP).forEach(([header, key]) => {
    if (key !== 'date' && key !== 'store' && key !== 'city') {
        dataObj[key] = safeFloat(row[header]);
    }
  });

  return dataObj as ConstructionData;
}

export const parseCSVData = (file: File): Promise<ConstructionData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedData = results.data.map((row: any, index: number) => processRow(row, index));
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const parseExcelData = (file: File): Promise<ConstructionData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        const parsedData = jsonData.map((row: any, index: number) => processRow(row, index));
        resolve(parsedData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
