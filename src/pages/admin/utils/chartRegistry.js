/**
 * Chart Registry
 * 
 * Central registry for mapping chart IDs to their rendering logic
 * and performance optimization settings
 */

// Chart performance priorities
export const CHART_PRIORITY = {
  CRITICAL: 'critical',     // Load immediately (above fold)
  HIGH: 'high',            // Load with small delay
  NORMAL: 'normal',        // Load when visible
  LOW: 'low'               // Load when visible with lower priority
};

// Chart size categories for optimization
export const CHART_SIZE = {
  SMALL: { width: 1, height: 1, pixels: 300 },
  MEDIUM: { width: 2, height: 1, pixels: 400 },
  LARGE: { width: 2, height: 2, pixels: 500 },
  WIDE: { width: 3, height: 1, pixels: 350 }
};

// Chart registry with performance metadata
export const CHART_REGISTRY = {
  'score-distribution': {
    id: 'score-distribution',
    name: 'Score Distribution',
    component: 'ScoreDistributionChart',
    priority: CHART_PRIORITY.HIGH,
    size: CHART_SIZE.SMALL,
    dataIntensive: false,
    renderTime: 'fast', // fast, medium, slow
    dependencies: ['recharts'],
    preloadOnIdle: true
  },
  
  'time-distribution': {
    id: 'time-distribution',
    name: 'Time Distribution',
    component: 'TimeDistributionChart',
    priority: CHART_PRIORITY.NORMAL,
    size: CHART_SIZE.SMALL,
    dataIntensive: false,
    renderTime: 'fast',
    dependencies: ['recharts'],
    preloadOnIdle: true
  },
  
  'score-trend': {
    id: 'score-trend',
    name: 'Score Trend',
    component: 'ScoreTrendChart',
    priority: CHART_PRIORITY.CRITICAL,
    size: CHART_SIZE.WIDE,
    dataIntensive: true,
    renderTime: 'medium',
    dependencies: ['recharts'],
    preloadOnIdle: false // Load immediately
  },
  
  'supervisor-performance': {
    id: 'supervisor-performance',
    name: 'Supervisor Performance',
    component: 'SupervisorPerformanceChart',
    priority: CHART_PRIORITY.HIGH,
    size: CHART_SIZE.SMALL,
    dataIntensive: false,
    renderTime: 'fast',
    dependencies: ['recharts'],
    preloadOnIdle: true
  },
  
  'market-results': {
    id: 'market-results',
    name: 'Market Results',
    component: 'MarketResultsChart',
    priority: CHART_PRIORITY.NORMAL,
    size: CHART_SIZE.MEDIUM,
    dataIntensive: true,
    renderTime: 'medium',
    dependencies: ['recharts'],
    preloadOnIdle: true
  },
  
  'time-vs-score': {
    id: 'time-vs-score',
    name: 'Time vs Score',
    component: 'TimeVsScoreChart',
    priority: CHART_PRIORITY.NORMAL,
    size: CHART_SIZE.LARGE,
    dataIntensive: true,
    renderTime: 'slow',
    dependencies: ['recharts'],
    preloadOnIdle: false
  },
  
  'pass-fail-rate': {
    id: 'pass-fail-rate',
    name: 'Pass/Fail Rate',
    component: 'PassFailRateChart',
    priority: CHART_PRIORITY.CRITICAL,
    size: CHART_SIZE.SMALL,
    dataIntensive: false,
    renderTime: 'fast',
    dependencies: ['recharts'],
    preloadOnIdle: false
  },
  
  'quiz-type-performance': {
    id: 'quiz-type-performance',
    name: 'Quiz Type Performance',
    component: 'QuizTypePerformanceChart',
    priority: CHART_PRIORITY.NORMAL,
    size: CHART_SIZE.MEDIUM,
    dataIntensive: true,
    renderTime: 'medium',
    dependencies: ['recharts'],
    preloadOnIdle: true
  },
  
  'top-bottom-performers': {
    id: 'top-bottom-performers',
    name: 'Top/Bottom Performers',
    component: 'TopBottomPerformersChart',
    priority: CHART_PRIORITY.HIGH,
    size: CHART_SIZE.MEDIUM,
    dataIntensive: false,
    renderTime: 'fast',
    dependencies: ['recharts'],
    preloadOnIdle: true
  },
  
  'supervisor-effectiveness': {
    id: 'supervisor-effectiveness',
    name: 'Supervisor Effectiveness',
    component: 'SupervisorEffectivenessChart',
    priority: CHART_PRIORITY.NORMAL,
    size: CHART_SIZE.WIDE,
    dataIntensive: true,
    renderTime: 'medium',
    dependencies: ['recharts'],
    preloadOnIdle: true
  },
  
  'question-analytics': {
    id: 'question-analytics',
    name: 'Question Analytics',
    component: 'QuestionLevelAnalyticsChart',
    priority: CHART_PRIORITY.LOW,
    size: CHART_SIZE.LARGE,
    dataIntensive: true,
    renderTime: 'slow',
    dependencies: ['recharts'],
    preloadOnIdle: false
  },
  
  'retake-analysis': {
    id: 'retake-analysis',
    name: 'Retake Analysis',
    component: 'RetakeAnalysisChart',
    priority: CHART_PRIORITY.NORMAL,
    size: CHART_SIZE.MEDIUM,
    dataIntensive: true,
    renderTime: 'medium',
    dependencies: ['recharts'],
    preloadOnIdle: true
  }
};

