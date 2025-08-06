import { useMemo, useEffect } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboard } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';
import { filterDataForChart, isHoverDrillDownDisabled } from '../../utils/dashboardFilters';

const TimeDistributionChart = ({ data = [], loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    getFiltersForChart,
    shouldFilterChart,
    drillDown,
    applyHoverFilter
  } = useDashboard();

  // Get filtered data (includes hover filters from other charts, excludes own hover)
  const filteredData = useMemo(() => {
    const filters = getFiltersForChart('time-distribution');
    const shouldFilter = shouldFilterChart('time-distribution');
    return filterDataForChart(data, filters, 'time-distribution', shouldFilter);
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process data into time ranges
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Define time ranges (in seconds)
    const ranges = [
      { label: '< 1 min', min: 0, max: 60, count: 0 },
      { label: '1-3 min', min: 60, max: 180, count: 0 },
      { label: '3-5 min', min: 180, max: 300, count: 0 },
      { label: '5-10 min', min: 300, max: 600, count: 0 },
      { label: '> 10 min', min: 600, max: Infinity, count: 0 }
    ];

    // Count times in each range
    filteredData.forEach(result => {
      const timeInSeconds = parseInt(result.time_taken) || 0;
      const range = ranges.find(r => timeInSeconds >= r.min && timeInSeconds < r.max);
      if (range) {
        range.count++;
      }
    });

    // Filter out ranges with no data and format for pie chart
    return ranges
      .filter(range => range.count > 0)
      .map((range) => ({
        id: range.label,
        label: range.label,
        value: range.count,
        percentage: filteredData.length > 0 ? ((range.count / filteredData.length) * 100).toFixed(1) : 0,
        min: range.min,
        max: range.max
      }));
  }, [filteredData]);

  // Handle time range click for drill-down
  const handleTimeRangeClick = (timeData) => {
    const range = timeData.data;
    drillDown('timeRange', {
      label: range.id,
      min: range.min,
      max: range.max
    }, 'time-distribution');
  };

  // Handle time range hover for cross-filtering
  const handleTimeRangeHover = (timeData) => {
    // Check if hover drill-down is disabled
    if (isHoverDrillDownDisabled()) return;
    if (timeData) {
      const range = timeData.data;
      applyHoverFilter('timeRange', {
        label: range.id,
        min: range.min,
        max: range.max
      }, 'time-distribution');
    }
  };

  const handleTimeRangeLeave = () => {
    // Clear hover filter when mouse leaves
    applyHoverFilter('timeRange', null, 'time-distribution');
  };

  // Clear hover filters when entering loading state or when component unmounts to prevent stuck filters
  useEffect(() => {
    if (loading) {
      applyHoverFilter('timeRange', null, 'time-distribution');
    }
  }, [loading, applyHoverFilter]);

  // Clear hover filters when component unmounts
  useEffect(() => {
    return () => {
      applyHoverFilter('timeRange', null, 'time-distribution');
    };
  }, [applyHoverFilter]);

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

  const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="h-full w-full">
      <ResponsivePie
        data={chartData}
        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={colors}
        theme={{
          background: 'transparent',
          text: {
            fontSize: 12,
            fill: isDark ? '#e2e8f0' : '#475569',
          },
          tooltip: {
            container: {
              background: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#e2e8f0' : '#475569',
              fontSize: 12,
              borderRadius: 6,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
              zIndex: 9999,
            },
          },
        }}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={isDark ? '#e2e8f0' : '#475569'}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={isDark ? '#ffffff' : '#000000'}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        onClick={handleTimeRangeClick}
        onMouseEnter={handleTimeRangeHover}
        onMouseLeave={handleTimeRangeLeave}
        tooltip={({ datum }) => {
          // Calculate insights about this time range
          const isLargestSegment = datum.value === Math.max(...chartData.map(d => d.value));
          const isSmallestSegment = datum.value === Math.min(...chartData.map(d => d.value));

          // Determine if this is a concerning time range
          let timeInsight = '';
          if (datum.data.min >= 20) {
            timeInsight = 'This may indicate difficulty with test content';
          } else if (datum.data.max <= 5) {
            timeInsight = 'Very quick completion - may indicate rushing';
          } else if (datum.data.min <= 10 && datum.data.max <= 15) {
            timeInsight = 'Optimal completion time range';
          }

          // Calculate average time for this range (estimate) - convert from seconds to minutes
          const avgTimeSeconds = datum.data.max === Infinity
            ? datum.data.min + 300 // Estimate for "> 10 min" range
            : (datum.data.min + datum.data.max) / 2;
          const avgTime = (avgTimeSeconds / 60).toFixed(1);

          const data = [
            { label: 'Time Range', value: datum.label },
            { label: 'Test Count', value: datum.value },
            { label: 'Percentage', value: `${datum.data.percentage}%` },
            { label: 'Avg Time', value: `${avgTime} min` },
            { label: 'Status', value: isLargestSegment ? 'Most Common' : isSmallestSegment ? 'Least Common' : 'Normal' }
          ];

          return (
            <EnhancedTooltip
              title="Time Distribution"
              data={data}
              icon={true}
              color={datum.color}
              additionalInfo={timeInsight || `${datum.data.percentage}% of tests fall in this time range`}
            />
          );
        }}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 60,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 60,
            itemHeight: 18,
            itemTextColor: isDark ? '#e2e8f0' : '#475569',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 12,
            symbolShape: 'circle',
          },
        ]}
      />
    </div>
  );
};

export default TimeDistributionChart;
