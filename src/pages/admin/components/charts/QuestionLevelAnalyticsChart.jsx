import React, { useMemo, useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboard } from '../../contexts/DashboardContext';
import { filterDataForChart, isHoverDrillDownDisabled } from '../../utils/dashboardFilters';
import { questionAnalyticsService } from '../../services/questionAnalyticsService';

// Global cache that persists across component mounts/unmounts
const globalQuestionDataCache = new Map();
const GLOBAL_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Make cache clearing available globally for debugging
if (typeof window !== 'undefined') {
  window.clearAllQuestionAnalyticsCaches = () => {
    globalQuestionDataCache.clear();
    if (window.questionAnalyticsService) {
      window.questionAnalyticsService.clearCache();
    }
    console.log('🧹 All question analytics caches cleared (global + service). Refresh the page to see new data.');
  };

  // Force refresh function for debugging
  window.forceQuestionAnalyticsRefresh = () => {
    globalQuestionDataCache.clear();
    if (window.questionAnalyticsService) {
      window.questionAnalyticsService.clearCache();
    }
    // Force a page reload to completely reset the component state
    window.location.reload();
  };

  // Force refresh without page reload (for testing)
  window.forceQuestionAnalyticsRefreshNoReload = () => {
    globalQuestionDataCache.clear();
    if (window.questionAnalyticsService) {
      window.questionAnalyticsService.clearCache();
    }
    // Try to trigger a re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('forceQuestionAnalyticsRefresh'));
    console.log('🔄 Forced question analytics refresh without page reload');
  };
}
import EnhancedTooltip from './EnhancedTooltip';
import { FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';

// Helper function to format question types nicely
const formatQuestionType = (questionType) => {
  if (!questionType || questionType === 'Unknown') return 'Unknown';
  
  // Convert underscores to spaces and capitalize each word
  return questionType
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const QuestionLevelAnalyticsChart = ({ data = [], loading = false }) => {
  // Initialize state by checking global cache first
  const [questionState, setQuestionState] = useState(() => {
    // Check if we have cached data for this component instance
    const signature = data.length > 0 ? `${data.length}-${data[0]?.id || 'no-id'}-${data[data.length - 1]?.id || 'no-id'}` : 'empty';
    const cached = globalQuestionDataCache.get(signature);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < GLOBAL_CACHE_DURATION) {
      console.log('💾 QuestionAnalytics: Found cached data on mount!', { signature, cachedDataLength: cached.data.length });
      return {
        data: cached.data,
        loading: false,
        hasEverLoaded: true
      };
    }
    
    console.log('🆕 QuestionAnalytics: Starting fresh (no cache)', { signature });
    return {
      data: [],
      loading: false,
      hasEverLoaded: false
    };
  });

  // Debug logging to understand what's happening
  useEffect(() => {
    console.log('🔍 QuestionAnalytics: Component render/props change', {
      dataLength: data.length,
      chartFilteredDataLength: chartFilteredData?.length || 0,
      loading,
      questionStateLoading: questionState.loading,
      hasEverLoaded: questionState.hasEverLoaded,
      questionDataLength: questionState.data.length,
      currentSignature: currentDataSignature,
      sampleData: chartFilteredData?.[0] ? {
        id: chartFilteredData[0].id,
        quiz_id: chartFilteredData[0].quiz_id,
        hasAnswers: !!chartFilteredData[0].answers,
        answersCount: chartFilteredData[0].answers ? Object.keys(chartFilteredData[0].answers).length : 0
      } : null
    });
  });
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

  // Create a stable reference for chartFilteredData to prevent unnecessary refetches
  const stableDataRef = useRef(null);
  
  // Create a stable data identifier based on length and key fields only when actually needed
  const currentDataSignature = useMemo(() => {
    if (!chartFilteredData || chartFilteredData.length === 0) return 'empty';

    // Create a more comprehensive signature that includes answers data to detect changes
    const answersHash = chartFilteredData
      .map(result => result.answers ? Object.keys(result.answers).length : 0)
      .join('-');
    const signature = `${chartFilteredData.length}-${chartFilteredData[0]?.id || 'no-id'}-${chartFilteredData[chartFilteredData.length - 1]?.id || 'no-id'}-${answersHash}`;
    return signature;
  }, [chartFilteredData]);
  
  // Only update reference when signature actually changes
  const hasDataChanged = stableDataRef.current !== currentDataSignature;
  if (hasDataChanged) {
    console.log('🔄 QuestionAnalytics: Data signature changed', {
      oldSignature: stableDataRef.current,
      newSignature: currentDataSignature,
      dataLength: chartFilteredData.length
    });
    stableDataRef.current = currentDataSignature;
    stableDataRef.previousData = chartFilteredData;
  }

  // Fetch real question-level data only when data actually changes
  useEffect(() => {
    console.log('🔄 QuestionAnalytics: useEffect triggered', {
      hasDataChanged,
      hasEverLoaded: questionState.hasEverLoaded,
      currentDataSignature,
      willSkip: !hasDataChanged && questionState.hasEverLoaded
    });
    
    // Only run if data actually changed
    if (!hasDataChanged && questionState.hasEverLoaded) {
      console.log('⏭️ QuestionAnalytics: Skipping fetch - no data change and already loaded', {
        hasDataChanged,
        currentSignature: currentDataSignature,
        hasEverLoaded: questionState.hasEverLoaded
      });
      return;
    }
    
    const fetchQuestionData = async () => {
      const currentData = stableDataRef.previousData;
      
      if (!currentData || currentData.length === 0) {
        setQuestionState(prev => ({ ...prev, data: [] }));
        return;
      }

      setQuestionState(prev => ({ ...prev, loading: true }));

      try {
        console.log('QuestionAnalytics: Processing', currentData.length, 'filtered results');
        const analytics = await questionAnalyticsService.getQuestionAnalyticsFromFilteredData(currentData);
        
        // Store in global cache for next time
        globalQuestionDataCache.set(currentDataSignature, {
          data: analytics,
          timestamp: Date.now()
        });
        
        // Single atomic state update
        setQuestionState({
          data: analytics,
          loading: false,
          hasEverLoaded: true
        });
      } catch (error) {
        console.error('Error fetching question analytics:', error);
        
        // Single atomic state update
        setQuestionState({
          data: [],
          loading: false,
          hasEverLoaded: true
        });
      }
    };

    fetchQuestionData();
  }, [currentDataSignature, hasDataChanged, questionState.hasEverLoaded]);

  // Listen for force refresh events
  useEffect(() => {
    const handleForceRefresh = () => {
      console.log('🔄 QuestionAnalytics: Force refresh triggered');
      setQuestionState({
        data: [],
        loading: false,
        hasEverLoaded: false
      });
      // Reset the stable data ref to force a refresh
      stableDataRef.current = null;
    };

    window.addEventListener('forceQuestionAnalyticsRefresh', handleForceRefresh);
    return () => {
      window.removeEventListener('forceQuestionAnalyticsRefresh', handleForceRefresh);
    };
  }, []);

  // Process and filter the real question data
  const chartData = useMemo(() => {
    if (!questionState.data || questionState.data.length === 0) {
      return [];
    }

    return questionState.data
      .filter(q => !q.isLegacyNotice && !q.isExclusionNotice) // Exclude notice items from chart
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
            aVal = a.displayText || a.questionText;
            bVal = b.displayText || b.questionText;
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
      .slice(0, 15) // Show top 15 questions
      .map(question => ({
        ...question,
        questionId: question.displayText || question.questionText.substring(0, 50) + '...'
      }));
  }, [questionState.data, sortBy, sortOrder, showOnlyProblematic]);

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
  const handleQuestionClick = useCallback((questionData) => {
    drillDown('question', {
      questionId: questionData.data.questionId,
      questionText: questionData.data.questionText,
      quizTitle: questionData.data.quizTitle,
      category: questionData.data.category,
      section: questionData.data.section,
      difficulty: questionData.data.difficulty,
      correctRate: questionData.data.correctRate,
      status: questionData.data.status,
      needsReview: questionData.data.needsReview
    }, 'question-analytics');
  }, [drillDown]);

  // Handle question hover for cross-filtering
  const handleQuestionHover = useCallback((questionData) => {
    // Check if hover drill-down is disabled
    if (isHoverDrillDownDisabled()) return;
    if (questionData) {
      applyHoverFilter('question', {
        questionId: questionData.data.questionId,
        questionText: questionData.data.questionText,
        quizTitle: questionData.data.quizTitle
      }, 'question-analytics');
    }
  }, [applyHoverFilter]);

  const handleQuestionLeave = useCallback(() => {
    applyHoverFilter('question', null, 'question-analytics');
  }, [applyHoverFilter]);

  // Create the tooltip function (always create it to avoid hook order issues)
  const tooltipFunction = useCallback(({ id, value, data }) => {
    const tooltipData = [
      { label: 'Question', value: data.questionText ? data.questionText.substring(0, 200) + (data.questionText.length > 200 ? '...' : '') : 'No question text' },
      { label: 'Quiz', value: data.quizTitle || 'Unknown Quiz' },
      { label: 'Question Type', value: formatQuestionType(data.questionType) },
      { label: 'Difficulty', value: `${value}%` },
      { label: 'Correct Rate', value: `${data.correctRate ?? 0}%` },
      { label: 'Total Attempts', value: data.attempts },
      { label: 'Correct', value: data.correct },
      { label: 'Incorrect', value: data.incorrect },
      { label: 'Avg Time', value: data.avgTimeSpent ? `${data.avgTimeSpent}s` : 'No data' },
      { label: 'Status', value: data.status }
    ];

    // Add data source indicator if it's legacy, simulated, or notice data
    if (data.isLegacyNotice || data.isExclusionNotice) {
      tooltipData.push({ label: 'Type', value: 'System Notice' });
    } else if (data.isLegacyData) {
      tooltipData.push({ label: 'Data Source', value: 'Legacy (Estimated)' });
    } else if (data.isSimulatedData) {
      tooltipData.push({ label: 'Data Source', value: 'Score-based Simulation' });
    }

    let additionalInfo = '';
    
    if (data.isLegacyNotice) {
      additionalInfo = 'Legacy quiz results do not contain question-level response data needed for this analysis.';
    } else if (data.isExclusionNotice) {
      additionalInfo = `Legacy results from ${data.excludedQuizTypes?.join(', ')} were excluded from this analysis.`;
    } else if (data.needsReview) {
      additionalInfo = data.needsReview ? 'This question may need review or revision' : 'Question performance is within normal range';
    } else {
      additionalInfo = 'Question performance is within normal range';
    }
    
    if (data.isLegacyData) {
      additionalInfo += ' | Note: This data is estimated from historical quiz results.';
    } else if (data.isSimulatedData) {
      additionalInfo += ' | Note: This data is simulated based on overall quiz scores.';
    }

    return (
      <EnhancedTooltip
        title="Question Analytics"
        data={tooltipData}
        icon={true}
        color={data.statusColor}
        additionalInfo={additionalInfo}
      />
    );
  }, []);

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

  // Show loading if either the main data is loading OR we're processing question data
  if (loading || questionState.loading) {
    console.log('📊 QuestionAnalytics: Showing loading state', { loading, questionStateLoading: questionState.loading });
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading chart...</div>
      </div>
    );
  }

  // Don't show "no data" if we haven't loaded anything yet or are still in the process
  if (chartData.length === 0) {
    console.log('📊 QuestionAnalytics: No chart data', { 
      hasEverLoaded: questionState.hasEverLoaded,
      questionDataLength: questionState.data.length 
    });
    
    // If we've never loaded data successfully, show loading instead of no data
    if (!questionState.hasEverLoaded) {
      console.log('📊 QuestionAnalytics: Showing loading for never loaded');
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-slate-500 dark:text-slate-400">Loading chart...</div>
        </div>
      );
    }
    
    console.log('📊 QuestionAnalytics: Showing no data');
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">
          {showOnlyProblematic ? 'No problematic questions found' : 'No data available'}
        </div>
      </div>
    );
  }

  // Check if we only have a legacy notice
  const hasOnlyLegacyNotice = chartData.length === 1 && chartData[0]?.isLegacyNotice;
  
  if (hasOnlyLegacyNotice) {
    const notice = chartData[0];
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-slate-600 dark:text-slate-300 text-lg font-semibold mb-2">
            Question Analytics Not Available
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            Question-level analytics require detailed response data, which is not available for legacy quiz results.
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="text-amber-800 dark:text-amber-200 text-sm">
              <div className="font-medium">Legacy Quiz Types:</div>
              <div>{notice.legacyQuizTypes?.join(', ') || notice.quizTitle}</div>
              <div className="mt-2 text-xs">
                {notice.attempts} total quiz attempts
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have excluded legacy data to show a notice
  const excludedNotice = questionState.data?.find(q => q.isExclusionNotice);

  console.log('📊 QuestionAnalytics: Rendering chart with data', { chartDataLength: chartData.length });
  
  return (
    <div className="h-full w-full relative">
      {/* Legacy data exclusion notice */}
      {excludedNotice && (
        <div className="absolute top-2 left-2 z-10 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded px-2 py-1">
          <div className="text-amber-800 dark:text-amber-200 text-xs font-medium">
            ⚠️ {excludedNotice.attempts} legacy results excluded
          </div>
        </div>
      )}
      
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
              minWidth: '400px',
              maxWidth: '600px',
              padding: '12px',
              lineHeight: '1.4',
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
        animate={false}
        motionStiffness={90}
        motionDamping={15}
        onClick={handleQuestionClick}
        onMouseEnter={handleQuestionHover}
        onMouseLeave={handleQuestionLeave}
        tooltip={tooltipFunction}
      />
    </div>
  );
};

export default QuestionLevelAnalyticsChart;
