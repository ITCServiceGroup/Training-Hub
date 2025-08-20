const KEY = { public: 'catalog_public_v3', admin: 'catalog_admin_v3' };
const TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Catalog cache for sections -> categories -> study_guides (metadata only recommended)
 */
export const catalogCache = {
  get(mode) {
    try {
      const raw = localStorage.getItem(KEY[mode]);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return null;
      const age = Date.now() - (parsed.lastUpdated || 0);
      if (age > TTL_MS) parsed.stale = true;
      return parsed;
    } catch (e) {
      console.warn('[catalogCache] Failed to parse cache:', e);
      return null;
    }
  },

  set(mode, data) {
    try {
      localStorage.setItem(
        KEY[mode],
        JSON.stringify({ data, lastUpdated: Date.now() })
      );
    } catch (e) {
      console.warn('[catalogCache] Failed to write cache:', e);
    }
  },

  clear(mode) {
    try {
      localStorage.removeItem(KEY[mode]);
    } catch (e) {
      console.warn('[catalogCache] Failed to clear cache:', e);
    }
  }
};

