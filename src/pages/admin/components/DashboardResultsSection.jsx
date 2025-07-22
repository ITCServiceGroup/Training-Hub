import React, { useMemo } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { filterDataForChart } from '../utils/dashboardFilters';
import DashboardResultsTable from './DashboardResultsTable';

const DashboardResultsSection = ({ data = [], loading = false, onViewPDF = null }) => {
  const { getCombinedFilters, shouldFilterChart } = useDashboard();

  // Get filtered data for results table using the same filtering logic as charts
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Use a generic chart ID for the table filtering
    const filters = getCombinedFilters();
    const shouldFilter = true; // Always filter the results table
    
    return filterDataForChart(data, filters, 'results-table', shouldFilter);
  }, [data, getCombinedFilters]);

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