import React, { useMemo, useRef, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboard } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';
import { filterDataForChart } from '../../utils/dashboardFilters';

const ScoreDistributionChart = ({ data = [], loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { getFiltersForChart, getCombinedFilters, shouldFilterChart, drillDown, applyHoverFilter } = useDashboard();

  // Track data changes and drill down state to control animations
  const prevDataRef = useRef(null);
  const prevFiltersRef = useRef(null);
  const shouldAnimate = useRef(false);

  useEffect(() => {
    const filters = getFiltersForChart('score-distribution');
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
    const filters = getFiltersForChart('score-distribution');
    const shouldFilter = shouldFilterChart('score-distribution');
    return filterDataForChart(data, filters, 'score-distribution', shouldFilter);
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process data into score ranges
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Define score ranges (scores are stored as decimals 0-1, so convert to percentages)
    const ranges = [
      { label: '0-20%', min: 0, max: 20, count: 0 },
      { label: '21-40%', min: 21, max: 40, count: 0 },
      { label: '41-60%', min: 41, max: 60, count: 0 },
      { label: '61-80%', min: 61, max: 80, count: 0 },
      { label: '81-100%', min: 81, max: 100, count: 0 }
    ];

    // Count scores in each range
    filteredData.forEach(result => {
      const score = (parseFloat(result.score_value) || 0) * 100; // Convert to percentage

      // Find the appropriate range for this score
      let targetRange = null;
      if (score <= 20) {
        targetRange = ranges[0]; // 0-20%
      } else if (score <= 40) {
        targetRange = ranges[1]; // 21-40%
      } else if (score <= 60) {
        targetRange = ranges[2]; // 41-60%
      } else if (score <= 80) {
        targetRange = ranges[3]; // 61-80%
      } else {
        targetRange = ranges[4]; // 81-100%
      }

      if (targetRange) {
        targetRange.count++;
      }
    });

    return ranges.map(range => ({
      id: range.label,
      range: range.label,
      count: range.count,
      percentage: filteredData.length > 0 ? ((range.count / filteredData.length) * 100).toFixed(1) : 0,
      min: range.min,
      max: range.max
    }));
  }, [filteredData]);

  // Handle score range click for drill-down
  const handleScoreRangeClick = (scoreData) => {
    // Get the original data using the index
    const index = scoreData.index;
    const originalRange = chartData[index];

    drillDown('scoreRange', {
      label: originalRange.id || originalRange.range,
      min: originalRange.min,
      max: originalRange.max
    }, 'score-distribution');
  };

  // Handle score range hover for cross-filtering
  const handleScoreRangeHover = (scoreData) => {
    if (scoreData) {
      // Get the original data using the index
      const index = scoreData.index;
      const originalRange = chartData[index];

      const filterData = {
        label: originalRange.id || originalRange.range,
        min: originalRange.min,
        max: originalRange.max
      };
      applyHoverFilter('scoreRange', filterData, 'score-distribution');
    }
  };

  const handleScoreRangeLeave = () => {
    // Clear hover filter when mouse leaves
    applyHoverFilter('scoreRange', null, 'score-distribution');
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
        keys={['count']}
        indexBy="range"
        margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={['#3b82f6']}
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
          tickRotation: 0,
          legend: 'Score Range',
          legendPosition: 'middle',
          legendOffset: 40,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Number of Results',
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
        onClick={(data, event) => handleScoreRangeClick(data)}
        onMouseEnter={(data, event) => handleScoreRangeHover(data)}
        onMouseLeave={() => handleScoreRangeLeave()}
        tooltip={({ id, value, data }) => {
          // Calculate insights about this score range
          const isHighPerformance = data.min >= 90;
          const isLowPerformance = data.max <= 60;
          const isPassing = data.min >= 70;
          const isLargestGroup = value === Math.max(...chartData.map(d => d.count));
          const isSmallestGroup = value === Math.min(...chartData.filter(d => d.count > 0).map(d => d.count));

          // Performance insights
          let performanceInsight = '';
          if (isHighPerformance) {
            performanceInsight = 'Excellent performance range';
          } else if (isLowPerformance) {
            performanceInsight = 'May need additional training support';
          } else if (isPassing) {
            performanceInsight = 'Satisfactory performance range';
          } else {
            performanceInsight = 'Below passing threshold';
          }

          // Calculate cumulative percentage up to this range
          const sortedRanges = [...chartData].sort((a, b) => a.min - b.min);
          const currentIndex = sortedRanges.findIndex(r => r.range === data.range);
          const cumulativeCount = sortedRanges.slice(0, currentIndex + 1).reduce((sum, r) => sum + r.count, 0);
          const totalCount = chartData.reduce((sum, r) => sum + r.count, 0);
          const cumulativePercentage = totalCount > 0 ? ((cumulativeCount / totalCount) * 100).toFixed(1) : '0.0';

          // Determine status
          let status = 'Normal';
          if (isLargestGroup) {
            status = 'Most Common';
          } else if (isSmallestGroup && value > 0) {
            status = 'Least Common';
          } else if (value === 0) {
            status = 'No Results';
          }

          const tooltipData = [
            { label: 'Score Range', value: data.range },
            { label: 'Test Count', value: value },
            { label: 'Percentage', value: `${data.percentage}%` },
            { label: 'Cumulative', value: `${cumulativePercentage}%` },
            { label: 'Status', value: status }
          ];

          return (
            <EnhancedTooltip
              title="Score Distribution"
              data={tooltipData}
              icon={true}
              color="#10b981"
              additionalInfo={performanceInsight}
            />
          );
        }}
      />
    </div>
  );
};

export default ScoreDistributionChart;
