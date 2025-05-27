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

  /**
   * Save a study guide as a system template (developer only)
   * This method generates the code that should be added to systemTemplates.js
   * @param {Object} templateData - Template data
   * @returns {Object} Generated template object and code
   */
  async saveAsSystemTemplate(templateData) {
    try {
      // Generate a unique ID for the system template
      const id = `system-${templateData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      const systemTemplate = {
        id,
        name: templateData.name,
        description: templateData.description || '',
        category: templateData.category || 'Basic',
        tags: templateData.tags || [],
        isSystemTemplate: true,
        content: templateData.content
      };

      // Add to the in-memory system templates (for immediate use)
      systemTemplatesService.addTemplate(systemTemplate);

      // Generate the code that should be added to systemTemplates.js
      const templateCode = this.generateSystemTemplateCode(systemTemplate);

      debugLog('System template created', { id, name: systemTemplate.name });

      return {
        template: systemTemplate,
        code: templateCode,
        message: 'System template created successfully. Copy the generated code to systemTemplates.js'
      };
    } catch (error) {
      console.error('Error saving system template:', error.message);
      throw error;
    }
  }

  /**
   * Generate JavaScript code for a system template
   * @param {Object} template - Template object
   * @returns {string} JavaScript code
   */
  generateSystemTemplateCode(template) {
    return `  {
    id: '${template.id}',
    name: '${template.name}',
    description: '${template.description}',
    category: '${template.category}',
    tags: ${JSON.stringify(template.tags)},
    isSystemTemplate: true,
    content: ${JSON.stringify(template.content)}
  }`;
  }
}

export const templatesService = new TemplatesService();