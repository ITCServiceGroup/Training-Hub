import { readdir, readFile } from "node:fs/promises";
import { transform } from "esbuild";

const functionRoot = new URL("../supabase/functions/", import.meta.url);
const entries = [];
for (const directory of await readdir(functionRoot, { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const entry = new URL(`${directory.name}/index.ts`, functionRoot);
  try {
    entries.push({
      name: directory.name,
      entry,
      source: await readFile(entry, "utf8"),
    });
  } catch {
    // Non-function support directories do not need an index file.
  }
}

if (!entries.length) throw new Error("No Edge Function entrypoints were found");

for (const { name, source } of entries) {
  try {
    await transform(source, {
      loader: "ts",
      sourcefile: `${name}/index.ts`,
      target: "es2022",
      format: "esm",
      logLevel: "silent",
    });
  } catch (error) {
    throw new Error(`${name}: ${error.message}`, { cause: error });
  }
}

console.log(`Parsed ${entries.length} Edge Function entrypoints.`);
