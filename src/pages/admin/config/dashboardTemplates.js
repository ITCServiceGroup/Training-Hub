/**
 * Dashboard Templates
 * 
 * These templates replace the old "system configurations" and serve as starting points
 * for new users. When a user first logs in, these templates are copied to their account
 * as regular user dashboards that they can fully customize.
 */

export const DASHBOARD_TEMPLATES = [
  {
    name: 'Executive Overview',
    description: 'High-level metrics and KPIs for leadership team',
    tiles: [
      {
        id: 'pass-fail-rate',
        position: { x: 0, y: 0 },
        size: { w: 1, h: 1 },
        priority: 1,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'score-trend',
        position: { x: 1, y: 0 },
        size: { w: 1, h: 1 },
        priority: 2,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'market-results',
        position: { x: 2, y: 0 },
        size: { w: 1, h: 1 },
        priority: 3,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'top-bottom-performers',
        position: { x: 0, y: 1 },
        size: { w: 2, h: 1 },
        priority: 4,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'supervisor-effectiveness',
        position: { x: 2, y: 1 },
        size: { w: 1, h: 1 },
        priority: 5,
        isVisible: true,
        config: {},
        customSettings: {}
      }
    ],
    filters: {
      dateRange: 'last-30-days',
      market: 'all',
      supervisor: 'all'
    },
    layout: {
      columns: 3,
      rowHeight: 375
    }
  },

  {
    name: 'Manager Dashboard',
    description: 'Team performance and supervision metrics',
    tiles: [
      {
        id: 'supervisor-performance',
        position: { x: 0, y: 0 },
        size: { w: 1, h: 1 },
        priority: 1,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'supervisor-effectiveness',
        position: { x: 1, y: 0 },
        size: { w: 1, h: 1 },
        priority: 2,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'score-distribution',
        position: { x: 2, y: 0 },
        size: { w: 1, h: 1 },
        priority: 3,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'time-distribution',
        position: { x: 0, y: 1 },
        size: { w: 1, h: 1 },
        priority: 4,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'retake-analysis',
        position: { x: 1, y: 1 },
        size: { w: 2, h: 1 },
        priority: 5,
        isVisible: true,
        config: {},
        customSettings: {}
      }
    ],
    filters: {
      dateRange: 'last-7-days',
      market: 'all',
      supervisor: 'current-user'
    },
    layout: {
      columns: 3,
      rowHeight: 375
    }
  },

  {
    name: 'Training Analytics',
    description: 'Detailed training performance and learning analytics',
    tiles: [
      {
        id: 'quiz-type-performance',
        position: { x: 0, y: 0 },
        size: { w: 2, h: 1 },
        priority: 1,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'time-vs-score',
        position: { x: 2, y: 0 },
        size: { w: 1, h: 1 },
        priority: 2,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'question-level-analytics',
        position: { x: 0, y: 1 },
        size: { w: 3, h: 1 },
        priority: 3,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'score-distribution',
        position: { x: 0, y: 2 },
        size: { w: 1, h: 1 },
        priority: 4,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'retake-analysis',
        position: { x: 1, y: 2 },
        size: { w: 2, h: 1 },
        priority: 5,
        isVisible: true,
        config: {},
        customSettings: {}
      }
    ],
    filters: {
      dateRange: 'last-90-days',
      market: 'all',
      supervisor: 'all'
    },
    layout: {
      columns: 3,
      rowHeight: 375
    }
  },

  {
    name: 'Performance Monitoring',
    description: 'Real-time performance tracking and alerts',
    tiles: [
      {
        id: 'pass-fail-rate',
        position: { x: 0, y: 0 },
        size: { w: 1, h: 1 },
        priority: 1,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'score-trend',
        position: { x: 1, y: 0 },
        size: { w: 1, h: 1 },
        priority: 2,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'time-vs-score',
        position: { x: 2, y: 0 },
        size: { w: 1, h: 1 },
        priority: 3,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'top-bottom-performers',
        position: { x: 0, y: 1 },
        size: { w: 3, h: 1 },
        priority: 4,
        isVisible: true,
        config: {},
        customSettings: {}
      }
    ],
    filters: {
      dateRange: 'last-24-hours',
      market: 'all',
      supervisor: 'all'
    },
    layout: {
      columns: 3,
      rowHeight: 375
    }
  },

  {
    name: 'Quick Overview',
    description: 'Essential metrics at a glance',
    tiles: [
      {
        id: 'pass-fail-rate',
        position: { x: 0, y: 0 },
        size: { w: 1, h: 1 },
        priority: 1,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'time-distribution',
        position: { x: 1, y: 0 },
        size: { w: 1, h: 1 },
        priority: 2,
        isVisible: true,
        config: {},
        customSettings: {}
      },
      {
        id: 'score-trend',
        position: { x: 2, y: 0 },
        size: { w: 1, h: 1 },
        priority: 3,
        isVisible: true,
        config: {},
        customSettings: {}
      }
    ],
    filters: {
      dateRange: 'last-7-days',
      market: 'all',
      supervisor: 'all'
    },
    layout: {
      columns: 3,
      rowHeight: 375
    }
  }
];

/**
 * Get all dashboard templates
 */
export const getDashboardTemplates = () => {
  return DASHBOARD_TEMPLATES;
};

/**
 * Get a specific template by name
 */
export const getTemplateByName = (name) => {
  return DASHBOARD_TEMPLATES.find(template => template.name === name);
};

/**
 * Create templates in the database (admin function)
 */
export const createTemplatesInDatabase = async () => {
  const { createDashboardTemplate } = await import('../services/simpleDashboardService');
  
  console.log('🎯 Creating dashboard templates in database...');
  
  const createdTemplates = [];
  for (const template of DASHBOARD_TEMPLATES) {
    try {
      const created = await createDashboardTemplate(template);
      createdTemplates.push(created);
      console.log('✅ Created template:', template.name);
    } catch (error) {
      console.error('❌ Failed to create template:', template.name, error);
    }
  }
  
  console.log('🎉 Created', createdTemplates.length, 'templates');
  return createdTemplates;
};
