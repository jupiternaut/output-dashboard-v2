import React from 'react';
import { ArrowUp, ArrowDown, Minus, Info } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils';

interface MetricCardProps {
  title: string;
  value: number;
  deltaPercent?: number;
  unit: string;
  variant?: 'primary' | 'default';
  tooltip?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  deltaPercent,
  unit,
  variant = 'default',
  tooltip,
}) => {
  const isPositive = deltaPercent !== undefined && deltaPercent > 0;
  const isNegative = deltaPercent !== undefined && deltaPercent < 0;
  const isNeutral = deltaPercent === 0;

  return (
    <div
      className={`relative p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${
        variant === 'primary'
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-gray-100 text-gray-800'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3
          className={`text-sm font-medium ${
            variant === 'primary' ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {title}
        </h3>
        {tooltip && (
          <div className="group relative">
            <Info
              size={14}
              className={`cursor-help ${
                variant === 'primary' ? 'text-blue-200' : 'text-gray-400'
              }`}
            />
            <div className="absolute right-0 top-6 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              {tooltip}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{formatCurrency(value)}</span>
        <span
          className={`text-xs font-medium ${
            variant === 'primary' ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {unit}
        </span>
      </div>

      {deltaPercent !== undefined && (
        <div className="mt-3 flex items-center text-xs font-medium">
          {isPositive && (
            <span
              className={`flex items-center ${
                variant === 'primary' ? 'text-green-300' : 'text-green-600'
              }`}
            >
              <ArrowUp size={12} className="mr-0.5" />
              {formatPercentage(Math.abs(deltaPercent))}
            </span>
          )}
          {isNegative && (
            <span
              className={`flex items-center ${
                variant === 'primary' ? 'text-red-300' : 'text-red-600'
              }`}
            >
              <ArrowDown size={12} className="mr-0.5" />
              {formatPercentage(Math.abs(deltaPercent))}
            </span>
          )}
          {isNeutral && (
            <span
              className={`flex items-center ${
                variant === 'primary' ? 'text-gray-300' : 'text-gray-400'
              }`}
            >
              <Minus size={12} className="mr-0.5" />
              0.00%
            </span>
          )}
          <span
            className={`ml-1.5 ${
              variant === 'primary' ? 'text-blue-200' : 'text-gray-400'
            }`}
          >
            较上月
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
