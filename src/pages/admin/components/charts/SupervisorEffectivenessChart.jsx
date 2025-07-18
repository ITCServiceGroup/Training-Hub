import React, { useMemo } from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboardFilters } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';

const SupervisorEffectivenessChart = ({ data = [], loading = false }) => {
  const { isDark } = useTheme();
  const { getFiltersForChart, shouldFilterChart, drillDown, applyHoverFilter } = useDashboardFilters();

  // Filter data for this chart (includes hover filters from other charts, excludes own hover)
  const chartFilteredData = useMemo(() => {
    const filters = getFiltersForChart('supervisor-effectiveness');
    const shouldFilter = shouldFilterChart('supervisor-effectiveness');

    if (!shouldFilter) return data;

    return data.filter(result => {
      if (filters.market && result.market !== filters.market) return false;
      if (filters.timeRange) {
        const resultDate = new Date(result.date_of_test);
        const startDate = new Date(filters.timeRange.startDate);
        const endDate = new Date(filters.timeRange.endDate);
        if (resultDate < startDate || resultDate > endDate) return false;
      }
      if (filters.scoreRange) {
        const score = parseFloat(result.score_value) * 100;
        if (score < filters.scoreRange.min || score > filters.scoreRange.max) return false;
      }
      if (filters.quizType && result.quiz_type !== filters.quizType) return false;
      return true;
    });
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process data by supervisor with multiple effectiveness metrics
  const chartData = useMemo(() => {
    if (!chartFilteredData || chartFilteredData.length === 0) return [];

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
          supervisor: supervisor.length > 15 ? supervisor.substring(0, 15) + '...' : supervisor,
          fullName: supervisor,
          // Normalize all metrics to 0-100 scale for radar chart
          'Avg Score': (avgScore * 100).toFixed(1),
          'Pass Rate': (passRate * 100).toFixed(1),
          'Consistency': (consistency * 100).toFixed(1),
          'Efficiency': Math.min(100, (efficiency * 50)).toFixed(1), // Scale efficiency
          'Engagement': (engagement * 100).toFixed(1),
          'Team Size': Math.min(100, (teamSize / 20) * 100).toFixed(1), // Scale team size (max 20)
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
      .sort((a, b) => parseFloat(b['Avg Score']) - parseFloat(a['Avg Score']))
      .slice(0, 5); // Show top 5 supervisors for readability

    return supervisorData;
  }, [chartFilteredData]);

  // Handle supervisor click for drill-down
  const handleSupervisorClick = (point) => {
    const supervisorData = chartData.find(s => s.supervisor === point.id);
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

  const radarKeys = ['Avg Score', 'Pass Rate', 'Consistency', 'Efficiency', 'Engagement', 'Team Size'];

  return (
    <div className="h-full w-full relative" style={{ height: '275px' }}>
      {/* Legend */}
      <div className="absolute top-2 left-2 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 p-2">
        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Effectiveness Metrics</div>
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
          <div>• Score: Average test scores</div>
          <div>• Pass Rate: % passing tests</div>
          <div>• Consistency: Score reliability</div>
          <div>• Efficiency: Score vs time</div>
          <div>• Engagement: Tests per user</div>
          <div>• Team Size: Number of users</div>
        </div>
      </div>

      <ResponsiveRadar
        data={chartData}
        keys={radarKeys}
        indexBy="supervisor"
        valueFormat=">-.1f"
        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
        borderColor={{ from: 'color' }}
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={36}
        enableDots={true}
        dotSize={6}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        dotBorderColor={{ from: 'color' }}
        enableDotLabel={false}
        colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
        fillOpacity={0.1}
        blendMode="multiply"
        animate={true}
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
              border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
            },
          },
          grid: {
            line: {
              stroke: isDark ? '#475569' : '#cbd5e1',
              strokeWidth: 1,
            },
          },
        }}
        legends={[
          {
            anchor: 'top-left',
            direction: 'column',
            translateX: -50,
            translateY: -40,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: isDark ? '#e2e8f0' : '#475569',
            symbolSize: 12,
            symbolShape: 'circle',
          },
        ]}
        tooltip={({ id, value, formattedValue, color }) => {
          const supervisorData = chartData.find(s => s.supervisor === id);
          if (!supervisorData) return null;

          const tooltipData = [
            { label: 'Supervisor', value: supervisorData.fullName },
            { label: 'Team Size', value: supervisorData.rawData.teamSize },
            { label: 'Total Tests', value: supervisorData.rawData.count },
            { label: 'Avg Score', value: `${supervisorData.rawData.avgScore}%` },
            { label: 'Pass Rate', value: `${supervisorData.rawData.passRate}%` },
            { label: 'Avg Time', value: `${supervisorData.rawData.avgTime} min` },
            { label: 'Tests/User', value: supervisorData.rawData.testsPerUser },
            { label: 'Consistency', value: `${supervisorData.rawData.consistency}%` }
          ];

          return (
            <EnhancedTooltip
              title="Supervisor Effectiveness"
              data={tooltipData}
              icon={true}
              color={color}
              additionalInfo={`Managing ${supervisorData.rawData.teamSize} team members with ${supervisorData.rawData.passRate}% pass rate`}
            />
          );
        }}
      />
    </div>
  );
};

export default SupervisorEffectivenessChart;
