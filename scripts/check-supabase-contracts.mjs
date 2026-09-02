import { readdir, readFile } from "node:fs/promises";

const migrationDirectory = new URL("../supabase/migrations/", import.meta.url);
const testFile = new URL(
  "../supabase/tests/authorization_rls.test.sql",
  import.meta.url,
);
const migrationFiles = (await readdir(migrationDirectory))
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (!migrationFiles.length)
  throw new Error("No Supabase migrations were found");

const timestamps = new Set();
let privilegedFunctionCount = 0;
for (const file of migrationFiles) {
  const match = file.match(/^(\d{14})_[a-z0-9_]+\.sql$/);
  if (!match) throw new Error(`Migration name is not timestamped: ${file}`);
  if (timestamps.has(match[1]))
    throw new Error(`Duplicate migration timestamp: ${match[1]}`);
  timestamps.add(match[1]);

  const sql = await readFile(new URL(file, migrationDirectory), "utf8");
  const declarations = [
    ...sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+([\w.]+)/gi),
  ];
  let filePrivilegedFunctionCount = 0;
  declarations.forEach((declaration, index) => {
    const block = sql.slice(
      declaration.index,
      declarations[index + 1]?.index ?? sql.length,
    );
    if (!/security\s+definer/i.test(block)) return;

    filePrivilegedFunctionCount += 1;
    privilegedFunctionCount += 1;
    const functionName = declaration[1];
    if (!/set\s+search_path\s*=\s*''/i.test(block)) {
      throw new Error(
        `${file}: ${functionName} must use an empty fixed search_path`,
      );
    }
    if (functionName.startsWith("public.")) {
      const name = functionName.slice("public.".length);
      if (
        !new RegExp(
          `revoke\\s+all\\s+on\\s+function\\s+public\\.${name}\\s*\\(`,
          "i",
        ).test(block)
      ) {
        throw new Error(
          `${file}: ${functionName} must revoke default function execution`,
        );
      }
    }
  });

  const definerClauseCount = [...sql.matchAll(/security\s+definer/gi)].length;
  if (filePrivilegedFunctionCount !== definerClauseCount) {
    throw new Error(
      `${file}: found ${definerClauseCount} SECURITY DEFINER clauses but checked ${filePrivilegedFunctionCount} functions`,
    );
  }
}

const tests = await readFile(testFile, "utf8");
const declaredPlan = Number(tests.match(/select\s+plan\((\d+)\)/i)?.[1]);
const assertionCount = [
  ...tests.matchAll(
    /select\s+(?:ok|is|isnt|has_|lives_ok|throws_ok|results_eq|set_eq|bag_eq|matches|unlike|cmp_ok|isa_ok|can_ok|function_returns|col_type|policy_cmd_is)\s*\(/gi,
  ),
].length;

if (!declaredPlan || declaredPlan !== assertionCount) {
  throw new Error(
    `pgTAP plan mismatch: declared ${declaredPlan || 0}, found ${assertionCount}`,
  );
}

console.log(
  `Validated ${migrationFiles.length} migrations, ${privilegedFunctionCount} privileged functions, and ${assertionCount} pgTAP assertions.`,
);
