import React, { memo, useMemo } from 'react';
import DashboardTile from './DashboardTile';
import { useDashboard } from '../contexts/DashboardContext';
import LazyChartLoader from './LazyChartLoader';

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

  // Keep visualization libraries in separate chunks, but load every selected
  // dashboard chart immediately. The grid itself controls visibility and some
  // embedded browsers do not provide IntersectionObserver.
  const chartComponent = useMemo(() => {
    const chartId = tileId === 'question-level-analytics' ? 'question-analytics' : tileId;
    return (
      <LazyChartLoader
        chartId={chartId}
        chartProps={{
          data: tileData,
          loading: isInitialLoad,
          ...(tileId === 'time-vs-score' ? { globalFilters } : {})
        }}
        loadImmediately
        fillContainer
      />
    );
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
