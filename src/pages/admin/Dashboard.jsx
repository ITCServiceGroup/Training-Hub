import React, { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboards } from './hooks/useDashboards';
import { quizResultsService } from '../../services/api/quizResults';
import DashboardTile from './components/DashboardTile';
import TileFilterPopover from './components/TileFilterPopover';
import GlobalFilters from './components/GlobalFilters';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';

// Custom styles for Flatpickr theme integration
const flatpickrThemeStyles = `
  .flatpickr-calendar {
    font-family: inherit;
    border-radius: 0.5rem !important;
    overflow: hidden !important;
  }
  
  /* Header background - all possible containers */
  .flatpickr-months,
  .flatpickr-months .flatpickr-month,
  .flatpickr-month,
  .flatpickr-months > span {
    background-color: var(--primary-color) !important;
    background: var(--primary-color) !important;
    border-top-left-radius: 0.5rem !important;
    border-top-right-radius: 0.5rem !important;
  }
  
  /* Month header container - ensure all elements get theme color */
  .flatpickr-month,
  .flatpickr-months .flatpickr-month,
  .flatpickr-months span.flatpickr-month {
    background-color: var(--primary-color) !important;
    background: var(--primary-color) !important;
    color: white !important;
  }
  
  /* Current month text and year */
  .flatpickr-current-month,
  .flatpickr-current-month .flatpickr-monthDropdown-months,
  .flatpickr-current-month .cur-year,
  .flatpickr-current-month input.cur-year[readonly] {
    color: white !important;
    background-color: transparent !important;
    border: none !important;
  }
  
  /* Navigation arrows */
  .flatpickr-prev-month,
  .flatpickr-next-month {
    color: white !important;
    fill: white !important;
  }
  
  .flatpickr-prev-month:hover,
  .flatpickr-next-month:hover {
    color: rgba(255, 255, 255, 0.8) !important;
    fill: rgba(255, 255, 255, 0.8) !important;
  }
  
  /* Navigation arrow SVGs */
  .flatpickr-prev-month svg,
  .flatpickr-next-month svg {
    fill: white !important;
  }
  
  .flatpickr-prev-month:hover svg,
  .flatpickr-next-month:hover svg {
    fill: rgba(255, 255, 255, 0.8) !important;
  }
  
  /* Weekdays header */
  .flatpickr-weekdays {
    background-color: var(--primary-color) !important;
  }
  
  .flatpickr-weekday {
    color: white !important;
    background-color: var(--primary-color) !important;
  }
  
  /* Selected dates */
  .flatpickr-day.selected,
  .flatpickr-day.startRange,
  .flatpickr-day.endRange {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    color: white !important;
  }
  
  /* Date range styling */
  .flatpickr-day.inRange {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    color: white !important;
    box-shadow: -5px 0 0 var(--primary-color), 5px 0 0 var(--primary-color) !important;
  }
  
  /* Date hover effects */
  .flatpickr-day:hover {
    background: var(--primary-light) !important;
    border-color: var(--primary-light) !important;
  }
  
  /* Today indicator */
  .flatpickr-day.today {
    border-color: var(--primary-color) !important;
  }
  
  .flatpickr-day.today:hover,
  .flatpickr-day.today:focus {
    background: var(--primary-color) !important;
    color: white !important;
  }
  
  /* Style Flatpickr input to match react-select */
  .flatpickr-input,
  input.flatpickr-input,
  .date-range-wrapper input,
  .date-range-wrapper .flatpickr-input {
    background: white !important;
    border: 1px solid #d1d5db !important;
    border-radius: 6px !important;
    min-height: 42px !important;
    height: 42px !important;
    font-size: 12px !important;
    padding: 8px 12px !important;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
    transition: all 0.15s ease-in-out !important;
    margin: 0 !important;
    vertical-align: top !important;
    box-sizing: border-box !important;
    line-height: 1.5 !important;
    width: 100% !important;
  }
  
  .flatpickr-input:hover,
  input.flatpickr-input:hover,
  .date-range-wrapper input:hover,
  .date-range-wrapper .flatpickr-input:hover {
    border-color: var(--primary-color) !important;
  }
  
  .flatpickr-input:focus,
  input.flatpickr-input:focus,
  .date-range-wrapper input:focus,
  .date-range-wrapper .flatpickr-input:focus {
    outline: none !important;
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 1px var(--primary-color) !important;
  }
  
  /* Dark mode support for input */
  .dark .flatpickr-input,
  .dark input.flatpickr-input,
  .dark .date-range-wrapper input,
  .dark .date-range-wrapper .flatpickr-input {
    background: #1e293b !important;
    border-color: #475569 !important;
    color: #f8fafc !important;
  }
  
  .dark .flatpickr-input:hover,
  .dark .flatpickr-input:focus,
  .dark input.flatpickr-input:hover,
  .dark input.flatpickr-input:focus,
  .dark .date-range-wrapper input:hover,
  .dark .date-range-wrapper input:focus,
  .dark .date-range-wrapper .flatpickr-input:hover,
  .dark .date-range-wrapper .flatpickr-input:focus {
    border-color: var(--primary-color) !important;
  }
  
  /* Force alignment with react-select components */
  .date-range-container {
    display: flex !important;
    align-items: flex-end !important;
  }
  
  .date-range-container label {
    text-align: left !important;
    margin-left: 0 !important;
    padding-left: 0 !important;
    align-self: flex-start !important;
  }
  
  .date-range-wrapper {
    display: flex !important;
    align-items: center !important;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = flatpickrThemeStyles;
  if (!document.head.querySelector('style[data-flatpickr-theme]')) {
    styleSheet.setAttribute('data-flatpickr-theme', 'true');
    document.head.appendChild(styleSheet);
  }
}

import TileLibraryButton from './components/TileLibraryButton';
import DashboardManagerDropdown from './components/DashboardManagerDropdown';
import ExportButton from './components/ExportButton';
import ExportModal from './components/ExportModal';
import MultiSelect from './components/Filters/MultiSelect';
import SingleSelect from './components/Filters/SingleSelect';
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
import DashboardResultsSection from './components/DashboardResultsSection';
import PDFModal from './components/PDFModal';

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

  // Stable loading state for charts to prevent reloading during layout changes
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Stable data reference to prevent chart reloading
  const stableDataRef = useRef([]);
  const stableFiltersRef = useRef({});
  
  // Flag to prevent data fetching during layout operations
  const isLayoutOperationRef = useRef(false);

  // Tile order state (managed by presets and saved layouts)
  const [tileOrder, setTileOrder] = useState([]);

  // Global filters state (initialized from preset or saved layout)
  const [globalFilters, setGlobalFilters] = useState({
    dateRange: 'last-30-days',
    quickPreset: 'last-30-days',
    markets: [],
    supervisors: [],
    ldaps: [],
    quizTypes: []
  });

  // UI state - simplified (removed complex configuration management)
  const [showExportModal, setShowExportModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Handle PDF view
  const handleViewPDF = useCallback((url) => {
    console.log('handleViewPDF called with URL:', url);
    setPdfUrl(url);
    setShowPdfModal(true);
  }, []);

  // Individual tile filters state
  const [tileFilters, setTileFilters] = useState({});
  const [filterPopover, setFilterPopover] = useState({
    isOpen: false,
    tileId: null,
    position: { x: 0, y: 0 }
  });

  // Grid layout state
  const [gridLayout, setGridLayout] = useState([]);
  
  // Simple debounce timer for layout saves
  const saveTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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



  // Handle grid layout changes (drag and resize) - prevent data fetching during layout ops
  const handleGridLayoutChange = useCallback((newLayout) => {
    // Set flag to prevent data fetching during layout operations
    isLayoutOperationRef.current = true;
    
    // Immediately update visual layout for responsive feedback
    setGridLayout(newLayout);
    
    // Update tile order for UI consistency
    const newTileOrder = convertGridLayoutToTileOrder(newLayout);
    setTileOrder(newTileOrder);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operations to prevent excessive database calls
    saveTimeoutRef.current = setTimeout(async () => {
      const newTileConfigs = convertGridLayoutToTileConfigs(newLayout);
      
      // Update the dashboard
      if (activeDashboard) {
        try {
          await updateTiles(newTileConfigs);
          console.log('✅ Tiles updated successfully');
        } catch (error) {
          console.error('❌ Failed to update tiles:', error);
        }
      }

      // Save to localStorage as fallback
      try {
        localStorage.setItem('dashboard-tile-order', JSON.stringify(newTileOrder));
        localStorage.setItem('dashboard-grid-layout', JSON.stringify(newLayout));
        localStorage.setItem('dashboard-tile-configs', JSON.stringify(newTileConfigs));
        console.log('💾 Grid layout saved');
      } catch (error) {
        console.error('❌ Failed to save grid layout:', error);
      }
      
      // Clear the layout operation flag after saving
      setTimeout(() => {
        isLayoutOperationRef.current = false;
      }, 100);
    }, 300); // 300ms debounce
  }, [activeDashboard, updateTiles, convertGridLayoutToTileConfigs, convertGridLayoutToTileOrder]);

  // Handle grid resize events
  const handleGridResize = useCallback((newLayout, oldItem, newItem) => {
    // Let handleGridLayoutChange handle all state updates
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

  // Add a forced refresh trigger for when filters change but useEffect doesn't fire
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Fetch dashboard data based on global filters
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Skip data fetching during layout operations to prevent chart reloading
      if (isLayoutOperationRef.current) {
        console.log('🚫 Skipping data fetch during layout operation');
        return;
      }
      
      console.log('🔄 Fetching dashboard data with filters:', globalFilters);
      
      try {
        setLoading(true);
        setError(null);

        // Convert global filters to API format
        const getDateRange = (dateRange) => {
          if (typeof dateRange === 'object' && dateRange.startDate && dateRange.endDate) {
            return { startDate: dateRange.startDate, endDate: dateRange.endDate };
          }
          
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          
          switch (dateRange) {
            case 'today':
              return { startDate: todayStr, endDate: todayStr };
            case 'yesterday':
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              return { startDate: yesterdayStr, endDate: yesterdayStr };
            case 'last-7-days':
              const sevenDaysAgo = new Date(today);
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return { startDate: sevenDaysAgo.toISOString().split('T')[0], endDate: todayStr };
            case 'last-30-days':
            case 'last_month': // Handle legacy format
              const thirtyDaysAgo = new Date(today);
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return { startDate: thirtyDaysAgo.toISOString().split('T')[0], endDate: todayStr };
            case 'this-month':
              const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
              return { startDate: monthStart.toISOString().split('T')[0], endDate: todayStr };
            case 'this-quarter':
              const currentQuarter = Math.floor(today.getMonth() / 3);
              const quarterStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
              return { startDate: quarterStart.toISOString().split('T')[0], endDate: todayStr };
            case 'this-year':
              const yearStart = new Date(today.getFullYear(), 0, 1);
              return { startDate: yearStart.toISOString().split('T')[0], endDate: todayStr };
            case 'all-time':
              // Return a very early date to get all records
              return { startDate: '2000-01-01', endDate: todayStr };
            default:
              // Default to last 30 days
              const defaultStart = new Date(today);
              defaultStart.setDate(defaultStart.getDate() - 30);
              return { startDate: defaultStart.toISOString().split('T')[0], endDate: todayStr };
          }
        };
        
        const dateRange = getDateRange(globalFilters.dateRange);
        console.log('📅 Computed date range:', dateRange);
        
        const filterParams = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
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

        const data = await quizResultsService.getFilteredResults({
          ...filterParams,
          includeQuizMetadata: true // Include quiz passing thresholds for pass/fail analysis
        });
        setResults(data);
        // Update stable references only when data actually changes
        stableDataRef.current = data;
        stableFiltersRef.current = globalFilters;
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [globalFilters, isInitialLoad, refreshTrigger]);



  // Handle tile filter button clicks - memoized
  const handleTileFilterClick = useCallback((tileId, event) => {
    const rect = event.target.getBoundingClientRect();
    setFilterPopover({
      isOpen: true,
      tileId,
      position: {
        x: rect.left,
        y: rect.bottom + 8
      }
    });
  }, []);

  // Handle tile filter changes - memoized
  const handleTileFiltersChange = useCallback((tileId, filters) => {
    setTileFilters(prev => ({
      ...prev,
      [tileId]: filters
    }));
  }, []);

  // Handle use global filters - memoized
  const handleUseGlobalFilters = useCallback((tileId) => {
    setTileFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[tileId];
      return newFilters;
    });
    setFilterPopover({ isOpen: false, tileId: null, position: { x: 0, y: 0 } });
  }, []);

  // Handle tile refresh - memoized
  const handleTileRefresh = useCallback(() => {
    // For now, just refresh all data
    // In the future, we could refresh individual tiles
    window.location.reload();
  }, []);

  // Grid Tile Component (for react-grid-layout) - Memoized to prevent chart reloading
  const GridTile = memo(({ tileId }) => {
    // Memoize the tile configuration to prevent unnecessary recalculations
    const config = useMemo(() => {
      const dashboardTiles = getCurrentTiles();
      const tileConfig = dashboardTiles.find(tile => tile.id === tileId);
      const staticConfig = tileConfigs[tileId];

      return {
        title: staticConfig?.title || tileId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: staticConfig?.description || '',
        id: tileId,
        ...tileConfig
      };
    }, [tileId, getCurrentTiles]);

    // Use stable data references to prevent charts from re-rendering
    const tileData = useMemo(() => {
      // Use stable data reference instead of changing results/globalFilters
      return getFilteredDataForTile(tileId, stableDataRef.current, stableFiltersRef.current);
    }, [tileId]);

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
    }, [tileId, tileData, isInitialLoad]);


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
        {chartComponent}
      </DashboardTile>
    );
  });

  // Get effective filters for a tile (tile-specific or global)
  const getEffectiveFilters = (tileId, filtersSource = globalFilters) => {
    // Start with global filters as base
    const baseFilters = {
      dateRange: filtersSource.dateRange,
      supervisors: filtersSource.supervisors || [],
      markets: filtersSource.markets || [],
      ldaps: filtersSource.ldaps || [],
      quizTypes: filtersSource.quizTypes || [],
      scoreRange: { min: 0, max: 100 },
      timeRange: { min: 0, max: 500 } // Changed to minutes
    };

    // If tile has custom filters, merge them with global filters
    // Global filters take precedence (applied first)
    if (tileFilters[tileId]) {
      return {
        ...tileFilters[tileId],
        // Global filters override tile-specific ones
        supervisors: filtersSource.supervisors?.length > 0 ? filtersSource.supervisors : tileFilters[tileId].supervisors || [],
        markets: filtersSource.markets?.length > 0 ? filtersSource.markets : tileFilters[tileId].markets || [],
        ldaps: filtersSource.ldaps?.length > 0 ? filtersSource.ldaps : tileFilters[tileId].ldaps || [],
        quizTypes: filtersSource.quizTypes?.length > 0 ? filtersSource.quizTypes : tileFilters[tileId].quizTypes || [],
        dateRange: filtersSource.dateRange
      };
    }

    return baseFilters;
  };

  // Apply filters to data for a specific tile
  const getFilteredDataForTile = (tileId, dataSource = results, filtersSource = globalFilters) => {
    const filters = getEffectiveFilters(tileId, filtersSource);

    if (!dataSource || dataSource.length === 0) return [];

    // If this tile has custom filters, log for debugging
    if (tileFilters[tileId]) {
      console.log(`🔍 Applying custom filters for ${tileId}:`, filters);
    }

    return dataSource.filter(result => {
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

      // LDAP filter
      if (filters.ldaps && filters.ldaps.length > 0) {
        if (!filters.ldaps.includes(result.ldap)) {
          return false;
        }
      }

      // Quiz Type filter
      if (filters.quizTypes && filters.quizTypes.length > 0) {
        if (!filters.quizTypes.includes(result.quiz_type)) {
          return false;
        }
      }

      return true;
    });
  };

  // Check if tile has custom filters - memoized
  const hasCustomFilters = useCallback((tileId) => {
    return !!tileFilters[tileId];
  }, [tileFilters]);

  return (
    <DashboardProvider activeDashboardId={activeDashboard?.id}>
      <div className="space-y-6">
        {/* Streamlined Dashboard Header */}
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 p-6">
          <div className="space-y-4 mb-6">
            {/* Analytics Dashboard Title */}
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Analytics Dashboard
            </h1>
            
            {/* Dashboard Controls Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Dashboard Manager Dropdown */}
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

              {/* Edit Charts Button */}
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
                targetSelector=".dashboard-resizable-grid"
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

              {/* Global Filters */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Global Filters
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Time Period Filter */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Time Period
                    </label>
                    <div className="w-32">
                      <SingleSelect
                        value={globalFilters.quickPreset || 'last-30-days'}
                        onChange={(preset) => {
                          console.log('🔄 Time period filter changed to:', preset);
                          
                          // Use functional update to ensure we have the latest state
                          setGlobalFilters(prevFilters => {
                            let newFilters = { ...prevFilters, quickPreset: preset };
                            
                            // Apply preset date ranges
                            switch (preset) {
                              case 'today':
                                newFilters.dateRange = 'today';
                                // Clear any custom date range properties
                                delete newFilters.startDate;
                                delete newFilters.endDate;
                                break;
                              case 'yesterday':
                                newFilters.dateRange = 'yesterday';
                                // Clear any custom date range properties
                                delete newFilters.startDate;
                                delete newFilters.endDate;
                                break;
                              case 'last-7-days':
                                newFilters.dateRange = 'last-7-days';
                                // Clear any custom date range properties
                                delete newFilters.startDate;
                                delete newFilters.endDate;
                                break;
                              case 'last-30-days':
                                newFilters.dateRange = 'last-30-days';
                                // Clear any custom date range properties
                                delete newFilters.startDate;
                                delete newFilters.endDate;
                                break;
                              case 'this-month':
                                newFilters.dateRange = 'this-month';
                                // Clear any custom date range properties
                                delete newFilters.startDate;
                                delete newFilters.endDate;
                                break;
                              case 'this-quarter':
                                newFilters.dateRange = 'this-quarter';
                                // Clear any custom date range properties
                                delete newFilters.startDate;
                                delete newFilters.endDate;
                                break;
                              case 'this-year':
                                newFilters.dateRange = 'this-year';
                                // Clear any custom date range properties
                                delete newFilters.startDate;
                                delete newFilters.endDate;
                                break;
                              case 'all-time':
                                newFilters.dateRange = 'all-time';
                                // Clear any custom date range properties
                                delete newFilters.startDate;
                                delete newFilters.endDate;
                                break;
                              case 'custom':
                                newFilters.dateRange = {
                                  startDate: null,
                                  endDate: null
                                };
                                break;
                              default:
                                break;
                            }
                            
                            console.log('📝 Updated filters:', newFilters);
                            
                            // Force a refresh to ensure data is fetched
                            setTimeout(() => {
                              setRefreshTrigger(prev => prev + 1);
                            }, 100);
                            
                            return newFilters;
                          });
                        }}
                        options={[
                          { value: 'today', label: 'Today' },
                          { value: 'yesterday', label: 'Yesterday' },
                          { value: 'last-7-days', label: 'Last 7 Days' },
                          { value: 'last-30-days', label: 'Last 30 Days' },
                          { value: 'this-month', label: 'This Month' },
                          { value: 'this-quarter', label: 'This Quarter' },
                          { value: 'this-year', label: 'This Year' },
                          { value: 'all-time', label: 'All Time' },
                          { value: 'custom', label: 'Custom' }
                        ]}
                        placeholder="Select time period"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Custom Date Range Picker */}
                  {globalFilters.quickPreset === 'custom' && (
                    <div className="flex flex-col date-range-container">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Date Range
                      </label>
                      <div className="w-38 date-range-wrapper">
                        <Flatpickr
                          value={globalFilters.dateRange?.startDate && globalFilters.dateRange?.endDate 
                            ? [new Date(globalFilters.dateRange.startDate), new Date(globalFilters.dateRange.endDate)]
                            : []}
                          onChange={(selectedDates) => {
                            console.log('📅 Custom date range changed:', selectedDates);
                            
                            // Use functional update to ensure we have the latest state
                            setGlobalFilters(prevFilters => {
                              let newFilters = { ...prevFilters };
                              
                              if (selectedDates.length === 2) {
                                newFilters.dateRange = {
                                  startDate: selectedDates[0].toISOString().split('T')[0],
                                  endDate: selectedDates[1].toISOString().split('T')[0]
                                };
                              } else if (selectedDates.length === 1) {
                                // First date selected, clear end date
                                newFilters.dateRange = {
                                  startDate: selectedDates[0].toISOString().split('T')[0],
                                  endDate: null
                                };
                              } else if (selectedDates.length === 0) {
                                // Clear both dates
                                newFilters.dateRange = {
                                  startDate: null,
                                  endDate: null
                                };
                              }
                              
                              console.log('📝 Updated filters from date picker:', newFilters);
                              
                              // Force a refresh to ensure data is fetched
                              setTimeout(() => {
                                setRefreshTrigger(prev => prev + 1);
                              }, 100);
                              
                              return newFilters;
                            });
                          }}
                          placeholder="Select date range"
                          className="flatpickr-input"
                          options={{
                            mode: 'range',
                            dateFormat: 'm/d/y',
                            maxDate: 'today',
                            clickOpens: true,
                            allowInput: false,
                            disableMobile: true,
                            onReady: (selectedDates, dateStr, instance) => {
                              instance.element.setAttribute('autocomplete', 'off');
                              instance.element.setAttribute('readonly', 'readonly');
                              // Set initial dates if they exist
                              if (globalFilters.dateRange?.startDate && globalFilters.dateRange?.endDate) {
                                instance.setDate([
                                  new Date(globalFilters.dateRange.startDate),
                                  new Date(globalFilters.dateRange.endDate)
                                ], false);
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Market Filter */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Market
                    </label>
                    <div className="w-40">
                      <MultiSelect
                        type="markets"
                        value={globalFilters.markets || []}
                        onChange={(value) => {
                          console.log('🔄 Markets filter changed:', value);
                          setGlobalFilters(prevFilters => ({ ...prevFilters, markets: value || [] }));
                          setTimeout(() => setRefreshTrigger(prev => prev + 1), 100);
                        }}
                        hideLabel={true}
                      />
                    </div>
                  </div>

                  {/* Supervisor Filter */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Supervisor
                    </label>
                    <div className="w-40">
                      <MultiSelect
                        type="supervisors"
                        value={globalFilters.supervisors || []}
                        onChange={(value) => {
                          console.log('🔄 Supervisors filter changed:', value);
                          setGlobalFilters(prevFilters => ({ ...prevFilters, supervisors: value || [] }));
                          setTimeout(() => setRefreshTrigger(prev => prev + 1), 100);
                        }}
                        hideLabel={true}
                      />
                    </div>
                  </div>

                  {/* LDAP Filter */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      LDAP
                    </label>
                    <div className="w-40">
                      <MultiSelect
                        type="ldaps"
                        value={globalFilters.ldaps || []}
                        onChange={(value) => {
                          console.log('🔄 LDAP filter changed:', value);
                          setGlobalFilters(prevFilters => ({ ...prevFilters, ldaps: value || [] }));
                          setTimeout(() => setRefreshTrigger(prev => prev + 1), 100);
                        }}
                        hideLabel={true}
                      />
                    </div>
                  </div>

                  {/* Quiz Type Filter */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Quiz Type
                    </label>
                    <div className="w-40">
                      <MultiSelect
                        type="quizTypes"
                        value={globalFilters.quizTypes || []}
                        onChange={(value) => {
                          console.log('🔄 Quiz Types filter changed:', value);
                          setGlobalFilters(prevFilters => ({ ...prevFilters, quizTypes: value || [] }));
                          setTimeout(() => setRefreshTrigger(prev => prev + 1), 100);
                        }}
                        hideLabel={true}
                      />
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 opacity-0">
                      Reset
                    </label>
                    <button
                      onClick={() => {
                        console.log('🔄 Resetting filters');
                        
                        // Use functional update to ensure we have the latest state
                        setGlobalFilters(prevFilters => {
                          const dashboardFilters = activeDashboard?.filters || {};
                          const newFilters = { 
                            ...dashboardFilters, 
                            dateRange: 'last-30-days',
                            quickPreset: 'last-30-days',
                            markets: [],
                            supervisors: [],
                            ldaps: [],
                            quizTypes: []
                          };
                          
                          console.log('📝 Reset filters to:', newFilters);
                          
                          // Force a refresh to ensure data is fetched
                          setTimeout(() => {
                            setRefreshTrigger(prev => prev + 1);
                          }, 100);
                          
                          return newFilters;
                        });
                      }}
                      className="flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors shadow-sm border border-slate-300 dark:border-slate-600 text-white"
                      style={{
                        backgroundColor: 'var(--primary-color)',
                        '--tw-shadow': '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--primary-dark)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'var(--primary-color)';
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dashboard Description */}
            {activeDashboard?.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {activeDashboard.description}
              </p>
            )}
          </div>

          <GlobalFilters
            filters={globalFilters}
            onFiltersChange={(newFilters) => {
              console.log('🔄 GlobalFilters component changed filters:', newFilters);
              setGlobalFilters(newFilters);
              
              // Force a refresh to ensure data is fetched
              setTimeout(() => {
                setRefreshTrigger(prev => prev + 1);
              }, 100);
            }}
            onReset={() => {
              console.log('🔄 GlobalFilters component reset');
              const dashboardFilters = activeDashboard?.filters || {};
              setGlobalFilters(dashboardFilters);
              
              // Force a refresh to ensure data is fetched
              setTimeout(() => {
                setRefreshTrigger(prev => prev + 1);
              }, 100);
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

      {/* Results Table */}
      <DashboardResultsSection 
        data={stableDataRef.current || []}
        loading={loading}
        onViewPDF={handleViewPDF}
        globalFilters={globalFilters}
      />

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
        targetSelector=".dashboard-resizable-grid"
        defaultFilename={`dashboard_${activeDashboard?.name || 'export'}`}
        title={`Export ${activeDashboard?.name || 'Dashboard'}`}
      />

      {/* PDF Modal */}
      <PDFModal
        isOpen={showPdfModal}
        pdfUrl={pdfUrl}
        onClose={() => setShowPdfModal(false)}
      />
      </div>
    </DashboardProvider>
  );
};

export default memo(Dashboard);
