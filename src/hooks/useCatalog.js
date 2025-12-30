import { useEffect, useMemo, useState } from 'react';
import { sectionsService } from '../services/api/sections';
import { catalogCache } from '../services/cache/catalogCache';
import { useNetworkStatus } from '../contexts/NetworkContext';

/**
 * Shared catalog hook for Sections -> Categories -> Study Guides list (metadata only)
 * Supports offline (localStorage) and online refresh + reconnect auto-refresh.
 *
 * mode: 'public' | 'admin'
 *  - public: publishedOnly=true for study_guides
 *  - admin: include all
 */
export function useCatalog({ mode = 'public' } = {}) {
  const publishedOnly = mode === 'public';
  const { isOnline, reconnectCount } = useNetworkStatus();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const toSlim = (data) => (data || []).map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    icon: s.icon,
    display_order: s.display_order,
    // RBAC fields for sections
    is_nationwide: s.is_nationwide,
    market_id: s.market_id,
    created_by: s.created_by,
    categories: (s.categories || []).map(c => ({
      id: c.id,
      section_id: c.section_id,
      name: c.name,
      description: c.description,
      icon: c.icon,
      display_order: c.display_order,
      // RBAC fields for categories
      is_nationwide: c.is_nationwide,
      market_id: c.market_id,
      created_by: c.created_by,
      study_guides: (c.study_guides || []).map(g => ({
        id: g.id,
        category_id: g.category_id,
        title: g.title,
        description: g.description || '',
        // Keep cache small: do not store content; leave preview empty
        preview: '',
        is_published: !!g.is_published,
        display_order: g.display_order,
        updated_at: g.updated_at,
        // RBAC fields
        is_nationwide: g.is_nationwide,
        market_id: g.market_id,
        created_by: g.created_by,
        markets: g.markets // Include market name for visibility badge
      }))
    }))
  }));

  const load = async (preferCache = false) => {
    const cached = catalogCache.get(mode);

    // If offline or preferCache, return cached immediately
    if (preferCache || !isOnline) {
      setSections(cached?.data || []);
      setLoading(false);
      return;
    }

    // If online but have cache, render it first for instant UI, then refresh in background
    if (cached?.data && !preferCache) {
      setSections(cached.data);
      setLoading(false);
      try {
        const fresh = await sectionsService.getSectionsWithCategories(publishedOnly);
        const slim = toSlim(fresh);
        setSections(slim);
        catalogCache.set(mode, slim);
      } catch (e) {
        // keep cached view
        console.warn('[useCatalog] Background refresh failed:', e);
      }
      return;
    }

    // No cache -> fetch
    try {
      const data = await sectionsService.getSectionsWithCategories(publishedOnly);
      const slim = toSlim(data);
      setSections(slim);
      catalogCache.set(mode, slim);
    } catch (e) {
      console.warn('[useCatalog] Initial fetch failed, using cache if any');
      setSections(cached?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(false); }, [mode, isOnline]);
  useEffect(() => { if (reconnectCount > 0) load(false); }, [reconnectCount]);

  const refresh = () => load(false);

  const getCategoriesBySection = useMemo(
    () => (sectionId) => (sections || []).find(s => s.id === sectionId)?.categories || [],
    [sections]
  );

  const getGuidesByCategory = useMemo(
    () => (categoryId, onlyPublished = publishedOnly) => {
      const category = (sections || []).flatMap(s => s.categories || []).find(c => c.id === categoryId);
      const guides = category?.study_guides || [];
      return onlyPublished ? guides.filter(g => g.is_published) : guides;
    },
    [sections, publishedOnly]
  );

  return { sections, loading, getCategoriesBySection, getGuidesByCategory, refresh };
}

export default useCatalog;

