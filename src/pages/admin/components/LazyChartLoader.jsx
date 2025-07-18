/**
 * Lazy Chart Loader Component
 * 
 * Implements lazy loading for chart components to improve initial page load performance.
 * Charts are only loaded when they become visible in the viewport.
 */

import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

// Lazy load all chart components with proper error handling
const ScoreDistributionChart = lazy(() =>
  import('./charts/ScoreDistributionChart').catch(err => {
    console.error('Failed to load ScoreDistributionChart:', err);
    return { default: () => <div>Error loading ScoreDistributionChart</div> };
  })
);
const TimeDistributionChart = lazy(() =>
  import('./charts/TimeDistributionChart').catch(err => {
    console.error('Failed to load TimeDistributionChart:', err);
    return { default: () => <div>Error loading TimeDistributionChart</div> };
  })
);
const ScoreTrendChart = lazy(() =>
  import('./charts/ScoreTrendChart').catch(err => {
    console.error('Failed to load ScoreTrendChart:', err);
    return { default: () => <div>Error loading ScoreTrendChart</div> };
  })
);
const SupervisorPerformanceChart = lazy(() =>
  import('./charts/SupervisorPerformanceChart').catch(err => {
    console.error('Failed to load SupervisorPerformanceChart:', err);
    return { default: () => <div>Error loading SupervisorPerformanceChart</div> };
  })
);
const MarketResultsChart = lazy(() =>
  import('./charts/MarketResultsChart').catch(err => {
    console.error('Failed to load MarketResultsChart:', err);
    return { default: () => <div>Error loading MarketResultsChart</div> };
  })
);
const TimeVsScoreChart = lazy(() =>
  import('./charts/TimeVsScoreChart').catch(err => {
    console.error('Failed to load TimeVsScoreChart:', err);
    return { default: () => <div>Error loading TimeVsScoreChart</div> };
  })
);
const PassFailRateChart = lazy(() =>
  import('./charts/PassFailRateChart').catch(err => {
    console.error('Failed to load PassFailRateChart:', err);
    return { default: () => <div>Error loading PassFailRateChart</div> };
  })
);
const QuizTypePerformanceChart = lazy(() =>
  import('./charts/QuizTypePerformanceChart').catch(err => {
    console.error('Failed to load QuizTypePerformanceChart:', err);
    return { default: () => <div>Error loading QuizTypePerformanceChart</div> };
  })
);
const TopBottomPerformersChart = lazy(() =>
  import('./charts/TopBottomPerformersChart').catch(err => {
    console.error('Failed to load TopBottomPerformersChart:', err);
    return { default: () => <div>Error loading TopBottomPerformersChart</div> };
  })
);
const SupervisorEffectivenessChart = lazy(() =>
  import('./charts/SupervisorEffectivenessChart').catch(err => {
    console.error('Failed to load SupervisorEffectivenessChart:', err);
    return { default: () => <div>Error loading SupervisorEffectivenessChart</div> };
  })
);
const QuestionLevelAnalyticsChart = lazy(() =>
  import('./charts/QuestionLevelAnalyticsChart').catch(err => {
    console.error('Failed to load QuestionLevelAnalyticsChart:', err);
    return { default: () => <div>Error loading QuestionLevelAnalyticsChart</div> };
  })
);
const RetakeAnalysisChart = lazy(() =>
  import('./charts/RetakeAnalysisChart').catch(err => {
    console.error('Failed to load RetakeAnalysisChart:', err);
    return { default: () => <div>Error loading RetakeAnalysisChart</div> };
  })
);

// Chart component mapping
const CHART_COMPONENTS = {
  'score-distribution': ScoreDistributionChart,
  'time-distribution': TimeDistributionChart,
  'score-trend': ScoreTrendChart,
  'supervisor-performance': SupervisorPerformanceChart,
  'market-results': MarketResultsChart,
  'time-vs-score': TimeVsScoreChart,
  'pass-fail-rate': PassFailRateChart,
  'quiz-type-performance': QuizTypePerformanceChart,
  'top-bottom-performers': TopBottomPerformersChart,
  'supervisor-effectiveness': SupervisorEffectivenessChart,
  'question-analytics': QuestionLevelAnalyticsChart,
  'retake-analysis': RetakeAnalysisChart
};

