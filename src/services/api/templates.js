import { supabase } from '../../config/supabase';
import { systemTemplatesService } from '../systemTemplates';
import { debugLog } from '../../config/developer';

class TemplatesService {
  constructor() {
    this.tableName = 'v2_study_guide_templates';
  }

  async getAll() {
    try {
      // Get user templates from database
      const { data: userTemplates, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('name');

      if (error) throw error;

      // Get system templates
      const systemTemplates = systemTemplatesService.getAll();

      // Combine and sort all templates
      const allTemplates = [
        ...systemTemplates,
        ...(userTemplates || []).map(template => ({ ...template, isSystemTemplate: false }))
      ].sort((a, b) => {
        // Sort system templates first, then by name
        if (a.isSystemTemplate && !b.isSystemTemplate) return -1;
        if (!a.isSystemTemplate && b.isSystemTemplate) return 1;
        return a.name.localeCompare(b.name);
      });

      debugLog('Combined templates loaded', {
        systemCount: systemTemplates.length,
        userCount: userTemplates?.length || 0,
        totalCount: allTemplates.length
      });

      return allTemplates;
    } catch (error) {
      console.error('Error fetching templates:', error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      // Check if it's a system template first
      if (id?.startsWith('system-')) {
        const systemTemplate = systemTemplatesService.getById(id);
        if (systemTemplate) {
          debugLog('System template found', { id, name: systemTemplate.name });
          return systemTemplate;
        }
      }

      // Otherwise, fetch from database
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { ...data, isSystemTemplate: false };
    } catch (error) {
      console.error('Error fetching template:', error.message);
      throw error;
    }
  }

  async create(templateData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating template:', error.message);
      throw error;
    }
  }

  async update(id, templateData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(templateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating template:', error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      // Prevent deletion of system templates
      if (id?.startsWith('system-')) {
        throw new Error('System templates cannot be deleted');
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting template:', error.message);
      throw error;
    }
  }


}

export const templatesService = new TemplatesService();