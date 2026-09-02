# Training Hub Phase 0 Baseline

**Status:** In progress
**Started:** 2026-09-02
**Scope:** TH-001 through TH-003 from `IMPLEMENTATION_PLAN.md`
**Production project reference:** `scmwpoowjhzawvmiyohz`

## Purpose

This document records the verified starting state for the Training Hub improvement program. It deliberately separates:

- behavior confirmed against the deployed production API;
- behavior inferred from checked-in migrations or application code; and
- facts that require Supabase project-management or direct database access.

No production rows, policies, functions, files, or configuration were modified while producing this baseline.

## Executive result

Three high-priority exposures were confirmed through anonymous, non-mutating production requests:

1. An anonymous caller can retrieve at least one `access_codes` row, including a non-null bearer code and non-null employee email, LDAP, market, and supervisor fields.
2. An anonymous caller can retrieve at least one `questions` row containing the `correct_answer` column.
3. An anonymous caller can list at least one object in `quiz-pdfs` and download a listed PDF through the public-object endpoint.

No access-code value, answer value, employee identifier, object name, PDF content, or credential was printed or stored during these checks.

These confirmations justify prioritizing the assessment-integrity and report-privacy work. They do not by themselves prove the behavior of update, insert, delete, privileged functions, or authenticated role boundaries.

## Repository and Git baseline

| Check | Result |
| --- | --- |
| Branch | `main` |
| Local commit | `bb02234847105200e9961660231dcbb2d6feb92b` |
| `origin/main` | `bb02234847105200e9961660231dcbb2d6feb92b` |
| Pre-existing working change | `IMPLEMENTATION_PLAN.md` was untracked and created for this program |
| Branch divergence | None observed |
| Implementation branches/worktrees | None created |

## Available access and tooling

### Workspace

- No local `.env`, `.env.local`, `.env.automation`, database URL, database password, service-role credential, or Supabase access token was found.
- `.env.example` contains only placeholder frontend configuration names.
- No system `supabase`, `psql`, `docker`, `node`, or `npm` command is on `PATH`.
- A bundled Node runtime is available through the Codex workspace runtime.
- The root does not contain a standard `supabase/config.toml`.
- A nested configuration exists at `supabase/functions/supabase/config.toml`, indicating an incorrectly nested or partially initialized Supabase project.

### Supabase connector

The authenticated Supabase connector is functional, but the Training Hub project is not among the projects visible to it. Only unrelated projects were returned. Therefore the connector could not be used for:

- `pg_policy`, grants, function, trigger, or view inspection;
- the live migration ledger;
- Storage bucket configuration and policies;
- deployed Edge Function inventory;
- Auth settings;
- database/security advisors; or
- schema export and backup.

Project-level access to `scmwpoowjhzawvmiyohz` remains a Phase 0 dependency.

## Live anonymous probes

### Method

The checks used the public frontend key already committed in `src/pages/admin/components/PDFModal.jsx`. Requests were sent without an authenticated user token. Only HTTP status, row presence, object presence, and counts limited to one were returned to the audit output.

All probes were read-only:

- table probes used `GET` with `limit=1`;
- Storage listing used a one-object list request; and
- public-object verification used `HEAD`.

### Results

| Surface | Anonymous request | Result | Interpretation |
| --- | --- | --- | --- |
| Access codes | Initial ID-only probe followed by a field-presence probe, each with `limit=1` | HTTP 200; one row; `code`, `email`, `ldap`, `market`, `supervisor`, `quiz_id`, `expires_at`, and `is_used` were returned and non-null | **Confirmed exposure:** anonymous callers can retrieve a live bearer code and associated employee data. Only field names and null/non-null flags were emitted; no values were printed or stored. |
| Correct answers | `GET questions?select=id,correct_answer&limit=1` | HTTP 200; one row | **Confirmed exposure:** official answer data is reachable anonymously for at least one question. The answer value was not returned to the audit output. |
| Quiz results read | `GET quiz_results?select=id&limit=1` | HTTP 200; zero rows | Inconclusive. This may indicate RLS denial, an empty visible result set, or both. It says nothing about inserts. |
| Report object listing | List `quiz-pdfs`, limit one | HTTP 200; one object | **Confirmed exposure:** an anonymous caller can enumerate at least one report object name. The name was not returned to the audit output. |
| Report download | `HEAD` public URL for the listed object | HTTP 200 | **Confirmed exposure:** a listed quiz-result PDF is publicly downloadable without a user session. |