// Loading skeleton component
const ChartSkeleton = ({ height = 300 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div 
      className={`w-full rounded-lg animate-pulse ${
        isDark ? 'bg-slate-700' : 'bg-slate-200'
      }`}
      style={{ height: `${height}px` }}
    >
      <div className="p-4 space-y-4">
        {/* Title skeleton */}
        <div className={`h-4 rounded ${
          isDark ? 'bg-slate-600' : 'bg-slate-300'
        } w-1/3`}></div>
        
        {/* Chart area skeleton */}
        <div className="space-y-3">
          <div className={`h-3 rounded ${
            isDark ? 'bg-slate-600' : 'bg-slate-300'
          } w-full`}></div>
          <div className={`h-3 rounded ${
            isDark ? 'bg-slate-600' : 'bg-slate-300'
          } w-5/6`}></div>
          <div className={`h-3 rounded ${
            isDark ? 'bg-slate-600' : 'bg-slate-300'
          } w-4/6`}></div>
          <div className={`h-3 rounded ${
            isDark ? 'bg-slate-600' : 'bg-slate-300'
          } w-3/6`}></div>
        </div>
        
        {/* Bottom area skeleton */}
        <div className="flex space-x-4">
          <div className={`h-3 rounded ${
            isDark ? 'bg-slate-600' : 'bg-slate-300'
          } w-1/4`}></div>
          <div className={`h-3 rounded ${
            isDark ? 'bg-slate-600' : 'bg-slate-300'
          } w-1/4`}></div>
          <div className={`h-3 rounded ${
            isDark ? 'bg-slate-600' : 'bg-slate-300'
          } w-1/4`}></div>
        </div>
      </div>
    </div>
  );
};

// Error boundary for chart loading failures
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { chartId } = this.props;
      return (
        <div className="w-full h-64 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
          <div className="text-center">
            <div className="text-4xl mb-2 text-slate-400 dark:text-slate-500">
              📊
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Failed to load chart: {chartId}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 px-3 py-1 text-xs rounded transition-colors bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Intersection Observer hook for visibility detection
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        
        // Once visible, keep it loaded (don't unload when scrolled away)
        if (visible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      {
        threshold: 0.1, // Load when 10% visible
        rootMargin: '50px', // Start loading 50px before entering viewport
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasBeenVisible, options]);

  return [elementRef, isVisible || hasBeenVisible];
};

// Main lazy chart loader component
const LazyChartLoader = ({ 
  chartId, 
  chartProps = {}, 
  height = 300,
  loadImmediately = false 
}) => {
  const [containerRef, shouldLoad] = useIntersectionObserver();
  const ChartComponent = CHART_COMPONENTS[chartId];

  // Load immediately if specified (for above-the-fold content)
  const shouldLoadChart = loadImmediately || shouldLoad;

  if (!ChartComponent) {
    console.error('❌ Unknown chart type:', chartId, 'Available charts:', Object.keys(CHART_COMPONENTS));
    return (
      <div ref={containerRef}>
        <ChartErrorBoundary chartId={chartId}>
          <div>Unknown chart type: {chartId}</div>
        </ChartErrorBoundary>
      </div>
    );
  }

  console.log('📊 Rendering chart:', chartId, 'shouldLoad:', shouldLoadChart);

  return (
    <div ref={containerRef} style={{ minHeight: `${height}px` }}>
      {shouldLoadChart ? (
        <Suspense fallback={<ChartSkeleton height={height} />}>
          <ChartErrorBoundary chartId={chartId}>
            <ChartComponent {...chartProps} />
          </ChartErrorBoundary>
        </Suspense>
      ) : (
        <ChartSkeleton height={height} />
      )}
    </div>
  );
};

// Preload function for critical charts (disabled for now)
export const preloadChart = (chartId) => {
  // TODO: Implement proper preloading
  console.log(`📊 Preload requested for chart: ${chartId} (disabled)`);
};

// Preload multiple charts
export const preloadCharts = (chartIds) => {
  chartIds.forEach(chartId => preloadChart(chartId));
};

// Get available chart IDs
export const getAvailableChartIds = () => Object.keys(CHART_COMPONENTS);

export default LazyChartLoader;
