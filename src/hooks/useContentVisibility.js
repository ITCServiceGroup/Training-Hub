import { useRBAC, ROLES } from '../contexts/RBACContext';

/**
 * Hook to manage content visibility and permissions based on RBAC rules
 * @returns {object} Content visibility and permission functions
 */
export const useContentVisibility = () => {
  const { profile, isAdmin } = useRBAC();

  /**
   * Check if user can view a specific content item
   * @param {object} content - Content item with market_id and is_nationwide properties
   * @returns {boolean}
   */
  const canViewContent = (content) => {
    if (!profile) return false;
    if (!content) return false;

    // Admins can view everything
    if (isAdmin()) return true;

    // Everyone can view nationwide content
    if (content.is_nationwide) return true;

    // Regional users can view content from their market
    return content.market_id === profile.market_id;
  };

  /**
   * Check if user can edit a specific content item
   * @param {object} content - Content item with created_by, market_id properties
   * @returns {boolean}
   */
  const canEditContent = (content) => {
    if (!profile) return false;
    if (!content) return false;

    // Admins can edit everything
    if (isAdmin()) return true;

    // AOM and Supervisor can edit content in their market
    if (profile.role === ROLES.AOM || profile.role === ROLES.SUPERVISOR) {
      return content.market_id === profile.market_id;
    }

    // Lead Tech can only edit their own content
    if (profile.role === ROLES.LEAD_TECH) {
      return content.created_by === profile.user_id;
    }

    return false;
  };

  /**
   * Check if user can delete a specific content item
   * Same rules as edit for most cases
   * @param {object} content - Content item with created_by, market_id properties
   * @returns {boolean}
   */
  const canDeleteContent = (content) => {
    return canEditContent(content);
  };

  /**
   * Get default values for new content based on user role
   * @returns {object} Default values for created_by, market_id, is_nationwide
   */
  const getNewContentDefaults = () => {
    if (!profile) {
      return { created_by: null, is_nationwide: false, market_id: null };
    }

    // Admins create nationwide content by default
    if (isAdmin()) {
      return {
        created_by: profile.user_id,
        is_nationwide: true,
        market_id: null
      };
    }

    // Regional users create regional content
    return {
      created_by: profile.user_id,
      is_nationwide: false,
      market_id: profile.market_id
    };
  };

  /**
   * Check if user can request content to be promoted to nationwide
   * @param {object} content - Content item
   * @returns {boolean}
   */
  const canRequestNationwideApproval = (content) => {
    if (!profile || !content) return false;

    // Only for regional content that user can edit
    if (content.is_nationwide) return false;
    if (!canEditContent(content)) return false;

    // Admins don't need to request approval
    if (isAdmin()) return false;

    // Content must not already be approved
    if (content.approved_by) return false;

    return true;
  };

  /**
   * Filter a list of content items based on visibility rules
   * @param {array} contentList - Array of content items
   * @returns {array} Filtered array of visible content
   */
  const filterVisibleContent = (contentList) => {
    if (!Array.isArray(contentList)) return [];
    return contentList.filter(canViewContent);
  };

  /**
   * Get visibility badge info for a content item
   * @param {object} content - Content item
   * @returns {object} Badge info with label, color, and icon
   */
  const getVisibilityBadge = (content) => {
    if (!content) return null;

    if (content.is_nationwide) {
      return {
        label: 'Nationwide',
        color: 'blue',
        icon: '🌐'
      };
    }

    // Try to get market name from content
    const marketName = content.markets?.name || content.market_name || `Market ${content.market_id}`;

    return {
      label: marketName,
      color: 'green',
      icon: '📍'
    };
  };

  /**
   * Check if content was created by current user
   * @param {object} content - Content item with created_by property
   * @returns {boolean}
   */
  const isOwnContent = (content) => {
    if (!profile || !content) return false;
    return content.created_by === profile.user_id;
  };

  return {
    canViewContent,
    canEditContent,
    canDeleteContent,
    getNewContentDefaults,
    canRequestNationwideApproval,
    filterVisibleContent,
    getVisibilityBadge,
    isOwnContent
  };
};
