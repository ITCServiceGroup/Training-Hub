import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboards } from './hooks/useDashboards';
import { quizResultsService } from '../../services/api/quizResults';
import DashboardTile from './components/DashboardTile';
import TileFilterPopover from './components/TileFilterPopover';
import GlobalFilters from './components/GlobalFilters';

import TileLibraryButton from './components/TileLibraryButton';
import DashboardManagerDropdown from './components/DashboardManagerDropdown';
import ExportButton from './components/ExportButton';
import ExportModal from './components/ExportModal';
import { DashboardProvider } from './contexts/DashboardContext';
import DrillDownBreadcrumbs from './components/DrillDownBreadcrumbs';
// Removed old complex hook - now using simplified useDashboards


import ResizableGridLayout from './components/ResizableGridLayout';
import './components/styles/dashboard-grid.css';
import './components/styles/resizable-grid.css';
import './components/styles/resizable-grid.css';
// Temporarily revert to direct imports while fixing lazy loading
import ScoreDistributionChart from './components/charts/ScoreDistributionChart';
import TimeDistributionChart from './components/charts/TimeDistributionChart';
import ScoreTrendChart from './components/charts/ScoreTrendChart';
import SupervisorPerformanceChart from './components/charts/SupervisorPerformanceChart';
import MarketResultsChart from './components/charts/MarketResultsChart';
import TimeVsScoreChart from './components/charts/TimeVsScoreChart';
import PassFailRateChart from './components/charts/PassFailRateChart';
import QuizTypePerformanceChart from './components/charts/QuizTypePerformanceChart';
import TopBottomPerformersChart from './components/charts/TopBottomPerformersChart';
import SupervisorEffectivenessChart from './components/charts/SupervisorEffectivenessChart';
import QuestionLevelAnalyticsChart from './components/charts/QuestionLevelAnalyticsChart';
import RetakeAnalysisChart from './components/charts/RetakeAnalysisChart';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Simplified dashboard system
  const {
    dashboards,
    activeDashboard,
    loading: dashboardLoading,
    error: dashboardError,
    switchToDashboard,
    updateTiles,
    getCurrentTiles,
    createDashboard,
    updateActiveDashboard,
    deleteDashboard,
    duplicateDashboardById,
    setAsDefaultDashboard,
    clearError
  } = useDashboards();

  // Dashboard state
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tile order state (managed by presets and saved layouts)
  const [tileOrder, setTileOrder] = useState([]);

  // Global filters state (initialized from preset or saved layout)
  const [globalFilters, setGlobalFilters] = useState({
    dateRange: {
      preset: 'last_month',
      startDate: null,
      endDate: null
    },
    quickPreset: 'last_month'
  });

  // UI state - simplified (removed complex configuration management)
  const [showExportModal, setShowExportModal] = useState(false);

  // Individual tile filters state
  const [tileFilters, setTileFilters] = useState({});
  const [filterPopover, setFilterPopover] = useState({
    isOpen: false,
    tileId: null,
    position: { x: 0, y: 0 }
  });

  // Grid layout state
  const [gridLayout, setGridLayout] = useState([]);

  // Convert tile configurations to grid layout format
  const convertTileConfigsToGridLayout = useCallback((tileConfigs) => {
    if (!Array.isArray(tileConfigs)) return [];

    return tileConfigs.map((tileConfig) => {
      // Handle both old format (string IDs) and new format (tile configuration objects)
      if (typeof tileConfig === 'string') {
        // Legacy format - convert to default 1x1 tile
        const index = tileConfigs.indexOf(tileConfig);
        const row = Math.floor(index / 3);
        const col = index % 3;
        return {
          i: tileConfig,
          x: col,
          y: row,
          w: 1, // Default width: 1 column
          h: 1, // Default height: 1 row
          minW: 1,
          maxW: 3,
          minH: 1,
          maxH: 2,
        };
      } else {
        // New format - use tile configuration data
        return {
          i: tileConfig.id,
          x: tileConfig.position?.x || 0,
          y: tileConfig.position?.y || 0,
          w: tileConfig.size?.w || 1,
          h: tileConfig.size?.h || 1,
          minW: 1,
          maxW: 3,
          minH: 1,
          maxH: 2,
        };
      }
    });
  }, []);

  // Convert grid layout back to tile configurations
  const convertGridLayoutToTileConfigs = useCallback((layout) => {
    return layout
      .sort((a, b) => {
        if (a.y === b.y) {
          return a.x - b.x; // Same row, sort by column
        }
        return a.y - b.y; // Different rows, sort by row
      })
      .map((item, index) => ({
        id: item.i,
        position: { x: item.x, y: item.y },
        size: { w: item.w, h: item.h },
        priority: index + 1,
        isVisible: true,
        config: {},
        customSettings: {}
      }));
  }, []);

  // Convert grid layout back to tile order for compatibility (legacy support)
  const convertGridLayoutToTileOrder = useCallback((layout) => {
    return layout
      .sort((a, b) => {
        if (a.y === b.y) {
          return a.x - b.x; // Same row, sort by column
        }
        return a.y - b.y; // Different rows, sort by row
      })
      .map(item => item.i);
  }, []);

  // Sync tile configurations with active dashboard
  useEffect(() => {
    const loadTileConfigurations = async () => {
      if (activeDashboard) {
        const dashboardTiles = getCurrentTiles();
        if (dashboardTiles.length > 0) {
          // Use dashboard tiles
          const tileOrder = dashboardTiles.map(tile => tile.id);
          setTileOrder(tileOrder);
          const newGridLayout = convertTileConfigsToGridLayout(dashboardTiles);
          setGridLayout(newGridLayout);
          console.log('📋 Loaded tile configurations from dashboard:', dashboardTiles);
          console.log('🔲 Generated grid layout:', newGridLayout);
        } else {
          // Fallback to default tiles if no dashboard tiles
          const { DEFAULT_DASHBOARD_TILES } = await import('./config/availableTiles');
          setTileOrder(DEFAULT_DASHBOARD_TILES);
          const newGridLayout = convertTileConfigsToGridLayout(DEFAULT_DASHBOARD_TILES);
          setGridLayout(newGridLayout);
          console.log('📋 Using default tile order:', DEFAULT_DASHBOARD_TILES);
          console.log('🔲 Generated grid layout:', newGridLayout);
        }
      }
    };
    loadTileConfigurations();
  }, [activeDashboard, getCurrentTiles, convertTileConfigsToGridLayout]);

  // Sync global filters with active dashboard
  useEffect(() => {
    if (activeDashboard) {
      const dashboardFilters = activeDashboard.filters;
      if (dashboardFilters && Object.keys(dashboardFilters).length > 0) {
        setGlobalFilters(dashboardFilters);
      }
    }
  }, [activeDashboard]);

  // Charts are now loaded directly (lazy loading to be implemented later)

  // Tile configuration
  const tileConfigs = {
    'score-distribution': {
      title: 'Score Distribution',
      description: 'Distribution of quiz scores across different ranges'
    },
    'time-distribution': {
      title: 'Time Distribution',
      description: 'Distribution of time taken to complete quizzes'
    },
    'score-trend': {
      title: 'Score Trend',
      description: 'Average quiz scores over time'
    },
    'supervisor-performance': {
      title: 'Supervisor Performance',
      description: 'Average performance by supervisor'
    },
    'market-results': {
      title: 'Market Results',
      description: 'Performance comparison across different markets'
    },
    'time-vs-score': {
      title: 'Time vs Score',
      description: 'Correlation between time taken and quiz scores'
    },
    'pass-fail-rate': {
      title: 'Pass/Fail Rate',
      description: 'Overall pass and fail rates with configurable threshold'
    },
    'quiz-type-performance': {
      title: 'Quiz Type Performance',
      description: 'Performance comparison across different quiz types'
    },
    'top-bottom-performers': {
      title: 'Top/Bottom Performers',
      description: 'Individual user performance rankings'
    },
    'supervisor-effectiveness': {
      title: 'Supervisor Effectiveness',
      description: 'Multi-dimensional supervisor performance analysis'
    },
    'question-analytics': {
      title: 'Question Analytics',
      description: 'Question-level difficulty and performance analysis'
    },
    'retake-analysis': {
      title: 'Retake Analysis',
      description: 'Flow analysis of retake patterns and outcomes'
    }
  };



  // Handle grid layout changes (drag and resize)
  const handleGridLayoutChange = useCallback(async (newLayout) => {
    setGridLayout(newLayout);

    // Convert grid layout to tile configurations
    const newTileConfigs = convertGridLayoutToTileConfigs(newLayout);

    // Also convert to tile order for compatibility
    const newTileOrder = convertGridLayoutToTileOrder(newLayout);
    setTileOrder(newTileOrder);

    console.log('🔄 Grid layout changed:', newLayout);
    console.log('📋 New tile configurations:', newTileConfigs);
    console.log('📋 New tile order (legacy):', newTileOrder);

    // Update the dashboard using simplified approach
    if (activeDashboard) {
      console.log('🔄 Updating tiles for dashboard:', activeDashboard.name);
      try {
        await updateTiles(newTileConfigs);
        console.log('� Tiles updated successfully');
      } catch (error) {
        console.error('❌ Failed to update tiles:', error);
      }
    }

    // Save to localStorage as fallback
    try {
      localStorage.setItem('dashboard-tile-order', JSON.stringify(newTileOrder));
      localStorage.setItem('dashboard-grid-layout', JSON.stringify(newLayout));
      localStorage.setItem('dashboard-tile-configs', JSON.stringify(newTileConfigs));
      console.log('💾 Grid layout, tile configurations, and tile order saved');
    } catch (error) {
      console.error('❌ Failed to save grid layout:', error);
    }
  }, [activeDashboard, updateTiles, convertGridLayoutToTileConfigs, convertGridLayoutToTileOrder]);

  // Handle grid resize events
  const handleGridResize = useCallback((newLayout, oldItem, newItem) => {
    console.log('📏 Tile resized:', {
      id: newItem.i,
      oldSize: { w: oldItem.w, h: oldItem.h },
      newSize: { w: newItem.w, h: newItem.h }
    });

    // Update the grid layout immediately for responsive feedback
    setGridLayout(newLayout);

    // The full layout change will be handled by handleGridLayoutChange
    // This provides immediate visual feedback during resize
  }, []);



  // Load tile order from localStorage on mount (fallback if no active configuration)
  useEffect(() => {
    const loadFallbackTileOrder = async () => {
      // Only use localStorage if no active dashboard is set
      if (!activeDashboard && tileOrder.length === 0) {
        try {
          const savedOrder = localStorage.getItem('dashboard-tile-order');
          if (savedOrder) {
            const parsedOrder = JSON.parse(savedOrder);
            if (Array.isArray(parsedOrder) && parsedOrder.length > 0) {
              setTileOrder(parsedOrder);
              console.log('📋 Loaded tile order from localStorage:', parsedOrder);
              return;
            }
          }
        } catch (error) {
          console.error('❌ Failed to load tile order from localStorage:', error);
        }

        // Final fallback to default tiles
        const { DEFAULT_DASHBOARD_TILES } = await import('./config/availableTiles');
        setTileOrder(DEFAULT_DASHBOARD_TILES);
        console.log('📋 Using default tile order as final fallback:', DEFAULT_DASHBOARD_TILES);
      }
    };

    loadFallbackTileOrder();
  }, [activeDashboard, tileOrder.length]);

  // Fetch dashboard data based on global filters
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert global filters to API format
        const filterParams = {
          startDate: globalFilters.dateRange.startDate,
          endDate: globalFilters.dateRange.endDate,
          supervisors: [],
          ldaps: [],
          markets: [],
          quizTypes: [],
          minScore: 0,
          maxScore: 1,
          minTime: 0,
          maxTime: 3600,
          sortField: 'date_of_test',
          sortOrder: 'desc'
        };

        const data = await quizResultsService.getFilteredResults(filterParams);
        setResults(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [globalFilters]);



  // Handle tile filter button clicks
  const handleTileFilterClick = (tileId, event) => {
    const rect = event.target.getBoundingClientRect();
    setFilterPopover({
      isOpen: true,
      tileId,
      position: {
        x: rect.left,
        y: rect.bottom + 8
      }
    });
  };

  // Handle tile filter changes
  const handleTileFiltersChange = (tileId, filters) => {
    setTileFilters(prev => ({
      ...prev,
      [tileId]: filters
    }));
  };

  // Handle use global filters
  const handleUseGlobalFilters = (tileId) => {
    setTileFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[tileId];
      return newFilters;
    });
    setFilterPopover({ isOpen: false, tileId: null, position: { x: 0, y: 0 } });
  };

  // Handle tile refresh
  const handleTileRefresh = () => {
    // For now, just refresh all data
    // In the future, we could refresh individual tiles
    window.location.reload();
  };

  // Grid Tile Component (for react-grid-layout)
  const GridTile = ({ tileId }) => {
    // Get tile configuration from dashboard tiles or fallback to static config
    const dashboardTiles = getCurrentTiles();
    const tileConfig = dashboardTiles.find(tile => tile.id === tileId);
    const staticConfig = tileConfigs[tileId];

    const config = {
      title: staticConfig?.title || tileId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: staticConfig?.description || '',
      id: tileId,
      ...tileConfig
    };

    // Get filtered data for this specific tile
    const tileData = getFilteredDataForTile(tileId);

    // Render the appropriate chart component
    const renderChart = () => {
      switch (tileId) {
        case 'score-distribution':
          return <ScoreDistributionChart data={tileData} loading={loading} />;
        case 'time-distribution':
          return <TimeDistributionChart data={tileData} loading={loading} />;
        case 'score-trend':
          return <ScoreTrendChart data={tileData} loading={loading} />;
        case 'supervisor-performance':
          return <SupervisorPerformanceChart data={tileData} loading={loading} />;
        case 'market-results':
          return <MarketResultsChart data={tileData} loading={loading} />;
        case 'time-vs-score':
          return <TimeVsScoreChart data={tileData} loading={loading} />;
        case 'pass-fail-rate':
          return <PassFailRateChart data={tileData} loading={loading} />;
        case 'quiz-type-performance':
          return <QuizTypePerformanceChart data={tileData} loading={loading} />;
        case 'top-bottom-performers':
          return <TopBottomPerformersChart data={tileData} loading={loading} />;
        case 'supervisor-effectiveness':
          return <SupervisorEffectivenessChart data={tileData} loading={loading} />;
        case 'question-analytics':
        case 'question-level-analytics':
          return <QuestionLevelAnalyticsChart data={tileData} loading={loading} />;
        case 'retake-analysis':
          return <RetakeAnalysisChart data={tileData} loading={loading} />;

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
    };

    return (
      <DashboardTile
        id={tileId}
        title={config.title}
        loading={loading}
        error={error}
        hasCustomFilters={hasCustomFilters(tileId)}
        onFilterClick={(id, event) => handleTileFilterClick(id, event)}
        onRefresh={handleTileRefresh}
        dragHandle={null}
      >
        {renderChart()}
      </DashboardTile>
    );
  };

  // Get effective filters for a tile (tile-specific or global)
  const getEffectiveFilters = (tileId) => {
    if (tileFilters[tileId]) {
      return tileFilters[tileId];
    }

    // Return global filters as default
    return {
      dateRange: globalFilters.dateRange,
      supervisors: [],
      markets: [],
      scoreRange: { min: 0, max: 100 },
      timeRange: { min: 0, max: 500 } // Changed to minutes
    };
  };

  // Apply filters to data for a specific tile
  const getFilteredDataForTile = (tileId) => {
    const filters = getEffectiveFilters(tileId);

    if (!results || results.length === 0) return [];

    // If this tile has custom filters, log for debugging
    if (tileFilters[tileId]) {
      console.log(`🔍 Applying custom filters for ${tileId}:`, filters);
    }

    return results.filter(result => {
      // Date range filter
      if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
        const resultDate = new Date(result.date_of_test);
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        if (resultDate < startDate || resultDate > endDate) {
          return false;
        }
      }

      // Score range filter
      if (filters.scoreRange) {
        const score = parseFloat(result.score_value) * 100; // Convert to percentage
        if (score < filters.scoreRange.min || score > filters.scoreRange.max) {
          return false;
        }
      }

      // Time range filter (convert minutes to seconds)
      if (filters.timeRange) {
        const time = parseInt(result.time_taken);
        const minTimeSeconds = filters.timeRange.min * 60; // Convert minutes to seconds
        const maxTimeSeconds = filters.timeRange.max * 60; // Convert minutes to seconds
        if (time < minTimeSeconds || time > maxTimeSeconds) {
          return false;
        }
      }

      // Supervisors filter
      if (filters.supervisors && filters.supervisors.length > 0) {
        if (!filters.supervisors.includes(result.supervisor)) {
          return false;
        }
      }

      // Markets filter
      if (filters.markets && filters.markets.length > 0) {
        if (!filters.markets.includes(result.market)) {
          return false;
        }
      }

      return true;
    });
  };

  // Check if tile has custom filters
  const hasCustomFilters = (tileId) => {
    return !!tileFilters[tileId];
  };

  return (
    <DashboardProvider activeDashboardId={activeDashboard?.id}>
      <div className="space-y-6">
        {/* Header with Preset Selector and Global Filters */}
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Dashboard
              </h1>

              {/* Beautiful Dashboard Manager Dropdown */}
              <DashboardManagerDropdown
                dashboards={dashboards}
                activeDashboard={activeDashboard}
                onDashboardChange={switchToDashboard}
                onCreateDashboard={createDashboard}
                onUpdateDashboard={updateActiveDashboard}
                onDuplicateDashboard={duplicateDashboardById}
                onDeleteDashboard={deleteDashboard}
                onSetDefaultDashboard={setAsDefaultDashboard}
                loading={dashboardLoading}
              />

              {/* Tile Library Button */}
              <TileLibraryButton
                currentTiles={getCurrentTiles().map(tile => tile.id)}
                onAddTile={(tileId) => {
                  // Add tile to current dashboard
                  const currentTiles = getCurrentTiles();
                  const newTile = {
                    id: tileId,
                    position: { x: 0, y: 0 }, // Will be auto-positioned
                    size: { w: 1, h: 1 },
                    priority: currentTiles.length + 1,
                    isVisible: true,
                    config: {},
                    customSettings: {}
                  };
                  updateTiles([...currentTiles, newTile]);
                }}
                onRemoveTile={(tileId) => {
                  // Remove tile from current dashboard
                  const currentTiles = getCurrentTiles();
                  const updatedTiles = currentTiles.filter(tile => tile.id !== tileId);
                  updateTiles(updatedTiles);
                }}
              />



              {/* Export Button */}
              <ExportButton
                targetSelector=".dashboard-grid"
                type="dashboard"
                filename={`dashboard_${activeDashboard?.name || 'export'}`}
                title={`${activeDashboard?.name || 'Dashboard'} Export`}
                variant="dropdown"
                size="normal"
                showLabel={true}
                dashboardContext={{
                  filters: globalFilters,
                  tileFilters,
                  dashboard: activeDashboard
                }}
                rawData={results}
              />

            </div>
          </div>

          <GlobalFilters
            filters={globalFilters}
            onFiltersChange={setGlobalFilters}
            onReset={() => {
              const dashboardFilters = activeDashboard?.filters || {};
              setGlobalFilters(dashboardFilters);
            }}
          />
        </div>

        {/* Drill-down Breadcrumbs */}
        <DrillDownBreadcrumbs />

      {/* Dashboard Grid */}
      <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 p-6">

        {error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 dark:text-red-400 text-lg font-medium">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn-primary"
            >
              Retry
            </button>
          </div>
        ) : gridLayout.length > 0 ? (
          <ResizableGridLayout
            layout={gridLayout}
            onLayoutChange={handleGridLayoutChange}
            onResize={handleGridResize}
            className="dashboard-resizable-grid"
          >
            {gridLayout.map((item) => (
              <div key={item.i}>
                <GridTile tileId={item.i} />
              </div>
            ))}
          </ResizableGridLayout>
        ) : (
          <div className="p-8 text-center">
            <div className="text-slate-500 dark:text-slate-400">
              Loading dashboard tiles...
            </div>
          </div>
        )}
      </div>

      {/* Filter Popover */}
      <TileFilterPopover
        isOpen={filterPopover.isOpen}
        onClose={() => setFilterPopover({ isOpen: false, tileId: null, position: { x: 0, y: 0 } })}
        tileId={filterPopover.tileId}
        tileTitle={filterPopover.tileId ? filterPopover.tileId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
        filters={filterPopover.tileId ? getEffectiveFilters(filterPopover.tileId) : {}}
        onFiltersChange={handleTileFiltersChange}
        onUseGlobal={() => handleUseGlobalFilters(filterPopover.tileId)}
        position={filterPopover.position}
      />

      {/* Removed complex configuration modals - using simplified dashboard system */}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        targetSelector=".dashboard-grid"
        type="dashboard"
        defaultFilename={`dashboard_${activeDashboard?.name || 'export'}`}
        title={`Export ${activeDashboard?.name || 'Dashboard'}`}
      />
      </div>
    </DashboardProvider>
  );
};

export default Dashboard;
