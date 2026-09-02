# Supabase local development and recovery

## Canonical baseline

`supabase/migrations/20260902000000_production_schema_baseline.sql` is the
schema-only production baseline captured on 2026-09-02 and normalized only for
trailing comment whitespace. It contains no table rows, Auth users, Storage
objects, credentials, or secret values. Its reviewed SHA-256 is:

```text
c0287da9bf30a331e673f3d848211bc77c45d4b5b23559f3e228e44a86031ed0
```

`npm run db:static` enforces that checksum. Never edit the baseline after it is
registered in a migration ledger. Capture every later database change in a new
forward migration created with `supabase migration new <name>`.

The historical `database/migrations` directory remains evidence of past manual
changes, not the replay ledger. The canonical chain is now the 12 timestamped
files under `supabase/migrations`: one production baseline followed by 11
forward changes.

## Verified local setup

The chain was verified with Supabase CLI 2.116.0, PostgreSQL 15, Docker, and
Colima on 2026-09-02. Two independent rehearsals succeeded:

1. Restore the schema-only production snapshot, insert synthetic legacy rows
   and production-like bucket metadata, then apply all forward migrations.
2. Run `supabase db reset --local --no-seed` from a blank Supabase database with
   no manual restore step.

Both rehearsals applied every migration. The final blank reset produced 33
public tables, a private 10 MiB PDF bucket, the allowlisted 50 MiB media bucket,
and the intended four-function anonymous RPC allowlist. Database lint reported
no public/private schema errors and all 127 pgTAP assertions passed. A real
two-session concurrency check accepted exactly one submission against a
single-use synthetic code.

## Local commands

```bash
supabase start
supabase db reset --local
npm run db:lint
npm run db:test
npm run verify
npm run test:e2e
```

Docker must be available for the local Supabase stack. Keep `.temp`,
`.local-backups`, local environment files, access tokens, database passwords,
service-role keys, and generated signing keys out of Git.

`supabase/seed.sql` intentionally contains no persistent identities. Behavioral
database fixtures are created inside the pgTAP transaction and rolled back, so
local seeds cannot be mistaken for production employees.

## Existing production project

Project `scmwpoowjhzawvmiyohz` had a deployed application schema but an empty
Supabase migration ledger when inventoried. Before the first production push,
verify the baseline checksum and live schema again, then register only version
`20260902000000` as already applied. Do not execute the baseline against the
existing production schema.

```bash
supabase migration repair 20260902000000 --status applied --linked
supabase migration list --linked
supabase db push --dry-run
```

The dry run must list only the 11 forward migrations. Any other result is a stop
condition.

## Rollback approach

Production changes are rolled back only with a reviewed forward migration:

- restore prior grants and policies only if the replacement learner path is
  simultaneously disabled;
- make the PDF bucket public only as an emergency, time-limited operational
  exception;
- preserve `quiz_results`, `security_audit_log`, completion evidence, and
  code-consumption records;
- do not remove new columns until every application version using them has
  retired; and
- restore a prior GitHub Pages artifact independently from database recovery.

Because result immutability and code consumption are evidence controls, never
use destructive reset commands against production.
