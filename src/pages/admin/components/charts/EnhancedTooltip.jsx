import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

const EnhancedTooltip = ({ 
  title, 
  data, 
  showDrillDown = false, 
  drillDownText = "Click to drill down",
  icon = null,
  color = null,
  trend = null,
  comparison = null,
  additionalInfo = null
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`
      ${isDark ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}
      p-3 rounded-lg shadow-xl border-2 min-w-[200px] max-w-[300px]
    `}>
      {/* Header with icon and title */}
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color || '#3b82f6' }}
          />
        )}
        <div className="font-semibold text-sm truncate">{title}</div>
      </div>

      {/* Main data points */}
      <div className="space-y-1.5">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {item.label}:
            </span>
            <span className="text-sm font-medium ml-2">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-1">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Trend:
            </span>
            <span className={`text-xs font-medium ${
              trend.direction === 'up' 
                ? 'text-green-600 dark:text-green-400' 
                : trend.direction === 'down'
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}>
              {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {trend.value}
            </span>
          </div>
        </div>
      )}

      {/* Comparison data */}
      {comparison && (
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
          <div className="text-xs space-y-1">
            <div className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              vs {comparison.period}:
            </div>
            <div className={`font-medium ${
              comparison.change > 0 
                ? 'text-green-600 dark:text-green-400' 
                : comparison.change < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}>
              {comparison.change > 0 ? '+' : ''}{comparison.change}% {comparison.label}
            </div>
          </div>
        </div>
      )}

      {/* Additional information */}
      {additionalInfo && (
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {additionalInfo}
          </div>
        </div>
      )}

      {/* Drill down indicator */}
      {showDrillDown && (
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
            <span>🔍</span>
            {drillDownText}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTooltip;
