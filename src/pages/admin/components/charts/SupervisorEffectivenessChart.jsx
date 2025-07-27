import React, { useMemo, useRef, useEffect } from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboardFilters } from '../../contexts/DashboardContext';
import { filterDataForChart } from '../../utils/dashboardFilters';

const SupervisorEffectivenessChart = ({ data = [], loading = false }) => {
  const { isDark } = useTheme();
  const { getFiltersForChart, shouldFilterChart, drillDown } = useDashboardFilters();

  // Track data changes and drill down state to control animations
  const prevDataRef = useRef(null);
  const prevFiltersRef = useRef(null);
  const shouldAnimate = useRef(false);

  useEffect(() => {
    const filters = getFiltersForChart('supervisor-effectiveness');
    const filtersChanged = prevFiltersRef.current !== null && 
      JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    const dataChanged = prevDataRef.current !== null && 
      JSON.stringify(prevDataRef.current) !== JSON.stringify(data);

    // Animate if this is a filter change (drill down) or data change, but not on initial mount
    shouldAnimate.current = filtersChanged || dataChanged;
    
    prevDataRef.current = data;
    prevFiltersRef.current = filters;
  }, [data, getFiltersForChart]);

  // Filter data for this chart (includes hover filters from other charts, excludes own hover)
  const chartFilteredData = useMemo(() => {
    const filters = getFiltersForChart('supervisor-effectiveness');
    const shouldFilter = shouldFilterChart('supervisor-effectiveness');
    
    // Use standard filtering utility - includes supervisor filters for drill-down from other charts
    return filterDataForChart(data, filters, 'supervisor-effectiveness', shouldFilter);
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process data by supervisor with multiple effectiveness metrics
  const supervisorMetrics = useMemo(() => {
    if (!chartFilteredData || chartFilteredData.length === 0) return { data: [], supervisors: [] };

    // Group by supervisor
    const supervisorGroups = {};

    chartFilteredData.forEach(result => {
      const supervisor = result.supervisor || 'Unknown';
      if (!supervisorGroups[supervisor]) {
        supervisorGroups[supervisor] = {
          scores: [],
          times: [],
          users: new Set(),
          count: 0
        };
      }

      supervisorGroups[supervisor].scores.push(parseFloat(result.score_value) || 0);
      supervisorGroups[supervisor].times.push(parseInt(result.time_taken) || 0);
      supervisorGroups[supervisor].users.add(result.ldap);
      supervisorGroups[supervisor].count++;
    });

    // Calculate effectiveness metrics for each supervisor
    const supervisorData = Object.entries(supervisorGroups)
      .map(([supervisor, group]) => {
        const avgScore = group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length;
        const avgTime = group.times.reduce((sum, time) => sum + time, 0) / group.times.length;
        const passRate = group.scores.filter(score => score >= 0.7).length / group.scores.length;
        const teamSize = group.users.size;
        const testsPerUser = group.count / teamSize;

        // Calculate consistency (lower standard deviation = higher consistency)
        const scoreVariance = group.scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / group.scores.length;
        const consistency = Math.max(0, 1 - Math.sqrt(scoreVariance));

        // Calculate efficiency (good scores in reasonable time)
        const efficiency = avgScore / (avgTime / 600); // Normalize time to 10-minute baseline

        // Calculate engagement (tests per user)
        const engagement = Math.min(1, testsPerUser / 5); // Normalize to 5 tests per user baseline

        return {
          supervisor: supervisor, // Don't truncate supervisor names
          fullName: supervisor,
          metrics: {
            'Avg Score': parseFloat((avgScore * 100).toFixed(1)),
            'Pass Rate': parseFloat((passRate * 100).toFixed(1)),
            'Consistency': parseFloat((consistency * 100).toFixed(1)),
            'Efficiency': parseFloat(Math.min(100, (efficiency * 50)).toFixed(1)), // Scale efficiency
            'Engagement': parseFloat((engagement * 100).toFixed(1)),
            'Team Size': parseFloat(Math.min(100, (teamSize / 20) * 100).toFixed(1)), // Scale team size (max 20)
          },
          // Raw values for tooltips
          rawData: {
            avgScore: (avgScore * 100).toFixed(1),
            avgTime: Math.round(avgTime / 60),
            passRate: (passRate * 100).toFixed(1),
            teamSize,
            testsPerUser: testsPerUser.toFixed(1),
            count: group.count,
            consistency: (consistency * 100).toFixed(1)
          }
        };
      })
      .sort((a, b) => parseFloat(b.metrics['Avg Score']) - parseFloat(a.metrics['Avg Score']))
      .slice(0, 5); // Show top 5 supervisors for readability

    // Transform data for Nivo radar chart format
    const metrics = ['Avg Score', 'Pass Rate', 'Consistency', 'Efficiency', 'Engagement', 'Team Size'];
    const radarData = metrics.map(metric => {
      const dataPoint = { metric };
      supervisorData.forEach(supervisor => {
        dataPoint[supervisor.supervisor] = supervisor.metrics[metric];
      });
      return dataPoint;
    });

    return {
      data: radarData,
      supervisors: supervisorData.map(s => s.supervisor),
      supervisorDetails: supervisorData
    };
  }, [chartFilteredData]);

  const chartData = supervisorMetrics.data;

  // Handle supervisor click for drill-down
  const handleSupervisorClick = (point) => {
    const supervisorData = supervisorMetrics.supervisorDetails.find(s => s.supervisor === point.id);
    if (supervisorData) {
      drillDown('supervisor', {
        fullName: supervisorData.fullName,
        supervisor: supervisorData.supervisor
      }, 'supervisor-effectiveness');
    }
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

  // For the new data structure, keys are the supervisor names
  const radarKeys = supervisorMetrics.supervisors;



  // Use the transformed radar data
  const dataToUse = chartData;

  // Custom legend colors
  const legendColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="h-full w-full relative" style={{ overflow: 'visible' }}>
      {/* Custom Legend */}
     <div className="absolute z-20 p-1" style={{ top: '-6px', left: '-4px' }}>
        <div className="space-y-1">
          {radarKeys.map((supervisor, index) => (
            <div key={supervisor} className="flex items-center space-x-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: legendColors[index] }}
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {supervisor}
              </span>
            </div>
          ))}
        </div>
      </div>

        <ResponsiveRadar
        data={dataToUse}
        keys={radarKeys}
        indexBy="metric"
        valueFormat=">-.1f"
        maxValue="auto"
        margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
        borderColor={{ from: 'color' }}
        borderWidth={2}
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={36}
        enableDots={true}
        dotSize={6}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        dotBorderColor={{ from: 'color' }}
        enableDotLabel={false}
        fillOpacity={0.1}
        blendMode="multiply"
        animate={shouldAnimate.current}
        motionStiffness={90}
        motionDamping={15}
        isInteractive={true}
        theme={{
          background: 'transparent',
          text: {
            fontSize: 11,
            fill: isDark ? '#e2e8f0' : '#475569',
          },
          tooltip: {
            container: {
              background: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#e2e8f0' : '#475569',
              fontSize: 12,
              borderRadius: 6,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: `2px solid ${isDark ? '#475569' : '#e2e8f0'}`,
              padding: '12px',
              minWidth: '280px',
              maxWidth: '350px'
            },
          },
          grid: {
            line: {
              stroke: isDark ? '#475569' : '#cbd5e1',
              strokeWidth: 1,
            },
          },
        }}
        colors={legendColors}
        legends={[]}


        onClick={(point) => {
          if (point) {
            handleSupervisorClick(point);
          }
        }}
      />
    </div>
  );
};

export default SupervisorEffectivenessChart;
