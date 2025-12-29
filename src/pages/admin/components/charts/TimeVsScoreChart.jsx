import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboardPreferences } from '../../../../contexts/DashboardPreferencesContext';
import { useDashboardFilters } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';
import { FaExpand, FaCompress, FaEye, FaEyeSlash } from 'react-icons/fa';
import { filterDataForChart } from '../../utils/dashboardFilters';

const TimeVsScoreChart = ({ data = [], loading = false, globalFilters = {} }) => {
  const { theme } = useTheme();
  const { dashboardPreferences } = useDashboardPreferences();
  const isDark = theme === 'dark';
  const { getFiltersForChart, getCombinedFilters, shouldFilterChart } = useDashboardFilters();

  // Calculate dynamic score threshold based on actual pass thresholds in data
  const calculateDefaultScoreThreshold = useCallback((data) => {
    if (!data || data.length === 0) {
      return 90; // Fallback to 90% if no data
    }

    // Extract pass thresholds from the data
    const passThresholds = data
      .map(result => result.passing_score)
      .filter(threshold => threshold != null && threshold > 0);

    if (passThresholds.length === 0) {
      return 90; // Fallback if no thresholds found
    }

    // Get unique thresholds and calculate their simple average
    // This gives us the simple average: (80% + 90%) / 2 = 85%
    const uniqueThresholds = [...new Set(passThresholds)];
    const avgThreshold = uniqueThresholds.reduce((sum, threshold) => sum + threshold, 0) / uniqueThresholds.length;
    const avgThresholdPercent = avgThreshold <= 1 ? avgThreshold * 100 : avgThreshold;

    // Round to nearest 5 for cleaner UI
    return Math.round(avgThresholdPercent / 5) * 5;
  }, []);

  // Calculate dynamic time threshold based on actual quiz time limits (50% of average)
  const calculateDefaultTimeThreshold = useCallback((data) => {
    if (!data || data.length === 0) {
      return 15; // Fallback to 15 minutes if no data
    }

    // Extract time limits from the data (in seconds)
    const timeLimits = data
      .map(result => result.time_limit)
      .filter(limit => limit != null && limit > 0);

    if (timeLimits.length === 0) {
      return 15; // Fallback if no time limits found
    }

    // Get unique time limits and calculate their simple average
    const uniqueTimeLimits = [...new Set(timeLimits)];
    const avgTimeLimit = uniqueTimeLimits.reduce((sum, limit) => sum + limit, 0) / uniqueTimeLimits.length;

    // Convert to minutes and take 50% as the threshold
    const avgTimeLimitMinutes = avgTimeLimit / 60;
    const halfTimeMinutes = avgTimeLimitMinutes * 0.5;

    // Round to nearest whole minute, minimum 1 minute
    return Math.max(1, Math.round(halfTimeMinutes));
  }, []);


  // Set session flag to indicate navigation and handle page refresh detection
  useEffect(() => {
    sessionStorage.setItem('timeVsScoreChart_hasNavigated', 'true');

    // Clear session flag on page refresh (beforeunload)
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('timeVsScoreChart_hasNavigated');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Don't remove the session flag here - we want it to persist for navigation
    };
  }, []);

  // Efficiency quadrant analysis
  const [showQuadrants, setShowQuadrants] = useState(true);
  const [anonymizeNames, setAnonymizeNames] = useState(() => !dashboardPreferences.defaultShowNames);

  useEffect(() => {
    setAnonymizeNames(!dashboardPreferences.defaultShowNames);
  }, [dashboardPreferences.defaultShowNames]);

  // Anonymization function (defined after anonymizeNames state)
  const anonymizeName = useCallback((ldap) => {
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
  }, [anonymizeNames]);
  const [quadrantThresholds, setQuadrantThresholds] = useState(() => {
    const saved = localStorage.getItem('timeVsScoreChart_quadrantThresholds');
    const sessionFlag = sessionStorage.getItem('timeVsScoreChart_hasNavigated');

    if (saved && sessionFlag) {
      // This is navigation (not a fresh page load), restore saved values
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isCustom: parsed.isCustom || false // Preserve custom flag
        };
      } catch (e) {
        console.warn('Failed to parse saved quadrant thresholds:', e);
      }
    }

    // This is a fresh page load or no saved data, use dynamic defaults
    return {
      scoreThreshold: calculateDefaultScoreThreshold(data), // Dynamic threshold based on actual pass thresholds
      timeThreshold: calculateDefaultTimeThreshold(data),   // Dynamic threshold based on actual time limits (50%)
      isCustom: false     // Track if user has manually set the threshold
    };
  });

  // Update score threshold when data changes (only if not custom and not during navigation)
  useEffect(() => {
    const sessionFlag = sessionStorage.getItem('timeVsScoreChart_hasNavigated');
    const isNavigation = sessionFlag && !quadrantThresholds.isCustom;

    // Only update thresholds if:
    // 1. Not custom (user hasn't manually set them)
    // 2. We have data
    // 3. This is either a fresh page load OR the thresholds actually changed
    if (!quadrantThresholds.isCustom && data && data.length > 0) {
      // Use the original data (not filtered) for threshold calculation
      // This ensures we get the full picture of all available tests
      const newDefaultScoreThreshold = calculateDefaultScoreThreshold(data);
      const newDefaultTimeThreshold = calculateDefaultTimeThreshold(data);

      // If this is navigation, only update if the thresholds significantly changed
      // (indicating different data set), otherwise preserve user's session values
      const scoreThresholdChanged = Math.abs(newDefaultScoreThreshold - quadrantThresholds.scoreThreshold) >= 5;
      const timeThresholdChanged = Math.abs(newDefaultTimeThreshold - quadrantThresholds.timeThreshold) >= 2; // 2 minute threshold

      if (!isNavigation || scoreThresholdChanged || timeThresholdChanged) {
        const updates = {};

        if (newDefaultScoreThreshold !== quadrantThresholds.scoreThreshold) {
          updates.scoreThreshold = newDefaultScoreThreshold;
        }

        if (newDefaultTimeThreshold !== quadrantThresholds.timeThreshold) {
          updates.timeThreshold = newDefaultTimeThreshold;
        }

        if (Object.keys(updates).length > 0) {
          setQuadrantThresholds(prev => ({
            ...prev,
            ...updates
          }));
        }
      }
    }
  }, [data, calculateDefaultScoreThreshold, calculateDefaultTimeThreshold, quadrantThresholds.isCustom, quadrantThresholds.scoreThreshold, quadrantThresholds.timeThreshold]);

  // Save quadrant thresholds to localStorage when they change
  useEffect(() => {
    localStorage.setItem('timeVsScoreChart_quadrantThresholds', JSON.stringify(quadrantThresholds));
  }, [quadrantThresholds]);

  // Get filtered data (includes hover filters from other charts, excludes own hover)
  const filteredData = useMemo(() => {
    const filters = getFiltersForChart('time-vs-score');
    const shouldFilter = shouldFilterChart('time-vs-score');
    return filterDataForChart(data, filters, 'time-vs-score', shouldFilter);
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Calculate quiz-specific thresholds when filtering by quiz type
  const getQuizSpecificThresholds = useCallback((quizType, data) => {
    if (!quizType || !data || data.length === 0) {
      return null;
    }

    // Find records for this specific quiz
    const quizRecords = data.filter(record => record.quiz_type === quizType);
    if (quizRecords.length === 0) {
      return null;
    }

    // Get the quiz settings from the first record (they should all be the same for this quiz)
    const sampleRecord = quizRecords[0];
    const passingScore = sampleRecord.passing_score;
    const timeLimit = sampleRecord.time_limit;

    let scoreThreshold = 90; // Fallback
    if (passingScore != null && passingScore > 0) {
      const passingScorePercent = passingScore <= 1 ? passingScore * 100 : passingScore;
      scoreThreshold = Math.round(passingScorePercent / 5) * 5; // Round to nearest 5
    }

    let timeThreshold = 15; // Fallback
    if (timeLimit != null && timeLimit > 0) {
      const timeLimitMinutes = timeLimit / 60;
      const halfTimeMinutes = timeLimitMinutes * 0.5;
      timeThreshold = Math.max(1, Math.round(halfTimeMinutes));
    }

    return {
      scoreThreshold,
      timeThreshold,
      quizType,
      isQuizSpecific: true
    };
  }, []);

  // Check if we're filtering by a specific quiz and get its thresholds
  const currentQuizFilter = useMemo(() => {
    // Check drill-down filters (hover/click from other charts)
    const drillDownFilters = getFiltersForChart('time-vs-score');
    if (drillDownFilters.quizType) {
      return drillDownFilters.quizType;
    }

    // Check global filters (selected from filter dropdowns)
    // Only show quiz-specific thresholds when exactly one quiz is selected
    if (globalFilters.quizTypes && Array.isArray(globalFilters.quizTypes) && globalFilters.quizTypes.length === 1) {
      return globalFilters.quizTypes[0];
    }

    return null;
  }, [getFiltersForChart, globalFilters]);

  const quizSpecificThresholds = useMemo(() => {
    if (currentQuizFilter) {
      return getQuizSpecificThresholds(currentQuizFilter, data);
    }
    return null;
  }, [currentQuizFilter, data, getQuizSpecificThresholds]);

  // Get effective thresholds (quiz-specific when filtering, otherwise user's settings)
  const effectiveThresholds = useMemo(() => {
    if (quizSpecificThresholds) {
      return {
        scoreThreshold: quizSpecificThresholds.scoreThreshold,
        timeThreshold: quizSpecificThresholds.timeThreshold,
        isCustom: quadrantThresholds.isCustom,
        isQuizSpecific: true,
        quizType: quizSpecificThresholds.quizType
      };
    }
    return {
      ...quadrantThresholds,
      isQuizSpecific: false
    };
  }, [quizSpecificThresholds, quadrantThresholds]);

  // Calculate the maximum time limit for X-axis scaling
  const maxTimeLimit = useMemo(() => {
    if (!data || data.length === 0) {
      return 30; // Default fallback (30 minutes)
    }

    // Get time limits from the data (in seconds)
    const timeLimits = data
      .map(result => result.time_limit)
      .filter(limit => limit != null && limit > 0);

    if (timeLimits.length === 0) {
      return 30; // Fallback if no time limits found
    }

    // If filtering by specific quiz, use that quiz's time limit
    if (currentQuizFilter) {
      const quizRecords = data.filter(record => record.quiz_type === currentQuizFilter);
      if (quizRecords.length > 0 && quizRecords[0].time_limit) {
        return Math.ceil(quizRecords[0].time_limit / 60); // Convert to minutes and round up
      }
    }

    // For multiple quizzes, use the longest time limit
    const maxTimeLimitSeconds = Math.max(...timeLimits);
    return Math.ceil(maxTimeLimitSeconds / 60); // Convert to minutes and round up
  }, [data, currentQuizFilter]);

  // Process data for scatter plot with quadrant analysis
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Convert data to scatter plot format with quadrant classification
    const scatterData = filteredData
      .filter(result => result.time_taken && result.score_value)
      .map(result => {
        const timeMinutes = parseInt(result.time_taken) / 60;
        const scorePercent = parseFloat(result.score_value) * 100;

        // Classify into efficiency quadrants
        const isHighScore = scorePercent >= effectiveThresholds.scoreThreshold;
        const isFastTime = timeMinutes <= effectiveThresholds.timeThreshold;

        let quadrant, color, efficiency;
        if (isHighScore && isFastTime) {
          quadrant = 'High Score, Fast Time';
          color = '#10b981'; // Green - Optimal
          efficiency = 'optimal';
        } else if (isHighScore && !isFastTime) {
          quadrant = 'High Score, Slow Time';
          color = '#3b82f6'; // Blue - Thorough
          efficiency = 'thorough';
        } else if (!isHighScore && isFastTime) {
          quadrant = 'Low Score, Fast Time';
          color = '#f59e0b'; // Orange - Rushed
          efficiency = 'rushed';
        } else {
          quadrant = 'Low Score, Slow Time';
          color = '#ef4444'; // Red - Struggling
          efficiency = 'struggling';
        }

        return {
          x: timeMinutes,
          y: scorePercent,
          supervisor: result.supervisor || 'Unknown',
          market: result.market || 'Unknown',
          date: result.date_of_test,
          ldap: anonymizeName(result.ldap || 'Unknown'),
          quadrant,
          efficiency,
          color
        };
      })
      .filter(point => point.x > 0 && point.y >= 0 && point.x <= 30) // Filter outliers
      .slice(0, 200); // Limit for performance

    return [{ id: 'time_vs_score', data: scatterData }];
  }, [filteredData, effectiveThresholds, anonymizeName]);

  // Calculate quadrant statistics
  const quadrantStats = useMemo(() => {
    if (!chartData[0]?.data) return {};

    const stats = {
      optimal: { count: 0, percentage: 0 },
      thorough: { count: 0, percentage: 0 },
      rushed: { count: 0, percentage: 0 },
      struggling: { count: 0, percentage: 0 }
    };

    const total = chartData[0].data.length;
    chartData[0].data.forEach(point => {
      stats[point.efficiency].count++;
    });

    Object.keys(stats).forEach(key => {
      stats[key].percentage = ((stats[key].count / total) * 100).toFixed(1);
    });

    return stats;
  }, [chartData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading chart...</div>
      </div>
    );
  }

  if (chartData.length === 0 || chartData[0].data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Chart Controls */}
      <div className="absolute top-1 left-1 z-10 flex gap-2">
        <button
          onClick={() => setShowQuadrants(!showQuadrants)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            showQuadrants
              ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'
              : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Toggle efficiency quadrants"
        >
          <FaExpand size={10} />
          Quadrants
        </button>
        
        <button
          onClick={() => setAnonymizeNames(!anonymizeNames)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title={anonymizeNames ? "Show actual names" : "Show anonymous identifiers"}
        >
          {anonymizeNames ? <FaEyeSlash size={10} /> : <FaEye size={10} />}
          {anonymizeNames ? 'Anonymous' : 'Names'}
        </button>

        {showQuadrants && (
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600 px-1 h-7 overflow-hidden">
            {effectiveThresholds.isQuizSpecific && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mr-1">
                {effectiveThresholds.quizType}:
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">Score:</span>
              <input
                type="number"
                value={effectiveThresholds.scoreThreshold}
                onChange={(e) => setQuadrantThresholds(prev => ({
                  ...prev,
                  scoreThreshold: parseInt(e.target.value) || 90,
                  isCustom: true // Mark as custom when user manually changes it
                }))}
                disabled={effectiveThresholds.isQuizSpecific}
                className={`w-12 text-xs px-1 py-0.5 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 ${
                  effectiveThresholds.isQuizSpecific
                    ? 'bg-slate-100 dark:bg-slate-600 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-700'
                }`}
                style={{ marginTop: '16px' }}
                min="0"
                max="100"
                title={effectiveThresholds.isQuizSpecific
                  ? `Score threshold for ${effectiveThresholds.quizType} (${effectiveThresholds.scoreThreshold}% - quiz specific)`
                  : `Score threshold for green zone (current: ${effectiveThresholds.scoreThreshold}%, calculated default: ${calculateDefaultScoreThreshold(data)}% based on pass thresholds)`
                }
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">%</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">Time:</span>
              <input
                type="number"
                value={effectiveThresholds.timeThreshold}
                onChange={(e) => setQuadrantThresholds(prev => ({
                  ...prev,
                  timeThreshold: parseInt(e.target.value) || 15,
                  isCustom: true // Mark as custom when user manually changes it
                }))}
                disabled={effectiveThresholds.isQuizSpecific}
                className={`w-12 text-xs px-1 py-0.5 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 ${
                  effectiveThresholds.isQuizSpecific
                    ? 'bg-slate-100 dark:bg-slate-600 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-700'
                }`}
                style={{ marginTop: '16px' }}
                min="1"
                max="60"
                title={effectiveThresholds.isQuizSpecific
                  ? `Time threshold for ${effectiveThresholds.quizType} (${effectiveThresholds.timeThreshold} min - 50% of quiz time limit)`
                  : `Time threshold for green zone (current: ${effectiveThresholds.timeThreshold} min, calculated default: ${calculateDefaultTimeThreshold(data)} min based on 50% of quiz time limits)`
                }
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">min</span>
            </div>

            {!effectiveThresholds.isQuizSpecific && quadrantThresholds.isCustom && (
              <button
                onClick={() => {
                  // Clear session flag to allow dynamic updates
                  sessionStorage.removeItem('timeVsScoreChart_hasNavigated');
                  setQuadrantThresholds(prev => ({
                    ...prev,
                    scoreThreshold: calculateDefaultScoreThreshold(data),
                    timeThreshold: calculateDefaultTimeThreshold(data),
                    isCustom: false
                  }));
                }}
                className="text-xs px-1 py-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                title="Reset to dynamic thresholds based on quiz settings"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>



      <ResponsiveScatterPlot
        data={chartData}
        margin={{ top: 50, right: 30, bottom: 50, left: 60 }}
        xScale={{ type: 'linear', min: 0, max: maxTimeLimit }}
        yScale={{ type: 'linear', min: 0, max: 100 }}
        blendMode={isDark ? "normal" : "multiply"}
        nodeSize={8}
        colors={{ datum: 'color' }}
        enableGridX={true}
        enableGridY={true}
        useMesh={true}
        debugMesh={false}
        layers={[
          'grid',
          'axes',
          // Custom quadrant layer
          showQuadrants && (({ xScale, yScale, innerWidth, innerHeight }) => {
            const timeThreshold = effectiveThresholds.timeThreshold;
            const scoreThreshold = effectiveThresholds.scoreThreshold;

            const xPos = xScale(timeThreshold);
            const yPos = yScale(scoreThreshold);

            return (
              <g>
                {/* Quadrant backgrounds */}
                {/* Top-left: Optimal (Fast + High Score) */}
                <rect
                  x={0}
                  y={0}
                  width={xPos}
                  height={yPos}
                  fill="rgba(34, 197, 94, 0.1)"
                />
                {/* Top-right: Thorough (Slow + High Score) */}
                <rect
                  x={xPos}
                  y={0}
                  width={innerWidth - xPos}
                  height={yPos}
                  fill="rgba(59, 130, 246, 0.1)"
                />
                {/* Bottom-left: Rushed (Fast + Low Score) */}
                <rect
                  x={0}
                  y={yPos}
                  width={xPos}
                  height={innerHeight - yPos}
                  fill="rgba(249, 115, 22, 0.1)"
                />
                {/* Bottom-right: Struggling (Slow + Low Score) */}
                <rect
                  x={xPos}
                  y={yPos}
                  width={innerWidth - xPos}
                  height={innerHeight - yPos}
                  fill="rgba(239, 68, 68, 0.1)"
                />

                {/* Quadrant lines */}
                <line
                  x1={xPos}
                  y1={0}
                  x2={xPos}
                  y2={innerHeight}
                  stroke={isDark ? '#6b7280' : '#9ca3af'}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
                <line
                  x1={0}
                  y1={yPos}
                  x2={innerWidth}
                  y2={yPos}
                  stroke={isDark ? '#6b7280' : '#9ca3af'}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              </g>
            );
          }),
          // Custom nodes layer to control point colors in dark mode
          ({ nodes, xScale, yScale }) => (
            <g>
              {nodes.map(node => (
                <circle
                  key={node.id}
                  cx={xScale(node.data.x)}
                  cy={yScale(node.data.y)}
                  r={4}
                  fill={isDark ? '#ffffff' : '#000000'}
                  stroke="none"
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </g>
          ),
          'mesh'
        ].filter(Boolean)}
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
          dots: {
            text: {
              fill: isDark ? '#ffffff' : '#000000',
            },
          },
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Time Taken (minutes)',
          legendOffset: 40,
          legendPosition: 'middle',
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Score (%)',
          legendOffset: -50,
          legendPosition: 'middle',
        }}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        tooltip={({ node }) => {
          // Calculate efficiency score (higher score in less time = more efficient)
          const efficiency = (node.data.y / node.data.x).toFixed(1);

          // Determine performance category using dynamic threshold
          let performanceCategory = 'Average';
          let timeCategory = 'Normal';

          const dynamicThreshold = effectiveThresholds.scoreThreshold;
          if (node.data.y >= dynamicThreshold) performanceCategory = 'Excellent';
          else if (node.data.y >= dynamicThreshold - 10) performanceCategory = 'Good';
          else if (node.data.y >= dynamicThreshold - 20) performanceCategory = 'Fair';
          else performanceCategory = 'Needs Improvement';

          if (node.data.x <= 5) timeCategory = 'Very Fast';
          else if (node.data.x <= 10) timeCategory = 'Fast';
          else if (node.data.x <= 15) timeCategory = 'Normal';
          else if (node.data.x <= 20) timeCategory = 'Slow';
          else timeCategory = 'Very Slow';

          // Calculate comparison to ideal (high score, low time)
          const idealScore = 95;
          const idealTime = 8;
          const distanceFromIdeal = Math.sqrt(
            Math.pow(idealScore - node.data.y, 2) +
            Math.pow(idealTime - node.data.x, 2)
          ).toFixed(1);

          const data = [
            { label: 'Username', value: node.data.ldap },
            { label: 'Score', value: `${node.data.y.toFixed(1)}%` },
            { label: 'Time Taken', value: `${node.data.x.toFixed(1)} min` },
            { label: 'Efficiency', value: `${efficiency} pts/min` },
            { label: 'Performance', value: performanceCategory },
            { label: 'Speed', value: timeCategory },
            { label: 'Supervisor', value: node.data.supervisor },
            { label: 'Market', value: node.data.market }
          ];

          return (
            <EnhancedTooltip
              title="Quiz Performance"
              data={data}
              icon={true}
              color={node.data.color}
              additionalInfo={`Efficiency Category: ${node.data.quadrant}`}
            />
          );
        }}

      />

      {/* Quadrant Statistics */}
      {showQuadrants && (
        <div className="absolute top-2 right-2 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 p-2">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Efficiency Analysis</div>
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Optimal: {quadrantStats.optimal?.percentage}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Thorough: {quadrantStats.thorough?.percentage}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span>Rushed: {quadrantStats.rushed?.percentage}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Struggling: {quadrantStats.struggling?.percentage}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeVsScoreChart;
