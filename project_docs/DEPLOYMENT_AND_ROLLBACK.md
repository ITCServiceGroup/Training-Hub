# Deployment and rollback runbook

## Safety boundary

The static GitHub Pages application and the Supabase backend are one release unit. The frontend in this repository depends on the new RPCs, policies, tables, private Storage behavior, and Edge Functions. Never publish the frontend first.

Production operations require an authenticated operator with access to the Training Hub Supabase project and the GitHub `github-pages` environment. Do not put credentials in command history, logs, issues, or committed files.

## Required release order

### 1. Establish the recovery point

1. Confirm `main` is clean and aligned with the intended remote commit.
2. Record the current Pages deployment and retain its artifact or commit SHA.
3. Export the live schema and migration ledger.
4. Back up authorization tables, access-code metadata, result evidence, training lifecycle records, audit ledgers, and Storage object metadata.
5. Record integrity counts and representative IDs without copying answer content or employee PII into logs.
6. Confirm a restoration rehearsal has succeeded in a non-production project.

### 2. Reconcile the database ledger

```bash
npx supabase login
npx supabase link --project-ref scmwpoowjhzawvmiyohz
npx supabase migration list
```

Compare the remote ledger with `supabase/migrations`. The historical `database/migrations` files are evidence, not a canonical replay chain. If the remote schema differs from the prerequisites asserted by a migration, stop and create a reviewed forward reconciliation migration. Do not mark an incompatible migration as applied and do not edit an already-applied file.

Production had an empty Supabase migration ledger when inventoried. The checksum-locked `20260902000000_production_schema_baseline.sql` exactly matches the schema-only production snapshot and must be registered as already applied before the first push. Never execute that baseline against the populated production schema.

```bash
npx supabase migration repair 20260902000000 --status applied --linked
npx supabase migration list --linked
```

The expected chain contains the baseline plus 12 forward migrations and ends with `20260902211800_allow_rls_policy_helpers.sql`. `20260902192134_remediate_security_review_findings.sql` intentionally validates existing score evidence before adding the range constraint and removes legacy plaintext codes. Any validation or prerequisite failure is a stop condition that requires data reconciliation, not a bypass.

### 3. Verify outside production

The free-tier project limit prevents a second hosted project. The approved substitute is a local PostgreSQL 15 Supabase stack rebuilt from the schema-only production snapshot plus synthetic fixtures. This does not replace the controlled production role smoke pass after deployment.

```bash
npx supabase db reset
npm run db:test
npm run db:lint
npm run verify
npm run test:e2e
```

Apply the forward migrations to the local production snapshot and verify:

- anonymous users cannot enumerate codes, retrieve correct answers, or directly write results;
- ordinary users cannot change role, market, active state, or permissions;
- managers can access only their authorized hierarchy and market;
- supervisors cannot read or mutate peer-team profiles, training records, results, or assignment audiences;
- inactive privileged profiles cannot author content or question-bank rows;
- bulk analytics return aggregates and result summaries without learner answer or timing payloads;
- training media rejects unapproved MIME types, oversize files, overwrite attempts, and cross-owner paths;
- one idempotency key and one access code produce at most one result under replay/concurrency;
- direct report object access fails and an authorized short-lived path succeeds;
- assignment, learning-path, certification, content-review, and compliance workflows operate with realistic fixtures;
- the old admin user-creation RPC cannot execute from a browser role.
- password recovery returns to the GitHub Pages project base and access codes do not remain in browser URLs.

Verified on 2026-09-02: snapshot-plus-fixture replay, blank `db reset`, 167 pgTAP assertions across two files, clean public/private lint, 56 unit/contract tests, production build and budgets, 9 desktop/mobile/axe checks, one intentional skip, and a real two-session single-code concurrency test.

### 4. Apply production backend changes

Run migration commands only after the reviewed plan and backup are present:

```bash
npx supabase db push --dry-run
npx supabase db push
```

Review the dry-run list before applying. It must list exactly the 12 forward migrations and must not list the baseline. Immediately compare the migration ledger and run read-only integrity checks after the push.

Deploy both Edge Functions:

```bash
npx supabase functions deploy admin-create-user
npx supabase functions deploy upload-quiz-pdf --no-verify-jwt
```

`admin-create-user` validates JWTs at the gateway. `upload-quiz-pdf` intentionally allows the public assessment caller through the gateway and then requires the short-lived, one-time upload token issued by the authoritative submission RPC. Do not change either setting without reviewing the corresponding function contract.

Set `SUPABASE_SERVICE_ROLE_KEY` only in the hosted function secret store. Confirm function logs are PII-redacted and perform one authorized and one denied call.

### 5. Publish the Pages artifact

1. Push the reviewed commit to `main`.
2. Wait for the validation workflow to pass.
3. In GitHub Actions, run **Validate and deploy GitHub Pages** manually with `deploy=true`.
4. Confirm the deployment is tied to the validated commit and protected production environment.

### 6. Production smoke verification

Use controlled test accounts and disposable test data:

- public home, study, login, legal, and invalid-code states render at phone and desktop widths;
- a valid code loads learner-safe questions with no correct-answer fields in the response;
- submission creates one authoritative result, consumes the code, and tolerates an idempotent retry;
- invalid, expired, used, and wrong-quiz code paths disclose no identifying details;
- report processing never changes the committed score and a raw Storage URL remains inaccessible;
- inactive and unauthorized users see the correct denial state;
- supervisor, AOM, and admin route/action access matches `AUTHORIZATION_MATRIX.md`;
- assignment creation, learner start/completion, learning-path prerequisites, waiver, certification status, content review/publication, and compliance queues work within scope;
- browser console and function logs contain no tokens, full answer payloads, or employee PII;
- the database/security advisors show no new critical finding.

Record the release commit, migration versions, function versions, smoke-test operator, and outcome in the release record.

## Rollback and recovery

Database rollback is a reviewed forward-fix operation. Never run destructive reset commands, delete evidence rows, or rewrite applied migrations in production.

1. Stop new frontend traffic by redeploying the last known-good Pages artifact if the current client is unsafe.
2. Keep the replacement backend APIs in place if the previous frontend can coexist with them.
3. For a database defect, create a timestamped forward migration that corrects the behavior while preserving results, completions, adjustments, and audit history.
4. Reopen legacy grants or public Storage only if the incident commander approves a time-bounded emergency exception and compensating monitoring. Prefer disabling a broken workflow over weakening authorization.
5. If an Edge Function is defective, redeploy its known-good source. Do not expose service credentials to bypass it.
6. Verify integrity counts, migration ledger, denial tests, and known-good workflows after recovery.
7. Document cause, affected release, recovery actions, and required follow-up.

## Stop conditions

Stop the release if any of the following is true:

- live project ownership, schema, or migration history cannot be confirmed;
- a backup or restoration rehearsal is missing;
- local production-snapshot replay or a negative authorization test fails;
- the migration dry run contains an unexpected object;
- an Edge Function secret or gateway setting is missing;
- the frontend build does not match the deployed backend contract;
- CI, browser, accessibility, source-map, bundle, or dependency gates fail;
- production smoke verification cannot be run with controlled accounts.
