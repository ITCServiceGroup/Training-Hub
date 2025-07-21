import { supabase } from '../../../config/supabase';
import { DASHBOARD_TEMPLATES } from '../config/dashboardTemplates';

/**
 * Update Dashboard Templates
 * 
 * This utility updates the existing dashboard templates in the database
 * with the new reorganized chart layouts.
 */

/**
 * Update all dashboard templates in the database
 */
export const updateDashboardTemplates = async () => {
  console.log('🔄 Updating dashboard templates with new chart organization...');

  try {
    const updatedTemplates = [];
    
    for (const template of DASHBOARD_TEMPLATES) {
      console.log(`📋 Updating template: ${template.name}`);
      
      // Update the template in the database
      const { data, error } = await supabase
        .from('user_dashboards')
        .update({
          tiles: template.tiles,
          filters: template.filters,
          layout: template.layout,
          description: template.description
        })
        .eq('name', template.name)
        .eq('is_template', true)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error updating template ${template.name}:`, error);
        continue;
      }

      updatedTemplates.push(data);
      console.log(`✅ Updated template: ${template.name}`);
    }

    console.log(`🎉 Updated ${updatedTemplates.length} dashboard templates`);
    return { success: true, templates: updatedTemplates };

  } catch (error) {
    console.error('❌ Error updating templates:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update existing user dashboards to use new chart organization
 * This will update all user dashboards that match template names
 */
export const updateUserDashboards = async () => {
  console.log('🔄 Updating user dashboards with new chart organization...');

  try {
    const updatedDashboards = [];
    
    for (const template of DASHBOARD_TEMPLATES) {
      console.log(`📋 Updating user dashboards for: ${template.name}`);
      
      // Update all user dashboards with this name
      const { data, error } = await supabase
        .from('user_dashboards')
        .update({
          tiles: template.tiles,
          filters: template.filters,
          layout: template.layout,
          description: template.description
        })
        .eq('name', template.name)
        .eq('is_template', false)
        .select();

      if (error) {
        console.error(`❌ Error updating user dashboards for ${template.name}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        updatedDashboards.push(...data);
        console.log(`✅ Updated ${data.length} user dashboards for: ${template.name}`);
      }
    }

    console.log(`🎉 Updated ${updatedDashboards.length} user dashboards`);
    return { success: true, dashboards: updatedDashboards };

  } catch (error) {
    console.error('❌ Error updating user dashboards:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete update - templates and user dashboards
 */
export const updateAllDashboards = async () => {
  console.log('🚀 Updating all dashboards with new chart organization...');

  try {
    // Step 1: Update templates
    const templateResult = await updateDashboardTemplates();
    if (!templateResult.success) {
      throw new Error(`Template update failed: ${templateResult.error}`);
    }

    // Step 2: Update user dashboards
    const dashboardResult = await updateUserDashboards();
    if (!dashboardResult.success) {
      throw new Error(`User dashboard update failed: ${dashboardResult.error}`);
    }

    console.log('🎉 All dashboards updated successfully!');
    return {
      success: true,
      message: 'All dashboards updated with new chart organization',
      templates: templateResult.templates,
      userDashboards: dashboardResult.dashboards
    };

  } catch (error) {
    console.error('❌ Update failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to update dashboards'
    };
  }
};

/**
 * Preview what changes will be made
 */
export const previewChanges = () => {
  console.log('👀 Preview of dashboard template changes:');
  
  DASHBOARD_TEMPLATES.forEach(template => {
    console.log(`\n📋 ${template.name}:`);
    console.log(`   Description: ${template.description}`);
    console.log(`   Charts (${template.tiles.length}):`);
    template.tiles.forEach((tile, index) => {
      console.log(`     ${index + 1}. ${tile.id} (${tile.size.w}x${tile.size.h})`);
    });
  });

  return {
    templates: DASHBOARD_TEMPLATES.length,
    totalCharts: DASHBOARD_TEMPLATES.reduce((sum, t) => sum + t.tiles.length, 0),
    uniqueCharts: [...new Set(DASHBOARD_TEMPLATES.flatMap(t => t.tiles.map(tile => tile.id)))].length
  };
};
