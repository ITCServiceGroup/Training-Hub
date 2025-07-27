import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useDashboard } from '../../contexts/DashboardContext';
import EnhancedTooltip from './EnhancedTooltip';
import { FaUser, FaUsers, FaChartLine, FaEye, FaEyeSlash } from 'react-icons/fa';
import { filterDataForChart, createTimeRangeFilter } from '../../utils/dashboardFilters';

const ScoreTrendChart = ({ data = [], loading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { getFiltersForChart, getCombinedFilters, shouldFilterChart, applyBrushSelection, brushSelection } = useDashboard();

  // Local state for brush selection
  const [brushRange, setBrushRange] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const chartRef = useRef(null);

  // Learning curve analysis mode - persist selection in localStorage
  const [analysisMode, setAnalysisMode] = useState(() => {
    const saved = localStorage.getItem('scoreTrendAnalysisMode');
    return saved && ['aggregate', 'individual', 'cohort'].includes(saved) ? saved : 'aggregate';
  });
  const [anonymizeNames, setAnonymizeNames] = useState(() => {
    const saved = localStorage.getItem('scoreTrendAnonymizeNames');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save analysis mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('scoreTrendAnalysisMode', analysisMode);
  }, [analysisMode]);

  // Save anonymization preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('scoreTrendAnonymizeNames', JSON.stringify(anonymizeNames));
  }, [anonymizeNames]);

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

  // Get filtered data (includes hover filters from other charts, excludes own hover)
  const filteredData = useMemo(() => {
    const filters = getFiltersForChart('score-trend');
    const shouldFilter = shouldFilterChart('score-trend');
    return filterDataForChart(data, filters, 'score-trend', shouldFilter);
  }, [data, getFiltersForChart, shouldFilterChart]);

  // Process aggregate data (original functionality)
  const processAggregateData = useCallback((data) => {
    const dateGroups = {};

    data.forEach(result => {
      const date = result.date_of_test ? result.date_of_test.split('T')[0] : null;
      if (!date) return;

      if (!dateGroups[date]) {
        dateGroups[date] = {
          scores: [],
          count: 0
        };
      }

      const score = parseFloat(result.score_value) || 0;
      dateGroups[date].scores.push(score);
      dateGroups[date].count++;
    });

    const points = Object.entries(dateGroups)
      .map(([date, group]) => {
        const average = group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length;
        return {
          x: date,
          y: (average * 100).toFixed(1),
          count: group.count
        };
      })
      .sort((a, b) => new Date(a.x) - new Date(b.x));

    return [{ id: 'Average Score', color: '#f59e0b', data: points }];
  }, []);

  // Process individual user data
  const processIndividualData = useCallback((data) => {
    const userGroups = {};
    data.forEach(result => {
      const user = result.ldap || 'Unknown';
      if (!userGroups[user]) {
        userGroups[user] = [];
      }
      userGroups[user].push({
        x: result.date_of_test ? result.date_of_test.split('T')[0] : null,
        y: (parseFloat(result.score_value) || 0) * 100,
        date: new Date(result.date_of_test)
      });
    });

    // Only show users with 2+ attempts to display a meaningful trend
    // Individual mode requires multiple data points to show progression
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
      '#f97316', '#84cc16', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b'
    ];
    const eligibleUsers = Object.entries(userGroups)
      .filter(([user, attempts]) => attempts.length >= 2); // Must have 2+ attempts for trend analysis
    
    console.log('Individual mode eligible users:', {
      totalUsers: Object.keys(userGroups).length,
      usersWithOneAttempt: Object.entries(userGroups).filter(([user, attempts]) => attempts.length === 1).length,
      usersWithTwoOrMore: eligibleUsers.length,
      userDetails: eligibleUsers.map(([user, attempts]) => ({ user, attemptCount: attempts.length }))
    });
    
    return eligibleUsers
      .sort(([userA, attemptsA], [userB, attemptsB]) => attemptsB.length - attemptsA.length) // Sort by number of attempts (most active first)
      .slice(0, 12) // Show up to 12 users (increased from 6 for better visibility)
      .map(([user, attempts], index) => {
        const displayName = anonymizeName(user);
        const truncatedName = displayName.length > 15 ? displayName.substring(0, 15) + '...' : displayName;
        return {
          id: truncatedName,
          fullLdap: user,
          displayName: displayName,
          data: attempts.filter(a => a.x).sort((a, b) => new Date(a.x) - new Date(b.x))
            .map((attempt, index) => ({ 
              ...attempt, 
              fullLdap: user, 
              displayName: displayName,
              attempt: index + 1 // Now correctly numbered after sorting by date
            })),
          color: colors[index % colors.length]
        };
      });
  }, [anonymizeNames]);

  // Process cohort data (users who started around the same time)
  const processCohortData = useCallback((data) => {
    // Group users by their first test date (cohort start)
    const userFirstTests = {};
    data.forEach(result => {
      const user = result.ldap || 'Unknown';
      const testDate = new Date(result.date_of_test);
      if (!userFirstTests[user] || testDate < userFirstTests[user]) {
        userFirstTests[user] = testDate;
      }
    });

    // Group users into cohorts (weekly cohorts)
    const cohorts = {};
    Object.entries(userFirstTests).forEach(([user, firstTest]) => {
      const weekStart = new Date(firstTest);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const cohortKey = weekStart.toISOString().split('T')[0];

      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = [];
      }
      cohorts[cohortKey].push(user);
    });

    // Calculate average performance for each cohort over time
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return Object.entries(cohorts)
      .filter(([cohortStart, users]) => users.length >= 3) // Only cohorts with 3+ users
      .slice(0, 5) // Show top 5 cohorts
      .map(([cohortStart, users], index) => {
        const cohortData = {};

        data.forEach(result => {
          if (users.includes(result.ldap)) {
            const date = result.date_of_test ? result.date_of_test.split('T')[0] : null;
            if (date && !cohortData[date]) {
              cohortData[date] = [];
            }
            if (date) {
              cohortData[date].push(parseFloat(result.score_value) || 0);
            }
          }
        });

        const dailyAverages = Object.entries(cohortData)
          .map(([date, scores]) => ({
            x: date,
            y: (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100
          }))
          .sort((a, b) => new Date(a.x) - new Date(b.x));

        return {
          id: `Cohort ${new Date(cohortStart).toLocaleDateString()} (${users.length} users)`,
          data: dailyAverages,
          color: colors[index % colors.length]
        };
      });
  }, []);

  // Process data based on analysis mode
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    console.log('ScoreTrendChart processing data:', {
      mode: analysisMode,
      filteredDataCount: filteredData.length,
      brushSelection: brushSelection.timeRange
    });

    switch (analysisMode) {
      case 'individual':
        const individualData = processIndividualData(filteredData);
        console.log('Individual mode data:', {
          seriesCount: individualData.length,
          totalDataPoints: individualData.reduce((sum, series) => sum + series.data.length, 0)
        });
        return individualData;
      case 'cohort':
        return processCohortData(filteredData);
      case 'aggregate':
      default:
        return processAggregateData(filteredData);
    }
  }, [filteredData, analysisMode, anonymizeNames, processAggregateData, processIndividualData, processCohortData, brushSelection]);

  // Convert pixel position to date
  const pixelToDate = useCallback((pixelX, chartWidth, dataPoints) => {
    if (!dataPoints || dataPoints.length === 0) return null;

    const margin = 60; // Left margin
    const plotWidth = chartWidth - margin - 30; // Subtract left and right margins
    const relativeX = pixelX - margin;
    const ratio = Math.max(0, Math.min(1, relativeX / plotWidth));

    const sortedDates = dataPoints.map(p => new Date(p.x)).sort((a, b) => a - b);
    const minDate = sortedDates[0];
    const maxDate = sortedDates[sortedDates.length - 1];
    
    // Add padding to ensure we can select beyond the last data point
    // This allows brush selection to capture "today" even if it's at the very edge
    const timeDiff = maxDate.getTime() - minDate.getTime();
    const paddingTime = timeDiff * 0.05; // Add 5% padding to the time range
    
    const extendedMaxDate = new Date(maxDate.getTime() + paddingTime);
    const extendedTimeDiff = extendedMaxDate.getTime() - minDate.getTime();

    return new Date(minDate.getTime() + (extendedTimeDiff * ratio));
  }, []);

  // Handle mouse events for brush selection
  const handleMouseDown = useCallback((event) => {
    if (!chartRef.current) return;

    const rect = chartRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;

    setIsDragging(true);
    setDragStart(x);
    setBrushRange(null);
  }, []);

  const handleMouseMove = useCallback((event) => {
    if (!isDragging || !chartRef.current || !dragStart) return;

    const rect = chartRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;

    setBrushRange([Math.min(dragStart, x), Math.max(dragStart, x)]);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback((event) => {
    if (!isDragging || !chartRef.current || !dragStart) return;

    const rect = chartRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;

    const startX = Math.min(dragStart, x);
    const endX = Math.max(dragStart, x);

    // Only create selection if drag distance is significant
    if (Math.abs(endX - startX) > 10) {
      // Get all data points from all series for accurate date range calculation
      let allDataPoints = [];
      if (analysisMode === 'individual' || analysisMode === 'cohort') {
        // For individual/cohort modes, combine data points from all series
        chartData.forEach(series => {
          if (series.data && Array.isArray(series.data)) {
            allDataPoints.push(...series.data);
          }
        });
        // Remove duplicates and sort by date
        const uniqueDates = [...new Set(allDataPoints.map(p => p.x))];
        allDataPoints = uniqueDates.map(x => ({ x })).sort((a, b) => new Date(a.x) - new Date(b.x));
      } else {
        // For aggregate mode, use the single series
        allDataPoints = chartData[0]?.data || [];
      }
      
      let startDate = pixelToDate(startX, rect.width, allDataPoints);
      let endDate = pixelToDate(endX, rect.width, allDataPoints);

      // Check if user dragged to the very right edge - if so, extend to "today"
      const rightEdgeThreshold = rect.width - 50; // Within 50px of right edge
      if (endX >= rightEdgeThreshold) {
        // Extend to today's date
        endDate = new Date();
        console.log('Extended brush selection to today due to edge drag:', endDate.toISOString().split('T')[0]);
      }

      if (startDate && endDate) {
        // Add a small buffer to ensure we capture edge cases
        // Sometimes brush selection can be slightly off due to pixel-to-date conversion
        const bufferedStartDate = new Date(startDate);
        bufferedStartDate.setHours(0, 0, 0, 0); // Start of day
        
        const bufferedEndDate = new Date(endDate);
        bufferedEndDate.setHours(23, 59, 59, 999); // End of day
        
        const timeRange = createTimeRangeFilter(
          bufferedStartDate.toISOString().split('T')[0],
          bufferedEndDate.toISOString().split('T')[0],
          `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        );

        console.log('Brush selection created:', {
          originalStartDate: startDate.toISOString().split('T')[0],
          originalEndDate: endDate.toISOString().split('T')[0],
          bufferedStartDate: bufferedStartDate.toISOString().split('T')[0],
          bufferedEndDate: bufferedEndDate.toISOString().split('T')[0],
          endX,
          rightEdgeThreshold: rect.width - 50,
          wasExtendedToToday: endX >= (rect.width - 50)
        });

        // Apply the brush selection
        applyBrushSelection(timeRange, 'score-trend');
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setBrushRange(null);
  }, [isDragging, dragStart, chartData, pixelToDate, applyBrushSelection]);

  // Clear brush selection
  const handleClearBrush = useCallback(() => {
    setBrushRange(null);
    applyBrushSelection(null, 'score-trend');
  }, [applyBrushSelection]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading chart...</div>
      </div>
    );
  }

  if (chartData.length === 0 || (chartData[0] && chartData[0].data.length === 0)) {
    return (
      <div className="h-full w-full relative">
        {/* Clear brush button - always show when there's a brush selection */}
        {brushSelection.timeRange && brushSelection.sourceChart === 'score-trend' && (
          <button
            onClick={handleClearBrush}
            className="absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Clear Selection
          </button>
        )}

        {/* Analysis Mode Controls */}
        <div className="top-2 left-1 z-10 flex gap-1">
          <button
            onClick={() => setAnalysisMode('aggregate')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              analysisMode === 'aggregate'
                ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Show overall trends"
          >
            <FaUsers size={10} />
            Aggregate
          </button>

          <button
            onClick={() => setAnalysisMode('individual')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              analysisMode === 'individual'
                ? isDark ? 'bg-green-700 text-green-200' : 'bg-green-100 text-green-700'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Show individual learning curves"
          >
            <FaUser size={10} />
            Individual
          </button>

          <button
            onClick={() => setAnalysisMode('cohort')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              analysisMode === 'cohort'
                ? isDark ? 'bg-purple-700 text-purple-200' : 'bg-purple-100 text-purple-700'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Show cohort performance"
          >
            <FaChartLine size={10} />
            Cohort
          </button>
          
          {/* Anonymization toggle - only show in individual mode */}
          {analysisMode === 'individual' && (
            <button
              onClick={() => setAnonymizeNames(!anonymizeNames)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                isDark 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={anonymizeNames ? 'Show real names' : 'Anonymize names'}
            >
              {anonymizeNames ? <FaEyeSlash size={10} /> : <FaEye size={10} />}
              {anonymizeNames ? 'Anonymous' : 'Names'}
            </button>
          )}
        </div>

        <div className="h-full flex flex-col items-center justify-center">
          <div className="text-slate-500 dark:text-slate-400 text-center">
            <div>No data available</div>
            {analysisMode === 'individual' && (
              <div className="text-sm mt-1 text-slate-400 dark:text-slate-500">
                (to identify an individual trend, 2 or more results are required for a given time range)
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className="h-full w-full relative cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        setDragStart(null);
        setBrushRange(null); // Only clear temporary brush, keep activeBrushRange
      }}
    >
      {/* Analysis Mode Controls */}
      <div className="top-2 left-1 z-10 flex gap-1" >
        <button
          onClick={() => setAnalysisMode('aggregate')}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            analysisMode === 'aggregate'
              ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'
              : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Show overall trends"
        >
          <FaUsers size={10} />
          Aggregate
        </button>

        <button
          onClick={() => setAnalysisMode('individual')}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            analysisMode === 'individual'
              ? isDark ? 'bg-green-700 text-green-200' : 'bg-green-100 text-green-700'
              : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Show individual learning curves"
        >
          <FaUser size={10} />
          Individual
        </button>

        <button
          onClick={() => setAnalysisMode('cohort')}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            analysisMode === 'cohort'
              ? isDark ? 'bg-purple-700 text-purple-200' : 'bg-purple-100 text-purple-700'
              : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Show cohort performance"
        >
          <FaChartLine size={10} />
          Cohort
        </button>
        
        {/* Anonymization toggle - only show in individual mode */}
        {analysisMode === 'individual' && (
          <button
            onClick={() => setAnonymizeNames(!anonymizeNames)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              isDark 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title={anonymizeNames ? 'Show real names' : 'Anonymize names'}
          >
            {anonymizeNames ? <FaEyeSlash size={10} /> : <FaEye size={10} />}
            {anonymizeNames ? 'Anonymous' : 'Names'}
          </button>
        )}
      </div>

      {/* Clear brush button */}
      {brushSelection.timeRange && brushSelection.sourceChart === 'score-trend' && (
        <button
          onClick={handleClearBrush}
          className="absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Clear Selection
        </button>
      )}

      {/* Temporary brush selection overlay during dragging */}
      {brushRange && (
        <div
          className="absolute top-0 bg-blue-200 bg-opacity-30 border-l-2 border-r-2 border-blue-500 pointer-events-none"
          style={{
            left: `${brushRange[0]}px`,
            width: `${brushRange[1] - brushRange[0]}px`,
            height: '100%',
            zIndex: 5
          }}
        />
      )}



      {/* Active brush selection indicator */}
      {brushSelection.timeRange && brushSelection.sourceChart === 'score-trend' && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded border border-blue-300 shadow-sm">
          Selected: {brushSelection.timeRange.label}
        </div>
      )}

      <ResponsiveLine
        data={chartData}
        margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
        colors={{ datum: 'color' }}
        xScale={{
          type: 'time',
          format: '%Y-%m-%d',
          useUTC: false,
          precision: 'day',
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{
          type: 'linear',
          min: 0,
          max: 100,
          stacked: false,
          reverse: false,
        }}
        yFormat=" >-.1f"
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
              maxWidth: '300px',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              zIndex: 9999
            },
          },
          crosshair: {
            line: {
              stroke: 'transparent',
              strokeWidth: 0,
            },
          },
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          format: '%m/%d',
          tickValues: 'every 7 days',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Date',
          legendOffset: 60,
          legendPosition: 'middle',
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Average Score (%)',
          legendOffset: -50,
          legendPosition: 'middle',
        }}
        curve="monotoneX"
        pointSize={8}
        pointColor="#ffffff"
        pointBorderWidth={2}
        pointBorderColor={(point) => {
          // For aggregate mode, use the fixed orange color like before
          if (analysisMode === 'aggregate') {
            return '#f59e0b';
          }
          // For individual and cohort modes, use the seriesColor directly from the point
          return point.seriesColor || '#3b82f6';
        }}
        pointLabelYOffset={-12}
        useMesh={true}
        enableSlices={false}
        enableCrosshair={false}
        enablePoints={true}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        tooltip={({ point }) => {
          // Calculate minimal positioning adjustments only when very close to edges
          const [tooltipStyle, setTooltipStyle] = useState({});
          
          useEffect(() => {
            const handleMouseMove = (e) => {
              const tooltipWidth = 300; // Approximate tooltip width
              const tooltipHeight = 180; // Approximate tooltip height
              const edgeThreshold = 50; // Only adjust when within 50px of edge
              
              const viewportWidth = window.innerWidth;
              const viewportHeight = window.innerHeight;
              
              let adjustments = {};
              
              // Only adjust if VERY close to right edge
              if (e.clientX + tooltipWidth/2 > viewportWidth - edgeThreshold) {
                const overflowAmount = (e.clientX + tooltipWidth/2) - (viewportWidth - 20);
                adjustments.marginLeft = `-${Math.min(overflowAmount, tooltipWidth/3)}px`;
              }
              // Only adjust if VERY close to left edge  
              else if (e.clientX - tooltipWidth/2 < edgeThreshold) {
                const overflowAmount = edgeThreshold - (e.clientX - tooltipWidth/2);
                adjustments.marginLeft = `${Math.min(overflowAmount, tooltipWidth/3)}px`;
              }
              
              // Only adjust if VERY close to top edge
              if (e.clientY - tooltipHeight < edgeThreshold) {
                adjustments.marginTop = '15px'; // Move slightly below cursor
                adjustments.transform = 'translateY(0)';
              }
              
              setTooltipStyle(adjustments);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            return () => document.removeEventListener('mousemove', handleMouseMove);
          }, []);
          // Individual mode has different tooltip structure
          if (analysisMode === 'individual') {
            const userDisplayName = anonymizeNames ? point.data.displayName : point.data.fullLdap;
            const attemptNumber = point.data.attempt;
            const userSeries = chartData.find(series => series.fullLdap === point.data.fullLdap);
            
            // Calculate comprehensive progression analysis
            const userAttempts = userSeries?.data || [];
            const currentAttemptIndex = userAttempts.findIndex(d => d.x === point.data.xFormatted);
            const previousAttempt = currentAttemptIndex > 0 ? userAttempts[currentAttemptIndex - 1] : null;
            const firstAttempt = userAttempts[0];
            const currentScore = parseFloat(point.data.y);
            
            // Calculate performance metrics
            const bestScore = Math.max(...userAttempts.map(a => parseFloat(a.y)));
            const worstScore = Math.min(...userAttempts.map(a => parseFloat(a.y)));
            const firstScore = firstAttempt ? parseFloat(firstAttempt.y) : currentScore;
            
            // Previous attempt trend
            let trend = null;
            if (previousAttempt) {
              const change = currentScore - parseFloat(previousAttempt.y);
              const percentChange = ((change / parseFloat(previousAttempt.y)) * 100).toFixed(1);
              trend = {
                direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
                value: `${Math.abs(percentChange)}% from previous`
              };
            }
            
            // Overall progress from first attempt
            let overallProgress = null;
            if (userAttempts.length > 1 && firstAttempt) {
              const totalChange = currentScore - firstScore;
              const totalPercentChange = ((totalChange / firstScore) * 100).toFixed(1);
              overallProgress = {
                direction: totalChange > 0 ? 'up' : totalChange < 0 ? 'down' : 'stable',
                value: `${Math.abs(totalPercentChange)}% from first attempt`,
                points: `${firstScore.toFixed(1)}% → ${currentScore.toFixed(1)}%`
              };
            }
            
            // Performance classification
            const getPerformanceTier = (score) => {
              if (score >= 95) return 'Expert';
              if (score >= 85) return 'Proficient';
              if (score >= 70) return 'Developing';
              return 'Struggling';
            };
            
            const performanceTier = getPerformanceTier(currentScore);
            const isPersonalBest = Math.abs(currentScore - bestScore) < 0.1;
            
            const data = [
              { label: 'User', value: userDisplayName || 'Unknown' },
              { label: 'Date', value: point.data.xFormatted },
              { label: 'Score', value: `${point.data.yFormatted}%${isPersonalBest ? ' 🏆' : ''}` },
              { label: 'Attempt #', value: `${attemptNumber || 'N/A'} of ${userAttempts.length}` },
              { label: 'Performance', value: performanceTier },
              ...(overallProgress ? [{ label: 'Overall Progress', value: overallProgress.points }] : [])
            ];
            
            // Create comprehensive additional info
            const additionalInfo = [
              `Personal best: ${bestScore.toFixed(1)}%`,
              overallProgress ? `${overallProgress.direction === 'up' ? '📈' : overallProgress.direction === 'down' ? '📉' : '➡️'} ${overallProgress.value}` : null
            ].filter(Boolean).join(' • ');
            
            return (
              <div style={{
                position: 'relative',
                ...tooltipStyle
              }}>
                <EnhancedTooltip
                  title="Individual Performance"
                  data={data}
                  icon={true}
                  color={point.seriesColor}
                  trend={trend}
                  additionalInfo={additionalInfo || `${userAttempts.length} total attempts`}
                />
              </div>
            );
          }
          
          // Default tooltip for Aggregate and Cohort modes
          const currentIndex = chartData[0]?.data.findIndex(d => d.x === point.data.x) || 0;
          const previousPoint = currentIndex > 0 ? chartData[0]?.data[currentIndex - 1] : null;
          const nextPoint = currentIndex < (chartData[0]?.data.length - 1) ? chartData[0]?.data[currentIndex + 1] : null;

          // Calculate trend
          let trend = null;
          if (previousPoint) {
            const change = parseFloat(point.data.y) - parseFloat(previousPoint.y);
            const percentChange = ((change / parseFloat(previousPoint.y)) * 100).toFixed(1);
            trend = {
              direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
              value: `${Math.abs(percentChange)}% from previous`
            };
          }

          // Calculate comparison to overall average
          const allPoints = chartData[0]?.data || [];
          const overallAverage = allPoints.reduce((sum, p) => sum + parseFloat(p.y), 0) / allPoints.length;
          const comparison = {
            period: 'overall average',
            change: ((parseFloat(point.data.y) - overallAverage) / overallAverage * 100).toFixed(1),
            label: 'vs average'
          };

          const data = [
            { label: 'Date', value: point.data.xFormatted },
            { label: 'Average Score', value: `${point.data.yFormatted}%` },
            { label: 'Tests Taken', value: point.data.count },
            { label: 'Overall Avg', value: `${overallAverage.toFixed(1)}%` }
          ];

          return (
            <div style={{
              position: 'relative',
              ...tooltipStyle
            }}>
              <EnhancedTooltip
                title={analysisMode === 'cohort' ? 'Cohort Performance' : 'Score Trend'}
                data={data}
                icon={true}
                color="#f59e0b"
                trend={trend}
                comparison={comparison}
                additionalInfo={`${point.data.count} test${point.data.count !== 1 ? 's' : ''} completed on this date`}
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export default ScoreTrendChart;
