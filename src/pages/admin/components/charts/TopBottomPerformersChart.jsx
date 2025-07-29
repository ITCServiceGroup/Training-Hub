import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboard } from '../../contexts/DashboardContext';
import { filterDataForChart } from '../../utils/dashboardFilters';
import EnhancedTooltip from './EnhancedTooltip';
import { FaToggleOn, FaToggleOff, FaEye, FaEyeSlash } from 'react-icons/fa';

const TopBottomPerformersChart = ({ data = [], loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { getFiltersForChart, shouldFilterChart } = useDashboard();
  const [showTopPerformers, setShowTopPerformers] = useState(true);
  const [anonymizeNames, setAnonymizeNames] = useState(true);
  const [performerCount, setPerformerCount] = useState(10);

  // Enhanced anonymization function
  const anonymizeName = (ldap) => {
    if (!anonymizeNames) return ldap;
    
    // Create a stable hash from the LDAP for consistent anonymization
    let hash = 0;
    for (let i = 0; i < ldap.length; i++) {
      const char = ldap.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert hash to positive number
    hash = Math.abs(hash);
    
    // Generate anonymous identifier
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Theta', 'Sigma', 'Omega', 'Zeta', 'Kappa', 'Lambda'];
    const suffixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
    
    const prefixIndex = hash % prefixes.length;
    const suffixIndex = Math.floor(hash / 100) % suffixes.length;
    
    return `${prefixes[prefixIndex]}-${suffixes[suffixIndex]}`;
  };

  // Track data changes and drill down state to control animations
  const prevDataRef = useRef(null);
  const prevFiltersRef = useRef(null);
  const shouldAnimate = useRef(false);

  useEffect(() => {
    const filters = getFiltersForChart('top-bottom-performers');
    const filtersChanged = prevFiltersRef.current !== null && 
      JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    const dataChanged = prevDataRef.current !== null && 
      JSON.stringify(prevDataRef.current) !== JSON.stringify(data);

    // Animate if this is a filter change (drill down) or data change, but not on initial mount
    shouldAnimate.current = filtersChanged || dataChanged;
    
    prevDataRef.current = data;
    prevFiltersRef.current = filters;
  }, [data, getFiltersForChart]);

  // Get filtered data using the centralized filtering utility
  const filteredData = useMemo(() => {
    const filters = getFiltersForChart('top-bottom-performers');
    const shouldFilter = shouldFilterChart('top-bottom-performers');
    return filterDataForChart(data, filters, 'top-bottom-performers', shouldFilter);
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process data by individual performers
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // First, identify users with 2+ tests overall (unfiltered)
    const allUserGroups = {};
    data.forEach(result => {
      const ldap = result.ldap || 'Unknown';
      if (!allUserGroups[ldap]) {
        allUserGroups[ldap] = 0;
      }
      allUserGroups[ldap]++;
    });

    // Get users who have 1+ tests overall
    const qualifyingUsers = Object.keys(allUserGroups).filter(ldap => allUserGroups[ldap] >= 1);

    if (qualifyingUsers.length === 0) return [];

    // Now filter the data and group by qualifying users only
    const userGroups = {};

    filteredData.forEach(result => {
      const ldap = result.ldap || 'Unknown';

      // Only include users who have 2+ tests overall
      if (!qualifyingUsers.includes(ldap)) return;

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

    // Calculate averages and format for chart (only for users who have data in the filtered set)
    const userData = Object.entries(userGroups)
      .filter(([ldap, group]) => group.count > 0) // Must have at least 1 test in filtered data
      .map(([ldap, group]) => {
        const avgScore = group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length;
        const avgTime = group.times.reduce((sum, time) => sum + time, 0) / group.times.length;
        const bestScore = Math.max(...group.scores);
        const worstScore = Math.min(...group.scores);
        const consistency = 1 - (Math.sqrt(group.scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / group.scores.length));

        return {
          ldap: anonymizeName(ldap),
          fullLdap: ldap,
          averageScore: (avgScore * 100).toFixed(1),
          averageTime: Math.round(avgTime / 60), // Convert to minutes
          bestScore: (bestScore * 100).toFixed(1),
          worstScore: (worstScore * 100).toFixed(1),
          consistency: (consistency * 100).toFixed(1),
          count: group.count,
          totalTests: allUserGroups[ldap], // Show total tests for context
          supervisor: group.supervisor,
          market: group.market,
          latestTest: group.latestTest,
          trend: group.scores.length > 1 ?
            (group.scores[group.scores.length - 1] > group.scores[0] ? 'improving' : 'declining') : 'stable'
        };
      })
      .sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore));

    // Return top or bottom performers based on toggle
    if (showTopPerformers) {
      return userData.slice(0, performerCount);
    } else {
      return userData.slice(-performerCount).reverse();
    }
  }, [data, filteredData, showTopPerformers, anonymizeNames, performerCount]);

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
    <div className="h-full w-full relative">
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
              zIndex: 9999,
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
        labelTextColor={isDark ? '#ffffff' : '#000000'}
        animate={shouldAnimate.current}
        motionStiffness={90}
        motionDamping={15}
        tooltip={({ id, value, data }) => {
          const tooltipData = [
            { label: 'User', value: anonymizeNames ? data.ldap : data.fullLdap },
            { label: 'Average Score', value: `${value}%` },
            { label: 'Best Score', value: `${data.bestScore}%` },
            { label: 'Worst Score', value: `${data.worstScore}%` },
            { label: 'Consistency', value: `${data.consistency}%` },
            { label: 'Filtered Tests', value: data.count },
            { label: 'Total Tests', value: data.totalTests },
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
