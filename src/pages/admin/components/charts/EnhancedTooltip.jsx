import { useEffect, useRef } from 'react';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tooltipRef = useRef(null);
  
  // Smart positioning to avoid sidebar overlap and screen edge cutoff
  useEffect(() => {
    if (tooltipRef.current) {
      const tooltip = tooltipRef.current;
      
      // Reset transform first to get original position
      tooltip.style.transform = '';
      
      // Get the natural position without any transforms
      const rect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const sidebarWidth = 250;
      const minMargin = 5; // Minimum margin from screen edge
      
      let translateX = 0;
      
      // Check if tooltip would be behind sidebar (left side)
      if (rect.left < sidebarWidth) {
        translateX = sidebarWidth - rect.left + 10;
      }
      // Check if tooltip would extend beyond right edge
      else if (rect.right > viewportWidth - minMargin) {
        // Calculate minimum movement to keep tooltip on screen with small margin
        translateX = (viewportWidth - minMargin) - rect.right;
      }
      
      // Apply the calculated adjustment
      if (translateX !== 0) {
        tooltip.style.transform = `translateX(${translateX}px)`;
      }
      
      tooltip.style.zIndex = '2147483647';
    }
  });

  return (
    <div 
      ref={tooltipRef}
      className="p-3 rounded-lg shadow-xl min-w-[300px] max-w-[500px]"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#475569',
        border: `2px solid ${isDark ? '#475569' : '#e2e8f0'}`,
        zIndex: 2147483647
      }}
    >
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
          <div key={index}>
            <div className="flex justify-between items-center">
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {item.label}:
              </span>
              <span className="text-sm font-medium ml-2">
                {item.value}
              </span>
            </div>
            {/* Add subtle divider after the first item (Question) */}
            {index === 0 && (
              <div className={`mt-2 mb-1 border-t ${isDark ? 'border-slate-600' : 'border-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Trend:
            </span>
            <span className={`text-xs font-medium ${
              trend.direction === 'up' 
                ? (isDark ? 'text-green-400' : 'text-green-600')
                : trend.direction === 'down'
                ? (isDark ? 'text-red-400' : 'text-red-600')
                : (isDark ? 'text-slate-400' : 'text-slate-600')
            }`}>
              {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {trend.value}
            </span>
          </div>
        </div>
      )}

      {/* Comparison data */}
      {comparison && (
        <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
          <div className="text-xs space-y-1">
            <div className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              vs {comparison.period}:
            </div>
            <div className={`font-medium ${
              comparison.change > 0 
                ? (isDark ? 'text-green-400' : 'text-green-600')
                : comparison.change < 0
                ? (isDark ? 'text-red-400' : 'text-red-600')
                : (isDark ? 'text-slate-400' : 'text-slate-600')
            }`}>
              {comparison.change > 0 ? '+' : ''}{comparison.change}% {comparison.label}
            </div>
          </div>
        </div>
      )}

      {/* Additional information */}
      {additionalInfo && (
        <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {additionalInfo}
          </div>
        </div>
      )}

      {/* Drill down indicator */}
      {showDrillDown && (
        <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
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
