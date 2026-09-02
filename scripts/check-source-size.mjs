import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import process from "node:process";

const root = process.cwd();
const srcRoot = join(root, "src");
const generatedTemplateRoot = join(srcRoot, "data", "templates");
const limits = {
  authored: 256 * 1024,
  generatedTemplate: 600 * 1024,
  registry: 24 * 1024,
};

const files = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(?:js|jsx|ts|tsx)$/.test(entry.name)) files.push(path);
  }
};

await walk(srcRoot);

const failures = [];
for (const file of files) {
  const bytes = (await stat(file)).size;
  const path = relative(root, file);
  const limit = file.startsWith(generatedTemplateRoot)
    ? limits.generatedTemplate
    : path === "src/data/systemTemplateRegistry.js"
      ? limits.registry
      : limits.authored;

  if (bytes > limit) failures.push(`${path}: ${bytes} bytes exceeds ${limit}`);
}

if (failures.length > 0) {
  console.error(`Source size check failed:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log(
  `Validated ${files.length} source modules against authored and generated size budgets.`,
);
