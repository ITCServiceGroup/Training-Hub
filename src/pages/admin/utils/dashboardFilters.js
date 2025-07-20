/**
 * Utility functions for filtering dashboard data based on drill-down and cross-filter state
 */

/**
 * Filter data based on drill-down and cross-filter state
 * @param {Array} data - Raw quiz results data
 * @param {Object} combinedFilters - Combined drill-down and cross-filter state
 * @param {string} chartId - ID of the chart requesting filtered data
 * @param {boolean} shouldFilter - Whether this chart should be filtered
 * @returns {Array} Filtered data
 */
export const filterDataForChart = (data, combinedFilters, chartId, shouldFilter) => {
  if (!data || data.length === 0 || !shouldFilter) {
    return data;
  }

  let filteredData = [...data];

  // Apply supervisor filter
  if (combinedFilters.supervisor) {
    const supervisorValue = typeof combinedFilters.supervisor === 'object' 
      ? combinedFilters.supervisor.fullName || combinedFilters.supervisor.supervisor
      : combinedFilters.supervisor;
    
    filteredData = filteredData.filter(result => 
      result.supervisor === supervisorValue
    );
  }

  // Apply market filter
  if (combinedFilters.market) {
    const marketValue = typeof combinedFilters.market === 'object'
      ? combinedFilters.market.fullName || combinedFilters.market.id
      : combinedFilters.market;
    
    filteredData = filteredData.filter(result => 
      result.market === marketValue
    );
  }

  // Apply time range filter
  if (combinedFilters.timeRange) {
    const timeRange = combinedFilters.timeRange;

    filteredData = filteredData.filter(result => {
      let passesFilter = true;

      // Apply date-based filter if present
      if (timeRange.startDate && timeRange.endDate) {
        const resultDate = new Date(result.date_of_test);
        const startDate = new Date(timeRange.startDate);
        const endDate = new Date(timeRange.endDate);
        passesFilter = passesFilter && (resultDate >= startDate && resultDate <= endDate);
      }

      // Apply duration-based filter if present
      if (timeRange.min !== undefined && timeRange.max !== undefined) {
        const timeTaken = parseInt(result.time_taken) || 0;
        passesFilter = passesFilter && (timeTaken >= timeRange.min && (timeRange.max === Infinity ? true : timeTaken <= timeRange.max));
      }

      return passesFilter;
    });
  }

  // Apply score range filter
  if (combinedFilters.scoreRange) {
    const { min, max } = combinedFilters.scoreRange;

    filteredData = filteredData.filter(result => {
      const score = (parseFloat(result.score_value) || 0) * 100; // Convert to percentage

      // Handle boundary cases properly
      if (min === 0 && max === 20) {
        return score <= 20;
      } else if (min === 21 && max === 40) {
        return score > 20 && score <= 40;
      } else if (min === 41 && max === 60) {
        return score > 40 && score <= 60;
      } else if (min === 61 && max === 80) {
        return score > 60 && score <= 80;
      } else if (min === 81 && max === 100) {
        return score > 80 && score <= 100;
      } else {
        // Fallback to original logic
        return score >= min && score <= max;
      }
    });
  }

  // Apply quiz type filter
  if (combinedFilters.quizType) {
    const quizTypeValue = typeof combinedFilters.quizType === 'object'
      ? combinedFilters.quizType.fullName || combinedFilters.quizType
      : combinedFilters.quizType;

    filteredData = filteredData.filter(result =>
      result.quiz_type === quizTypeValue
    );
  }

  // Apply question filter (this would typically be used for question-level analysis)
  if (combinedFilters.question) {
    // For question-level filtering, we might filter by quiz type that contains the question
    const questionValue = combinedFilters.question;
    if (questionValue.quizType) {
      filteredData = filteredData.filter(result =>
        result.quiz_type === questionValue.quizType
      );
    }
  }

  return filteredData;
};

/**
 * Get unique values for drill-down options
 * @param {Array} data - Raw quiz results data
 * @param {string} field - Field to extract unique values from
 * @returns {Array} Array of unique values with counts
 */
