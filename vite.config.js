import { defineConfig, loadEnv, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import { randomBytes, timingSafeEqual } from "crypto";
import { readdir, readFile, writeFile } from "fs/promises";
import { resolve } from "path";

const rootDir = process.cwd();
const floorplanSourcePath = resolve(
  rootDir,
  "public/interactive-elements/router-simulator/floorplan.js",
);
const supportedLayoutFloorplans = new Set(["floor1", "floor2", "floor3"]);

function replaceFloorplanArrayBlock(source, floorplanKey, blockName, items) {
  const markerPattern = new RegExp(
    `^[ \\t]*\\/\\* ${blockName}_START:${floorplanKey} \\*\\/[\\s\\S]*?^[ \\t]*\\/\\* ${blockName}_END:${floorplanKey} \\*\\/`,
    "m",
  );
  if (!markerPattern.test(source)) {
    throw new Error(
      `Could not find ${blockName.toLowerCase()} markers for ${floorplanKey}.`,
    );
  }

  const serializedItems = items
    .map((item) => `        ${JSON.stringify(item)}`)
    .join(",\n");
  const replacement = [
    `        /* ${blockName}_START:${floorplanKey} */`,
    serializedItems,
    `        /* ${blockName}_END:${floorplanKey} */`,
  ]
    .filter(Boolean)
    .join("\n");

  return source.replace(markerPattern, replacement);
}

const layoutItemKeys = new Set([
  "type",
  "style",
  "x",
  "y",
  "width",
  "height",
  "rotation",
  "room",
  "color",
  "attenuation",
]);

function validateLayoutItems(items, label) {
  if (!Array.isArray(items) || items.length > 200) {
    throw new Error(`${label} must be an array with at most 200 items.`);
  }

  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`${label} items must be objects.`);
    }
    if (Object.keys(item).some((key) => !layoutItemKeys.has(key))) {
      throw new Error(`${label} contains an unsupported property.`);
    }
    if (
      typeof item.type !== "string" ||
      item.type.length < 1 ||
      item.type.length > 80
    ) {
      throw new Error(`${label} item types must be short strings.`);
    }
    for (const key of ["x", "y", "width", "height"]) {
      if (
        !Number.isFinite(item[key]) ||
        item[key] < -5000 ||
        item[key] > 5000
      ) {
        throw new Error(`${label} item ${key} is out of bounds.`);
      }
    }
    for (const key of ["rotation", "attenuation"]) {
      if (
        item[key] !== undefined &&
        (!Number.isFinite(item[key]) || Math.abs(item[key]) > 5000)
      ) {
        throw new Error(`${label} item ${key} is out of bounds.`);
      }
    }
    for (const key of ["style", "room", "color"]) {
      if (
        item[key] !== undefined &&
        (typeof item[key] !== "string" || item[key].length > 120)
      ) {
        throw new Error(`${label} item ${key} must be a short string.`);
      }
    }
  }
}

