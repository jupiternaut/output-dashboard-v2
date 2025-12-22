import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_DATA } from './mockData';
import { calculateMetric, getAvailableCities, getAvailableMonths, getAvailableStores, formatCurrency } from './utils';
import MetricCard from './components/MetricCard';
import { ChartSection } from './components/Charts';
import FileUploader from './components/FileUploader';
import { ConstructionData } from './types';
import { LayoutDashboard, Calendar, MapPin, Store, Database } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [data, setData] = useState<ConstructionData[]>(MOCK_DATA);
  const [dataSourceName, setDataSourceName] = useState<string>('演示数据');
  
  const [selectedCity, setSelectedCity] = useState<string>('全部');
  const [selectedStore, setSelectedStore] = useState<string>('全部');
  const [selectedMonth, setSelectedMonth] = useState<string>('2023-12');

  // Reset filters when data changes to avoid empty states
  const handleDataLoaded = (newData: ConstructionData[], fileName: string) => {
    setData(newData);
    setDataSourceName(fileName);
    
    // Auto-select the latest month in the new data
    const newMonths = getAvailableMonths(newData);
    if (newMonths.length > 0) {
        setSelectedMonth(newMonths[newMonths.length - 1]);
    }
    setSelectedCity('全部');
    setSelectedStore('全部');
  };

  // Derived Options
  const cities = useMemo(() => ['全部', ...getAvailableCities(data)], [data]);
  const stores = useMemo(() => ['全部', ...getAvailableStores(data, selectedCity)], [data, selectedCity]);
  const months = useMemo(() => getAvailableMonths(data), [data]);

  // Calculate Metrics based on filters
  const metrics = useMemo(() => {
    return {
      totalOutput: calculateMetric(data, 'totalOutputValue', selectedMonth, selectedCity, selectedStore),
      grossProfit: calculateMetric(data, 'totalGrossProfit', selectedMonth, selectedCity, selectedStore),
      received: calculateMetric(data, 'received', selectedMonth, selectedCity, selectedStore),
      unpaid: calculateMetric(data, 'unpaid', selectedMonth, selectedCity, selectedStore),
      underConstruction: calculateMetric(data, 'underConstructionOutput', selectedMonth, selectedCity, selectedStore),
      pending: calculateMetric(data, 'pendingStartOutput', selectedMonth, selectedCity, selectedStore),
      completed: calculateMetric(data, 'completedOutput', selectedMonth, selectedCity, selectedStore),
      managerBonus: calculateMetric(data, 'managerBonus', selectedMonth, selectedCity, selectedStore),
    };
  }, [data, selectedCity, selectedStore, selectedMonth]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10">
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                <LayoutDashboard size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">运营数据看板</h1>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Database size={12} />
                        <span>数据源: {dataSourceName}</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
             {/* Upload Button */}
             <FileUploader onDataLoaded={handleDataLoaded} />
             
             <div className="h-6 w-px bg-gray-200 hidden md:block mx-2"></div>

             {/* Filters */}
             <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* City Filter */}
                <div className="relative group flex-1 md:flex-none">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPin size={16} />
                </div>
                <select
                    className="w-full md:w-auto pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                    value={selectedCity}
                    onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedStore('全部'); // Reset store when city changes
                    }}
                >
                    {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                </div>

                {/* Store Filter */}
                <div className="relative flex-1 md:flex-none">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Store size={16} />
                </div>
                <select
                    className="w-full md:w-auto pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                >
                    {stores.map(store => (
                    <option key={store} value={store}>{store}</option>
                    ))}
                </select>
                </div>

                {/* Month Filter */}
                <div className="relative flex-1 md:flex-none">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar size={16} />
                </div>
                <select
                    className="w-full md:w-auto pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                    ))}
                </select>
                </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Key Metrics Row 1 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">核心指标概览</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">单位: 万元</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="总产值"
              value={metrics.totalOutput.current}
              // deltaPercent removed for Total Output
              unit="万"
              variant="primary"
              tooltip="本月所有工地的总产值合计 (年度累计)"
            />
            <MetricCard
              title="总毛利"
              value={metrics.grossProfit.current}
              // deltaPercent removed for Gross Profit
              unit="万"
              tooltip="年度总毛利"
            />
            <MetricCard
              title="已收工程款"
              value={metrics.received.current}
              deltaPercent={metrics.received.deltaPercent}
              unit="万"
            />
            <MetricCard
              title="未收工程款"
              value={metrics.unpaid.current}
              deltaPercent={metrics.unpaid.deltaPercent}
              unit="万"
            />
          </div>
        </section>

        {/* Project Status Metrics Row 2 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">项目进度追踪</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="在建产值"
              value={metrics.underConstruction.current}
              deltaPercent={metrics.underConstruction.deltaPercent}
              unit="万"
            />
            <MetricCard
              title="待开工产值"
              value={metrics.pending.current}
              deltaPercent={metrics.pending.deltaPercent}
              unit="万"
            />
             <MetricCard
              title="完工产值"
              value={metrics.completed.current}
              deltaPercent={metrics.completed.deltaPercent}
              unit="万"
            />
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSection 
              data={data} 
              selectedStore={selectedStore} 
              selectedCity={selectedCity} 
            />
          </div>
          
          {/* Side Summary Panel */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">本月支出概览</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">项目经理支出</span>
                <span className="font-bold text-gray-800">{formatCurrency(metrics.managerBonus.current)} 万</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">净收款率</span>
                <span className="font-bold text-blue-600">
                  {metrics.totalOutput.current > 0 
                    ? ((metrics.received.current / metrics.totalOutput.current) * 100).toFixed(1) + '%' 
                    : '0%'}
                </span>
              </div>

               <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mt-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">经营洞察</h4>
                <p className="text-xs text-blue-600 leading-relaxed">
                  本月回款情况{metrics.received.deltaPercent >= 0 ? '优良，保持正向现金流。' : '需注意催收进度。'}
                  <br/>
                  当前在建项目 {metrics.underConstruction.current > 0 ? '运行正常' : '暂无数据'}。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