export const getUniqueValuesWithCounts = (data, field) => {
  if (!data || data.length === 0) return [];

  const counts = {};
  data.forEach(result => {
    const value = result[field] || 'Unknown';
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Get drill-down options for a specific chart type
 * @param {Array} data - Raw quiz results data
 * @param {string} chartType - Type of chart (supervisor-performance, market-results, etc.)
 * @returns {Object} Available drill-down options
 */
export const getDrillDownOptions = (data, chartType) => {
  const options = {};

  switch (chartType) {
    case 'supervisor-performance':
      options.supervisors = getUniqueValuesWithCounts(data, 'supervisor');
      options.markets = getUniqueValuesWithCounts(data, 'market');
      break;
    case 'market-results':
      options.markets = getUniqueValuesWithCounts(data, 'market');
      options.supervisors = getUniqueValuesWithCounts(data, 'supervisor');
      break;
    case 'score-trend':
    case 'time-distribution':
    case 'score-distribution':
      options.supervisors = getUniqueValuesWithCounts(data, 'supervisor');
      options.markets = getUniqueValuesWithCounts(data, 'market');
      break;
    default:
      options.supervisors = getUniqueValuesWithCounts(data, 'supervisor');
      options.markets = getUniqueValuesWithCounts(data, 'market');
      break;
  }

  return options;
};

/**
 * Create a time range filter object
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} label - Human-readable label
 * @returns {Object} Time range filter object
 */
export const createTimeRangeFilter = (startDate, endDate, label) => ({
  startDate,
  endDate,
  label
});

/**
 * Get time range from chart data point (for trend charts)
 * @param {Object} dataPoint - Chart data point
 * @param {string} granularity - Time granularity (day, week, month)
 * @returns {Object} Time range filter object
 */
export const getTimeRangeFromDataPoint = (dataPoint, granularity = 'month') => {
  const date = new Date(dataPoint.x || dataPoint.date);
  let startDate, endDate, label;

  switch (granularity) {
    case 'day':
      startDate = date.toISOString().split('T')[0];
      endDate = startDate;
      label = date.toLocaleDateString();
      break;
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      startDate = weekStart.toISOString().split('T')[0];
      endDate = weekEnd.toISOString().split('T')[0];
      label = `Week of ${weekStart.toLocaleDateString()}`;
      break;
    case 'month':
    default:
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      startDate = monthStart.toISOString().split('T')[0];
      endDate = monthEnd.toISOString().split('T')[0];
      label = monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      break;
  }

  return createTimeRangeFilter(startDate, endDate, label);
};

/**
 * Check if a chart should show drill-down indicators
 * @param {string} chartType - Type of chart
 * @param {Object} combinedFilters - Current filter state
 * @returns {boolean} Whether to show drill-down indicators
 */
export const shouldShowDrillDownIndicators = (chartType, combinedFilters) => {
  // Don't show indicators if already at maximum drill level for this chart type
  switch (chartType) {
    case 'supervisor-performance':
      return !combinedFilters.supervisor;
    case 'market-results':
      return !combinedFilters.market;
    case 'score-trend':
    case 'time-distribution':
    case 'score-distribution':
      return true; // These can always drill down by supervisor or market
    default:
      return true;
  }
};

/**
 * Get chart-specific drill-down actions
 * @param {string} chartType - Type of chart
 * @returns {Array} Available drill-down actions for this chart
 */
export const getChartDrillDownActions = (chartType) => {
  switch (chartType) {
    case 'supervisor-performance':
      return ['supervisor', 'market'];
    case 'market-results':
      return ['market', 'supervisor'];
    case 'score-trend':
      return ['timeRange', 'supervisor', 'market'];
    case 'time-distribution':
    case 'score-distribution':
      return ['supervisor', 'market'];
    case 'time-vs-score':
      return ['supervisor', 'market'];
    default:
      return ['supervisor', 'market'];
  }
};