function routerSimulatorFurnitureSavePlugin() {
  const sourceWriteToken = randomBytes(32).toString("hex");

  return {
    name: "router-simulator-furniture-save",
    configureServer(server) {
      server.middlewares.use("/__router-simulator/source-token", (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end();
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify({ token: sourceWriteToken }));
      });

      server.middlewares.use(
        "/__router-simulator/save-furniture",
        async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          const expectedOrigin = `http://${req.headers.host}`;
          const receivedToken = req.headers["x-router-source-token"];
          const tokenMatches =
            typeof receivedToken === "string" &&
            receivedToken.length === sourceWriteToken.length &&
            timingSafeEqual(
              Buffer.from(receivedToken),
              Buffer.from(sourceWriteToken),
            );
          if (
            req.headers.origin !== expectedOrigin ||
            !tokenMatches ||
            !String(req.headers["content-type"] || "")
              .toLowerCase()
              .startsWith("application/json")
          ) {
            res.statusCode = 403;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ error: "Source-write authorization failed." }),
            );
            return;
          }

          try {
            const chunks = [];
            let receivedBytes = 0;
            for await (const chunk of req) {
              const buffer =
                typeof chunk === "string" ? Buffer.from(chunk) : chunk;
              receivedBytes += buffer.length;
              if (receivedBytes > 128 * 1024) {
                throw new Error("Layout payload exceeds 128 KiB.");
              }
              chunks.push(buffer);
            }

            const body = JSON.parse(
              Buffer.concat(chunks).toString("utf8") || "{}",
            );
            const { floorplanKey, furniture, fixedObstacles } = body;

            if (!supportedLayoutFloorplans.has(floorplanKey)) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: `Unsupported floorplan key: ${floorplanKey}`,
                }),
              );
              return;
            }

            validateLayoutItems(furniture, "Furniture");
            validateLayoutItems(fixedObstacles, "Fixed obstacles");

            const source = await readFile(floorplanSourcePath, "utf8");
            const withFurniture = replaceFloorplanArrayBlock(
              source,
              floorplanKey,
              "FURNITURE",
              furniture,
            );
            const updatedSource = replaceFloorplanArrayBlock(
              withFurniture,
              floorplanKey,
              "FIXED_OBSTACLES",
              fixedObstacles,
            );
            await writeFile(floorplanSourcePath, updatedSource, "utf8");

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (error) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: error.message || "Failed to save furniture.",
              }),
            );
          }
        },
      );
    },
  };
}

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJavaScriptFiles(path)));
    } else if (entry.isFile() && /\.(?:js|mjs|cjs)$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

function productionDiagnosticsPlugin() {
  const transformOptions = {
    drop: ["console", "debugger"],
    minify: true,
    sourcemap: false,
    // Some interactive modules use top-level await. Preserve modern syntax;
    // GitHub Pages serves these scripts as modules to evergreen browsers.
    target: "esnext",
  };

  return {
    name: "strip-production-diagnostics",
    apply: "build",
    enforce: "post",
    async renderChunk(code, chunk) {
      const result = await transformWithEsbuild(
        code,
        chunk.fileName,
        transformOptions,
      );
      return { code: result.code, map: null };
    },
    async closeBundle() {
      // Vite copies public files without passing them through renderChunk. Strip
      // diagnostics from those fixed-name scripts after the copy completes.
      const outputDirectory = resolve(rootDir, "dist");
      const files = await collectJavaScriptFiles(outputDirectory);
      for (const file of files) {
        if (file.includes(`${resolve(outputDirectory, "assets")}/`)) continue;
        const source = await readFile(file, "utf8");
        const result = await transformWithEsbuild(
          source,
          file,
          transformOptions,
        );
        await writeFile(file, result.code, "utf8");
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, rootDir, "");

  const appConfig = {
    supabaseUrl: env.VITE_SUPABASE_URL || "",
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || "",
  };
  const interactiveAssetVersion =
    env.VITE_INTERACTIVE_ASSET_VERSION ||
    process.env.GITHUB_SHA ||
    "development";

  return {
    plugins: [
      react(),
      routerSimulatorFurnitureSavePlugin(),
      productionDiagnosticsPlugin(),
    ],
    server: {
      port: 3333, // Use a completely different port
      strictPort: true, // Fail if port is in use
      open: false,
    },
    build: {
      outDir: "dist",
      manifest: true,
      rollupOptions: {
        onwarn(warning, warn) {
          // Ignore certain warnings
          if (warning.code === "EMPTY_BUNDLE") return;
          warn(warning);
        },
      },
      // Generate static assets with correct paths
      assetsDir: "assets",
      cssCodeSplit: true,
      // Do not publish source maps with the public GitHub Pages bundle.
      sourcemap: mode === "development",
    },
    esbuild:
      mode === "production" ? { drop: ["console", "debugger"] } : undefined,
    // Use relative path since we're using HashRouter
    base: "./",
    define: {
      __APP_CONFIG__: JSON.stringify(appConfig),
      __INTERACTIVE_ASSET_VERSION__: JSON.stringify(interactiveAssetVersion),
    },
    // Ensure we're using the correct HTML template
    resolve: {
      alias: {
        "@": resolve(rootDir, "src"),
        "@public": resolve(rootDir, "public"),
      },
    },
  };
});
