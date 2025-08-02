/**
 * Data Quality Notifications
 * Provides notifications and alerts for data quality issues
 */

import toast from 'react-hot-toast';

/**
 * Configuration for different types of data quality issues
 */
const NOTIFICATION_CONFIG = {
  usingDefaultScore: {
    threshold: 1, // Show notification if any records use default score
    icon: '⚠️',
    style: 'warning'
  },
  fuzzyMatches: {
    threshold: 1, // Show info if any records use fuzzy matching
    icon: '🔍',
    style: 'info'
  },
  noMatches: {
    threshold: 1, // Show error if any records have no match
    icon: '❌',
    style: 'error'
  },
  lowSimilarity: {
    threshold: 80, // Show warning if similarity is below 80%
    icon: '⚡',
    style: 'warning'
  }
};

/**
 * Show data quality notifications based on enrichment statistics
 * @param {Object} stats - Statistics from quiz results enrichment
 * @param {boolean} silent - If true, only log to console without showing toasts
 */
export function showDataQualityNotifications(stats, silent = false) {
  const notifications = [];

  // Check for records using default passing score
  if (stats.using_default_score >= NOTIFICATION_CONFIG.usingDefaultScore.threshold) {
    const message = `${stats.using_default_score} quiz result${stats.using_default_score > 1 ? 's' : ''} using default 70% passing score`;
    notifications.push({
      type: 'usingDefaultScore',
      message,
      count: stats.using_default_score,
      severity: 'warning'
    });

    if (!silent) {
      toast(message, {
        icon: NOTIFICATION_CONFIG.usingDefaultScore.icon,
        duration: 6000,
        style: {
          background: '#fbbf24',
          color: '#92400e',
        }
      });
    }
  }

  // Check for fuzzy matches (informational)
  if (stats.fuzzy_matches >= NOTIFICATION_CONFIG.fuzzyMatches.threshold) {
    const message = `${stats.fuzzy_matches} quiz result${stats.fuzzy_matches > 1 ? 's' : ''} matched using fuzzy matching`;
    notifications.push({
      type: 'fuzzyMatches',
      message,
      count: stats.fuzzy_matches,
      severity: 'info'
    });

    if (!silent) {
      toast(message, {
        icon: NOTIFICATION_CONFIG.fuzzyMatches.icon,
        duration: 4000,
        style: {
          background: '#3b82f6',
          color: '#1e40af',
        }
      });
    }
  }

  // Check for no matches (error)
  if (stats.no_matches >= NOTIFICATION_CONFIG.noMatches.threshold) {
    const message = `${stats.no_matches} quiz result${stats.no_matches > 1 ? 's' : ''} have no matching quiz metadata`;
    notifications.push({
      type: 'noMatches',
      message,
      count: stats.no_matches,
      severity: 'error'
    });

    if (!silent) {
      toast.error(message, {
        icon: NOTIFICATION_CONFIG.noMatches.icon,
        duration: 8000,
      });
    }
  }

  // Log all notifications to console for debugging
  if (notifications.length > 0) {
    console.group('📊 Data Quality Notifications');
    notifications.forEach(notif => {
      const logFn = notif.severity === 'error' ? console.error : 
                   notif.severity === 'warning' ? console.warn : console.info;
      logFn(`${NOTIFICATION_CONFIG[notif.type].icon} ${notif.message}`);
    });
    console.groupEnd();
  }

  return notifications;
}

/**
 * Show a summary toast with data quality overview
 * @param {Object} stats - Statistics from quiz results enrichment
 */
export function showDataQualitySummary(stats) {
  const totalIssues = stats.using_default_score + stats.no_matches;
  const totalRecords = stats.total_records;
  
  if (totalIssues === 0) {
    toast.success(`All ${totalRecords} quiz results have proper metadata`, {
      icon: '✅',
      duration: 3000,
    });
  } else {
    const percentage = ((totalIssues / totalRecords) * 100).toFixed(1);
    toast(`${totalIssues}/${totalRecords} (${percentage}%) quiz results have data quality issues`, {
      icon: '📊',
      duration: 5000,
      style: {
        background: totalIssues > totalRecords * 0.1 ? '#ef4444' : '#f59e0b',
        color: 'white',
      }
    });
  }
}

/**
 * Create an action to fix data quality issues
 * @param {string} type - Type of issue to fix
 * @param {Function} onFix - Callback function to execute the fix
 */
export function createDataQualityAction(type, onFix) {
  const config = NOTIFICATION_CONFIG[type];
  if (!config) return null;

  return {
    label: getFixActionLabel(type),
    icon: config.icon,
    execute: onFix,
    severity: config.style
  };
}

/**
 * Get appropriate action label for fixing data quality issues
 * @param {string} type - Type of issue
 * @returns {string} - Action label
 */
function getFixActionLabel(type) {
  switch (type) {
    case 'usingDefaultScore':
      return 'Review Quiz Metadata';
    case 'fuzzyMatches':
      return 'Review Fuzzy Matches';
    case 'noMatches':
      return 'Fix Missing Matches';
    default:
      return 'Review Issues';
  }
}

/**
 * Debounced notification system to prevent spam
 */
class DebouncedNotifications {
  constructor(delay = 2000) {
    this.delay = delay;
    this.timeouts = new Map();
  }

  notify(key, notificationFn) {
    // Clear existing timeout for this key
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      notificationFn();
      this.timeouts.delete(key);
    }, this.delay);

    this.timeouts.set(key, timeout);
  }

  clear() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

export const debouncedNotifier = new DebouncedNotifications();

export default {
  showDataQualityNotifications,
  showDataQualitySummary,
  createDataQualityAction,
  debouncedNotifier
};