/**
 * Optimized Chart Renderer
 * 
 * High-performance chart rendering system with lazy loading,
 * preloading strategies, and performance monitoring
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import LazyChartLoader, { preloadCharts } from './LazyChartLoader';
import { 
  getChartInfo, 
  getChartHeight, 
  shouldLoadImmediately,
  createPreloadStrategy,
  getPerformanceMetrics
} from '../utils/chartRegistry';

// Performance monitoring hook
const usePerformanceMonitoring = (chartIds) => {
  const metrics = useMemo(() => getPerformanceMetrics(chartIds), [chartIds]);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Dashboard Performance Metrics:', {
        ...metrics,
        chartIds: chartIds.length > 5 ? `${chartIds.slice(0, 5).join(', ')}... (+${chartIds.length - 5} more)` : chartIds.join(', ')
      });
    }
  }, [metrics, chartIds]);
  
  return metrics;
};

// Preloading strategy hook
const usePreloadingStrategy = (chartIds) => {
  const strategy = useMemo(() => createPreloadStrategy(chartIds), [chartIds]);
  
  useEffect(() => {
    // Preload high priority charts after initial render
    if (strategy.afterInitialRender.length > 0) {
      const timer = setTimeout(() => {
        console.log('🚀 Preloading high priority charts:', strategy.afterInitialRender);
        preloadCharts(strategy.afterInitialRender);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [strategy.afterInitialRender]);
  
  useEffect(() => {
    // Preload normal priority charts when browser is idle
    if (strategy.onIdle.length > 0 && 'requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(() => {
        console.log('💤 Preloading charts during idle time:', strategy.onIdle);
        preloadCharts(strategy.onIdle);
      }, { timeout: 5000 });
      
      return () => window.cancelIdleCallback(idleCallback);
    }
  }, [strategy.onIdle]);
  
  return strategy;
};

// Individual chart renderer with optimization
const OptimizedChart = ({ 
  chartId, 
  chartProps = {}, 
  className = '',
  onLoadStart,
  onLoadComplete,
  onError 
}) => {
  const chartInfo = getChartInfo(chartId);
  const height = getChartHeight(chartId);
  const loadImmediately = shouldLoadImmediately(chartId);
  
  const handleLoadStart = useCallback(() => {
    if (onLoadStart) {
      onLoadStart(chartId);
    }
    console.log(`📊 Loading chart: ${chartId}`);
  }, [chartId, onLoadStart]);
  
  const handleLoadComplete = useCallback(() => {
    if (onLoadComplete) {
      onLoadComplete(chartId);
    }
    console.log(`✅ Chart loaded: ${chartId}`);
  }, [chartId, onLoadComplete]);
  
  const handleError = useCallback((error) => {
    if (onError) {
      onError(chartId, error);
    }
    console.error(`❌ Chart failed to load: ${chartId}`, error);
  }, [chartId, onError]);
  
  if (!chartInfo) {
    console.warn(`⚠️ Unknown chart ID: ${chartId}`);
    return (
      <div className={`flex items-center justify-center h-64 text-slate-500 ${className}`}>
        Unknown chart: {chartId}
      </div>
    );
  }
  
  return (
    <div className={className}>
      <LazyChartLoader
        chartId={chartId}
        chartProps={{
          ...chartProps,
          onLoadStart: handleLoadStart,
          onLoadComplete: handleLoadComplete,
          onError: handleError
        }}
        height={height}
        loadImmediately={loadImmediately}
      />
    </div>
  );
};

// Main optimized chart renderer component
const OptimizedChartRenderer = ({ 
  charts = [], 
  globalFilters = {},
  onChartLoadStart,
  onChartLoadComplete,
  onChartError,
  className = ''
}) => {
  // Extract chart IDs for performance monitoring
  const chartIds = useMemo(() => charts.map(chart => chart.id), [charts]);
  
  // Performance monitoring
  const performanceMetrics = usePerformanceMonitoring(chartIds);
  
  // Preloading strategy
  const preloadStrategy = usePreloadingStrategy(chartIds);
  
  // Chart loading state management
  const [loadingCharts, setLoadingCharts] = React.useState(new Set());
  const [loadedCharts, setLoadedCharts] = React.useState(new Set());
  const [errorCharts, setErrorCharts] = React.useState(new Set());
  
  const handleChartLoadStart = useCallback((chartId) => {
    setLoadingCharts(prev => new Set([...prev, chartId]));
    if (onChartLoadStart) {
      onChartLoadStart(chartId);
    }
  }, [onChartLoadStart]);
  
  const handleChartLoadComplete = useCallback((chartId) => {
    setLoadingCharts(prev => {
      const newSet = new Set(prev);
      newSet.delete(chartId);
      return newSet;
    });
    setLoadedCharts(prev => new Set([...prev, chartId]));
    if (onChartLoadComplete) {
      onChartLoadComplete(chartId);
    }
  }, [onChartLoadComplete]);
  
  const handleChartError = useCallback((chartId, error) => {
    setLoadingCharts(prev => {
      const newSet = new Set(prev);
      newSet.delete(chartId);
      return newSet;
    });
    setErrorCharts(prev => new Set([...prev, chartId]));
    if (onChartError) {
      onChartError(chartId, error);
    }
  }, [onChartError]);
  
  // Performance logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const totalCharts = chartIds.length;
      const loadedCount = loadedCharts.size;
      const loadingCount = loadingCharts.size;
      const errorCount = errorCharts.size;
      
      if (totalCharts > 0) {
        console.log(`📈 Chart Loading Progress: ${loadedCount}/${totalCharts} loaded, ${loadingCount} loading, ${errorCount} errors`);
      }
    }
  }, [chartIds.length, loadedCharts.size, loadingCharts.size, errorCharts.size]);
  
  if (!charts || charts.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-slate-500 ${className}`}>
        No charts to display
      </div>
    );
  }
  
  return (
    <div className={className}>
      {charts.map((chart) => (
        <OptimizedChart
          key={chart.id}
          chartId={chart.id}
          chartProps={{
            ...globalFilters,
            ...chart.props
          }}
          className={chart.className}
          onLoadStart={handleChartLoadStart}
          onLoadComplete={handleChartLoadComplete}
          onError={handleChartError}
        />
      ))}
      
      {/* Development performance info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs">
          <div>📊 Charts: {chartIds.length}</div>
          <div>✅ Loaded: {loadedCharts.size}</div>
          <div>⏳ Loading: {loadingCharts.size}</div>
          <div>❌ Errors: {errorCharts.size}</div>
          <div>🚀 Critical: {preloadStrategy.immediate.length}</div>
          <div>⚡ Est. Load: {performanceMetrics.estimatedLoadTime}ms</div>
        </div>
      )}
    </div>
  );
};

// Export individual components for flexibility
export { OptimizedChart };

// Export performance utilities
export const getChartLoadingStats = (charts) => {
  const chartIds = charts.map(chart => chart.id);
  return getPerformanceMetrics(chartIds);
};

export const preloadCriticalCharts = (charts) => {
  const strategy = createPreloadStrategy(charts.map(chart => chart.id));
  if (strategy.immediate.length > 0) {
    console.log('🚀 Preloading critical charts:', strategy.immediate);
    preloadCharts(strategy.immediate);
  }
};

export default OptimizedChartRenderer;
