import React, { useMemo, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboardFilters } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';
import { FaToggleOn, FaToggleOff, FaEye, FaEyeSlash } from 'react-icons/fa';

const TopBottomPerformersChart = ({ data = [], loading = false }) => {
  const { isDark } = useTheme();
  const { getFiltersForChart, shouldFilterChart } = useDashboardFilters();
  const [showTopPerformers, setShowTopPerformers] = useState(true);
  const [anonymizeNames, setAnonymizeNames] = useState(true);
  const [performerCount, setPerformerCount] = useState(10);

  // Filter data for this chart (includes hover filters from other charts, excludes own hover)
  const chartFilteredData = useMemo(() => {
    const filters = getFiltersForChart('top-bottom-performers');
    const shouldFilter = shouldFilterChart('top-bottom-performers');

    if (!shouldFilter) return data;

    return data.filter(result => {
      if (filters.supervisor && result.supervisor !== filters.supervisor) return false;
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

  // Process data by individual performers
  const chartData = useMemo(() => {
    if (!chartFilteredData || chartFilteredData.length === 0) return [];

    // Group by LDAP (individual user)
    const userGroups = {};
    
    chartFilteredData.forEach(result => {
      const ldap = result.ldap || 'Unknown';
      if (!userGroups[ldap]) {
        userGroups[ldap] = {
          scores: [],
          times: [],
          count: 0,
          supervisor: result.supervisor || 'Unknown',
          market: result.market || 'Unknown',
          latestTest: result.date_of_test
        };
      }
      
      userGroups[ldap].scores.push(parseFloat(result.score_value) || 0);
      userGroups[ldap].times.push(parseInt(result.time_taken) || 0);
      userGroups[ldap].count++;
      
      // Keep track of latest test date
      if (new Date(result.date_of_test) > new Date(userGroups[ldap].latestTest)) {
        userGroups[ldap].latestTest = result.date_of_test;
      }
    });

    // Calculate averages and format for chart
    const userData = Object.entries(userGroups)
      .map(([ldap, group]) => {
        const avgScore = group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length;
        const avgTime = group.times.reduce((sum, time) => sum + time, 0) / group.times.length;
        const bestScore = Math.max(...group.scores);
        const worstScore = Math.min(...group.scores);
        const consistency = 1 - (Math.sqrt(group.scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / group.scores.length));
        
        return {
          ldap: anonymizeNames ? `User ${ldap.slice(-4)}` : ldap,
          fullLdap: ldap,
          averageScore: (avgScore * 100).toFixed(1),
          averageTime: Math.round(avgTime / 60), // Convert to minutes
          bestScore: (bestScore * 100).toFixed(1),
          worstScore: (worstScore * 100).toFixed(1),
          consistency: (consistency * 100).toFixed(1),
          count: group.count,
          supervisor: group.supervisor,
          market: group.market,
          latestTest: group.latestTest,
          trend: group.scores.length > 1 ? 
            (group.scores[group.scores.length - 1] > group.scores[0] ? 'improving' : 'declining') : 'stable'
        };
      })
      .filter(user => user.count >= 2) // Only show users with multiple tests
      .sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore));

    // Return top or bottom performers based on toggle
    if (showTopPerformers) {
      return userData.slice(0, performerCount);
    } else {
      return userData.slice(-performerCount).reverse();
    }
  }, [chartFilteredData, showTopPerformers, anonymizeNames, performerCount]);

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
        <div className="text-slate-500 dark:text-slate-400">No data available (requires users with 2+ tests)</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative" style={{ height: '275px' }}>
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {/* Top/Bottom Toggle */}
        <button
          onClick={() => setShowTopPerformers(!showTopPerformers)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            isDark 
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title={showTopPerformers ? 'Show bottom performers' : 'Show top performers'}
        >
          {showTopPerformers ? <FaToggleOn className="text-green-500" /> : <FaToggleOff />}
          {showTopPerformers ? 'Top' : 'Bottom'}
        </button>

        {/* Anonymize Toggle */}
        <button
          onClick={() => setAnonymizeNames(!anonymizeNames)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            isDark 
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title={anonymizeNames ? 'Show real names' : 'Anonymize names'}
        >
          {anonymizeNames ? <FaEyeSlash /> : <FaEye />}
          {anonymizeNames ? 'Anonymous' : 'Names'}
        </button>
      </div>

      <ResponsiveBar
        data={chartData}
        keys={['averageScore']}
        indexBy="ldap"
        margin={{ top: 40, right: 30, bottom: 80, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear', min: 0, max: 100 }}
        indexScale={{ type: 'band', round: true }}
        colors={({ data }) => {
          const score = parseFloat(data.averageScore);
          if (showTopPerformers) {
            if (score >= 95) return '#059669'; // Dark green
            if (score >= 90) return '#10b981'; // Green
            if (score >= 85) return '#3b82f6'; // Blue
            return '#6366f1'; // Indigo
          } else {
            if (score <= 50) return '#dc2626'; // Dark red
            if (score <= 60) return '#ef4444'; // Red
            if (score <= 70) return '#f59e0b'; // Orange
            return '#eab308'; // Yellow
          }
        }}
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
          legend: showTopPerformers ? 'Top Performers' : 'Bottom Performers',
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
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        tooltip={({ id, value, data }) => {
          const tooltipData = [
            { label: 'User', value: anonymizeNames ? data.ldap : data.fullLdap },
            { label: 'Average Score', value: `${value}%` },
            { label: 'Best Score', value: `${data.bestScore}%` },
            { label: 'Worst Score', value: `${data.worstScore}%` },
            { label: 'Consistency', value: `${data.consistency}%` },
            { label: 'Tests Taken', value: data.count },
            { label: 'Supervisor', value: data.supervisor },
            { label: 'Market', value: data.market },
            { label: 'Trend', value: data.trend }
          ];

          const color = parseFloat(value) >= 90 ? '#10b981' : 
                       parseFloat(value) >= 80 ? '#3b82f6' : 
                       parseFloat(value) >= 70 ? '#f59e0b' : '#ef4444';

          return (
            <EnhancedTooltip
              title={showTopPerformers ? "Top Performer" : "Bottom Performer"}
              data={tooltipData}
              icon={true}
              color={color}
              additionalInfo={`${data.count} tests with ${data.consistency}% consistency`}
            />
          );
        }}
      />
    </div>
  );
};

export default TopBottomPerformersChart;
