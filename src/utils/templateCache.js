/**
 * Template Cache Utility
 * Provides caching mechanism for parsed template content to improve performance
 */

class TemplateCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50; // Maximum number of cached templates
    this.accessTimes = new Map(); // Track access times for LRU eviction
  }

  /**
   * Generate a cache key for template content
   * @param {*} content - Template content (string or object)
   * @returns {string} Cache key
   */
  generateKey(content) {
    if (typeof content === 'string') {
      return `str_${content.length}_${content.substring(0, 100)}`;
    } else if (typeof content === 'object' && content !== null) {
      return `obj_${JSON.stringify(content).length}_${Object.keys(content).join(',')}`;
    }
    return `unknown_${typeof content}`;
  }

  /**
   * Get cached parsed content
   * @param {*} rawContent - Raw template content
   * @returns {*|null} Cached parsed content or null if not found
   */
  get(rawContent) {
    const key = this.generateKey(rawContent);
    
    if (this.cache.has(key)) {
      // Update access time for LRU
      this.accessTimes.set(key, Date.now());
      const cached = this.cache.get(key);
      console.log('TemplateCache: Cache hit for key:', key.substring(0, 50) + '...');
      return cached;
    }
    
    console.log('TemplateCache: Cache miss for key:', key.substring(0, 50) + '...');
    return null;
  }

  /**
   * Store parsed content in cache
   * @param {*} rawContent - Raw template content
   * @param {*} parsedContent - Parsed template content
   */
  set(rawContent, parsedContent) {
    const key = this.generateKey(rawContent);
    
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    this.cache.set(key, parsedContent);
    this.accessTimes.set(key, Date.now());
    
    console.log('TemplateCache: Cached content for key:', key.substring(0, 50) + '...');
    console.log('TemplateCache: Cache size:', this.cache.size);
  }

  /**
   * Remove least recently used item from cache
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, time] of this.accessTimes.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
      console.log('TemplateCache: Evicted LRU item:', oldestKey.substring(0, 50) + '...');
    }
  }

  /**
   * Clear all cached content
   */
  clear() {
    this.cache.clear();
    this.accessTimes.clear();
    console.log('TemplateCache: Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()).map(key => key.substring(0, 50) + '...')
    };
  }
}

// Create singleton instance
export const templateCache = new TemplateCache();
export default templateCache;