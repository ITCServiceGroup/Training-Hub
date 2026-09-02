import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const rootDir = process.cwd();
const distDir = join(rootDir, "dist");

const forbiddenPatterns = [
  {
    label: "console diagnostic",
    pattern:
      /(?<![\w$.])console\s*(?:\.|\[)\s*["']?(?:log|debug|info|warn|error|trace|table|dir)["']?\s*(?:\]|\()/,
  },
  { label: "debugger statement", pattern: /\bdebugger\s*;/ },
  { label: "source-map reference", pattern: /[#@]\s*sourceMappingURL\s*=/ },
  { label: "contact-form payload label", pattern: /Contact form submitted:/ },
  { label: "raw analytics payload label", pattern: /rawData sample:/ },
  { label: "learner record payload label", pattern: /First record structure:/ },
];

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJavaScriptFiles(path)));
    } else if (entry.isFile() && /\.(?:js|mjs|cjs)$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

let files;
try {
  files = await collectJavaScriptFiles(distDir);
} catch (error) {
  throw new Error(
    `Production diagnostics check requires a completed build at ${distDir}: ${error.message}`,
  );
}

if (files.length === 0) {
  throw new Error("Production diagnostics check found no JavaScript assets.");
}

const violations = [];
for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const { label, pattern } of forbiddenPatterns) {
    if (pattern.test(source)) {
      violations.push(`${relative(rootDir, file)} contains a ${label}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Production diagnostic exposure check failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(
  `Production diagnostic exposure check passed for ${files.length} JavaScript assets.`,
);
