import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSupabaseClient, initializeSupabase } from '../config/supabase';
import { initializeConfig, isSupabaseConfigured } from '../config/config';

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
    if (logs.length > 100) logs.shift();
    localStorage.setItem('authLogs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to persist log to localStorage', e);
  }
};

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize configuration and Supabase
  useEffect(() => {
    logAuth('Initializing configuration');
    initializeConfig();
    
    if (!isSupabaseConfigured()) {
      logAuth('Supabase is not configured - some features will be disabled');
      setLoading(false);
      return;
    }

    const client = initializeSupabase();
    if (!client) {
      logAuth('Failed to initialize Supabase client');
      setError('Authentication service unavailable');
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        const { data, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;

        const session = data.session;
        setSession(session);
        setUser(session?.user || null);
        
        logAuth('Session initialized', {
          hasSession: !!session,
          hasUser: !!session?.user
        });

        const { data: { subscription } } = await client.auth.onAuthStateChange(
          (_event, session) => {
            logAuth(`Auth state changed: ${_event}`);
            setSession(session);
            setUser(session?.user || null);
          }
        );

        return () => subscription?.unsubscribe();
      } catch (error) {
        logAuth('Auth initialization error', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign in with email
  const signIn = async (email, password) => {
    const client = getSupabaseClient();
    if (!client) {
      setError('Authentication service unavailable');
      return { error: 'Authentication service unavailable' };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);
      return data;
    } catch (error) {
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setError('Authentication service unavailable');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isSupabaseAvailable: !!getSupabaseClient()
  };

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
