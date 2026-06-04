import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

const rootDir = process.cwd();
const floorplanSourcePath = resolve(rootDir, 'public/interactive-elements/router-simulator/floorplan.js');
const supportedLayoutFloorplans = new Set(['floor1', 'floor2', 'floor3']);

async function updateFloorplanArrayBlock(floorplanKey, blockName, items) {
  const markerPattern = new RegExp(
    `^[ \\t]*\\/\\* ${blockName}_START:${floorplanKey} \\*\\/[\\s\\S]*?^[ \\t]*\\/\\* ${blockName}_END:${floorplanKey} \\*\\/`,
    'm'
  );
  const source = await readFile(floorplanSourcePath, 'utf8');

  if (!markerPattern.test(source)) {
    throw new Error(`Could not find ${blockName.toLowerCase()} markers for ${floorplanKey}.`);
  }

  const serializedItems = items.map((item) => `        ${JSON.stringify(item)}`).join(',\n');
  const replacement = [
    `        /* ${blockName}_START:${floorplanKey} */`,
    serializedItems,
    `        /* ${blockName}_END:${floorplanKey} */`
  ].filter(Boolean).join('\n');

  const updatedSource = source.replace(markerPattern, replacement);
  await writeFile(floorplanSourcePath, updatedSource, 'utf8');
}

function routerSimulatorFurnitureSavePlugin() {
  return {
    name: 'router-simulator-furniture-save',
    configureServer(server) {
      server.middlewares.use('/__router-simulator/save-furniture', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }

          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
          const { floorplanKey, furniture, fixedObstacles } = body;

          if (!supportedLayoutFloorplans.has(floorplanKey)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Unsupported floorplan key: ${floorplanKey}` }));
            return;
          }

          if (!Array.isArray(furniture)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Furniture payload must be an array.' }));
            return;
          }

          if (typeof fixedObstacles !== 'undefined' && !Array.isArray(fixedObstacles)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Fixed obstacles payload must be an array when provided.' }));
            return;
          }

          await updateFloorplanArrayBlock(floorplanKey, 'FURNITURE', furniture);

          if (Array.isArray(fixedObstacles)) {
            await updateFloorplanArrayBlock(floorplanKey, 'FIXED_OBSTACLES', fixedObstacles);
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message || 'Failed to save furniture.' }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, rootDir, '');

  const appConfig = {
    supabaseUrl: env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || ''
  };

  return {
  plugins: [react(), routerSimulatorFurnitureSavePlugin()],
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
      '@': resolve(rootDir, 'src'),
      '@public': resolve(rootDir, 'public')
    }
  }
  };
});