### Probes intentionally not performed

The following operations could mutate production or create misleading records and were not attempted:

- updating a user profile to test self-promotion;
- updating or consuming an access code;
- inserting a fabricated quiz result;
- creating, updating, or deleting a Storage object;
- calling user-management functions;
- submitting a quiz; or
- changing bucket or RLS configuration.

These behaviors require policy/grant inspection or rollback-safe testing in a non-production environment.

## Checked-in database inventory

### Schema snapshot

`database/schema_snapshot.json` reports:

- generation timestamp: `2025-01-15T00:00:00Z`;
- database label: `training_hub_v2`;
- 14 tables; and
- two public Storage buckets: `media-library` and `quiz-pdfs`.

The snapshot predates the RBAC migrations dated December 2025 and does not include `user_profiles` or `content_approval_requests`. It cannot be treated as the current schema or as evidence that RLS is correct.

Tables represented in the old snapshot:

- `access_codes`
- `categories`
- `markets`
- `media_library`
- `questions`
- `quiz_questions`
- `quiz_results`
- `quizzes`
- `sections`
- `study_guide_templates`
- `study_guides`
- `supervisors`
- `user_dashboards`
- `user_initialization`

Later migrations also create:

- `user_profiles`
- `content_approval_requests`
- the `user_role` enum with `super_admin`, `admin`, `aom`, `supervisor`, `lead_tech`, and `technician`.

### Migration history

| Inventory item | Checked-in result |
| --- | --- |
| SQL migration files | 33 |
| Historical `CREATE POLICY` statements | 180 |
| Historical `SECURITY DEFINER` references | 21 |
| Historical `CREATE TRIGGER` statements | 9 |
| Duplicate numeric prefix | `24` |
| Current migration directory | `database/migrations` rather than standard `supabase/migrations` |

The counts are historical occurrences, not the expected final live count, because later files drop and recreate earlier policies and functions.

### Reproducibility concerns

1. `02_create_quiz_system.sql` uses inline `COMMENT` syntax in column definitions that is not valid ordinary PostgreSQL syntax.
2. Migration prefix `24` is used twice, leaving order dependent on filename sorting rather than a unique migration sequence.
3. The old schema snapshot predates major RBAC migrations.
4. The root lacks a standard Supabase configuration and migration ledger.
5. A duplicate nested Edge Function scaffold exists under `supabase/functions/supabase/functions/upload-quiz-pdf`.
6. Some Storage migrations use `CREATE POLICY IF NOT EXISTS`, which must be verified against the actual Postgres version and successfully applied history.
7. Migration replay has not been proven on a clean database.

## Privileged function inventory

The migration history defines or replaces these security-sensitive helpers:

- `get_user_profile()`
- `get_user_role()`
- `get_user_market_id()`
- `is_admin()`
- `is_super_admin()`
- `can_view_content(...)`
- `can_edit_content(...)`
- `can_create_content()`
- `can_manage_user(...)`
- `admin_create_user(...)`

The migrations also define maintenance and dashboard trigger functions.

Source-level concerns requiring live verification:

- several authorization helpers are `SECURITY DEFINER` in `public`;
- the later search-path migration uses `public, auth` for several privileged helpers instead of an empty path with fully qualified objects;
- explicit `REVOKE EXECUTE ... FROM PUBLIC` is not consistently visible for all privileged functions; and
- `admin_create_user` writes directly into Auth schema objects rather than using a narrowly controlled current Auth administration interface.

The final owners, definitions, and execute grants must be queried live before remediation SQL is written.

## Application data paths

### Access codes

`src/services/api/accessCodes.js` directly selects, inserts, updates, and deletes `access_codes` from the browser. Validation also selects a full code row and associated quiz data from the browser.

### Official questions and grading

`src/components/quiz/QuizTaker.jsx` grades official assessments in the browser using `question.correct_answer`. It then independently:

