import React, { useMemo, useRef, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboardFilters } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';

const QuizTypePerformanceChart = ({ data = [], loading = false }) => {
  const { isDark } = useTheme();
  const { getFiltersForChart, shouldFilterChart, drillDown, applyHoverFilter } = useDashboardFilters();

  // Track data changes and drill down state to control animations
  const prevDataRef = useRef(null);
  const prevFiltersRef = useRef(null);
  const shouldAnimate = useRef(false);

  useEffect(() => {
    const filters = getFiltersForChart('quiz-type-performance');
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
    const filters = getFiltersForChart('quiz-type-performance');
    const shouldFilter = shouldFilterChart('quiz-type-performance');

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

  // Process data by quiz type
  const chartData = useMemo(() => {
    if (!chartFilteredData || chartFilteredData.length === 0) return [];

    // Group by quiz type
    const quizTypeGroups = {};
    
    chartFilteredData.forEach(result => {
      const quizType = result.quiz_type || 'Unknown';
      if (!quizTypeGroups[quizType]) {
        quizTypeGroups[quizType] = {
          records: [],
          count: 0
        };
      }
      
      quizTypeGroups[quizType].records.push(result);
      quizTypeGroups[quizType].count++;
    });

    // Calculate averages and format for chart
    const quizTypeData = Object.entries(quizTypeGroups)
      .map(([quizType, group]) => {
        // Only process records with valid thresholds
        const validRecords = group.records.filter(r => r.passing_score != null);
        if (validRecords.length === 0) return null;
        
        const scores = validRecords.map(r => parseFloat(r.score_value) || 0);
        const times = validRecords.map(r => parseInt(r.time_taken) || 0);
        
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        
        // Calculate pass rate using actual thresholds
        const passedCount = validRecords.filter(r => {
          const score = parseFloat(r.score_value) || 0;
          const threshold = r.passing_score; // Already in decimal format
          return score >= threshold;
        }).length;
        const passRate = passedCount / validRecords.length;
        
        return {
          quizType: quizType.length > 20 ? quizType.substring(0, 20) + '...' : quizType,
          fullName: quizType,
          averageScore: (avgScore * 100).toFixed(1),
          averageTime: Math.round(avgTime / 60), // Convert to minutes
          passRate: (passRate * 100).toFixed(1),
          count: validRecords.length,
          difficulty: avgScore < 0.6 ? 'Hard' : avgScore < 0.8 ? 'Medium' : 'Easy'
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore))
      .slice(0, 10); // Show top 10 quiz types

    return quizTypeData;
  }, [chartFilteredData]);

  // Handle quiz type click for drill-down
  const handleQuizTypeClick = (quizTypeData) => {
    drillDown('quizType', {
      fullName: quizTypeData.data.fullName,
      quizType: quizTypeData.data.quizType,
      averageScore: quizTypeData.data.averageScore,
      passRate: quizTypeData.data.passRate,
      difficulty: quizTypeData.data.difficulty
    }, 'quiz-type-performance');
  };

  // Handle quiz type hover for cross-filtering
  const handleQuizTypeHover = (quizTypeData) => {
    if (quizTypeData) {
      applyHoverFilter('quizType', quizTypeData.data.fullName, 'quiz-type-performance');
    }
  };

  const handleQuizTypeLeave = () => {
    applyHoverFilter('quizType', null, 'quiz-type-performance');
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
        indexBy="quizType"
        margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear', min: 0, max: 100 }}
        indexScale={{ type: 'band', round: true }}
        colors={({ data }) => {
          const score = parseFloat(data.averageScore);
          if (score >= 90) return '#10b981'; // Green
          if (score >= 80) return '#3b82f6'; // Blue
          if (score >= 70) return '#f59e0b'; // Orange
          return '#ef4444'; // Red
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
          legend: 'Quiz Type',
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
        onClick={handleQuizTypeClick}
        onMouseEnter={handleQuizTypeHover}
        onMouseLeave={handleQuizTypeLeave}
        tooltip={({ id, value, data }) => {
          const tooltipData = [
            { label: 'Quiz Type', value: data.fullName },
            { label: 'Average Score', value: `${value}%` },
            { label: 'Pass Rate', value: `${data.passRate}%` },
            { label: 'Avg Time', value: `${data.averageTime} min` },
            { label: 'Tests Taken', value: data.count },
            { label: 'Difficulty', value: data.difficulty }
          ];

          const color = parseFloat(value) >= 90 ? '#10b981' : 
                       parseFloat(value) >= 80 ? '#3b82f6' : 
                       parseFloat(value) >= 70 ? '#f59e0b' : '#ef4444';

          return (
            <EnhancedTooltip
              title="Quiz Type Performance"
              data={tooltipData}
              icon={true}
              color={color}
              additionalInfo={`${data.count} tests completed with ${data.passRate}% pass rate`}
            />
          );
        }}
      />
    </div>
  );
};

export default QuizTypePerformanceChart;
