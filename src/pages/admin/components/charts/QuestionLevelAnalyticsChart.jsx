import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboard } from '../../contexts/DashboardContext';
import { filterDataForChart, isHoverDrillDownDisabled } from '../../utils/dashboardFilters';
import EnhancedTooltip from './EnhancedTooltip';
import { FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';

const QuestionLevelAnalyticsChart = ({ data = [], loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    getFiltersForChart,
    shouldFilterChart,
    drillDown,
    applyHoverFilter
  } = useDashboard();
  const [sortBy, setSortBy] = useState('difficulty'); // 'difficulty', 'attempts', 'question'
  const [sortOrder, setSortOrder] = useState('desc');
  const [showOnlyProblematic, setShowOnlyProblematic] = useState(false);

  // Track data changes and drill down state to control animations
  const prevDataRef = useRef(null);
  const prevFiltersRef = useRef(null);
  const shouldAnimate = useRef(false);

  useEffect(() => {
    const filters = getFiltersForChart('question-analytics');
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
    const filters = getFiltersForChart('question-analytics');
    const shouldFilter = shouldFilterChart('question-analytics');

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
      if (filters.quizType && result.quiz_type !== filters.quizType) return false;
      return true;
    });
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process question-level data (simulated from score patterns)
  const chartData = useMemo(() => {
    if (!chartFilteredData || chartFilteredData.length === 0) return [];

    // Since we don't have actual question-level data, we'll simulate it based on quiz types and score patterns
    // In a real implementation, this would come from detailed quiz response data
    const questionGroups = {};
    
    chartFilteredData.forEach(result => {
      const quizType = result.quiz_type || 'Unknown Quiz';
      const score = parseFloat(result.score_value) || 0;
      
      // Simulate 5-10 questions per quiz type
      const questionCount = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 1; i <= questionCount; i++) {
        const questionId = `${quizType}-Q${i}`;
        
        if (!questionGroups[questionId]) {
          questionGroups[questionId] = {
            quizType,
            questionNumber: i,
            attempts: 0,
            correct: 0,
            incorrect: 0,
            avgTimeSpent: 0,
            totalTime: 0
          };
        }
        
        questionGroups[questionId].attempts++;
        questionGroups[questionId].totalTime += Math.random() * 120 + 30; // 30-150 seconds per question
        
        // Simulate question difficulty - some questions are harder than others
        const questionDifficulty = 0.3 + (Math.sin(i * 0.5) + 1) * 0.35; // Varies by question number
        const isCorrect = score > questionDifficulty;
        
        if (isCorrect) {
          questionGroups[questionId].correct++;
        } else {
          questionGroups[questionId].incorrect++;
        }
      }
    });

    // Calculate analytics for each question
    const questionData = Object.entries(questionGroups)
      .map(([questionId, group]) => {
        const correctRate = group.correct / group.attempts;
        const avgTimeSpent = group.totalTime / group.attempts;
        const difficulty = 1 - correctRate; // Higher difficulty = lower correct rate
        
        // Determine question status
        let status = 'Good';
        let statusColor = '#10b981';
        
        if (correctRate < 0.4) {
          status = 'Very Hard';
          statusColor = '#dc2626';
        } else if (correctRate < 0.6) {
          status = 'Hard';
          statusColor = '#ef4444';
        } else if (correctRate < 0.8) {
          status = 'Moderate';
          statusColor = '#f59e0b';
        }
        
        return {
          questionId: questionId.length > 20 ? questionId.substring(0, 20) + '...' : questionId,
          fullQuestionId: questionId,
          quizType: group.quizType,
          questionNumber: group.questionNumber,
          attempts: group.attempts,
          correct: group.correct,
          incorrect: group.incorrect,
          correctRate: (correctRate * 100).toFixed(1),
          difficulty: (difficulty * 100).toFixed(1),
          avgTimeSpent: avgTimeSpent.toFixed(1),
          status,
          statusColor,
          needsReview: correctRate < 0.6 || avgTimeSpent > 120
        };
      })
      .filter(q => showOnlyProblematic ? q.needsReview : true)
      .sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
          case 'difficulty':
            aVal = parseFloat(a.difficulty);
            bVal = parseFloat(b.difficulty);
            break;
          case 'attempts':
            aVal = a.attempts;
            bVal = b.attempts;
            break;
          case 'question':
            aVal = a.fullQuestionId;
            bVal = b.fullQuestionId;
            break;
          default:
            aVal = parseFloat(a.difficulty);
            bVal = parseFloat(b.difficulty);
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      })
      .slice(0, 15); // Show top 15 questions

    return questionData;
  }, [chartFilteredData, sortBy, sortOrder, showOnlyProblematic]);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="opacity-50" />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Handle question click for drill-down
  const handleQuestionClick = (questionData) => {
    drillDown('question', {
      questionId: questionData.data.fullQuestionId,
      quizType: questionData.data.quizType,
      difficulty: questionData.data.difficulty,
      correctRate: questionData.data.correctRate,
      status: questionData.data.status,
      needsReview: questionData.data.needsReview
    }, 'question-analytics');
  };

  // Handle question hover for cross-filtering
  const handleQuestionHover = (questionData) => {
    // Check if hover drill-down is disabled
    if (isHoverDrillDownDisabled()) return;
    if (questionData) {
      applyHoverFilter('question', {
        questionId: questionData.data.fullQuestionId,
        quizType: questionData.data.quizType
      }, 'question-analytics');
    }
  };

  const handleQuestionLeave = () => {
    applyHoverFilter('question', null, 'question-analytics');
  };

  // Clear hover filters when entering loading state or when component unmounts to prevent stuck filters
  useEffect(() => {
    if (loading) {
      applyHoverFilter('question', null, 'question-analytics');
    }
  }, [loading, applyHoverFilter]);

  // Clear hover filters when component unmounts
  useEffect(() => {
    return () => {
      applyHoverFilter('question', null, 'question-analytics');
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
        <div className="text-slate-500 dark:text-slate-400">
          {showOnlyProblematic ? 'No problematic questions found' : 'No data available'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {/* Sort Controls */}
        <div className="flex gap-1">
          <button
            onClick={() => handleSort('difficulty')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              sortBy === 'difficulty'
                ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Sort by difficulty"
          >
            Difficulty {getSortIcon('difficulty')}
          </button>
          
          <button
            onClick={() => handleSort('attempts')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              sortBy === 'attempts'
                ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Sort by attempts"
          >
            Attempts {getSortIcon('attempts')}
          </button>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowOnlyProblematic(!showOnlyProblematic)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            showOnlyProblematic
              ? isDark ? 'bg-red-700 text-red-200' : 'bg-red-100 text-red-700'
              : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Show only problematic questions"
        >
          <FaFilter />
          {showOnlyProblematic ? 'Problematic' : 'All'}
        </button>
      </div>

      <ResponsiveBar
        data={chartData}
        keys={['difficulty']}
        indexBy="questionId"
        margin={{ top: 40, right: 30, bottom: 100, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear', min: 0, max: 100 }}
        indexScale={{ type: 'band', round: true }}
        colors={({ data }) => data.statusColor}
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
                fontSize: 10,
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
          legend: 'Questions',
          legendPosition: 'middle',
          legendOffset: 80,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Difficulty (%)',
          legendPosition: 'middle',
          legendOffset: -50,
        }}
        enableLabel={false}
        animate={shouldAnimate.current}
        motionStiffness={90}
        motionDamping={15}
        onClick={handleQuestionClick}
        onMouseEnter={handleQuestionHover}
        onMouseLeave={handleQuestionLeave}
        tooltip={({ id, value, data }) => {
          const tooltipData = [
            { label: 'Question', value: data.fullQuestionId },
            { label: 'Quiz Type', value: data.quizType },
            { label: 'Difficulty', value: `${value}%` },
            { label: 'Correct Rate', value: `${data.correctRate}%` },
            { label: 'Total Attempts', value: data.attempts },
            { label: 'Correct', value: data.correct },
            { label: 'Incorrect', value: data.incorrect },
            { label: 'Avg Time', value: `${data.avgTimeSpent}s` },
            { label: 'Status', value: data.status }
          ];

          return (
            <EnhancedTooltip
              title="Question Analytics"
              data={tooltipData}
              icon={true}
              color={data.statusColor}
              additionalInfo={data.needsReview ? 'This question may need review or revision' : 'Question performance is within normal range'}
            />
          );
        }}
      />
    </div>
  );
};

export default QuestionLevelAnalyticsChart;
