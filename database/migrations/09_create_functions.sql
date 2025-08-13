-- Migration 09: Create Database Functions
-- This migration creates all custom database functions

-- Function: Update updated_at column timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Ensure single default dashboard per user
CREATE OR REPLACE FUNCTION ensure_single_default_dashboard()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a dashboard as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE user_dashboards 
        SET is_default = false 
        WHERE user_id = NEW.user_id 
          AND id != NEW.id 
          AND is_default = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Ensure single default configuration (legacy support)
CREATE OR REPLACE FUNCTION ensure_single_default_configuration()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a configuration as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE dashboard_configurations 
        SET is_default = false 
        WHERE user_id = NEW.user_id 
          AND id != NEW.id 
          AND is_default = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Ensure single default layout (legacy support)
CREATE OR REPLACE FUNCTION ensure_single_default_layout()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a layout as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE dashboard_layouts 
        SET is_default = false 
        WHERE user_id = NEW.user_id 
          AND id != NEW.id 
          AND is_default = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Set timestamp trigger function (alias for compatibility)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update dashboard configurations updated_at (legacy support)
CREATE OR REPLACE FUNCTION update_dashboard_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update dashboard layouts updated_at (legacy support)
CREATE OR REPLACE FUNCTION update_dashboard_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Migrate existing users to simple dashboards
CREATE OR REPLACE FUNCTION migrate_existing_users_to_simple_dashboards()
RETURNS TABLE(user_id UUID, dashboards_created INTEGER, success BOOLEAN) AS $$
DECLARE
    user_record RECORD;
    template_record RECORD;
    dashboards_count INTEGER;
BEGIN
    -- Loop through all users who don't have dashboards yet
    FOR user_record IN
        SELECT DISTINCT u.id as uid
        FROM auth.users u
        LEFT JOIN user_dashboards ud ON u.id = ud.user_id AND ud.is_template = false
        WHERE ud.user_id IS NULL
    LOOP
        dashboards_count := 0;

        -- Copy each template to this user
        FOR template_record IN
            SELECT * FROM user_dashboards WHERE is_template = true
        LOOP
            INSERT INTO user_dashboards (
                user_id, name, description, tiles, filters, layout, is_template
            ) VALUES (
                user_record.uid,
                template_record.name,
                template_record.description,
                template_record.tiles,
                template_record.filters,
                template_record.layout,
                false
            );
            dashboards_count := dashboards_count + 1;
        END LOOP;

        -- Mark user as initialized
        INSERT INTO user_initialization (user_id, dashboard_templates_copied)
        VALUES (user_record.uid, true)
        ON CONFLICT (user_id) DO UPDATE SET
            dashboard_templates_copied = true,
            updated_at = NOW();

        -- Return result for this user
        RETURN QUERY SELECT user_record.uid, dashboards_count, true;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;