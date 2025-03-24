/**
 * Debug Helper Utility
 * 
 * This utility provides a central place for debugging functions and tools
 * that can be accessed globally to help diagnose issues.
 */

// View all logs from localStorage
export const viewAllLogs = () => {
  try {
    const authLogs = JSON.parse(localStorage.getItem('authLogs') || '[]');
    const loginLogs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
    const routeLogs = JSON.parse(localStorage.getItem('routeLogs') || '[]');
    const adminLogs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
    
    // Combine all logs and sort by timestamp
    const allLogs = [
      ...authLogs.map(log => ({ ...log, source: 'AUTH' })),
      ...loginLogs.map(log => ({ ...log, source: 'LOGIN' })),
      ...routeLogs.map(log => ({ ...log, source: 'ROUTE' })),
      ...adminLogs.map(log => ({ ...log, source: 'ADMIN' })),
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    console.log('=== ALL LOGS ===', allLogs);
    return allLogs;
  } catch (e) {
    console.error('Failed to retrieve logs', e);
    return [];
  }
};

// Clear all logs
export const clearAllLogs = () => {
  localStorage.removeItem('authLogs');
  localStorage.removeItem('loginLogs');
  localStorage.removeItem('routeLogs');
  localStorage.removeItem('adminLogs');
  console.log('All logs cleared');
};

// Export a diagnostic function to the window for easy console access
window.debugAuth = {
  viewLogs: viewAllLogs,
  clearLogs: clearAllLogs,
  
  // Get current localStorage state
  getLocalStorage: () => {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        result[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        result[key] = localStorage.getItem(key);
      }
    }
    console.log('localStorage content:', result);
    return result;
  },
  
  // Get current session info
  getSessionInfo: async () => {
    try {
      const { supabase } = await import('../config/supabase');
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      
      console.log('Current session info:', {
        session: sessionData?.session,
        user: userData?.user
      });
      
      return {
        session: sessionData?.session,
        user: userData?.user
      };
    } catch (e) {
      console.error('Error getting session info', e);
      return { error: e.message };
    }
  },
  
  // Force sign out to reset state
  forceSignOut: async () => {
    try {
      const { supabase } = await import('../config/supabase');
      await supabase.auth.signOut({ scope: 'global' });
      localStorage.clear();
      console.log('Signed out and cleared localStorage');
      return true;
    } catch (e) {
      console.error('Error during force sign out', e);
      return false;
    }
  }
};

// Add a message to show this utility is loaded
console.log('Debug Helper loaded. Use window.debugAuth in console to access debugging tools.');
