import { supabase } from '../../config/supabase';

export const organizationService = {
  // Supervisor methods
  async getSupervisors() {
    const { data, error } = await supabase
      .from('supervisors')
      .select('*')
      .order('name');
    
    if (error) throw new Error(error.message);
    return data;
  },

  async addSupervisor(name) {
    const { data, error } = await supabase
      .from('supervisors')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async updateSupervisor(id, name) {
    const { data, error } = await supabase
      .from('supervisors')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
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
