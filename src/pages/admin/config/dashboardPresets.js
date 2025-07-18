// Dashboard preset configurations for different user roles and use cases

export const DASHBOARD_PRESETS = {
  executive: {
    id: 'executive',
    name: 'Executive Overview',
    description: 'High-level metrics and trends for leadership',
    icon: '📊',
    tiles: [
      {
        id: 'score-trend',
        position: { x: 0, y: 0, w: 2, h: 1 },
        priority: 1
      },
      {
        id: 'market-results',
        position: { x: 2, y: 0, w: 1, h: 1 },
        priority: 2
      },
      {
        id: 'supervisor-performance',
        position: { x: 0, y: 1, w: 2, h: 1 },
        priority: 3
      },
      {
        id: 'score-distribution',
        position: { x: 2, y: 1, w: 1, h: 1 },
        priority: 4
      }
    ],
    defaultFilters: {
      dateRange: {
        preset: 'last_quarter',
        startDate: null,
        endDate: null
      },
      quickPreset: 'last_quarter'
    },
    layout: 'compact'
  },

  detailed: {
    id: 'detailed',
    name: 'Detailed Analysis',
    description: 'Comprehensive view with all available metrics',
    icon: '🔍',
    tiles: [
      {
        id: 'score-trend',
        position: { x: 0, y: 0, w: 2, h: 1 },
        priority: 1
      },
      {
        id: 'pass-fail-rate',
        position: { x: 2, y: 0, w: 1, h: 1 },
        priority: 2
      },
      {
        id: 'score-distribution',
        position: { x: 0, y: 1, w: 1, h: 1 },
        priority: 3
      },
      {
        id: 'time-distribution',
        position: { x: 1, y: 1, w: 1, h: 1 },
        priority: 4
      },
      {
        id: 'quiz-type-performance',
        position: { x: 2, y: 1, w: 1, h: 1 },
        priority: 5
      },
      {
        id: 'supervisor-performance',
        position: { x: 0, y: 2, w: 1, h: 1 },
        priority: 6
      },
      {
        id: 'market-results',
        position: { x: 1, y: 2, w: 1, h: 1 },
        priority: 7
      },
      {
        id: 'time-vs-score',
        position: { x: 2, y: 2, w: 1, h: 1 },
        priority: 8
      }
    ],
    defaultFilters: {
      dateRange: {
        preset: 'last_month',
        startDate: null,
        endDate: null
      },
      quickPreset: 'last_month'
    },
    layout: 'detailed'
  },

  supervisor: {
    id: 'supervisor',
    name: 'Supervisor Focus',
    description: 'Team performance and individual metrics',
    icon: '👥',
    tiles: [
      {
        id: 'supervisor-performance',
        position: { x: 0, y: 0, w: 2, h: 1 },
        priority: 1
      },
      {
        id: 'score-trend',
        position: { x: 2, y: 0, w: 1, h: 1 },
        priority: 2
      },
      {
        id: 'time-vs-score',
        position: { x: 0, y: 1, w: 1, h: 1 },
        priority: 3
      },
      {
        id: 'score-distribution',
        position: { x: 1, y: 1, w: 1, h: 1 },
        priority: 4
      },
      {
        id: 'time-distribution',
        position: { x: 2, y: 1, w: 1, h: 1 },
        priority: 5
      }
    ],
    defaultFilters: {
      dateRange: {
        preset: 'last_week',
        startDate: null,
        endDate: null
      },
      quickPreset: 'last_week'
    },
    layout: 'focused'
  },

  performance: {
    id: 'performance',
    name: 'Performance Analysis',
    description: 'Deep dive into score and time metrics',
    icon: '⚡',
    tiles: [
      {
        id: 'time-vs-score',
        position: { x: 0, y: 0, w: 2, h: 1 },
        priority: 1
      },
      {
        id: 'score-distribution',
        position: { x: 2, y: 0, w: 1, h: 1 },
        priority: 2
      },
      {
        id: 'time-distribution',
        position: { x: 0, y: 1, w: 1, h: 1 },
        priority: 3
      },
      {
        id: 'score-trend',
        position: { x: 1, y: 1, w: 2, h: 1 },
        priority: 4
      }
    ],
    defaultFilters: {
      dateRange: {
        preset: 'last_month',
        startDate: null,
        endDate: null
      },
      quickPreset: 'last_month'
    },
    layout: 'performance'
  },

  trends: {
    id: 'trends',
    name: 'Trend Analysis',
    description: 'Focus on patterns and changes over time',
    icon: '📈',
    tiles: [
      {
        id: 'score-trend',
        position: { x: 0, y: 0, w: 3, h: 1 },
        priority: 1
      },
      {
        id: 'supervisor-performance',
        position: { x: 0, y: 1, w: 1, h: 1 },
        priority: 2
      },
      {
        id: 'market-results',
        position: { x: 1, y: 1, w: 1, h: 1 },
        priority: 3
      },
      {
        id: 'time-vs-score',
        position: { x: 2, y: 1, w: 1, h: 1 },
        priority: 4
      }
    ],
    defaultFilters: {
      dateRange: {
        preset: 'last_quarter',
        startDate: null,
        endDate: null
      },
      quickPreset: 'last_quarter'
    },
    layout: 'trends'
  },

  advanced: {
    id: 'advanced',
    name: 'Advanced Analytics',
    description: 'Deep insights with advanced chart types',
    icon: '🧠',
    tiles: [
      {
        id: 'top-bottom-performers',
        position: { x: 0, y: 0, w: 2, h: 1 },
        priority: 1
      },
      {
        id: 'supervisor-effectiveness',
        position: { x: 2, y: 0, w: 1, h: 1 },
        priority: 2
      },
      {
        id: 'question-analytics',
        position: { x: 0, y: 1, w: 1, h: 1 },
        priority: 3
      },
      {
        id: 'retake-analysis',
        position: { x: 1, y: 1, w: 1, h: 1 },
        priority: 4
      },
      {
        id: 'quiz-type-performance',
        position: { x: 2, y: 1, w: 1, h: 1 },
        priority: 5
      }
    ],
    defaultFilters: {
      dateRange: {
        preset: 'last_month',
        startDate: null,
        endDate: null
      },
      quickPreset: 'last_month'
    },
    layout: 'advanced'
  }
};

