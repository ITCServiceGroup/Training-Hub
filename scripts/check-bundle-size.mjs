import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const manifest = JSON.parse(await readFile("dist/.vite/manifest.json", "utf8"));
const budgets = [
  { source: "index.html", gzipKiB: 180 },
  { source: "src/pages/QuizPage.jsx", gzipKiB: 80 },
  { source: "src/pages/admin/Dashboard.jsx", gzipKiB: 120 },
  { source: "src/pages/admin/StudyGuides.jsx", gzipKiB: 90 },
];
const templateBudgetGzipKiB = 30;

const resolveEntry = (source) => {
  if (manifest[source]) return manifest[source];
  const expectedName = source
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "");
  return Object.values(manifest).find(
    (entry) => entry.name === expectedName && entry.isDynamicEntry,
  );
};

let failed = false;
for (const budget of budgets) {
  const entry = resolveEntry(budget.source);
  if (!entry?.file) {
    console.error(
      `Bundle entry is missing from the manifest: ${budget.source}`,
    );
    failed = true;
    continue;
  }

  const compressedBytes = gzipSync(await readFile(`dist/${entry.file}`), {
    level: 9,
  }).byteLength;
  const compressedKiB = compressedBytes / 1024;
  const result = `${budget.source}: ${compressedKiB.toFixed(1)} KiB gzip / ${budget.gzipKiB} KiB budget`;
  if (compressedKiB > budget.gzipKiB) {
    console.error(`OVER BUDGET - ${result}`);
    failed = true;
  } else {
    console.log(`PASS - ${result}`);
  }
}

const generatedTemplateEntries = Object.entries(manifest).filter(
  ([source]) =>
    source.startsWith("src/data/templates/") &&
    !source.includes("_template-example"),
);

if (generatedTemplateEntries.length !== 12) {
  console.error(
    `Expected 12 independently loadable system templates, found ${generatedTemplateEntries.length}.`,
  );
  failed = true;
}

for (const [source, entry] of generatedTemplateEntries) {
  const compressedBytes = gzipSync(await readFile(`dist/${entry.file}`), {
    level: 9,
  }).byteLength;
  const compressedKiB = compressedBytes / 1024;
  const result = `${source}: ${compressedKiB.toFixed(1)} KiB gzip / ${templateBudgetGzipKiB} KiB budget`;
  if (!entry.isDynamicEntry || compressedKiB > templateBudgetGzipKiB) {
    console.error(`OVER BUDGET - ${result}`);
    failed = true;
  } else {
    console.log(`PASS - ${result}`);
  }
}

if (failed) process.exit(1);
