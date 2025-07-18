/**
 * Unified Dashboard Configuration Type Definition
 * 
 * This replaces the separate concepts of presets, layouts, and tile management
 * with a single, unified configuration system.
 */

// Configuration types
export const CONFIGURATION_TYPES = {
  SYSTEM: 'system',     // Built-in configurations (read-only)
  USER: 'user',         // User-created configurations
  SHARED: 'shared',     // Shared configurations (future)
  TEMPLATE: 'template'  // Template configurations for cloning
};

// Tile position and size structure
export const TileLayout = {
  position: {
    x: 0,        // Grid X position
    y: 0,        // Grid Y position
  },
  size: {
    w: 1,        // Width in grid units
    h: 1         // Height in grid units
  }
};

// Individual tile configuration within a dashboard
export const TileConfiguration = {
  id: '',              // Tile ID (matches availableTiles.js)
  position: TileLayout.position,
  size: TileLayout.size,
  config: {},          // Tile-specific configuration options
  priority: 0,         // Display order/priority
  isVisible: true,     // Whether tile is currently visible
  customSettings: {}   // User customizations for this tile
};

// Main dashboard configuration object
export const DashboardConfiguration = {
  // Identity
  id: '',                    // Unique configuration ID
  name: '',                  // Display name
  description: '',           // Optional description
  
  // Type and ownership
  type: CONFIGURATION_TYPES.USER,  // Configuration type
  isDefault: false,          // Whether this is the user's default
  isTemplate: false,         // Whether this can be used as a template
  
  // Content
  tiles: [],                 // Array of TileConfiguration objects
  filters: {                 // Default filters for this configuration
    dateRange: {
      preset: 'last_month',
      startDate: null,
      endDate: null
    },
    quickPreset: 'last_month',
    supervisor: null,
    market: null,
    quizType: null
  },
  
  // Layout settings
  layout: {
    gridColumns: 3,          // Number of grid columns
    gridGap: 16,             // Gap between tiles in pixels
    autoResize: true,        // Whether to auto-resize tiles
    compactMode: false       // Whether to use compact layout
  },
  
  // Metadata
  metadata: {
    createdBy: '',           // User ID who created this
    createdAt: '',           // ISO timestamp
    updatedAt: '',           // ISO timestamp
    lastUsedAt: '',          // ISO timestamp
    usageCount: 0,           // How many times this has been used
    tags: [],                // Searchable tags
    category: '',            // Optional category
    popularity: 0,           // Popularity score (0-100)
    version: '1.0.0'         // Configuration version for migrations
  },
  
  // Sharing and permissions (future)
  sharing: {
    isPublic: false,         // Whether publicly visible
    sharedWith: [],          // Array of user IDs with access
    permissions: {           // What others can do
      canView: true,
      canClone: true,
      canEdit: false
    }
  }
};

