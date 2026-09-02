import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { getSupabaseClient, initializeSupabase } from "../config/supabase";
import { initializeConfig, isSupabaseConfigured } from "../config/config";

// Keep authentication diagnostics ephemeral and development-only. Persisting
// auth events in localStorage creates unnecessary employee-session metadata.
const logAuth = (message, data = null) => {
  if (!import.meta.env.DEV) return;
  console.debug(`[AUTH ${new Date().toISOString()}] ${message}`, data || "");
};

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [authEvent, setAuthEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track the current user ID to prevent unnecessary state updates
  const currentUserIdRef = useRef(null);

  // Initialize configuration and Supabase
  useEffect(() => {
    let isMounted = true;
    let subscription;

    logAuth("Initializing configuration");
    initializeConfig();

    if (!isSupabaseConfigured()) {
      logAuth("Supabase is not configured - some features will be disabled");
      setLoading(false);
      return;
    }

    const client = initializeSupabase();
    if (!client) {
      logAuth("Failed to initialize Supabase client");
      setError("Authentication service unavailable");
      setLoading(false);
      return;
    }

    const handleAuthStateChange = (event, newSession) => {
      if (!isMounted) return;

      const newUserId = newSession?.user?.id || null;
      currentUserIdRef.current = newUserId;
      setSession(newSession);
      setUser(newSession?.user || null);
      setAuthEvent(event);
      logAuth(`Auth state changed: ${event}`, { hasUser: Boolean(newUserId) });
    };

    const { data: authListener } = client.auth.onAuthStateChange(
      handleAuthStateChange,
    );
    subscription = authListener.subscription;

    const initializeAuth = async () => {
      try {
        const { data, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        if (!isMounted) return;

        const initialSession = data.session;
        setSession(initialSession);
        setUser(initialSession?.user || null);
        currentUserIdRef.current = initialSession?.user?.id || null;

        logAuth("Session initialized", {
          hasSession: !!initialSession,
          hasUser: !!initialSession?.user,
        });
      } catch (error) {
        if (!isMounted) return;
        logAuth("Auth initialization error", error);
        setError(error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with email
  const signIn = async (email, password) => {
    const client = getSupabaseClient();
    if (!client) {
      setError("Authentication service unavailable");
      return { error: "Authentication service unavailable" };
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
      setError("Authentication service unavailable");
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
    authEvent,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isSupabaseAvailable: !!getSupabaseClient(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
