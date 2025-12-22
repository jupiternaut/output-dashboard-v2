import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { ConstructionData } from '../types';
import { formatCurrency } from '../utils';

interface ChartSectionProps {
  data: ConstructionData[];
  selectedStore: string;
  selectedCity: string;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  data,
  selectedStore,
  selectedCity,
}) => {
  // Aggregate data by month
  const monthlyData = useMemo(() => {
    const grouped = new Map<string, any>();

    // Sort raw data by date first
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

    sortedData.forEach((item) => {
      // Filter logic matches App.tsx
      if (selectedCity !== '全部' && item.city !== selectedCity) return;
      if (selectedStore !== '全部' && item.store !== selectedStore) return;

      const key = item.date;
      if (!grouped.has(key)) {
        grouped.set(key, {
          date: key,
          totalOutput: 0,
          grossProfit: 0,
          received: 0,
          unpaid: 0,
          pending: 0,
          construction: 0,
          completed: 0,
        });
      }

      const entry = grouped.get(key);
      entry.totalOutput += item.totalOutputValue;
      entry.grossProfit += item.totalGrossProfit;
      entry.received += item.received;
      entry.unpaid += item.unpaid;
      
      // Accumulate output composition
      entry.pending += item.pendingStartOutput;
      entry.construction += item.underConstructionOutput;
      entry.completed += item.completedOutput;
    });

    return Array.from(grouped.values());
  }, [data, selectedStore, selectedCity]);

  return (
    <div className="space-y-6">
      {/* Chart 1: Output & Gross Profit Trend */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">产值与毛利趋势</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(val) => `${val / 10000}亿`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="totalOutput" 
                name="总产值" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorOutput)" 
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="grossProfit" 
                name="总毛利" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Output Composition */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">产值构成分析</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 cursor={{ fill: '#f9fafb' }}
                 formatter={(value: number) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="construction" name="在建产值" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} maxBarSize={50} />
              <Bar dataKey="completed" name="完工产值" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={50} />
              <Bar dataKey="pending" name="待开工产值" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
       {/* Chart 3: Financial Health */}
       <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">回款与未付对比</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUnpaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area type="monotone" dataKey="received" name="已收工程款" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorReceived)" />
              <Area type="monotone" dataKey="unpaid" name="未收工程款" stroke="#ef4444" fillOpacity={1} fill="url(#colorUnpaid)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
