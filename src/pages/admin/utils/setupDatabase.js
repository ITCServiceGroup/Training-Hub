import { supabase } from '../../../config/supabase';

/**
 * Setup Database for Simplified Dashboard System
 * 
 * This utility helps set up the database tables and templates
 * for the new simplified dashboard system.
 */

/**
 * Execute the SQL migration to create tables and templates
 */
export const setupDatabaseTables = async () => {
  console.log('🎯 Setting up database tables for simplified dashboard system...');

  try {
    // Create user_dashboards table
    const createUserDashboardsTable = `
      CREATE TABLE IF NOT EXISTS user_dashboards (
        id TEXT PRIMARY KEY DEFAULT ('dashboard_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 8)),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        tiles JSONB NOT NULL DEFAULT '[]',
        filters JSONB DEFAULT '{}',
        layout JSONB DEFAULT '{}',
        is_template BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        
        CONSTRAINT user_dashboards_user_name_unique UNIQUE(user_id, name),
        CONSTRAINT user_dashboards_name_not_empty CHECK (length(trim(name)) > 0)
      );
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createUserDashboardsTable });
    if (tableError) {
      console.error('❌ Error creating user_dashboards table:', tableError);
      throw tableError;
    }

    // Create user_initialization table
    const createUserInitTable = `
      CREATE TABLE IF NOT EXISTS user_initialization (
        user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        initialized_at TIMESTAMPTZ DEFAULT now(),
        dashboard_templates_copied BOOLEAN DEFAULT false,
        version TEXT DEFAULT '1.0.0',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    const { error: initTableError } = await supabase.rpc('exec_sql', { sql: createUserInitTable });
    if (initTableError) {
      console.error('❌ Error creating user_initialization table:', initTableError);
      throw initTableError;
    }

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_user_dashboards_user_id ON user_dashboards(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_dashboards_is_template ON user_dashboards(is_template);
      CREATE INDEX IF NOT EXISTS idx_user_dashboards_created_at ON user_dashboards(created_at);
      CREATE INDEX IF NOT EXISTS idx_user_initialization_initialized_at ON user_initialization(initialized_at);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexes });
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      throw indexError;
    }

    // Enable RLS
    const enableRLS = `
      ALTER TABLE user_dashboards ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_initialization ENABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLS });
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
      throw rlsError;
    }

    console.log('✅ Database tables created successfully');
    return { success: true, message: 'Database tables created successfully' };

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create dashboard templates in the database
 */
export const createDashboardTemplates = async () => {
  console.log('📋 Creating dashboard templates...');

  const templates = [
    {
      name: 'Executive Overview',
      description: 'High-level metrics and KPIs for leadership team',
      tiles: [
        { id: 'pass-fail-rate', position: { x: 0, y: 0 }, size: { w: 1, h: 1 }, priority: 1, isVisible: true, config: {}, customSettings: {} },
        { id: 'score-trend', position: { x: 1, y: 0 }, size: { w: 1, h: 1 }, priority: 2, isVisible: true, config: {}, customSettings: {} },
        { id: 'supervisor-performance', position: { x: 2, y: 0 }, size: { w: 1, h: 1 }, priority: 3, isVisible: true, config: {}, customSettings: {} },
        { id: 'market-results', position: { x: 0, y: 1 }, size: { w: 1, h: 1 }, priority: 4, isVisible: true, config: {}, customSettings: {} },
        { id: 'top-bottom-performers', position: { x: 1, y: 1 }, size: { w: 2, h: 1 }, priority: 5, isVisible: true, config: {}, customSettings: {} }
      ],
      filters: { dateRange: 'last-30-days', market: 'all', supervisor: 'all' },
      layout: { columns: 3, rowHeight: 375 }
    },
    {
      name: 'Manager Dashboard',
      description: 'Team performance and supervision metrics',
      tiles: [
        { id: 'supervisor-performance', position: { x: 0, y: 0 }, size: { w: 1, h: 1 }, priority: 1, isVisible: true, config: {}, customSettings: {} },
        { id: 'team-performance', position: { x: 1, y: 0 }, size: { w: 1, h: 1 }, priority: 2, isVisible: true, config: {}, customSettings: {} },
        { id: 'quiz-completion-rate', position: { x: 2, y: 0 }, size: { w: 1, h: 1 }, priority: 3, isVisible: true, config: {}, customSettings: {} },
        { id: 'score-distribution', position: { x: 0, y: 1 }, size: { w: 2, h: 1 }, priority: 4, isVisible: true, config: {}, customSettings: {} },
        { id: 'time-distribution', position: { x: 2, y: 1 }, size: { w: 1, h: 1 }, priority: 5, isVisible: true, config: {}, customSettings: {} }
      ],
      filters: { dateRange: 'last-7-days', market: 'all', supervisor: 'current-user' },
      layout: { columns: 3, rowHeight: 375 }
    },
    {
      name: 'Quick Overview',
      description: 'Essential metrics at a glance',
      tiles: [
        { id: 'pass-fail-rate', position: { x: 0, y: 0 }, size: { w: 1, h: 1 }, priority: 1, isVisible: true, config: {}, customSettings: {} },
        { id: 'quiz-completion-rate', position: { x: 1, y: 0 }, size: { w: 1, h: 1 }, priority: 2, isVisible: true, config: {}, customSettings: {} },
        { id: 'score-trend', position: { x: 2, y: 0 }, size: { w: 1, h: 1 }, priority: 3, isVisible: true, config: {}, customSettings: {} }
      ],
      filters: { dateRange: 'last-7-days', market: 'all', supervisor: 'all' },
      layout: { columns: 3, rowHeight: 375 }
    }
  ];

  try {
    const createdTemplates = [];
    
    for (const template of templates) {
      const { data, error } = await supabase
        .from('user_dashboards')
        .insert({
          user_id: null,
          name: template.name,
          description: template.description,
          tiles: template.tiles,
          filters: template.filters,
          layout: template.layout,
          is_template: true
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating template ${template.name}:`, error);
        continue;
      }

      createdTemplates.push(data);
      console.log(`✅ Created template: ${template.name}`);
    }

    console.log(`🎉 Created ${createdTemplates.length} dashboard templates`);
    return { success: true, templates: createdTemplates };

  } catch (error) {
    console.error('❌ Error creating templates:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete setup - tables and templates
 */
export const setupSimplifiedDashboardSystem = async () => {
  console.log('🚀 Setting up simplified dashboard system...');

  try {
    // Step 1: Create tables
    const tableResult = await setupDatabaseTables();
    if (!tableResult.success) {
      throw new Error(`Table setup failed: ${tableResult.error}`);
    }

    // Step 2: Create templates
    const templateResult = await createDashboardTemplates();
    if (!templateResult.success) {
      throw new Error(`Template creation failed: ${templateResult.error}`);
    }

    console.log('🎉 Simplified dashboard system setup completed successfully!');
    return {
      success: true,
      message: 'Simplified dashboard system is ready',
      templates: templateResult.templates
    };

  } catch (error) {
    console.error('❌ Setup failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to setup simplified dashboard system'
    };
  }
};

/**
 * Check if the system is already set up
 */
export const checkSystemSetup = async () => {
  try {
    // Check if tables exist by trying to query them
    const { data: dashboards, error: dashboardError } = await supabase
      .from('user_dashboards')
      .select('id')
      .eq('is_template', true)
      .limit(1);

    const { data: init, error: initError } = await supabase
      .from('user_initialization')
      .select('user_id')
      .limit(1);

    const hasTemplates = !dashboardError && dashboards && dashboards.length > 0;
    const hasInitTable = !initError;

    return {
      isSetup: hasTemplates && hasInitTable,
      hasTemplates,
      hasInitTable,
      message: hasTemplates && hasInitTable 
        ? 'System is already set up' 
        : 'System needs to be set up'
    };

  } catch (error) {
    return {
      isSetup: false,
      error: error.message,
      message: 'Failed to check system setup'
    };
  }
};
