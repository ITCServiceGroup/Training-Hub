import React, { memo, useMemo } from 'react';
import DashboardTile from './DashboardTile';
import { useDashboard } from '../contexts/DashboardContext';

// Import all chart components
import ScoreDistributionChart from './charts/ScoreDistributionChart';
import TimeDistributionChart from './charts/TimeDistributionChart';
import ScoreTrendChart from './charts/ScoreTrendChart';
import SupervisorPerformanceChart from './charts/SupervisorPerformanceChart';
import MarketResultsChart from './charts/MarketResultsChart';
import TimeVsScoreChart from './charts/TimeVsScoreChart';
import PassFailRateChart from './charts/PassFailRateChart';
import QuizTypePerformanceChart from './charts/QuizTypePerformanceChart';
import TopBottomPerformersChart from './charts/TopBottomPerformersChart';
import SupervisorEffectivenessChart from './charts/SupervisorEffectivenessChart';
import QuestionLevelAnalyticsChart from './charts/QuestionLevelAnalyticsChart';
import RetakeAnalysisChart from './charts/RetakeAnalysisChart';

// Tile configurations (static) - use AVAILABLE_TILES from config
import { AVAILABLE_TILES } from '../config/availableTiles';

/**
 * GridTile - A memoized component that renders a dashboard tile with its chart.
 * This component is defined outside the Dashboard to prevent recreation on every render.
 */
const GridTile = memo(({
  tileId,
  tileData,
  tileConfig,
  isInitialLoad,
  loading,
  error,
  globalFilters,
  hasCustomFilters,
  drillDownFilters = [],
  onFilterClick,
  onRefresh,
  onRemoveDrillDownFilter
}) => {
  // Get static config for title/description
  const config = useMemo(() => {
    const staticConfig = AVAILABLE_TILES[tileId];
    return {
      // AVAILABLE_TILES uses 'name' instead of 'title'
      title: staticConfig?.name || tileId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: staticConfig?.description || '',
      id: tileId,
      ...tileConfig
    };
  }, [tileId, tileConfig]);

  // Memoize chart rendering to prevent recreation of chart components
  const chartComponent = useMemo(() => {
    switch (tileId) {
      case 'score-distribution':
        return <ScoreDistributionChart data={tileData} loading={isInitialLoad} />;
      case 'time-distribution':
        return <TimeDistributionChart data={tileData} loading={isInitialLoad} />;
      case 'score-trend':
        return <ScoreTrendChart data={tileData} loading={isInitialLoad} />;
      case 'supervisor-performance':
        return <SupervisorPerformanceChart data={tileData} loading={isInitialLoad} />;
      case 'market-results':
        return <MarketResultsChart data={tileData} loading={isInitialLoad} />;
      case 'time-vs-score':
        return <TimeVsScoreChart data={tileData} loading={isInitialLoad} globalFilters={globalFilters} />;
      case 'pass-fail-rate':
        return <PassFailRateChart data={tileData} loading={isInitialLoad} />;
      case 'quiz-type-performance':
        return <QuizTypePerformanceChart data={tileData} loading={isInitialLoad} />;
      case 'top-bottom-performers':
        return <TopBottomPerformersChart data={tileData} loading={isInitialLoad} />;
      case 'supervisor-effectiveness':
        return <SupervisorEffectivenessChart data={tileData} loading={isInitialLoad} />;
      case 'question-analytics':
      case 'question-level-analytics':
        return <QuestionLevelAnalyticsChart data={tileData} loading={isInitialLoad} />;
      case 'retake-analysis':
        return <RetakeAnalysisChart data={tileData} loading={isInitialLoad} />;
      default:
        return (
          <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
            <div className="text-center">
              <div className="text-lg font-medium">Chart: {tileId}</div>
              <div className="text-sm">Component not found</div>
            </div>
          </div>
        );
    }
  }, [tileId, tileData, isInitialLoad, globalFilters]);

  return (
    <DashboardTile
      id={tileId}
      title={config.title}
      loading={loading}
      error={error}
      hasCustomFilters={hasCustomFilters}
      onFilterClick={(id, event) => onFilterClick(id, event)}
      onRefresh={onRefresh}
      dragHandle={null}
      drillDownFilters={drillDownFilters}
      onRemoveDrillDownFilter={onRemoveDrillDownFilter}
    >
      {chartComponent}
    </DashboardTile>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  // Only re-render if these specific props change
  return (
    prevProps.tileId === nextProps.tileId &&
    prevProps.tileData === nextProps.tileData &&
    prevProps.isInitialLoad === nextProps.isInitialLoad &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.hasCustomFilters === nextProps.hasCustomFilters &&
    prevProps.drillDownFilters === nextProps.drillDownFilters &&
    prevProps.globalFilters === nextProps.globalFilters
  );
});

GridTile.displayName = 'GridTile';

/**
 * GridTileWithDrillDown - Wrapper that provides drill-down functionality from context.
 * This is also defined outside Dashboard to prevent recreation.
 */
const GridTileWithDrillDown = memo(({
  tileId,
  tileData,
  tileConfig,
  isInitialLoad,
  loading,
  error,
  globalFilters,
  hasCustomFilters,
  onFilterClick,
  onRefresh
}) => {
  const { getActiveDrillDownFilters, removeDrillDownFilter } = useDashboard();

  // Get active drill-down filters for this chart
  const drillDownFilters = getActiveDrillDownFilters(tileId);

  return (
    <GridTile
      tileId={tileId}
      tileData={tileData}
      tileConfig={tileConfig}
      isInitialLoad={isInitialLoad}
      loading={loading}
      error={error}
      globalFilters={globalFilters}
      hasCustomFilters={hasCustomFilters}
      drillDownFilters={drillDownFilters}
      onFilterClick={onFilterClick}
      onRefresh={onRefresh}
      onRemoveDrillDownFilter={removeDrillDownFilter}
    />
  );
});

GridTileWithDrillDown.displayName = 'GridTileWithDrillDown';

export { GridTile, GridTileWithDrillDown };
export default GridTile;

