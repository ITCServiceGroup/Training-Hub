import React from 'react';
import { BiChevronRight, BiHome, BiX } from 'react-icons/bi';
import { useDashboard } from '../contexts/DashboardContext';

const DrillDownBreadcrumbs = () => {
  const { drillDownState, drillBack, resetDrillDown, crossFilters, clearCrossFilters } = useDashboard();

  const hasDrillDown = drillDownState.breadcrumbs.length > 0;
  const hasCrossFilters = crossFilters.sourceChart !== null;

  // Always render a fixed-height container to prevent layout shifts
  const hasContent = hasDrillDown || hasCrossFilters;

  // Only show breadcrumbs when there's actual drill-down or persistent cross-filters
  if (!hasContent) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 p-4">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Home/Reset Button */}
          <button
            onClick={resetDrillDown}
            className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
            title="Reset to overview"
          >
            <BiHome className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          {/* Drill-down Breadcrumbs */}
          {drillDownState.breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              <BiChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <button
                onClick={() => drillBack(index + 1)}
                className="px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                title={`Navigate to: ${breadcrumb.label}`}
              >
                <span className="text-sm font-medium">{breadcrumb.label}</span>
              </button>
            </React.Fragment>
          ))}

          {/* Cross-filter Indicator */}
          {hasCrossFilters && (
            <>
              <BiChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <div className="flex items-center space-x-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Cross-filtered by {crossFilters.sourceChart}
                </span>
                <button
                  onClick={clearCrossFilters}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  title="Clear cross-filter"
                >
                  <BiX className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Clear All Button */}
        {(hasDrillDown || hasCrossFilters) && (
          <button
            onClick={() => {
              resetDrillDown();
              clearCrossFilters();
            }}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md transition-colors"
          >
            <BiX className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
        </div>
      </div>
    </div>
  );
};

export default DrillDownBreadcrumbs;
