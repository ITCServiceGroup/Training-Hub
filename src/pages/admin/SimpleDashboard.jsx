import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboards } from './hooks/useDashboards';
import ResizableGridLayout from './components/ResizableGridLayout';
import DashboardTile from './components/DashboardTile';
import LoadingSpinner from '../../components/LoadingSpinner';

// Chart components
import ScoreDistributionChart from './components/charts/ScoreDistributionChart';
import TimeDistributionChart from './components/charts/TimeDistributionChart';
import ScoreTrendChart from './components/charts/ScoreTrendChart';
import SupervisorPerformanceChart from './components/charts/SupervisorPerformanceChart';
import MarketResultsChart from './components/charts/MarketResultsChart';
import PassFailRateChart from './components/charts/PassFailRateChart';
import QuizTypePerformanceChart from './components/charts/QuizTypePerformanceChart';
import TopBottomPerformersChart from './components/charts/TopBottomPerformersChart';
import QuestionLevelAnalyticsChart from './components/charts/QuestionLevelAnalyticsChart';

const chartComponents = {
  'pass-fail-rate': PassFailRateChart,
  'score-trend': ScoreTrendChart,
  'supervisor-performance': SupervisorPerformanceChart,
  'market-results': MarketResultsChart,
  'top-bottom-performers': TopBottomPerformersChart,
  'score-distribution': ScoreDistributionChart,
  'time-distribution': TimeDistributionChart,
  'question-level-analytics': QuestionLevelAnalyticsChart,
  'quiz-type-performance': QuizTypePerformanceChart,
  'team-performance': SupervisorPerformanceChart, // Reuse supervisor chart
  'quiz-completion-rate': PassFailRateChart, // Reuse pass-fail chart
  'completion-trends': ScoreTrendChart, // Reuse trend chart
  'learning-progress': ScoreTrendChart // Reuse trend chart
};

const SimpleDashboard = () => {
  const { user } = useAuth();
  const {
    dashboards,
    activeDashboard,
    loading,
    error,
    switchToDashboard,
    updateTiles,
    getCurrentTiles,
    clearError
  } = useDashboards();

  // Local state for grid layout
  const [gridLayout, setGridLayout] = useState([]);
  const [tileOrder, setTileOrder] = useState([]);

  // Convert tile configurations to grid layout format
  const convertTilesToGridLayout = useCallback((tiles) => {
    if (!Array.isArray(tiles)) return [];
    
    return tiles.map((tile) => ({
      i: tile.id,
      x: tile.position?.x || 0,
      y: tile.position?.y || 0,
      w: tile.size?.w || 1,
      h: tile.size?.h || 1,
      minW: 1,
      maxW: 3,
      minH: 1,
      maxH: 2
    }));
  }, []);

  // Convert grid layout back to tile configurations
  const convertGridLayoutToTiles = useCallback((layout, originalTiles) => {
    return layout
      .sort((a, b) => {
        if (a.y === b.y) {
          return a.x - b.x; // Same row, sort by column
        }
        return a.y - b.y; // Different rows, sort by row
      })
      .map((item, index) => {
        const originalTile = originalTiles.find(t => t.id === item.i);
        return {
          id: item.i,
          position: { x: item.x, y: item.y },
          size: { w: item.w, h: item.h },
          priority: index + 1,
          isVisible: originalTile?.isVisible !== undefined ? originalTile.isVisible : true,
          config: originalTile?.config || {},
          customSettings: originalTile?.customSettings || {}
        };
      });
  }, []);

  // Load tile configurations when active dashboard changes
  useEffect(() => {
    if (activeDashboard) {
      const tiles = getCurrentTiles();
      const newGridLayout = convertTilesToGridLayout(tiles);
      const newTileOrder = tiles.map(tile => tile.id);
      
      setGridLayout(newGridLayout);
      setTileOrder(newTileOrder);
      
      console.log('📋 Loaded dashboard:', activeDashboard.name);
      console.log('🔲 Grid layout:', newGridLayout);
    }
  }, [activeDashboard, getCurrentTiles, convertTilesToGridLayout]);

  // Handle grid layout changes (drag and resize)
  const handleGridLayoutChange = useCallback(async (newLayout) => {
    setGridLayout(newLayout);

    // Convert grid layout to tile configurations
    const currentTiles = getCurrentTiles();
    const newTileConfigs = convertGridLayoutToTiles(newLayout, currentTiles);
    
    // Update tile order for compatibility
    const newTileOrder = newTileConfigs.map(tile => tile.id);
    setTileOrder(newTileOrder);

    console.log('🔄 Grid layout changed:', newLayout);
    console.log('📋 New tile configurations:', newTileConfigs);

    // Save changes
    try {
      await updateTiles(newTileConfigs);
      console.log('💾 Tiles updated successfully');
    } catch (error) {
      console.error('❌ Failed to update tiles:', error);
    }
  }, [getCurrentTiles, convertGridLayoutToTiles, updateTiles]);

  // Handle grid resize events
  const handleGridResize = useCallback((newLayout, oldItem, newItem) => {
    console.log('📏 Tile resized:', {
      id: newItem.i,
      oldSize: { w: oldItem.w, h: oldItem.h },
      newSize: { w: newItem.w, h: newItem.h }
    });
    
    // Update the grid layout immediately for responsive feedback
    setGridLayout(newLayout);
  }, []);

  // Render chart component
  const renderChart = useCallback((tileId) => {
    const ChartComponent = chartComponents[tileId];
    if (!ChartComponent) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-lg font-medium">Chart Not Found</div>
            <div className="text-sm">Component: {tileId}</div>
          </div>
        </div>
      );
    }

    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <ChartComponent />
      </React.Suspense>
    );
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800 font-medium">Error loading dashboard</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button
          onClick={clearError}
          className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (!activeDashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium">No Dashboard Selected</div>
          <div className="text-sm">Please select a dashboard to view</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeDashboard.name}
            </h1>
            {activeDashboard.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {activeDashboard.description}
              </p>
            )}
          </div>
          
          {/* Dashboard Selector */}
          <div className="flex items-center space-x-4">
            <select
              value={activeDashboard.id}
              onChange={(e) => switchToDashboard(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              {dashboards.map(dashboard => (
                <option key={dashboard.id} value={dashboard.id}>
                  {dashboard.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-container">
        <ResizableGridLayout
          layout={gridLayout}
          onLayoutChange={handleGridLayoutChange}
          onResize={handleGridResize}
        >
          {tileOrder.map((tileId) => (
            <div key={tileId} className="dashboard-tile">
              <DashboardTile
                title={tileId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                className="h-full"
              >
                {renderChart(tileId)}
              </DashboardTile>
            </div>
          ))}
        </ResizableGridLayout>
      </div>
    </div>
  );
};

export default SimpleDashboard;
