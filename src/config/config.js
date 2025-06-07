// Runtime configuration values
let config = {
  supabaseUrl: '',
  supabaseAnonKey: ''
};

// Function to load config
export function initializeConfig() {
  if (import.meta.env.DEV) {
    // In development, use Vite's env variables
    config = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    };
  } else {
    // In production, use injected config from Vite's define
    try {
      // __APP_CONFIG__ is defined by Vite's define option during build
      if (typeof __APP_CONFIG__ !== 'undefined') {
        config = {
          ...config,
          ...__APP_CONFIG__
        };
      }
    } catch (e) {
      console.warn('Failed to load production config:', e);
    }
  }
  
  console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');
  console.log('Supabase configured:', isSupabaseConfigured());
}

// Getter functions with dev/prod handling
export function getSupabaseUrl() {
  return config.supabaseUrl;
}

export function getSupabaseAnonKey() {
  return config.supabaseAnonKey;
}

// Check if Supabase is configured
export function isSupabaseConfigured() {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}
