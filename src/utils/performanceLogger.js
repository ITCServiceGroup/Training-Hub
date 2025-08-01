/**
 * Performance Logger Utility
 * Helps track and measure performance improvements
 */

class PerformanceLogger {
  constructor() {
    this.timers = new Map();
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Start a performance timer
   * @param {string} label - Timer label
   */
  startTimer(label) {
    if (!this.isEnabled) return;
    
    this.timers.set(label, {
      start: performance.now(),
      label
    });
    console.log(`⏰ Performance Timer Started: ${label}`);
  }

  /**
   * End a performance timer and log the result
   * @param {string} label - Timer label
   * @returns {number} Duration in milliseconds
   */
  endTimer(label) {
    if (!this.isEnabled) return 0;

    const timer = this.timers.get(label);
    if (!timer) {
      console.warn(`⚠️ Performance Timer not found: ${label}`);
      return 0;
    }

    const duration = performance.now() - timer.start;
    this.timers.delete(label);

    // Store metric
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label).push(duration);

    console.log(`⏱️ Performance Timer Ended: ${label} - ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Log template modal opening performance
   * @param {number} templateCount - Number of templates
   * @param {number} duration - Duration in milliseconds
   */
  logModalOpen(templateCount, duration) {
    if (!this.isEnabled) return;

    console.log(`🚀 Template Modal Performance:`, {
      templateCount,
      duration: `${duration.toFixed(2)}ms`,
      avgPerTemplate: `${(duration / templateCount).toFixed(2)}ms/template`
    });
  }

  /**
   * Log template preview rendering performance
   * @param {string} templateId - Template ID
   * @param {boolean} wasLazy - Whether it was lazy loaded
   * @param {boolean} wasCached - Whether content was cached
   * @param {number} duration - Duration in milliseconds
   */
  logTemplateRender(templateId, wasLazy, wasCached, duration) {
    if (!this.isEnabled) return;

    const status = [];
    if (wasLazy) status.push('lazy');
    if (wasCached) status.push('cached');
    
    console.log(`🎨 Template Render: ${templateId}`, {
      status: status.join(', ') || 'normal',
      duration: `${duration.toFixed(2)}ms`
    });
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   */
  getStats() {
    if (!this.isEnabled) return {};

    const stats = {};
    for (const [label, durations] of this.metrics.entries()) {
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      
      stats[label] = {
        count: durations.length,
        avg: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        total: Math.round(durations.reduce((sum, d) => sum + d, 0) * 100) / 100
      };
    }
    
    return stats;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.timers.clear();
    this.metrics.clear();
  }

  /**
   * Log performance summary
   */
  logSummary() {
    if (!this.isEnabled) return;

    const stats = this.getStats();
    console.table(stats);
  }
}

// Create singleton instance
export const performanceLogger = new PerformanceLogger();
export default performanceLogger;