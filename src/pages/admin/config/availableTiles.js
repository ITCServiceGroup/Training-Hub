// Configuration for all available dashboard tiles
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaClock, 
  FaUsers, 
  FaTrophy,
  FaQuestionCircle,
  FaRedo,
  FaUserTie,
  FaMapMarkerAlt,
  FaChartArea,
  FaBullseye,
  FaGraduationCap,
  FaCheckCircle
} from 'react-icons/fa';

// Tile categories for organization
export const TILE_CATEGORIES = {
  PERFORMANCE: {
    id: 'performance',
    name: 'Performance Analytics',
    description: 'Charts focused on test scores and performance metrics',
    icon: FaTrophy,
    color: '#10b981'
  },
  TIME: {
    id: 'time',
    name: 'Time Analysis',
    description: 'Charts analyzing time-based patterns and trends',
    icon: FaClock,
    color: '#3b82f6'
  },
  PEOPLE: {
    id: 'people',
    name: 'People & Teams',
    description: 'Charts focused on users, supervisors, and team performance',
    icon: FaUsers,
    color: '#8b5cf6'
  },
  INSIGHTS: {
    id: 'insights',
    name: 'Advanced Insights',
    description: 'Specialized analytics and deep-dive charts',
    icon: FaBullseye,
    color: '#f59e0b'
  }
};

// All available tiles configuration
export const AVAILABLE_TILES = {
  // Performance Analytics Category
  'score-distribution': {
    id: 'score-distribution',
    name: 'Score Distribution',
    description: 'Distribution of test scores across different ranges',
    category: 'performance',
    icon: FaChartBar,
    component: 'ScoreDistributionChart',
    size: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 2 },
    tags: ['scores', 'distribution', 'performance'],
    isCore: true,
    popularity: 95
  },
  'score-trend': {
    id: 'score-trend',
    name: 'Score Trend',
    description: 'Score trends over time with learning curve analysis',
    category: 'performance',
    icon: FaChartLine,
    component: 'ScoreTrendChart',
    size: { w: 2, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 3, h: 2 },
    tags: ['scores', 'trends', 'time', 'learning'],
    isCore: true,
    popularity: 90
  },
  'pass-fail-rate': {
    id: 'pass-fail-rate',
    name: 'Pass/Fail Rate',
    description: 'Overall pass and fail rates with visual breakdown',
    category: 'performance',
    icon: FaChartPie,
    component: 'PassFailRateChart',
    size: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 1 },
    tags: ['pass', 'fail', 'rates', 'overview'],
    isCore: true,
    popularity: 85
  },
  'top-bottom-performers': {
    id: 'top-bottom-performers',
    name: 'Top/Bottom Performers',
    description: 'Ranking of highest and lowest performing users',
    category: 'performance',
    icon: FaTrophy,
    component: 'TopBottomPerformersChart',
    size: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 2 },
    tags: ['ranking', 'performers', 'users', 'leaderboard'],
    isCore: false,
    popularity: 75
  },

  // Time Analysis Category
  'time-distribution': {
    id: 'time-distribution',
    name: 'Time Distribution',
    description: 'Distribution of test completion times',
    category: 'time',
    icon: FaClock,
    component: 'TimeDistributionChart',
    size: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 1 },
    tags: ['time', 'distribution', 'completion'],
    isCore: true,
    popularity: 80
  },
  'time-vs-score': {
    id: 'time-vs-score',
    name: 'Time vs Score',
    description: 'Efficiency analysis comparing time taken to scores achieved',
    category: 'time',
    icon: FaChartArea,
    component: 'TimeVsScoreChart',
    size: { w: 2, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 3, h: 2 },
    tags: ['time', 'scores', 'efficiency', 'correlation'],
    isCore: false,
    popularity: 70
  },

  // People & Teams Category
  'supervisor-performance': {
    id: 'supervisor-performance',
    name: 'Supervisor Performance',
    description: 'Performance metrics grouped by supervisor',
    category: 'people',
    icon: FaUserTie,
    component: 'SupervisorPerformanceChart',
    size: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 2 },
    tags: ['supervisors', 'teams', 'management', 'performance'],
    isCore: true,
    popularity: 85
  },
  'supervisor-effectiveness': {
    id: 'supervisor-effectiveness',
    name: 'Supervisor Effectiveness',
    description: 'Analysis of supervisor training effectiveness',
    category: 'people',
    icon: FaGraduationCap,
    component: 'SupervisorEffectivenessChart',
    size: { w: 2, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 2 },
    tags: ['supervisors', 'effectiveness', 'training', 'analysis'],
    isCore: false,
    popularity: 65
  },
  'market-results': {
    id: 'market-results',
    name: 'Market Results',
    description: 'Performance results grouped by market/location',
    category: 'people',
    icon: FaMapMarkerAlt,
    component: 'MarketResultsChart',
    size: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 1 },
    tags: ['markets', 'locations', 'regional', 'performance'],
    isCore: true,
    popularity: 75
  },

  // Advanced Insights Category
  'quiz-type-performance': {
    id: 'quiz-type-performance',
    name: 'Quiz Type Performance',
    description: 'Performance breakdown by different quiz types',
    category: 'insights',
    icon: FaQuestionCircle,
    component: 'QuizTypePerformanceChart',
    size: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 1 },
    tags: ['quiz', 'types', 'categories', 'analysis'],
    isCore: false,
    popularity: 60
  },
  'question-analytics': {
    id: 'question-analytics',
    name: 'Question Analytics',
    description: 'Detailed analysis of individual question performance',
    category: 'insights',
    icon: FaBullseye,
    component: 'QuestionLevelAnalyticsChart',
    size: { w: 2, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 3, h: 2 },
    tags: ['questions', 'detailed', 'analytics', 'difficulty'],
    isCore: false,
    popularity: 50
  },
  'retake-analysis': {
    id: 'retake-analysis',
    name: 'Retake Analysis',
    description: 'Analysis of test retakes and improvement patterns',
    category: 'insights',
    icon: FaRedo,
    component: 'RetakeAnalysisChart',
    size: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 2 },
    tags: ['retakes', 'improvement', 'patterns', 'learning'],
    isCore: false,
    popularity: 55
  }
};

