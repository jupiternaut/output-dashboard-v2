import { ConstructionData } from './types';

const STORES = ['苏州中心店', '园区旗舰店', '新区体验店', '吴中展示厅'];
const CITIES = ['苏州', '无锡', '常州'];

// Helper to generate random float with precision
const randomFloat = (min: number, max: number, decimals: number = 2) => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
};

// Helper to generate random int
const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const generateMockData = (): ConstructionData[] => {
  const data: ConstructionData[] = [];
  const year = 2023;

  // Generate data for 12 months for each store in each city
  CITIES.forEach(city => {
    STORES.forEach(store => {
      for (let month = 1; month <= 12; month++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}`;
        
        // Base value scaling to make stores different
        const scale = 1 + Math.random() * 0.5;

        // Generate consistent metrics based on relationships
        // e.g. Total Output = Pending + Under Construction + Completed
        const pendingOutput = randomFloat(20, 100) * scale;
        const underConstOutput = randomFloat(100, 500) * scale;
        const completedOutput = randomFloat(50, 200) * scale;
        const totalOutput = pendingOutput + underConstOutput + completedOutput;

        // Financials
        const totalGrossProfit = totalOutput * randomFloat(0.15, 0.35); // 15-35% margin
        const received = totalOutput * randomFloat(0.6, 0.9); // 60-90% collection rate
        const unpaid = totalOutput - received;

        data.push({
          id: `${city}-${store}-${dateStr}`,
          date: dateStr,
          month: month,
          store: `${city}-${store}`, // Prefixing city to store name for uniqueness in this mock
          city: city,
          transferSites: randomInt(0, 5),
          totalOutputValue: totalOutput,
          pendingStartSites: randomInt(2, 10),
          pendingStartOutput: pendingOutput,
          underConstructionSites: randomInt(10, 50),
          underConstructionOutput: underConstOutput,
          completedSites: randomInt(5, 20),
          completedOutput: completedOutput,
          receivedEngineering: received * 0.8,
          unpaidEngineering: unpaid * 0.8,
          paidWorker: totalOutput * 0.2,
          paidForeman: totalOutput * 0.05,
          payableMaterial: totalOutput * 0.4,
          paidMaterial: totalOutput * 0.35,
          unpaidMaterial: totalOutput * 0.05,
          managerBonus: totalGrossProfit * 0.1,
          payableManager: totalGrossProfit * 0.05,
          received: received,
          unpaid: unpaid,
          totalGrossProfit: totalGrossProfit,
        });
      }
    });
  });

  return data;
};

export const MOCK_DATA = generateMockData();
