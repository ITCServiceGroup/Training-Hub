import React, { useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboardFilters } from '../../contexts/DashboardContext';
import { filterDataForChart } from '../../utils/dashboardFilters';
import EnhancedTooltip from './EnhancedTooltip';

const PassFailRateChart = ({ data = [], loading = false, passingThreshold = 0.7 }) => {
  const { isDark } = useTheme();
  const {
    getFiltersForChart,
    shouldFilterChart,
    drillDown,
    applyHoverFilter
  } = useDashboardFilters();

  // Filter data for this chart (includes hover filters from other charts, excludes own hover)
  const chartFilteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    try {
      const filters = getFiltersForChart('pass-fail-rate');
      const shouldFilter = shouldFilterChart('pass-fail-rate');

      // Use the standard filtering utility that handles all filter types correctly
      return filterDataForChart(data, filters, 'pass-fail-rate', shouldFilter);
    } catch (error) {
      console.warn('Error filtering chart data:', error);
      return [];
    }
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process data for pass/fail analysis
  const chartData = useMemo(() => {
    if (!chartFilteredData || chartFilteredData.length === 0) return [];

    let passCount = 0;
    let failCount = 0;

    chartFilteredData.forEach(result => {
      const score = parseFloat(result.score_value) || 0;
      if (score >= passingThreshold) {
        passCount++;
      } else {
        failCount++;
      }
    });

    const total = passCount + failCount;
    if (total === 0) return [];

    return [
      {
        id: 'pass',
        label: 'Pass',
        value: passCount,
        percentage: ((passCount / total) * 100).toFixed(1),
        color: '#10b981' // Green
      },
      {
        id: 'fail',
        label: 'Fail',
        value: failCount,
        percentage: ((failCount / total) * 100).toFixed(1),
        color: '#ef4444' // Red
      }
    ].filter(item => item.value > 0);
  }, [chartFilteredData, passingThreshold]);

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

  const passRate = chartData.find(d => d.id === 'pass')?.percentage || '0';
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  // Handle pass/fail segment click for drill-down
  const handleSegmentClick = (segment) => {
    const isPass = segment.id === 'pass';
    const scoreRange = isPass
      ? { min: passingThreshold * 100, max: 100 }
      : { min: 0, max: passingThreshold * 100 };

    drillDown('scoreRange', {
      min: scoreRange.min,
      max: scoreRange.max,
      label: isPass ? 'Passing Scores' : 'Failing Scores',
      threshold: passingThreshold * 100
    }, 'pass-fail-rate');
  };

  // Handle segment hover for cross-filtering
  const handleSegmentHover = (segment) => {
    if (segment) {
      const isPass = segment.id === 'pass';
      const scoreRange = isPass
        ? { min: passingThreshold * 100, max: 100 }
        : { min: 0, max: passingThreshold * 100 };

      applyHoverFilter('scoreRange', scoreRange, 'pass-fail-rate');
    }
  };

  const handleSegmentLeave = () => {
    applyHoverFilter('scoreRange', null, 'pass-fail-rate');
  };

  return (
    <div className="h-full w-full relative">
      {/* Pass Rate Summary */}
      <div className="absolute top-2 left-2 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 p-2">
        <div className="text-xs text-slate-600 dark:text-slate-400">Pass Rate</div>
        <div className={`text-lg font-bold ${parseFloat(passRate) >= 80 ? 'text-green-600' : parseFloat(passRate) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
          {passRate}%
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {total} total tests
        </div>
      </div>

      <ResponsivePie
        data={chartData}
        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
        innerRadius={0.6}
        padAngle={2}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={chartData.map(d => d.color)}
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
            },
          },
        }}
        borderWidth={2}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.3]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={isDark ? '#e2e8f0' : '#475569'}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]],
        }}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        onClick={handleSegmentClick}
        onMouseEnter={handleSegmentHover}
        onMouseLeave={handleSegmentLeave}
        tooltip={({ datum }) => {
          const isPassing = datum.id === 'pass';
          const threshold = (passingThreshold * 100).toFixed(0);
          
          const tooltipData = [
            { label: 'Result', value: datum.label },
            { label: 'Count', value: datum.value },
            { label: 'Percentage', value: `${datum.percentage}%` },
            { label: 'Threshold', value: `${threshold}%` }
          ];

          const additionalInfo = isPassing 
            ? `Students scoring ${threshold}% or higher`
            : `Students scoring below ${threshold}%`;

          return (
            <EnhancedTooltip
              title="Pass/Fail Analysis"
              data={tooltipData}
              icon={true}
              color={datum.color}
              additionalInfo={additionalInfo}
            />
          );
        }}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 20,
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

export default PassFailRateChart;