1. generates/uploads a PDF;
2. inserts a result;
3. marks the access code used; and
4. shows completion.

There is no single atomic boundary across those operations.

### Result reports

`supabase/functions/upload-quiz-pdf/index.ts`:

- accepts browser-supplied PDF data, LDAP, quiz ID, and code;
- uses the service-role key;
- validates only that a matching unused code exists and is not expired;
- does not visibly enforce code-to-quiz or code-to-LDAP binding;
- constructs a filename from the supplied LDAP;
- uploads to `quiz-pdfs`; and
- returns a public URL.

The checked-in Storage migration configures `quiz-pdfs` as public with no file-size or MIME allowlist. The production anonymous probe confirmed that at least one report is listable and downloadable.

## Finding status

| Finding | Status | Evidence needed next |
| --- | --- | --- |
| Anonymous access-code and employee-data retrieval | **Live confirmed** | Live grants/policies and legitimate client dependencies; no further sensitive row reads are needed |
| Anonymous correct-answer access | **Live confirmed** | Live grants/policies; determine every affected quiz/question visibility path |
| Public result PDF listing/download | **Live confirmed** | Live bucket settings, Storage policies, object counts, retention, and legitimate consumers |
| Client-authoritative official grading | **Source confirmed** | Production network trace and deployed bundle parity |
| Non-atomic result/code/report flow | **Source confirmed** | Production function version and database trigger inventory |
| Self-service role/market escalation | **Source plausible; live unverified** | Live table grants and profile update policies; rollback-safe role tests outside production |
| Anonymous arbitrary code updates | **Source plausible; live unverified** | Live update grants/policies; non-production negative test |
| Anonymous arbitrary result insertion | **Source plausible; live unverified** | Live insert grants/policies; non-production negative test |
| Broad privileged-function execution | **Source plausible; live unverified** | Live `pg_proc`, owners, definitions, and ACLs |
| Migration replay failure | **Source plausible; not executed** | Supabase CLI/local database and clean replay |
| Auth/session settings risk | **Unverified** | Project-level Auth settings and representative accounts |

## Required access to finish Phase 0

One of the following authorized paths is needed for the Training Hub project:

1. Add the Training Hub organization/project to the connected Supabase connector; or
2. provide a project-scoped Supabase MCP connection; or
3. provide a read-only database connection capable of querying catalog metadata; or
4. run reviewed inventory SQL in the Supabase SQL editor and provide the results.

Required read-only catalogs/settings include:

- `pg_class`, `pg_namespace`, `pg_attribute`, and `pg_constraint`;
- `pg_policy` and `pg_policies`;
- `information_schema.role_table_grants`, routine grants, and sequence grants;
- `pg_proc`, function owners, ACLs, security mode, and configuration;
- `pg_trigger`;
- view definitions and security mode;
- `storage.buckets` and Storage policies;
- `supabase_migrations.schema_migrations`;
- deployed Edge Functions;
- Data API schemas/default privileges;
- Auth configuration; and
- security/performance advisors.

## Next safe actions

1. Obtain project-level read-only access and complete TH-001.
2. Run `database/audits/phase_0_inventory.sql` through an authorized catalog connection and review the results before sharing them.
3. Review and approve `project_docs/AUTHORIZATION_MATRIX.md`.
4. Export the live schema and migration ledger before writing corrective SQL.
5. Establish a local Supabase project and prove clean migration replay.
6. Create non-production role and access-code fixtures.
7. Write negative pgTAP tests that reproduce each confirmed or plausible authorization failure.
8. Only after those tests fail for the expected reason, design the corrective expand-migrate-contract changes.

## Current Supabase guidance

- RLS and grants must both be explicit and tested: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Data API exposure must be configured intentionally: <https://supabase.com/docs/guides/api/securing-your-api>
- Private buckets subject downloads to access control; public buckets bypass download access control: <https://supabase.com/docs/guides/storage/buckets/fundamentals>
- Storage authorization uses policies on `storage.objects`: <https://supabase.com/docs/guides/storage/security/access-control>
- Relevant breaking changes must be checked before implementation: <https://supabase.com/changelog?types=breaking-change>
