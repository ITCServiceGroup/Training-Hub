import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd(), '');

  // Debug environment variables during build
  console.log('Vite Config Debug:');
  console.log('- Mode:', mode);
  console.log('- VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? `SET (${env.VITE_SUPABASE_URL.length} chars)` : 'MISSING');
  console.log('- VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? `SET (${env.VITE_SUPABASE_ANON_KEY.length} chars)` : 'MISSING');

  const appConfig = {
    supabaseUrl: env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || ''
  };

  console.log('- Final appConfig:', {
    supabaseUrl: appConfig.supabaseUrl ? `SET (${appConfig.supabaseUrl.length} chars)` : 'MISSING',
    supabaseAnonKey: appConfig.supabaseAnonKey ? `SET (${appConfig.supabaseAnonKey.length} chars)` : 'MISSING'
  });

  return {
  plugins: [react()],
  server: {
    port: 3333, // Use a completely different port
    strictPort: true, // Fail if port is in use
    open: true // Open browser automatically
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore certain warnings
        if (warning.code === 'EMPTY_BUNDLE') return;
        warn(warning);
      }
    },
    // Generate static assets with correct paths
    assetsDir: 'assets',
    cssCodeSplit: true,
    sourcemap: true
  },
  // Use relative path since we're using HashRouter
  base: './',
  define: {
    '__APP_CONFIG__': JSON.stringify(appConfig)
  },
  // Ensure we're using the correct HTML template
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@public': resolve(__dirname, 'public')
    }
  }
  };
});
