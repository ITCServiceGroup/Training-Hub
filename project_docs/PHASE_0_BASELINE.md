# Training Hub Phase 0 Baseline

**Status:** Read-only production inventory complete; protected data recovery approval pending
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

Direct catalog inventory later confirmed the corresponding grants, policies, function ACLs, and Storage configuration. These findings are no longer source-only hypotheses.

## Repository and Git baseline

| Check                             | Result                                                              |
| --------------------------------- | ------------------------------------------------------------------- |
| Branch                            | `main`                                                              |
| Local commit                      | `bb02234847105200e9961660231dcbb2d6feb92b`                          |
| `origin/main`                     | `bb02234847105200e9961660231dcbb2d6feb92b`                          |
| Pre-existing working change       | `IMPLEMENTATION_PLAN.md` was untracked and created for this program |
| Branch divergence                 | None observed                                                       |
| Implementation branches/worktrees | None created                                                        |

## Available access and tooling

The Supabase CLI is authenticated and linked to production project
`scmwpoowjhzawvmiyohz`. The local environment now has Homebrew, Colima, Docker,
Supabase CLI 2.116.0, and a PostgreSQL 15 local stack. The canonical root
configuration is `supabase/config.toml`; the obsolete nested scaffold has been
removed.

A schema-only production backup is retained locally under `.local-backups`
(ignored by Git, mode 0600) and its SHA-256 is recorded in the local-development
runbook. It contains no table rows, Auth users, or Storage objects. A full data
backup would copy employee/result data and the 84 legacy plaintext codes, so it
has not been created without explicit approval.

## Live catalog inventory

Read-only production catalog queries confirmed:

- 16 application tables in `public`, all with RLS enabled;
- 68 policies, most historically targeted at `public` rather than narrow API
  roles;
- 84 access-code rows, 61 quiz-result rows, 305 question rows, 454 quiz-question
  links, 23 quizzes, 20 study guides, and 4 user profiles;
- 84 plaintext access codes requiring the reviewed hash-only conversion;
- no duplicate normalized codes, malformed multi-select answers, out-of-range
  scores, orphaned quiz references, or invalid profile roles;
- broad anonymous table privileges and policies permitting code reads/updates,
  result insertion, and answer-bearing question reads;
- both `quiz-pdfs` and `media-library` configured public with no MIME or size
  limits;
- ten public `SECURITY DEFINER` functions callable by browser roles;
- an empty Supabase migration ledger despite the deployed schema;
- one deployed legacy Edge Function, `upload-quiz-pdf`; and
- 84 advisor findings in the deployed baseline: 26 warnings and 58 information
  items, including Security Definer execution exposure, leaked-password
  protection disabled, and insufficient MFA options.

The deployed database is PostgreSQL 15.14. No production mutation was performed
during inventory.

## Live anonymous probes

### Method

The checks used the public frontend key already committed in `src/pages/admin/components/PDFModal.jsx`. Requests were sent without an authenticated user token. Only HTTP status, row presence, object presence, and counts limited to one were returned to the audit output.

All probes were read-only:

- table probes used `GET` with `limit=1`;
- Storage listing used a one-object list request; and
- public-object verification used `HEAD`.

### Results

| Surface               | Anonymous request                                                             | Result                                                                                                                                | Interpretation                                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Access codes          | Initial ID-only probe followed by a field-presence probe, each with `limit=1` | HTTP 200; one row; `code`, `email`, `ldap`, `market`, `supervisor`, `quiz_id`, `expires_at`, and `is_used` were returned and non-null | **Confirmed exposure:** anonymous callers can retrieve a live bearer code and associated employee data. Only field names and null/non-null flags were emitted; no values were printed or stored. |
| Correct answers       | `GET questions?select=id,correct_answer&limit=1`                              | HTTP 200; one row                                                                                                                     | **Confirmed exposure:** official answer data is reachable anonymously for at least one question. The answer value was not returned to the audit output.                                          |
| Quiz results read     | `GET quiz_results?select=id&limit=1`                                          | HTTP 200; zero rows                                                                                                                   | Inconclusive. This may indicate RLS denial, an empty visible result set, or both. It says nothing about inserts.                                                                                 |
| Report object listing | List `quiz-pdfs`, limit one                                                   | HTTP 200; one object                                                                                                                  | **Confirmed exposure:** an anonymous caller can enumerate at least one report object name. The name was not returned to the audit output.                                                        |
| Report download       | `HEAD` public URL for the listed object                                       | HTTP 200                                                                                                                              | **Confirmed exposure:** a listed quiz-result PDF is publicly downloadable without a user session.                                                                                                |

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

