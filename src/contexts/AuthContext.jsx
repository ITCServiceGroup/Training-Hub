import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';

// Extract the Supabase URL for localStorage key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

if (!supabaseUrl) {
  logAuth('Missing Supabase URL environment variable');
  throw new Error('Missing required environment variable: VITE_SUPABASE_URL');
}

try {
  new URL(supabaseUrl);
} catch (error) {
  logAuth('Invalid Supabase URL format', error);
  throw new Error('Invalid Supabase URL configuration');
}

// Debug helper function with localStorage persistence
const logAuth = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[AUTH ${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Format data as string if present
  let dataString = '';
  if (data) {
    console.log(`[AUTH DATA]`, data);
    try {
      dataString = JSON.stringify(data, null, 2);
    } catch (e) {
      dataString = `[Unable to stringify: ${e.message}]`;
    }
  }
  
  // Persist to localStorage
  try {
    const logs = JSON.parse(localStorage.getItem('authLogs') || '[]');
    logs.push({ timestamp, type: 'AUTH', message, data: dataString });
    // Keep only last 100 logs
    if (logs.length > 100) logs.shift();
    localStorage.setItem('authLogs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to persist log to localStorage', e);
  }
};

// Function to view all persisted logs
window.viewAuthLogs = () => {
  try {
    const logs = JSON.parse(localStorage.getItem('authLogs') || '[]');
    console.log('=== PERSISTED AUTH LOGS ===', logs);
    return logs;
  } catch (e) {
    console.error('Failed to retrieve logs', e);
    return [];
  }
};

// Clear logs
window.clearAuthLogs = () => {
  localStorage.removeItem('authLogs');
  console.log('Auth logs cleared');
};

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle environment variable errors
  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setError('Missing required environment variables');
      setLoading(false);
      return;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Get current session from Supabase
    const initializeAuth = async () => {
      logAuth('Initializing authentication');
      setLoading(true);
      
      try {
        // Check current session
        logAuth('Checking for existing session');
        const { data, error } = await supabase.auth.getSession();
        
        logAuth('Session check response', data);
        
        if (error) {
          logAuth('Session check error', error);
          throw error;
        }
        
        const session = data.session;
        
        setSession(session);
        setUser(session?.user || null);
        
        logAuth('Session state after check', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          user: session?.user
        });
        
        // Listen for auth changes
        logAuth('Setting up auth state change listener');
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          (_event, session) => {
            logAuth(`Auth state changed: ${_event}`, {
              hasSession: !!session,
              hasUser: !!session?.user
            });
            setSession(session);
            setUser(session?.user || null);
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        setError(error.message);
        console.error('Error initializing auth:', error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign in with email
  const signIn = async (email, password) => {
    logAuth(`Signing in user: ${email}`);
    setLoading(true);
    setError(null);
    
    try {
      logAuth('Calling supabase.auth.signInWithPassword');
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      logAuth('Sign in response received', response);
      
      const { data, error } = response;
      
      if (error) {
        logAuth('Sign in error', error);
        throw error;
      }
      
      logAuth('Sign in successful', {
        session: data.session,
        user: data.user
      });
      
      // Manually update state after successful login
      // This ensures the state is updated immediately
      setSession(data.session);
      setUser(data.user);
      
      // Double check that localStorage has the session
      const supabaseKey = 'sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token';
      const localStorageSession = localStorage.getItem(supabaseKey);
      logAuth('localStorage session after login', { 
        hasLocalStorage: !!localStorageSession,
        localStorageLength: localStorageSession?.length
      });
      
      return data;
    } catch (error) {
      setError(error.message);
      console.error('Error signing in:', error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    logAuth('Signing out');
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logAuth('Sign out error', error);
        throw error;
      }
      
      logAuth('Sign out successful');
    } catch (error) {
      setError(error.message);
      console.error('Error signing out:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  // Provide Auth context value to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