// Helper functions
export const getChartInfo = (chartId) => CHART_REGISTRY[chartId] || null;

export const getChartsByPriority = (priority) => 
  Object.values(CHART_REGISTRY).filter(chart => chart.priority === priority);

export const getCriticalCharts = () => getChartsByPriority(CHART_PRIORITY.CRITICAL);

export const getPreloadableCharts = () => 
  Object.values(CHART_REGISTRY).filter(chart => chart.preloadOnIdle);

export const getChartHeight = (chartId) => {
  const chart = getChartInfo(chartId);
  return chart ? chart.size.pixels : CHART_SIZE.MEDIUM.pixels;
};

export const shouldLoadImmediately = (chartId) => {
  const chart = getChartInfo(chartId);
  return chart ? chart.priority === CHART_PRIORITY.CRITICAL : false;
};

// Performance optimization helpers
export const getLoadingStrategy = (chartIds) => {
  const critical = [];
  const high = [];
  const normal = [];
  const low = [];
  
  chartIds.forEach(chartId => {
    const chart = getChartInfo(chartId);
    if (!chart) return;
    
    switch (chart.priority) {
      case CHART_PRIORITY.CRITICAL:
        critical.push(chartId);
        break;
      case CHART_PRIORITY.HIGH:
        high.push(chartId);
        break;
      case CHART_PRIORITY.NORMAL:
        normal.push(chartId);
        break;
      case CHART_PRIORITY.LOW:
        low.push(chartId);
        break;
    }
  });
  
  return { critical, high, normal, low };
};

// Preloading strategy
export const createPreloadStrategy = (chartIds) => {
  const strategy = getLoadingStrategy(chartIds);
  
  return {
    immediate: strategy.critical,
    afterInitialRender: strategy.high,
    onIdle: strategy.normal.concat(strategy.low).filter(chartId => {
      const chart = getChartInfo(chartId);
      return chart && chart.preloadOnIdle;
    }),
    onDemand: strategy.normal.concat(strategy.low).filter(chartId => {
      const chart = getChartInfo(chartId);
      return chart && !chart.preloadOnIdle;
    })
  };
};

// Performance monitoring
export const getPerformanceMetrics = (chartIds) => {
  const charts = chartIds.map(getChartInfo).filter(Boolean);
  
  return {
    totalCharts: charts.length,
    criticalCharts: charts.filter(c => c.priority === CHART_PRIORITY.CRITICAL).length,
    dataIntensiveCharts: charts.filter(c => c.dataIntensive).length,
    slowRenderingCharts: charts.filter(c => c.renderTime === 'slow').length,
    estimatedLoadTime: charts.reduce((total, chart) => {
      const timeMap = { fast: 100, medium: 300, slow: 800 };
      return total + (timeMap[chart.renderTime] || 300);
    }, 0)
  };
};