| Inventory item                           | Checked-in result                                                |
| ---------------------------------------- | ---------------------------------------------------------------- |
| SQL migration files                      | 33                                                               |
| Historical `CREATE POLICY` statements    | 180                                                              |
| Historical `SECURITY DEFINER` references | 21                                                               |
| Historical `CREATE TRIGGER` statements   | 9                                                                |
| Duplicate numeric prefix                 | `24`                                                             |
| Current migration directory              | `database/migrations` rather than standard `supabase/migrations` |

The counts are historical occurrences, not the expected final live count, because later files drop and recreate earlier policies and functions.

### Reproducibility concerns

1. `02_create_quiz_system.sql` uses inline `COMMENT` syntax in column definitions that is not valid ordinary PostgreSQL syntax.
2. Migration prefix `24` is used twice, leaving order dependent on filename sorting rather than a unique migration sequence.
3. The old schema snapshot predates major RBAC migrations.
4. The original root lacked a standard Supabase configuration and migration ledger; a canonical root project and checksum-locked baseline now replace that gap.
5. The original duplicate nested Edge Function scaffold was removed after confirming it was unused.
6. Historical Storage SQL remains non-canonical; reviewed forward migrations now own final Storage policies and bucket limits.
7. Clean PostgreSQL 15 replay is now proven both from the production schema snapshot and from a blank `supabase db reset`.

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

| Finding                                           | Status                          | Evidence needed next                                                                                |
| ------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| Anonymous access-code and employee-data retrieval | **Live confirmed**              | Live grants/policies and legitimate client dependencies; no further sensitive row reads are needed  |
| Anonymous correct-answer access                   | **Live confirmed**              | Live grants/policies; determine every affected quiz/question visibility path                        |
| Public result PDF listing/download                | **Live confirmed**              | Live bucket settings, Storage policies, object counts, retention, and legitimate consumers          |
| Client-authoritative official grading             | **Source confirmed**            | Production network trace and deployed bundle parity                                                 |
| Non-atomic result/code/report flow                | **Source confirmed**            | Production function version and database trigger inventory                                          |
| Self-service role/market escalation               | **Live policy/grant confirmed** | Corrective RPC/grant behavior passes local pgTAP; controlled post-deploy denial remains             |
| Anonymous arbitrary code updates                  | **Live confirmed**              | Corrective grants/RLS pass local pgTAP; controlled post-deploy denial remains                       |
| Anonymous arbitrary result insertion              | **Live confirmed**              | Corrective immutable service boundary passes local runtime and concurrency tests                    |
| Broad privileged-function execution               | **Live confirmed**              | Final local state exposes exactly four anonymous functions and denies maintenance/service functions |
| Migration replay failure                          | **Resolved locally**            | Snapshot replay and blank `db reset` both pass all 12 migrations                                    |
| Auth/session settings risk                        | **Partially live confirmed**    | Leaked-password protection and MFA options remain dashboard/operator configuration work             |

## Remaining release prerequisites

1. Approve either a protected local full-data backup or the explicit decision to
   proceed using Supabase's available recovery facilities. The current
   schema-only backup is insufficient to restore employee/result rows.
2. Approve the authorization matrix and the interim non-destructive privacy
   defaults documented in `PRIVACY_RETENTION_DECISIONS.md`.
3. Register only the checksum-locked baseline migration as already applied in
   the empty production migration ledger.
4. Confirm the production dry run lists exactly the 11 forward migrations.
5. Apply the backend release, deploy both Edge Functions, and run controlled
   allow/deny smoke checks before publishing the matching Pages artifact.

Local preparation is complete: the production schema snapshot and synthetic
legacy fixtures replay cleanly, a blank database resets from version control,
127 pgTAP assertions pass, database lint is clean, and a real concurrent
single-use-code test commits one result only.

## Current Supabase guidance

- RLS and grants must both be explicit and tested: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Data API exposure must be configured intentionally: <https://supabase.com/docs/guides/api/securing-your-api>
- Private buckets subject downloads to access control; public buckets bypass download access control: <https://supabase.com/docs/guides/storage/buckets/fundamentals>
- Storage authorization uses policies on `storage.objects`: <https://supabase.com/docs/guides/storage/security/access-control>
- Relevant breaking changes must be checked before implementation: <https://supabase.com/changelog?types=breaking-change>
