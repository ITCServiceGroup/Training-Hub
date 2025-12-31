import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
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

  // Track the current user ID to prevent unnecessary state updates
  const currentUserIdRef = useRef(null);

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

        const initialSession = data.session;
        setSession(initialSession);
        setUser(initialSession?.user || null);
        currentUserIdRef.current = initialSession?.user?.id || null;

        logAuth('Session initialized', {
          hasSession: !!initialSession,
          hasUser: !!initialSession?.user
        });

        const { data: { subscription } } = await client.auth.onAuthStateChange(
          (event, newSession) => {
            const newUserId = newSession?.user?.id || null;

            logAuth(`Auth state changed: ${event}`, {
              previousUserId: currentUserIdRef.current,
              newUserId,
              userChanged: currentUserIdRef.current !== newUserId
            });

            // For TOKEN_REFRESHED events, only update if absolutely necessary
            // This prevents cascading re-renders when the tab regains focus
            if (event === 'TOKEN_REFRESHED') {
              // Only update if user ID has actually changed (shouldn't happen normally)
              if (currentUserIdRef.current !== newUserId) {
                logAuth('TOKEN_REFRESHED: User ID changed, updating state');
                currentUserIdRef.current = newUserId;
                setSession(newSession);
                setUser(newSession?.user || null);
              } else {
                // Just silently update the session reference without triggering state updates
                // This keeps the tokens fresh without causing re-renders
                logAuth('TOKEN_REFRESHED: Same user, skipping state update to prevent re-renders');
              }
              return;
            }

            // For all other events (SIGNED_IN, SIGNED_OUT, etc.), update state normally
            currentUserIdRef.current = newUserId;
            setSession(newSession);
            setUser(newSession?.user || null);
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
