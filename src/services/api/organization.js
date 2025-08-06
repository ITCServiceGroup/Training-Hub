import { supabase } from '../../config/supabase';

export const organizationService = {
  // Supervisor methods
  async getSupervisors(options = {}) {
    const { activeOnly = false, marketId = null } = options;
    
    let query = supabase
      .from('supervisors')
      .select(`
        *,
        markets (
          id,
          name
        )
      `);
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    if (marketId) {
      query = query.eq('market_id', marketId);
    }
    
    query = query.order('name');
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getActiveSupervisors() {
    return this.getSupervisors({ activeOnly: true });
  },

  async getSupervisorsByMarket(marketId) {
    return this.getSupervisors({ activeOnly: true, marketId });
  },

  async addSupervisor(name, marketId) {
    const { data, error } = await supabase
      .from('supervisors')
      .insert([{ 
        name, 
        market_id: marketId,
        is_active: true 
      }])
      .select(`
        *,
        markets (
          id,
          name
        )
      `)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async updateSupervisor(id, updates) {
    // Accept both old format (id, name) and new format (id, {name, market_id, is_active})
    const updateData = typeof updates === 'string' 
      ? { name: updates }
      : updates;

    const { data, error } = await supabase
      .from('supervisors')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        markets (
          id,
          name
        )
      `)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async deactivateSupervisor(id) {
    return this.updateSupervisor(id, { is_active: false });
  },

  async activateSupervisor(id) {
    return this.updateSupervisor(id, { is_active: true });
  },

  async deleteSupervisor(id) {
    const { error } = await supabase
      .from('supervisors')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },

  // Market methods
  async getMarkets() {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .order('name');
    
    if (error) throw new Error(error.message);
    return data;
  },

  async addMarket(name) {
    const { data, error } = await supabase
      .from('markets')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async updateMarket(id, name) {
    const { data, error } = await supabase
      .from('markets')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteMarket(id) {
    const { error } = await supabase
      .from('markets')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  }
};
