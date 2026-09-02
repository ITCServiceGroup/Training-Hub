# Supabase local development and recovery

## Current baseline constraint

The repository's historical `database/migrations` directory is evidence of past manual changes, not a reliable Supabase migration ledger. It contains renamed objects, obsolete policies, and SQL that cannot safely be replayed as a production baseline. Do not copy those files into `supabase/migrations` or mark them applied remotely.

The canonical production baseline must be created with an account that can access project `scmwpoowjhzawvmiyohz`:

1. Install the same Supabase CLI version used by CI.
2. Run `supabase login`, then `supabase link --project-ref scmwpoowjhzawvmiyohz`.
3. Compare `supabase migration list` with the production migration ledger.
4. Back up schema, authorization tables, result rows, access-code rows, and Storage object metadata.
5. Pull the production schema with `supabase db pull` and review the generated baseline before marking it applied.
6. Start the local stack, replay the baseline plus the new migrations, and run `supabase test db`.
7. Run `supabase db lint`, the database/security advisors, and a rollback rehearsal before any production push.

The five new timestamped migrations are forward-only changes. They deliberately assert required deployed tables so a drifted database fails before making a partial security change.

## Local commands

```bash
supabase start
supabase db reset
supabase test db
supabase db lint --local
npm run verify
```

Docker must be available for the local Supabase stack. Keep `.temp`, local environment files, access tokens, database passwords, service-role keys, and generated signing keys out of Git.

## Rollback approach

These changes should be rolled back only with a reviewed forward migration:

- restore prior grants and policies only if the replacement learner path is simultaneously disabled;
- make the PDF bucket public only as an emergency, time-limited operational exception;
- preserve `quiz_results`, `security_audit_log`, and code-consumption records;
- do not remove new columns until all application versions using them have been retired;
- restore a prior GitHub Pages artifact independently from database rollback.

Because result immutability and code consumption are evidence controls, never use destructive reset commands against production.
