import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { quizResultsService } from '../../services/api/quizResults';
import DashboardTile from './components/DashboardTile';
import TileFilterPopover from './components/TileFilterPopover';
import GlobalFilters from './components/GlobalFilters';
import ConfigurationSelector from './components/ConfigurationSelector';
import ConfigurationEditor from './components/ConfigurationEditor';
import ConfigurationGallery from './components/ConfigurationGallery';
import ExportButton from './components/ExportButton';
import ExportModal from './components/ExportModal';
import { DashboardProvider } from './contexts/DashboardContext';
import DrillDownBreadcrumbs from './components/DrillDownBreadcrumbs';
import { useDashboardConfigurations } from './hooks/useDashboardConfigurations';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaBars, FaPlus, FaLayerGroup } from 'react-icons/fa';
import './components/styles/dashboard-grid.css';
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

  // Unified dashboard configurations
  const {
    configurations,
    activeConfiguration,
    defaultConfiguration,
    loading: configLoading,
    error: configError,
    isEditing,
    editingConfiguration,
    applyConfiguration,
    saveConfigurationData,
    deleteConfigurationById,
    setAsDefault,
    cloneConfigurationData,
    startEditing,
    stopEditing,
    saveEditingConfiguration,
    updateEditingConfiguration,
    getCurrentTileOrder,
    getCurrentFilters,
    updateTileOrder,
    clearError
  } = useDashboardConfigurations();

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

  // UI state for configuration management
  const [showGallery, setShowGallery] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Individual tile filters state
  const [tileFilters, setTileFilters] = useState({});
  const [filterPopover, setFilterPopover] = useState({
    isOpen: false,
    tileId: null,
    position: { x: 0, y: 0 }
  });

  // Sync tile order with active configuration
  useEffect(() => {
    const loadTileOrder = async () => {
      if (activeConfiguration) {
        const configTileOrder = await getCurrentTileOrder();
        if (configTileOrder.length > 0) {
          setTileOrder(configTileOrder);
          console.log('📋 Loaded tile order from configuration:', configTileOrder);
        } else {
          // Fallback to default tiles if no configuration tile order
          const { DEFAULT_DASHBOARD_TILES } = await import('./config/availableTiles');
          setTileOrder(DEFAULT_DASHBOARD_TILES);
          console.log('📋 Using default tile order:', DEFAULT_DASHBOARD_TILES);
        }
      }
    };
    loadTileOrder();
  }, [activeConfiguration, getCurrentTileOrder]);

  // Sync global filters with active configuration
  useEffect(() => {
    if (activeConfiguration) {
      const configFilters = getCurrentFilters();
      if (configFilters && Object.keys(configFilters).length > 0) {
        setGlobalFilters(configFilters);
      }
    }
  }, [activeConfiguration, getCurrentFilters]);

  // Charts are now loaded directly (lazy loading to be implemented later)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Handle drag end
  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tileOrder.findIndex((id) => id === active.id);
      const newIndex = tileOrder.findIndex((id) => id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(tileOrder, oldIndex, newIndex);
      setTileOrder(newOrder);

      console.log('🔄 Drag completed. New order:', newOrder);
      console.log('📋 Active configuration:', activeConfiguration?.name, activeConfiguration?.type);

      // Update the tile order (works for both system and user configurations)
      if (activeConfiguration) {
        console.log('🔄 Updating tile order for configuration:', activeConfiguration.name);
        await updateTileOrder(activeConfiguration.id, newOrder);
      } else {
        console.warn('⚠️ No active configuration found');
      }

      // Save to localStorage as fallback
      try {
        localStorage.setItem('dashboard-tile-order', JSON.stringify(newOrder));
        console.log('💾 Tile order saved:', newOrder);
      } catch (error) {
        console.error('❌ Failed to save tile order:', error);
      }
    }
  }, [tileOrder, activeConfiguration, updateTileOrder]);



  // Load tile order from localStorage on mount (fallback if no active configuration)
  useEffect(() => {
    const loadFallbackTileOrder = async () => {
      // Only use localStorage if no active configuration is set
      if (!activeConfiguration && tileOrder.length === 0) {
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
  }, [activeConfiguration, tileOrder.length]);

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

  // Sortable Tile Component
  const SortableTile = ({ tileId }) => {
    const {
      setNodeRef,
      transform,
      transition,
      isDragging,
      attributes,
      listeners,
    } = useSortable({ id: tileId });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 1000 : 'auto',
      opacity: isDragging ? 0.8 : 1,
    };

    const config = tileConfigs[tileId];

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
          return <QuestionLevelAnalyticsChart data={tileData} loading={loading} />;
        case 'retake-analysis':
          return <RetakeAnalysisChart data={tileData} loading={loading} />;
        default:
          return (
            <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
              Chart not implemented
            </div>
          );
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`dashboard-grid-item ${isDragging ? 'dragging' : ''}`}
      >
        <DashboardTile
          id={tileId}
          title={config.title}
          loading={loading}
          error={error}
          hasCustomFilters={hasCustomFilters(tileId)}
          onFilterClick={(id, event) => handleTileFilterClick(id, event)}
          onRefresh={handleTileRefresh}
          dragHandle={
            <span
              {...attributes}
              {...listeners}
              className="text-gray-400 dark:text-gray-300 cursor-grab p-1 rounded flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <FaBars />
            </span>
          }
        >
          {renderChart()}
        </DashboardTile>
      </div>
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
    <DashboardProvider>
      <div className="space-y-6">
        {/* Header with Preset Selector and Global Filters */}
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Dashboard
              </h1>
              <ConfigurationSelector
                configurations={configurations}
                activeConfiguration={activeConfiguration}
                defaultConfiguration={defaultConfiguration}
                onConfigurationChange={applyConfiguration}
                onStartEditing={startEditing}
                onClone={cloneConfigurationData}
                onDelete={deleteConfigurationById}
                onSetDefault={setAsDefault}
                loading={configLoading}
              />

              <button
                onClick={() => startEditing()}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600'
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200'
                }`}
                title="Create new configuration"
              >
                <FaPlus size={14} />
                <span className="hidden sm:inline">New</span>
              </button>

              <button
                onClick={() => setShowGallery(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600'
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200'
                }`}
                title="Browse all configurations"
              >
                <FaLayerGroup size={14} />
                <span className="hidden sm:inline">Browse</span>
              </button>

              {/* Export Button */}
              <ExportButton
                targetSelector=".dashboard-grid"
                type="dashboard"
                filename={`dashboard_${activeConfiguration?.name || 'export'}`}
                title={`${activeConfiguration?.name || 'Dashboard'} Export`}
                variant="dropdown"
                size="normal"
                showLabel={true}
                dashboardContext={{
                  filters: globalFilters,
                  tileFilters,
                  configuration: activeConfiguration
                }}
                rawData={results}
              />

            </div>
          </div>

          <GlobalFilters
            filters={globalFilters}
            onFiltersChange={setGlobalFilters}
            onReset={() => {
              const configFilters = getCurrentFilters();
              setGlobalFilters(configFilters);
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
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tileOrder}
              strategy={rectSortingStrategy}
            >
              <div className="dashboard-grid">
                {tileOrder.map((tileId) => (
                  <SortableTile key={tileId} tileId={tileId} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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

      {/* Configuration Editor Modal */}
      {isEditing && (
        <ConfigurationEditor
          configuration={editingConfiguration}
          onSave={saveEditingConfiguration}
          onCancel={stopEditing}
          onUpdateConfiguration={updateEditingConfiguration}
          isLoading={configLoading}
        />
      )}

      {/* Configuration Gallery Modal */}
      {showGallery && (
        <ConfigurationGallery
          configurations={configurations}
          activeConfiguration={activeConfiguration}
          loading={configLoading}
          onConfigurationSelect={(configId) => {
            console.log('🎯 Gallery: Applying configuration:', configId);
            applyConfiguration(configId);
            setShowGallery(false);
          }}
          onEdit={(configId) => {
            startEditing(configId);
            setShowGallery(false);
          }}
          onClone={(configId, newName) => {
            cloneConfigurationData(configId, newName);
            setShowGallery(false);
          }}
          onDelete={(configId) => {
            deleteConfigurationById(configId);
          }}
          onSetDefault={(configId) => {
            setAsDefault(configId);
          }}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        targetSelector=".dashboard-grid"
        type="dashboard"
        defaultFilename={`dashboard_${activeConfiguration?.name || 'export'}`}
        title={`Export ${activeConfiguration?.name || 'Dashboard'}`}
      />
      </div>
    </DashboardProvider>
  );
};

export default Dashboard;
