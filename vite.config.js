import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
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
  // Ensure we're using the correct HTML template
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@public': resolve(__dirname, 'public')
    }
  }
});
