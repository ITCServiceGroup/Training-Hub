import { supabase } from '../../config/supabase';

/**
 * Approvals API Service
 * Handles approval requests for regional content to become nationwide
 */

/**
 * Create a new approval request
 * @param {string} contentType - Type of content ('study_guide', 'quiz', 'section', 'category')
 * @param {number} contentId - ID of the content item
 * @param {string} notes - Optional notes for the request
 * @returns {Promise<{data: object, error: object}>}
 */
export const createApprovalRequest = async (contentType, contentId, notes = null) => {
  try {
    const { data, error } = await supabase
      .from('content_approval_requests')
      .insert({
        content_type: contentType,
        content_id: contentId,
        notes,
        status: 'pending'
      })
      .select(`
        *,
        requester:requested_by (
          user_id,
          display_name,
          email,
          role
        )
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating approval request:', error);
    return { data: null, error };
  }
};

/**
 * Get all pending approval requests
 * @returns {Promise<{data: Array, error: object}>}
 */
export const getPendingApprovals = async () => {
  try {
    const { data, error } = await supabase
      .from('content_approval_requests')
      .select(`
        *,
        requester:requested_by (
          user_id,
          display_name,
          email,
          role,
          markets (
            id,
            name
          )
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return { data: null, error };
  }
};

/**
 * Get all approval requests (including approved and rejected)
 * @param {object} options - Filter options
 * @returns {Promise<{data: Array, error: object}>}
 */
export const getAllApprovals = async (options = {}) => {
  try {
    const { status = null, limit = 100 } = options;

    let query = supabase
      .from('content_approval_requests')
      .select(`
        *,
        requester:requested_by (
          user_id,
          display_name,
          email,
          role,
          markets (
            id,
            name
          )
        ),
        reviewer:reviewed_by (
          user_id,
          display_name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return { data: null, error };
  }
};

/**
 * Approve an approval request
 * @param {number} requestId - ID of the approval request
 * @param {string} reviewNotes - Optional review notes
 * @returns {Promise<{data: object, error: object}>}
 */
export const approveRequest = async (requestId, reviewNotes = null) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('content_approval_requests')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error approving request:', error);
    return { data: null, error };
  }
};

/**
 * Reject an approval request
 * @param {number} requestId - ID of the approval request
 * @param {string} reviewNotes - Review notes explaining rejection
 * @returns {Promise<{data: object, error: object}>}
 */
export const rejectRequest = async (requestId, reviewNotes) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('content_approval_requests')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error rejecting request:', error);
    return { data: null, error };
  }
};

/**
 * Get approval requests for a specific content item
 * @param {string} contentType - Type of content
 * @param {number} contentId - ID of the content item
 * @returns {Promise<{data: Array, error: object}>}
 */
export const getApprovalsByContent = async (contentType, contentId) => {
  try {
    const { data, error } = await supabase
      .from('content_approval_requests')
      .select(`
        *,
        requester:requested_by (
          user_id,
          display_name,
          email,
          role
        ),
        reviewer:reviewed_by (
          user_id,
          display_name,
          email,
          role
        )
      `)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching content approvals:', error);
    return { data: null, error };
  }
};

/**
 * Delete an approval request (only for pending requests)
 * @param {number} requestId - ID of the approval request
 * @returns {Promise<{error: object}>}
 */
export const deleteApprovalRequest = async (requestId) => {
  try {
    const { error } = await supabase
      .from('content_approval_requests')
      .delete()
      .eq('id', requestId)
      .eq('status', 'pending'); // Only allow deleting pending requests

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting approval request:', error);
    return { error };
  }
};

export const approvalsService = {
  createApprovalRequest,
  getPendingApprovals,
  getAllApprovals,
  approveRequest,
  rejectRequest,
  getApprovalsByContent,
  deleteApprovalRequest
};

export default approvalsService;
