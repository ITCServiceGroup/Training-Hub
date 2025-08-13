import { supabase } from '../../config/supabase';

const generateUniqueCode = () => {
  // Generate an 8-character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking characters (0,1,I,O)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const accessCodesService = {
  // Generate a new access code
  async generateCode(quizId, testTakerInfo) {
    try {
      // Generate a unique code and verify it doesn't exist
      let code;
      let isUnique = false;
      while (!isUnique) {
        code = generateUniqueCode();
        const { data } = await supabase
          .from('access_codes')
          .select('code')
          .eq('code', code)
          .single();

        isUnique = !data;
      }

      // Set expiration date to 30 minutes from now
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      // Create the access code record
      const { data, error } = await supabase
        .from('access_codes')
        .insert({
          quiz_id: quizId,
          code,
          ldap: testTakerInfo.ldap,
          email: testTakerInfo.email,
          supervisor: testTakerInfo.supervisor,
          market: testTakerInfo.market,
          expires_at: expiresAt.toISOString(),
          is_used: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating access code:', error);
      throw new Error('Failed to generate access code');
    }
  },

  // Get all access codes for a quiz
  async getByQuizId(quizId) {
    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching access codes:', error);
      throw new Error('Failed to fetch access codes');
    }
  },

  // Validate an access code
  async validateCode(code) {
    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*, v2_quizzes!inner(*)')
        .eq('code', code.toUpperCase())
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Invalid access code');
      }

      // Check if code is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('Access code has expired');
      }

      // Check if code has been used
      if (data.is_used) {
        throw new Error('Access code has already been used');
      }

      return data;
    } catch (error) {
      console.error('Error validating access code:', error);
      throw error;
    }
  },

  // Mark an access code as used
  async markAsUsed(code) {
    try {
      const { error } = await supabase
        .from('access_codes')
        .update({ is_used: true })
        .eq('code', code);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking access code as used:', error);
      throw new Error('Failed to update access code');
    }
  },

  // Delete an access code
  async delete(codeId) {
    try {
      const { error } = await supabase
        .from('access_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting access code:', error);
      throw new Error('Failed to delete access code');
    }
  }
};