// System configuration definitions (built-in presets)
export const SYSTEM_CONFIGURATIONS = {
  EXECUTIVE_OVERVIEW: {
    id: 'executive-overview',
    name: 'Executive Overview',
    description: 'High-level metrics and KPIs for leadership team',
    type: CONFIGURATION_TYPES.SYSTEM,
    tiles: [
      {
        id: 'pass-fail-rate',
        position: { x: 0, y: 0 },
        size: { w: 1, h: 1 },
        priority: 1
      },
      {
        id: 'score-trend',
        position: { x: 1, y: 0 },
        size: { w: 2, h: 1 },
        priority: 2
      },
      {
        id: 'supervisor-performance',
        position: { x: 0, y: 1 },
        size: { w: 1, h: 1 },
        priority: 3
      },
      {
        id: 'market-results',
        position: { x: 1, y: 1 },
        size: { w: 1, h: 1 },
        priority: 4
      },
      {
        id: 'top-bottom-performers',
        position: { x: 2, y: 1 },
        size: { w: 1, h: 1 },
        priority: 5
      }
    ],
    metadata: {
      createdBy: 'system',
      category: 'executive',
      tags: ['executive', 'overview', 'kpi', 'leadership'],
      popularity: 95
    }
  },

  MANAGER_DASHBOARD: {
    id: 'manager-dashboard',
    name: 'Manager Dashboard',
    description: 'Team performance and supervision metrics',
    type: CONFIGURATION_TYPES.SYSTEM,
    tiles: [
      {
        id: 'supervisor-performance',
        position: { x: 0, y: 0 },
        size: { w: 1, h: 1 },
        priority: 1
      },
      {
        id: 'supervisor-effectiveness',
        position: { x: 1, y: 0 },
        size: { w: 2, h: 1 },
        priority: 2
      },
      {
        id: 'score-distribution',
        position: { x: 0, y: 1 },
        size: { w: 1, h: 1 },
        priority: 3
      },
      {
        id: 'time-distribution',
        position: { x: 1, y: 1 },
        size: { w: 1, h: 1 },
        priority: 4
      },
      {
        id: 'top-bottom-performers',
        position: { x: 2, y: 1 },
        size: { w: 1, h: 1 },
        priority: 5
      },
      {
        id: 'retake-analysis',
        position: { x: 0, y: 2 },
        size: { w: 2, h: 1 },
        priority: 6
      }
    ],
    metadata: {
      createdBy: 'system',
      category: 'management',
      tags: ['manager', 'team', 'supervision', 'performance'],
      popularity: 88
    }
  },

  ANALYST_WORKBENCH: {
    id: 'analyst-workbench',
    name: 'Analyst Workbench',
    description: 'Comprehensive analytics and detailed insights',
    type: CONFIGURATION_TYPES.SYSTEM,
    tiles: [
      {
        id: 'score-trend',
        position: { x: 0, y: 0 },
        size: { w: 2, h: 1 },
        priority: 1
      },
      {
        id: 'time-vs-score',
        position: { x: 2, y: 0 },
        size: { w: 2, h: 1 },
        priority: 2
      },
      {
        id: 'score-distribution',
        position: { x: 0, y: 1 },
        size: { w: 1, h: 1 },
        priority: 3
      },
      {
        id: 'time-distribution',
        position: { x: 1, y: 1 },
        size: { w: 1, h: 1 },
        priority: 4
      },
      {
        id: 'question-analytics',
        position: { x: 0, y: 2 },
        size: { w: 2, h: 1 },
        priority: 5
      },
      {
        id: 'quiz-type-performance',
        position: { x: 2, y: 2 },
        size: { w: 1, h: 1 },
        priority: 6
      },
      {
        id: 'retake-analysis',
        position: { x: 0, y: 3 },
        size: { w: 1, h: 1 },
        priority: 7
      }
    ],
    metadata: {
      createdBy: 'system',
      category: 'analytics',
      tags: ['analyst', 'detailed', 'comprehensive', 'insights'],
      popularity: 75
    }
  },

  TRAINING_OVERVIEW: {
    id: 'training-overview',
    name: 'Training Overview',
    description: 'Learning progress and training effectiveness metrics',
    type: CONFIGURATION_TYPES.SYSTEM,
    tiles: [
      {
        id: 'score-trend',
        position: { x: 0, y: 0 },
        size: { w: 2, h: 1 },
        priority: 1
      },
      {
        id: 'pass-fail-rate',
        position: { x: 2, y: 0 },
        size: { w: 1, h: 1 },
        priority: 2
      },
      {
        id: 'supervisor-effectiveness',
        position: { x: 0, y: 1 },
        size: { w: 2, h: 1 },
        priority: 3
      },
      {
        id: 'retake-analysis',
        position: { x: 0, y: 2 },
        size: { w: 2, h: 1 },
        priority: 4
      },
      {
        id: 'quiz-type-performance',
        position: { x: 2, y: 2 },
        size: { w: 1, h: 1 },
        priority: 5
      }
    ],
    metadata: {
      createdBy: 'system',
      category: 'training',
      tags: ['training', 'learning', 'progress', 'effectiveness'],
      popularity: 82
    }
  },

  QUICK_INSIGHTS: {
    id: 'quick-insights',
    name: 'Quick Insights',
    description: 'Essential metrics for quick overview',
    type: CONFIGURATION_TYPES.SYSTEM,
    tiles: [
      {
        id: 'pass-fail-rate',
        position: { x: 0, y: 0 },
        size: { w: 1, h: 1 },
        priority: 1
      },
      {
        id: 'score-distribution',
        position: { x: 1, y: 0 },
        size: { w: 1, h: 1 },
        priority: 2
      },
      {
        id: 'supervisor-performance',
        position: { x: 2, y: 0 },
        size: { w: 1, h: 1 },
        priority: 3
      }
    ],
    metadata: {
      createdBy: 'system',
      category: 'overview',
      tags: ['quick', 'essential', 'overview', 'summary'],
      popularity: 90
    }
  }
};

// Validation functions
export const validateConfiguration = (config) => {
  const errors = [];
  
  if (!config.name || config.name.trim().length === 0) {
    errors.push('Configuration name is required');
  }
  
  if (config.name && config.name.length > 50) {
    errors.push('Configuration name must be 50 characters or less');
  }
  
  if (!config.tiles || !Array.isArray(config.tiles)) {
    errors.push('Configuration must have tiles array');
  }
  
  if (config.tiles && config.tiles.length === 0) {
    errors.push('Configuration must have at least one tile');
  }
  
  if (!Object.values(CONFIGURATION_TYPES).includes(config.type)) {
    errors.push('Invalid configuration type');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper functions
export const createEmptyConfiguration = (name = 'New Configuration') => ({
  ...DashboardConfiguration,
  id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  metadata: {
    ...DashboardConfiguration.metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
});

export const cloneConfiguration = (config, newName = null) => ({
  ...config,
  id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: newName || `${config.name} (Copy)`,
  type: CONFIGURATION_TYPES.USER,
  isDefault: false,
  metadata: {
    ...config.metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0
  }
});

export const getSystemConfigurations = () => Object.values(SYSTEM_CONFIGURATIONS);

export const getConfigurationById = (configurations, id) => 
  configurations.find(config => config.id === id) || null;
