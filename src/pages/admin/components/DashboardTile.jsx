import React, { useState, useRef } from 'react';
import { BiFilter, BiX, BiRefresh } from 'react-icons/bi';
import { useTheme } from '../../../contexts/ThemeContext';
import ExportButton from './ExportButton';

const DashboardTile = ({
  id,
  title,
  children,
  loading = false,
  error = null,
  hasCustomFilters = false,
  onFilterClick,
  onRefresh,
  dragHandle = null,
  className = ''
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isHovered, setIsHovered] = useState(false);
  const tileRef = useRef(null);

  const handleFilterClick = (e) => {
    e.stopPropagation();
    if (onFilterClick) {
      onFilterClick(id, e);
    }
  };

  const handleRefreshClick = (e) => {
    e.stopPropagation();
    if (onRefresh) {
      onRefresh(id);
    }
  };

  return (
    <div
      ref={tileRef}
      data-tile-id={id}
      className={`h-full min-h-[320px] bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minHeight: '320px' }}
    >
      {/* Tile Header */}
      <div className="dashboard-tile-header flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          {dragHandle && dragHandle}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
            {title}
          </h3>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Custom Filter Indicator */}
          {hasCustomFilters && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Custom filters applied" />
          )}
          
          {/* Filter Button */}
          <button
            onClick={handleFilterClick}
            className={`p-1.5 rounded-md transition-colors duration-200 ${
              isHovered 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' 
                : 'text-slate-400 dark:text-slate-500'
            } hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300`}
            title="Configure filters"
          >
            <BiFilter className="w-4 h-4" />
          </button>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefreshClick}
            className={`p-1.5 rounded-md transition-colors duration-200 ${
              isHovered
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                : 'text-slate-400 dark:text-slate-500'
            } hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300`}
            title="Refresh data"
          >
            <BiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Button */}
          {isHovered && (
            <ExportButton
              targetElement={tileRef.current}
              type="chart"
              filename={`${title.toLowerCase().replace(/\s+/g, '_')}_chart`}
              variant="icon"
              size="small"
              showLabel={false}
            />
          )}
        </div>
      </div>

      {/* Tile Content */}
      <div className="dashboard-tile-content p-4 h-[calc(100%-4rem)]">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-red-500 dark:text-red-400 mb-2">
              <BiX className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-sm text-red-600 dark:text-red-400 mb-3">
              {error}
            </div>
            <button
              onClick={handleRefreshClick}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="space-y-3 w-full">
              {/* Loading skeleton */}
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTile;
