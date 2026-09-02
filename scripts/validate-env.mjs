const requiredVariables = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const missing = requiredVariables.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  console.error(
    `Missing required build environment variables: ${missing.join(", ")}`,
  );
  process.exit(1);
}

try {
  const url = new URL(process.env.VITE_SUPABASE_URL);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) {
    throw new Error("expected an HTTPS *.supabase.co URL");
  }
} catch (error) {
  console.error(`VITE_SUPABASE_URL is invalid: ${error.message}`);
  process.exit(1);
}

if (process.env.VITE_SUPABASE_ANON_KEY.length < 40) {
  console.error(
    "VITE_SUPABASE_ANON_KEY does not look like a publishable Supabase key",
  );
  process.exit(1);
}

console.log(
  "Required build environment variables are present and structurally valid.",
);