// Helper functions
export const getTilesByCategory = (categoryId) => {
  return Object.values(AVAILABLE_TILES).filter(tile => tile.category === categoryId);
};

export const getCoreTiles = () => {
  return Object.values(AVAILABLE_TILES).filter(tile => tile.isCore);
};

export const getTilesByPopularity = (limit = null) => {
  const sorted = Object.values(AVAILABLE_TILES).sort((a, b) => b.popularity - a.popularity);
  return limit ? sorted.slice(0, limit) : sorted;
};

export const searchTiles = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(AVAILABLE_TILES).filter(tile => 
    tile.name.toLowerCase().includes(lowercaseQuery) ||
    tile.description.toLowerCase().includes(lowercaseQuery) ||
    tile.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getTileById = (tileId) => {
  return AVAILABLE_TILES[tileId] || null;
};

export const getCategoryById = (categoryId) => {
  return Object.values(TILE_CATEGORIES).find(cat => cat.id === categoryId) || null;
};

// Default dashboard configurations
export const DEFAULT_DASHBOARD_TILES = [
  'score-distribution',
  'score-trend', 
  'time-distribution',
  'supervisor-performance',
  'pass-fail-rate',
  'market-results'
];

export const MINIMAL_DASHBOARD_TILES = [
  'score-distribution',
  'pass-fail-rate',
  'supervisor-performance'
];

export const COMPREHENSIVE_DASHBOARD_TILES = Object.keys(AVAILABLE_TILES);

// Tile size presets
export const TILE_SIZE_PRESETS = {
  SMALL: { w: 1, h: 1 },
  MEDIUM: { w: 2, h: 1 },
  LARGE: { w: 2, h: 2 },
  WIDE: { w: 3, h: 1 },
  TALL: { w: 1, h: 2 }
};

// Validation functions
export const validateTileConfiguration = (tileConfig) => {
  const errors = [];
  
  if (!tileConfig.id || !AVAILABLE_TILES[tileConfig.id]) {
    errors.push('Invalid tile ID');
  }
  
  if (tileConfig.size) {
    const tile = AVAILABLE_TILES[tileConfig.id];
    if (tile) {
      if (tileConfig.size.w < tile.minSize.w || tileConfig.size.h < tile.minSize.h) {
        errors.push('Tile size below minimum');
      }
      if (tileConfig.size.w > tile.maxSize.w || tileConfig.size.h > tile.maxSize.h) {
        errors.push('Tile size above maximum');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
