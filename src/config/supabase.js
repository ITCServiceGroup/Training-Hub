import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, isSupabaseConfigured, initializeConfig } from './config';

let supabaseClient = null;

// Create a function to initialize Supabase client
export function initializeSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Ensure config is initialized first
  initializeConfig();

  // Check if configuration is available
  if (!isSupabaseConfigured()) {
    console.warn('Supabase configuration is missing - some features will be disabled');
    return null;
  }

  // Validate URL format
  try {
    new URL(getSupabaseUrl());
  } catch (error) {
    console.error('Invalid Supabase URL format:', error);
    return null;
  }

  // Create Supabase client
  try {
    supabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }

  return supabaseClient;
}

// Export a function to get the Supabase client
export function getSupabaseClient() {
  if (!supabaseClient) {
    console.log('[Supabase] Client not initialized, initializing now...');
    return initializeSupabase();
  }
  console.log('[Supabase] Returning existing client');
  return supabaseClient;
}

// Export a getter that lazily initializes the supabase client
// This ensures the client is properly initialized when accessed
export const supabase = new Proxy({}, {
  get(_target, prop) {
    console.log(`[Supabase Proxy] Accessing property: ${String(prop)}`);
    const client = getSupabaseClient();
    if (!client) {
      console.warn('Supabase client not available - configuration may be missing');
      return null;
    }
    console.log(`[Supabase Proxy] Returning property ${String(prop)} from client`);
    return client[prop];
  }
});