// Get all available presets
export const getAvailablePresets = () => {
  return Object.values(DASHBOARD_PRESETS);
};

// Get preset by ID
export const getPresetById = (presetId) => {
  return DASHBOARD_PRESETS[presetId] || null;
};

// Get default preset (detailed view)
export const getDefaultPreset = () => {
  return DASHBOARD_PRESETS.detailed;
};

// Convert preset to tile order array (for current drag-and-drop system)
export const presetToTileOrder = (preset) => {
  if (!preset || !preset.tiles) return [];
  
  return preset.tiles
    .sort((a, b) => a.priority - b.priority)
    .map(tile => tile.id);
};

// Check if user has permission for preset
export const canAccessPreset = (presetId, userRole) => {
  // For now, all presets are available to all users
  // This can be extended later for role-based access
  return true;
};

// Get recommended presets based on user role
export const getRecommendedPresets = (userRole) => {
  const roleMapping = {
    'admin': ['detailed', 'advanced', 'executive'],
    'supervisor': ['supervisor', 'performance', 'trends'],
    'manager': ['executive', 'supervisor', 'advanced'],
    'analyst': ['detailed', 'advanced', 'performance'],
    'user': ['executive', 'supervisor']
  };

  const recommendedIds = roleMapping[userRole] || ['detailed', 'executive'];
  return recommendedIds.map(id => DASHBOARD_PRESETS[id]).filter(Boolean);
};

export default DASHBOARD_PRESETS;
