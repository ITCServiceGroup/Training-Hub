-- Migration 10: Create Database Triggers
-- This migration creates all database triggers

-- Trigger: Update updated_at on v2_study_guide_templates
CREATE TRIGGER set_timestamp_v2_study_guide_templates
    BEFORE UPDATE ON v2_study_guide_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on v2_sections
CREATE TRIGGER v2_sections_updated_at_trigger
    BEFORE UPDATE ON v2_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on v2_categories  
CREATE TRIGGER v2_categories_updated_at_trigger
    BEFORE UPDATE ON v2_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on v2_study_guides
CREATE TRIGGER v2_study_guides_updated_at_trigger
    BEFORE UPDATE ON v2_study_guides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on user_dashboards
CREATE TRIGGER update_user_dashboards_updated_at
    BEFORE UPDATE ON user_dashboards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on user_initialization
CREATE TRIGGER update_user_initialization_updated_at
    BEFORE UPDATE ON user_initialization
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on media_library
CREATE TRIGGER update_media_library_updated_at
    BEFORE UPDATE ON media_library
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Ensure single default dashboard per user
CREATE TRIGGER trigger_ensure_single_default_dashboard
    BEFORE INSERT OR UPDATE ON user_dashboards
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_dashboard();