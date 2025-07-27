import React, { useMemo } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { filterDataForChart } from '../utils/dashboardFilters';
import DashboardResultsTable from './DashboardResultsTable';

const DashboardResultsSection = ({ data = [], loading = false, onViewPDF = null, globalFilters = {} }) => {
  const { getCombinedFilters, shouldFilterChart } = useDashboard();

  // Get filtered data for results table using both global filters and drill-down filters
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Combine global filters with drill-down filters
    const drillDownFilters = getCombinedFilters();
    
    // Create combined filters object that includes both global and drill-down filters
    const combinedFilters = {
      // Global filters
      markets: globalFilters.markets,
      supervisors: globalFilters.supervisors,
      ldaps: globalFilters.ldaps,
      quizTypes: globalFilters.quizTypes,
      dateRange: globalFilters.dateRange,
      
      // Drill-down filters (these take precedence if they exist)
      ...drillDownFilters
    };
    
    console.log('Results table filtering with:', {
      globalFilters,
      drillDownFilters,
      combinedFilters,
      dataCount: data.length
    });
    
    const shouldFilter = true; // Always filter the results table
    
    return filterDataForChart(data, combinedFilters, 'results-table', shouldFilter);
  }, [data, getCombinedFilters, globalFilters]);

  return (
    <div className="mt-6">
      <DashboardResultsTable 
        results={filteredData}
        loading={loading}
        onViewPDF={onViewPDF}
        initialPageSize={25}
      />
    </div>
  );
};

export default DashboardResultsSection;