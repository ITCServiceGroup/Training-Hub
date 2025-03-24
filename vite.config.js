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
    outDir: 'dist'
  },
  // Use root path for development
  base: '/',
  // Ensure we're using the correct HTML template
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
