import React, { useMemo, useRef, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboard } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';
import { filterDataForChart, shouldShowDrillDownIndicators } from '../../utils/dashboardFilters';

const SupervisorPerformanceChart = ({ data = [], loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { getFiltersForChart, getCombinedFilters, shouldFilterChart, drillDown, applyHoverFilter } = useDashboard();

  // Track data changes and drill down state to control animations
  const prevDataRef = useRef(null);
  const prevFiltersRef = useRef(null);
  const shouldAnimate = useRef(false);

  useEffect(() => {
    const filters = getFiltersForChart('supervisor-performance');
    const filtersChanged = prevFiltersRef.current !== null && 
      JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    const dataChanged = prevDataRef.current !== null && 
      JSON.stringify(prevDataRef.current) !== JSON.stringify(data);

    // Animate if this is a filter change (drill down) or data change, but not on initial mount
    shouldAnimate.current = filtersChanged || dataChanged;
    
    prevDataRef.current = data;
    prevFiltersRef.current = filters;
  }, [data, getFiltersForChart]);

  // Get filtered data (includes hover filters from other charts, excludes own hover)
  const filteredData = useMemo(() => {
    const filters = getFiltersForChart('supervisor-performance');
    const shouldFilter = shouldFilterChart('supervisor-performance');
    return filterDataForChart(data, filters, 'supervisor-performance', shouldFilter);
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process data by supervisor
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Group by supervisor and calculate averages
    const supervisorGroups = {};

    filteredData.forEach(result => {
      const supervisor = result.supervisor || 'Unknown';
      
      if (!supervisorGroups[supervisor]) {
        supervisorGroups[supervisor] = {
          scores: [],
          count: 0
        };
      }
      
      const score = parseFloat(result.score_value) || 0;
      supervisorGroups[supervisor].scores.push(score);
      supervisorGroups[supervisor].count++;
    });

    // Calculate averages and format for chart
    const supervisorData = Object.entries(supervisorGroups)
      .map(([supervisor, group]) => {
        const average = group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length;
        return {
          supervisor: supervisor.length > 15 ? supervisor.substring(0, 15) + '...' : supervisor,
          fullName: supervisor,
          averageScore: (average * 100).toFixed(1),
          count: group.count
        };
      })
      .sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore))
      .slice(0, 10); // Show top 10 supervisors

    return supervisorData;
  }, [filteredData]);

  // Handle supervisor click for drill-down
  const handleSupervisorClick = (supervisorData) => {
    drillDown('supervisor', {
      fullName: supervisorData.data.fullName,
      supervisor: supervisorData.data.supervisor
    }, 'supervisor-performance');
  };

  // Handle supervisor hover for cross-filtering
  const handleSupervisorHover = (supervisorData) => {
    if (supervisorData) {
      applyHoverFilter('supervisor', supervisorData.data.fullName, 'supervisor-performance');
    }
  };

  const handleSupervisorLeave = () => {
    // Clear hover filter when mouse leaves
    applyHoverFilter('supervisor', null, 'supervisor-performance');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading chart...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveBar
        data={chartData}
        keys={['averageScore']}
        indexBy="supervisor"
        margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear', min: 0, max: 100 }}
        indexScale={{ type: 'band', round: true }}
        colors={['#10b981']}
        borderRadius={4}
        theme={{
          background: 'transparent',
          text: {
            fontSize: 12,
            fill: isDark ? '#e2e8f0' : '#475569',
          },
          axis: {
            domain: {
              line: {
                stroke: isDark ? '#475569' : '#cbd5e1',
                strokeWidth: 1,
              },
            },
            legend: {
              text: {
                fontSize: 12,
                fill: isDark ? '#e2e8f0' : '#475569',
              },
            },
            ticks: {
              line: {
                stroke: isDark ? '#475569' : '#cbd5e1',
                strokeWidth: 1,
              },
              text: {
                fontSize: 11,
                fill: isDark ? '#e2e8f0' : '#475569',
              },
            },
          },
          grid: {
            line: {
              stroke: isDark ? '#374151' : '#f1f5f9',
              strokeWidth: 1,
            },
          },
          tooltip: {
            container: {
              background: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#e2e8f0' : '#475569',
              fontSize: 12,
              borderRadius: 6,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
            },
          },
        }}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Supervisor',
          legendPosition: 'middle',
          legendOffset: 60,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Average Score (%)',
          legendPosition: 'middle',
          legendOffset: -50,
        }}
        enableLabel={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        animate={shouldAnimate.current}
        motionStiffness={90}
        motionDamping={15}
        onClick={handleSupervisorClick}
        onMouseEnter={handleSupervisorHover}
        onMouseLeave={handleSupervisorLeave}
        tooltip={({ id, value, data }) => {
          const combinedFilters = getCombinedFilters();
          const canDrillDown = shouldShowDrillDownIndicators('supervisor-performance', combinedFilters);

          // Calculate supervisor performance vs others
          const allSupervisors = chartData;
          const totalTests = allSupervisors.reduce((sum, supervisor) => sum + supervisor.count, 0);
          const supervisorShare = ((data.count / totalTests) * 100).toFixed(1);

          // Find supervisor ranking
          const ranking = allSupervisors.findIndex(s => s.supervisor === data.supervisor) + 1;

          // Calculate comparison to average
          const overallAverage = allSupervisors.reduce((sum, supervisor) =>
            sum + (parseFloat(supervisor.averageScore) * supervisor.count), 0) / totalTests;
          const comparison = {
            period: 'all supervisors',
            change: ((parseFloat(value) - overallAverage) / overallAverage * 100).toFixed(1),
            label: 'vs average'
          };

          // Performance category
          let performanceCategory = 'Average';
          if (parseFloat(value) >= 90) performanceCategory = 'Excellent';
          else if (parseFloat(value) >= 80) performanceCategory = 'Good';
          else if (parseFloat(value) >= 70) performanceCategory = 'Fair';
          else performanceCategory = 'Needs Improvement';

          const tooltipData = [
            { label: 'Supervisor', value: data.fullName },
            { label: 'Average Score', value: `${value}%` },
            { label: 'Tests Supervised', value: data.count },
            { label: 'Performance', value: performanceCategory },
            { label: 'Ranking', value: `#${ranking} of ${allSupervisors.length}` }
          ];

          return (
            <EnhancedTooltip
              title="Supervisor Performance"
              data={tooltipData}
              icon={true}
              color="#3b82f6"
              comparison={comparison}
              showDrillDown={canDrillDown}
              drillDownText="Click to drill down to this supervisor"
              additionalInfo={`Supervised ${supervisorShare}% of all tests`}
            />
          );
        }}
      />
    </div>
  );
};

export default SupervisorPerformanceChart;
