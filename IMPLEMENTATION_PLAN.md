# Training Hub Implementation Plan

**Status:** Local implementation and verification complete; staging/live rollout gates remain
**Last updated:** 2026-09-02
**Repository:** `ITCServiceGroup/Training-Hub`
**Default branch:** `main`
**Production application:** <https://itcservicegroup.github.io/Training-Hub/>

## Purpose

This is the master implementation roadmap for improving Training Hub across security, assessment integrity, database reproducibility, engineering quality, architecture, accessibility, responsive design, content governance, and training-system capabilities.

The order is intentional. Authorization and assessment integrity must be addressed before broad refactoring or new product work. Database findings from the repository must be verified against the live Supabase project before any production change because the checked-in migration history may not exactly match the deployed schema.

## Progress legend

- `[ ]` Not started
- `[-]` In progress
- `[x]` Completed and verified
- `[!]` Blocked or requires a decision

Do not mark an item complete merely because code was written. Completion requires the listed acceptance criteria, tests, documentation, and deployment verification.

## Implementation checkpoint - 2026-09-02

The repository now contains the planned local implementation across Phases 1-7. This does not mean the production release is complete: clean database replay, pgTAP execution, staging role-boundary tests, migration-ledger reconciliation, privacy-owner decisions, controlled deployment, and post-deployment smoke verification still require the Training Hub Supabase project, Docker, production-like fixtures, and authorized operators.

| Area                     | Implemented locally                                                                                                                                                                              | Verification state                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Assessment integrity     | Learner-safe loader, server-held answers, hash-only codes, per-caller failed-validation limits, transactional/idempotent grading, immutable results, independent private-report upload           | Unit/contract/static SQL/browser checks pass; real PostgreSQL concurrency and live negative tests pending            |
| Authorization            | Named frontend permissions, route guards, direct/lead-mediated supervisor hierarchy, active-profile helpers, aggregate-only question analytics, hardened grants/RLS, legacy policy cleanup       | Frontend tests and 115 pgTAP assertions authored; pgTAP execution and live catalog verification pending              |
| Storage and provisioning | Private report bucket, atomic finalization, opaque keys, one-time upload token, allowlisted/owner-scoped public training media, hierarchy-safe `admin-create-user` Edge Function                 | Both functions parse; staging deployment and authorized/denied calls pending                                         |
| Delivery safety          | Manual production deployment, validation workflow, audit, CodeQL, Dependabot, format/source/build/bundle/diagnostic gates                                                                        | Local equivalent passes; remote GitHub workflow has not run on this worktree                                         |
| Frontend reliability     | Auth cleanup, explicit account states, error boundary, mobile admin drawer, focus management, accessibility smoke coverage                                                                       | Unit, desktop/mobile Playwright, and axe checks pass for covered public routes; authenticated fixture matrix pending |
| Architecture/performance | Domain training feature, centralized contracts and permissions, independently loaded validated templates, lazy chart/export loading, aggregate-only bounded analytics, source and bundle budgets | Build and route budgets pass; production performance telemetry targets remain a product/operations task              |
| Training lifecycle       | Assignments, audiences, enrollments, prerequisites, learning paths, completions, certification states, content review/publication/republish, compliance queues                                   | Schema/RPC/UI implementation and static checks complete; staging workflow and scheduler operation pending            |
| Privacy/retention        | Least-privilege access, private reports, redacted diagnostics, explicit decision record                                                                                                          | Destructive retention remains disabled until business/privacy/legal approval                                         |

Local evidence produced in this worktree:

- 56 unit/contract tests pass with 97.18% statement/line coverage.
- Nine forward-only migrations parse with PostgreSQL's parser and pass static contracts for 59 privileged functions.
- The pgTAP suite declares and contains 115 authorization/integrity assertions.
- Both Edge Function entrypoints parse as TypeScript.
- Production build, source-map prohibition, 314-module source budgets, route/template bundle budgets, and a 119-asset production-diagnostic prohibition pass.
- Nine desktop/mobile Playwright and axe checks pass and one desktop-only mobile check is intentionally skipped, including credential-free access-code URL verification.
- Full and production-only dependency audits report zero vulnerabilities at the time of this checkpoint.
- A standard Codex Security scan produced 20 validated findings; all 20 have a local code or removal remediation. See `project_docs/SECURITY_REMEDIATION.md` for the evidence and remaining staging gates.
- A final direct security review of the post-scan delta found and fixed an expired-code rate-limit bypass, serialized concurrent content republishing, and tightened telemetry field validation. The desktop diff-scan workbench could not create a follow-up scan because its working-tree selection was stale after `HEAD` changed, so the original full scan remains the canonical generated report.

See `project_docs/DEPLOYMENT_AND_ROLLBACK.md` for the exact order and stop conditions required to turn this local implementation into a production release.

## Guiding principles

1. **Prove live state first.** Inspect live grants, RLS policies, functions, triggers, Storage settings, and migration history before changing authorization.
2. **Use expand-migrate-contract.** Introduce replacement APIs, migrate the frontend, verify production traffic, and only then revoke legacy access.
3. **Keep official assessments server-authoritative.** The browser may collect answers but must not receive official correct answers, determine the authoritative score, or directly write official results.
4. **Make operations atomic and idempotent.** Result creation and access-code consumption must succeed or fail together.
5. **Treat grants and RLS separately.** Explicitly configure both and test allow and deny behavior for every client role.
6. **Prefer least privilege.** Privileged functions require explicit execute grants, a fixed `search_path`, narrowly scoped behavior, and authorization checks.
7. **Protect historical evidence.** Official attempts, certification decisions, and administrative corrections must be auditable and should not be silently overwritten.
8. **Preserve user work.** Before Git changes, inspect status and tracking, avoid unrelated files, and stage explicit paths only.
9. **Work directly on `main`.** Do not create branches or worktrees unless explicitly requested. Because pushes to `main` currently deploy automatically, delivery controls must be improved before pushing high-risk changes.
10. **Verification is part of implementation.** Every database or application fix requires proportionate automated and live verification.

## Current risk evidence

The following repository evidence motivated the priority order. These are hypotheses about production until the live project is inspected.

- `database/migrations/29_final_performance_fixes.sql`: the profile update policy appears to allow a user to update their entire own profile row, including authorization attributes unless grants or other controls prevent it.
- `database/migrations/32_fix_access_codes_rls.sql`: anonymous and authenticated roles appear able to read all access-code rows, and anonymous users appear able to update code rows.
- `database/migrations/26_fix_rls_issues.sql`: official quiz results appear insertable by anyone.
- `database/migrations/28_optimize_rls_policies.sql`: official question rows, including correct answers, may be retrievable by learners.
- `src/components/quiz/QuizTaker.jsx`: official grading, result construction, PDF upload, result insertion, and code consumption occur in separate browser-controlled steps.
- `supabase/functions/upload-quiz-pdf/index.ts`: PDF upload uses service-role privileges but does not appear to verify that the code belongs to the submitted quiz; payload size, filename, and file content validation are also insufficient.
- `database/migrations/15_create_storage_buckets.sql`: the result PDF bucket is configured as public with no recorded file-size or MIME limits.
- `src/pages/admin/components/PDFModal.jsx`: production Supabase configuration is hardcoded instead of using the shared environment-aware client.
- `src/App.jsx` and `src/components/auth/ProtectedRoute.jsx`: the admin route tree is authenticated but not consistently permission-gated by route.
- `src/contexts/AuthContext.jsx`: auth subscription cleanup is returned from an inner async function and is therefore not used by React.
- `src/utils/debugHelper.js`: production debug helpers can expose local storage and complete session information.
- `.github/workflows/deploy.yml`: deployment currently runs install and build only; there are no lint, unit, database, RLS, accessibility, or end-to-end gates.

## Target architecture

```text
Learner SPA
  |
  |-- Load assessment using access code
  |     `-- Server returns learner-safe questions without correct answers
  |
  `-- Submit answers + idempotency key
          |
          v
  Transactional assessment service
    1. Lock and validate the code
    2. Verify code-to-quiz binding and expiry
    3. Validate answer structure
    4. Grade with server-held answers
    5. Insert an immutable result
    6. Consume the code
    7. Write an audit event
    8. Commit all changes together
          |
          |-- Return limited result feedback
          `-- Generate/store report in private Storage

Admin SPA
  `-- Authenticated permission-gated APIs
        |-- Content and quiz management
        |-- User and role administration
        |-- Market-scoped analytics
        `-- Authorized signed report access
```

## Phase 0 - Prove the production baseline

**Estimate:** 2-3 engineering days
**Dependencies:** Supabase project access; representative test accounts
**Status:** `[-]`

### Phase 0 progress - 2026-09-02

- Repository `main` is aligned with `origin/main` at `bb02234847105200e9961660231dcbb2d6feb92b`.
- The connected Supabase account does not expose the Training Hub project, so catalog, grants, policies, migration ledger, Auth settings, advisors, and deployed-function inventory remain access-gated.
- Anonymous read-only production probes confirmed access-code enumeration, correct-answer retrieval, and public quiz-PDF listing/download without storing sensitive values.
- Checked-in schema, migrations, privileged functions, Storage code, and assessment data paths are documented in `project_docs/PHASE_0_BASELINE.md`.
- A proposed role and resource permission model is documented in `project_docs/AUTHORIZATION_MATRIX.md` and requires product-owner approval before RLS implementation.
- A read-only catalog inventory query is prepared at `database/audits/phase_0_inventory.sql` for use as soon as Training Hub project access is available.

### TH-001 - Inventory the live Supabase project

- [ ] Capture tables, columns, constraints, indexes, triggers, and views.
- [ ] Capture grants for `anon`, `authenticated`, service roles, tables, sequences, and functions.
- [ ] Capture every RLS policy, target role, command, `USING`, and `WITH CHECK` expression.
- [ ] Confirm RLS status on every exposed-schema table.
- [ ] Inventory functions, owners, security mode, `search_path`, and execute grants.
- [ ] Inventory Storage bucket privacy, MIME restrictions, file limits, and object policies.
- [ ] Inventory deployed Edge Functions and environment configuration without exposing secret values.
- [ ] Compare the remote migration ledger to `database/migrations` and the nested `supabase` directories.
- [ ] Record Auth configuration relevant to sessions, passwords, and enabled providers.
- [ ] Record Data API exposed schemas and default privileges.
- [ ] Run Supabase database and security advisors if supported by the installed tooling.

### TH-002 - Approve an authorization matrix

Define expected `select`, `insert`, `update`, `delete`, and privileged actions for:

- [ ] Signed-out quiz taker
- [ ] Authenticated ordinary user
- [ ] Supervisor
- [ ] AOM or regional manager
- [ ] Administrator
- [ ] Super administrator
- [ ] Automation/service role

Apply the matrix to profiles, authorization fields, access codes, quizzes, correct answers, attempts, results, reports, content, approvals, media, analytics, and user-management functions.

### TH-003 - Establish recovery and verification fixtures

- [ ] Export schema and record the current migration state.
- [ ] Back up authorization tables, access codes, results, and Storage object metadata.
- [ ] Record baseline row counts and representative integrity checks.
- [ ] Create non-production fixture users for every role and at least two markets.
- [ ] Create expired, unused, used, and wrong-quiz access-code fixtures.
- [ ] Document rollback SQL or reverse migrations for each planned authorization change.
- [ ] Test recovery in a non-production environment.

### Phase 0 exit criteria

- [ ] Live schema drift is documented.
- [ ] Every P0 finding is marked confirmed, disproven, or still uncertain.
- [ ] The authorization matrix is approved.
- [ ] Recovery and rollback procedures have been tested outside production.
- [ ] No production authorization change begins until these gates pass.

## Phase 1 - Establish guardrails and reduce immediate exposure

**Estimate:** 4-6 engineering days
**Dependencies:** Phase 0
**Status:** `[-]` (implemented locally; live verification pending)

### TH-101 - Standardize Supabase project structure

- [ ] Confirm the installed Supabase CLI version and discover commands through `--help`.
- [ ] Standardize future work under `supabase/migrations`, `supabase/functions`, and `supabase/tests`.
- [ ] Remove the nested placeholder project only after confirming it is unused.
- [ ] Do not rename or rewrite already-applied production migrations without reconciling the remote ledger.
- [ ] Create a reviewed canonical baseline for new environments.
- [ ] Prove a blank local database can reproduce the intended schema.
- [ ] Add deterministic seed fixtures for role and RLS testing.
- [ ] Document local Supabase setup and recovery.

### TH-102 - Add database authorization tests

Create pgTAP tests proving both allowed and denied behavior:

- [ ] Ordinary users cannot change their role, market, activation status, or permissions.
- [ ] Anonymous users cannot enumerate or arbitrarily update access codes.
- [ ] Clients cannot directly insert, alter, or delete official results.
- [ ] Learners cannot read official correct answers.
- [ ] Non-admins cannot manage users or system-wide settings.
- [ ] Market-scoped managers cannot read another market's protected data.
- [ ] Private reports cannot be read without authorization.
- [ ] Privileged functions reject unauthorized callers.
- [ ] Views do not bypass intended RLS behavior.
- [ ] Grants deny operations before policies where no client access is required.

Run the suite through `supabase test db` in CI.

### TH-103 - Protect profile authorization fields

- [ ] Separate user-owned preferences from administrative authorization attributes.
- [ ] Revoke generic profile updates from ordinary users.
- [ ] Permit self-service updates only to explicitly approved fields.
- [ ] Keep `role`, `market_id`, `is_active`, and permissions admin-controlled.
- [ ] Use both `USING` and `WITH CHECK` where updates remain available.
- [ ] Replace deprecated `auth.role()` policy checks with explicit target roles and ownership/authorization predicates.
- [ ] Record role, market, and activation changes in an audit ledger.
- [ ] Verify behavior through REST/RPC calls as each relevant role, not only through the UI.

### TH-104 - Make result reports private

- [ ] Change `quiz-pdfs` to a private bucket.
- [ ] Use opaque object keys rather than LDAP, email, or other identity-derived filenames.
- [ ] Restrict uploads to validated PDF content and enforce an agreed size limit.
- [ ] Store object keys and report status rather than public URLs.
- [ ] Issue short-lived signed URLs only after a report-view authorization check.
- [ ] Audit report views and downloads where appropriate.
- [ ] Decide and implement report retention and deletion rules.
- [ ] Migrate or protect existing public objects without losing historical links.

### TH-105 - Remove production diagnostic exposure

- [ ] Compile `window.debugAuth` and verbose bootstrap logging out of production.
- [ ] Stop logging tokens, sessions, full answer payloads, and employee identifiers.
- [ ] Add structured, environment-gated, PII-redacted telemetry.
- [ ] Add a real React error boundary and safe diagnostic correlation IDs.
- [ ] Confirm browser console and local storage contain no sensitive diagnostic material.

### Phase 1 exit criteria

- [ ] A user cannot self-promote through REST, RPC, or the interface.
- [ ] Result reports are inaccessible without an authorized signed path.
- [ ] Production logs contain no access tokens or full assessment payloads.
- [ ] Local migration replay and authorization tests pass.
- [ ] Existing learner and admin workflows still pass smoke testing.

## Phase 2 - Build the authoritative assessment service

**Estimate:** 7-10 engineering days
**Dependencies:** Phases 0-1
**Status:** `[-]` (implemented locally; live verification pending)

This phase introduces replacement behavior without immediately revoking the legacy paths.

### TH-201 - Separate learner-safe questions from answer data

- [ ] Define a learner question DTO containing only question ID, type, prompt, options, and presentation metadata.
- [ ] Exclude correct answers, hidden grading metadata, and unrelated question-bank data.
- [ ] Create separate practice feedback that can reveal explanations only at the intended time.
- [ ] Add network-contract tests proving official answer data is absent.

### TH-202 - Replace browser-generated access codes

- [ ] Generate codes with cryptographically secure randomness on the server.
- [ ] Decide whether to store code hashes rather than plaintext codes.
- [ ] Bind each code to a quiz, expiry, status, and allowed-attempt count.
- [ ] Add creation, use, expiration, and revocation audit events.
- [ ] Rate-limit failed code validation attempts.
- [ ] Use error messages that do not facilitate code enumeration.
- [ ] Define a compatibility window for existing codes.

### TH-203 - Implement transactional submission

Create a single operation such as `submit_quiz_attempt` that:

- [ ] Accepts the access code, answers, and an idempotency key.
- [ ] Locks the matching access-code row.
- [ ] Confirms that it is valid, unused, unexpired, and bound to the submitted quiz.
- [ ] Validates answer shape and question membership.
- [ ] Loads official correct answers internally.
- [ ] Grades deterministically using versioned grading rules.
- [ ] Inserts an immutable attempt/result.
- [ ] Consumes the access code.
- [ ] Writes an audit event.
- [ ] Commits all database changes together.
- [ ] Returns only the result and feedback the learner is allowed to see.

Privileged database requirements:

- [ ] Prefer `SECURITY INVOKER`; use `SECURITY DEFINER` only where required and justified.
- [ ] Use a fixed, minimal or empty `search_path` and fully qualified object names.
- [ ] Revoke execute from `PUBLIC` and grant only the required client roles.
- [ ] Perform authorization and code validation inside the function body.
- [ ] Add concurrency, replay, malformed-answer, wrong-quiz, expired-code, and used-code tests.

### TH-204 - Make official results immutable

- [ ] Remove direct client mutation of official result rows after the replacement path is active.
- [ ] Define a correction workflow that preserves the original result.
- [ ] Capture the administrator, reason, timestamp, and before/after state for adjustments.
- [ ] Prevent silent deletion or rewriting of certification evidence.

### TH-205 - Generate reports from committed results

- [ ] Generate reports only after authoritative submission succeeds.
- [ ] Decide between synchronous generation, asynchronous generation, and on-demand regeneration.
- [ ] Treat report generation failure separately from assessment completion.
- [ ] Generate from immutable result data rather than browser-provided score text.
- [ ] Store the result in private Storage and retain only its object key/status in the database.

### Phase 2 exit criteria

- [ ] Official correct answers never appear in learner network responses.
- [ ] Modifying browser state or score calculations cannot alter the stored score.
- [ ] Replaying one idempotency key produces one result.
- [ ] Concurrent submissions against one code produce one accepted attempt.
- [ ] Code consumption and result creation cannot partially succeed.
- [ ] Report-generation failure does not invalidate a completed assessment.
- [ ] Existing codes follow an explicit compatibility or retirement policy.

## Phase 3 - Migrate the frontend and revoke legacy access

**Estimate:** 2-4 engineering days
**Dependencies:** Phase 2
**Status:** `[-]` (implemented locally; live verification pending)

### TH-301 - Migrate the learner interface

- [ ] Move code validation to the new API.
- [ ] Load official quizzes through the learner-safe projection.
- [ ] Submit answers through the transactional operation.
- [ ] Display authoritative results and limited feedback.
- [ ] Add idempotent retry handling and clear error states.
- [ ] Display report-processing state where applicable.
- [ ] Release behind a temporary feature flag and monitor production behavior.

### TH-302 - Contract legacy access

After verified production adoption:

- [ ] Revoke anonymous access-code listing and arbitrary updates.
- [ ] Revoke direct client inserts, updates, and deletes on official results.
- [ ] Revoke learner access to official correct-answer storage.
- [ ] Remove official browser-side grading as an authoritative path.
- [ ] Remove the old PDF upload contract.
- [ ] Disable obsolete functions only after confirming they receive no legitimate traffic.
- [ ] Remove compatibility code after the agreed window.

### TH-303 - Run negative production verification

With controlled accounts and rollback ready, prove:

- [ ] Code enumeration fails.
- [ ] Arbitrary result insertion fails.
- [ ] Role promotion fails.
- [ ] Direct private-report access fails.
- [ ] Cross-market access fails.
- [ ] Public code-based assessments still work.
- [ ] Authorized administrative workflows still work.

### Phase 3 exit criteria

- [ ] All legacy write and answer-disclosure paths fail closed.
- [ ] The replacement path handles production traffic successfully.
- [ ] Logs show no legitimate traffic using retired paths for the agreed observation window.

## Phase 4 - Engineering quality and delivery safety

**Estimate:** 5-8 engineering days
**Dependencies:** Can begin during Phase 2 after the Phase 0 baseline
**Status:** `[-]` (implemented locally; remote CI and database replay pending)

### TH-401 - Add standard project commands

- [ ] `lint`
- [ ] `format:check`
- [ ] `typecheck`
- [ ] `test`
- [ ] `test:coverage`
- [ ] `test:e2e`
- [ ] `test:a11y`
- [ ] `db:test`
- [ ] `build`

Introduce TypeScript incrementally at service, DTO, validation, and database boundaries rather than attempting a full rewrite.

### TH-402 - Establish the test pyramid

Database:

- [ ] RLS and grant tests
- [ ] Function and trigger tests
- [ ] Migration replay
- [ ] Constraint and concurrency tests

Frontend:

- [ ] Auth and RBAC tests
- [ ] Assessment-state tests
- [ ] Content transformation and sanitization tests
- [ ] Error-boundary tests

End-to-end:

- [ ] Successful public code-based assessment
- [ ] Expired, used, invalid, and wrong-quiz code behavior
- [ ] Duplicate and concurrent submission
- [ ] Admin content creation and approval
- [ ] Manager market boundaries
- [ ] User-management denial
- [ ] Authorized signed report access

Accessibility:

- [ ] Automated axe scans
- [ ] Keyboard navigation
- [ ] Focus management and restoration
- [ ] Dialog and drawer focus trapping
- [ ] Sortable table semantics

### TH-403 - Strengthen GitHub Actions

Required pipeline order:

1. [ ] Lockfile-based dependency install
2. [ ] Formatting and lint
3. [ ] Type checking
4. [ ] Unit tests
5. [ ] Local Supabase startup
6. [ ] Migration replay
7. [ ] RLS and database tests
8. [ ] Production build
9. [ ] Bundle-size validation
10. [ ] End-to-end smoke test
11. [ ] Deployment only after all required gates pass

- [ ] Add a protected production environment or manual deployment approval before pushing high-risk changes to `main`.
- [ ] Separate CI validation from deployment so a failed gate cannot publish.
- [ ] Document rollback to the prior Pages artifact and database migration state.

### TH-404 - Harden the production application

- [ ] Disable public source maps or publish them only to an authorized error-reporting service.
- [ ] Tighten the Content Security Policy and remove unnecessary `unsafe-*` allowances where practical.
- [ ] Remove unnecessary browser permission grants.
- [ ] Correct the missing/empty favicon assets.
- [ ] Add dependency scanning, Dependabot, and CodeQL.
- [ ] Validate required environment variables during build.
- [ ] Verify currently supported Node, Vite, React, and Supabase client versions before upgrading.
- [ ] Remove dependencies confirmed to be unused.

### Phase 4 exit criteria

- [ ] A failed migration, RLS test, lint check, unit test, or E2E test prevents deployment.
- [ ] Production deployment requires an explicit successful validation result.
- [ ] The application has a tested and documented rollback path.
- [ ] Dependency and bundle regressions are visible in CI.

## Phase 5 - Frontend correctness, responsive design, and accessibility

**Estimate:** 7-12 engineering days
**Dependencies:** Phase 4 test foundation preferred
**Status:** `[-]` (implemented locally; authenticated staging verification pending)

### TH-501 - Repair authentication lifecycle

- [ ] Return auth subscription cleanup directly from the React effect.
- [ ] Keep session state current on token refresh without unnecessary application-wide rerenders.
- [ ] Replace the nonfunctional render fallback with a real error boundary.
- [ ] Define explicit loading, unauthenticated, inactive, unauthorized, and service-unavailable states.
- [ ] Test remounting and React Strict Mode behavior.

### TH-502 - Apply one permission model at every layer

- [ ] Define named permissions rather than scattering role-name comparisons.
- [ ] Use the same permission model for navigation visibility, route access, page actions, API/RPC authorization, and database tests.
- [ ] Apply explicit permissions to users, approvals, settings, content authoring, analytics, media, and assessment management routes.
- [ ] Ensure hidden navigation is never treated as an authorization control.

### TH-503 - Replace the admin mobile layout

At phone and tablet widths:

- [ ] Convert the sidebar into a modal drawer.
- [ ] Close the drawer after navigation.
- [ ] Give main content the full available viewport.
- [ ] Move overflowing filters into a responsive panel or sheet.
- [ ] Provide responsive table columns or card-style rows.
- [ ] Use mobile-appropriate chart layouts and summaries.
- [ ] Add `aria-expanded`, focus trapping, Escape handling, and focus restoration.
- [ ] Verify core admin tasks at 390px, 768px, and desktop widths.

### TH-504 - Simplify navigation and catalog discovery

- [ ] Use one contextual application shell for admin pages.
- [ ] Remove public-site navigation from the admin workspace.
- [ ] Flatten unnecessary Learn and Practice hierarchy.
- [ ] Add breadcrumbs, persistent field labels, search, and useful filters.
- [ ] Replace enabled actions for empty categories with meaningful empty states.
- [ ] Make current location and available next actions obvious.

### TH-505 - Make the learner home operational

Prioritize:

1. [ ] Required training
2. [ ] Continue learning
3. [ ] Upcoming due dates
4. [ ] Certification status
5. [ ] Recently viewed material
6. [ ] Search and catalog browsing

Marketing copy should remain secondary to the learner's immediate tasks.

### TH-506 - Reduce dashboard density

- [ ] Lead with four to six operational KPIs and exceptions.
- [ ] Lazy-load secondary charts.
- [ ] Support role-appropriate dashboard presets.
- [ ] Paginate result detail.
- [ ] Consolidate filters into a coherent responsive interface.
- [ ] Distinguish operational metrics from exploratory analytics.

### TH-507 - Complete an accessibility remediation pass

- [ ] Replace clickable non-semantic elements with appropriate controls.
- [ ] Ensure every control has a persistent accessible name.
- [ ] Validate focus order, visible focus, and skip navigation.
- [ ] Test dialogs, drawers, dropdowns, editors, tables, and chart alternatives.
- [ ] Validate contrast in light and dark themes.
- [ ] Provide text summaries or tables for essential chart information.

### Phase 5 exit criteria

- [ ] Core admin tasks work at target phone, tablet, and desktop widths.
- [ ] All interactive controls are keyboard operable.
- [ ] No admin capability is available merely because a user is authenticated.
- [ ] Automated accessibility scans contain no serious or critical violations.
- [ ] Learners can reach required or in-progress content in one or two actions.

## Phase 6 - Architecture and performance refactoring

**Estimate:** 10-20 engineering days, delivered incrementally
**Dependencies:** Stable test and authorization foundations
**Status:** `[-]` (implemented incrementally; live performance evidence pending)

### TH-601 - Organize code by product domain

Move toward domain ownership for:

- [ ] `auth`
- [ ] `users`
- [ ] `catalog`
- [ ] `authoring`
- [ ] `assessments`
- [ ] `assignments`
- [ ] `analytics`
- [ ] `media`
- [ ] `shared`

Each domain should own its UI, queries, validation, tests, and data contracts. Split oversized files through behavior-preserving changes backed by tests.

### TH-602 - Extract embedded template payloads

- [ ] Move large generated template data into versioned JSON or static modules.
- [ ] Validate templates against a schema.
- [ ] Load template payloads dynamically only when required.
- [ ] Separate generated assets from hand-maintained application logic.
- [ ] Add a build check for oversized source modules.
- [ ] Document the generation/update process.

### TH-603 - Introduce typed data contracts

- [ ] Generate database types from the verified schema.
- [ ] Add runtime validation for API responses and content JSON.
- [ ] Separate public DTOs from database-row types.
- [ ] Centralize Supabase clients and environment configuration.
- [ ] Centralize error translation, retry rules, and cancellation.

### TH-604 - Move analytics aggregation to Postgres

Create reviewed, permission-aware queries for:

- [ ] Completion totals
- [ ] Pass/fail rates
- [ ] Market comparisons
- [ ] Question performance
- [ ] Time trends
- [ ] Certification compliance

- [ ] Use `security_invoker` views where appropriate.
- [ ] Put privileged helpers in a non-exposed schema where possible.
- [ ] Paginate detail queries and prevent unbounded downloads.
- [ ] Measure query plans and add indexes only from evidence.
- [ ] Preserve market-level authorization in every aggregate and drill-down.

### TH-605 - Adopt performance budgets

- [ ] Agree on a compressed initial JavaScript budget.
- [ ] Agree on P75 interaction and load targets for learner and admin pages.
- [ ] Lazy-load editor, PDF, and charting libraries.
- [ ] Prevent unbounded dashboard result requests.
- [ ] Set a justified maximum source-module size.
- [ ] Measure bundle and browser performance in CI and production telemetry.

### Phase 6 exit criteria

- [ ] Large modules have explicit ownership and reduction plans.
- [ ] Template payloads no longer dominate the main application dependency graph.
- [ ] Analytics endpoints are bounded, permission-aware, and measured.
- [ ] Performance budgets are enforced rather than documented only.

## Phase 7 - Expand into a complete training system

**Estimate:** 15-30 engineering days after product decisions
**Dependencies:** Secure assessment and authorization foundation
**Status:** `[-]` (implemented locally; product decisions and staging verification pending)

### TH-701 - Define the training lifecycle

Proposed entities, subject to schema review:

- [ ] `training_assignments`
- [ ] `assignment_audiences`
- [ ] `enrollments`
- [ ] `completion_records`
- [ ] `certifications`
- [ ] `certification_renewals`
- [ ] `content_versions`
- [ ] `content_reviews`
- [ ] `audit_events`

### TH-702 - Assignment management

- [ ] Assign by employee, supervisor, market, role, or team.
- [ ] Support required and optional training.
- [ ] Add due dates, grace periods, priority, and reminders.
- [ ] Support prerequisites and learning paths.
- [ ] Preserve assignment history when people or organizational relationships change.

### TH-703 - Certification lifecycle

- [ ] Separate certification status from individual quiz attempts.
- [ ] Issue, expire, renew, suspend, and revoke certifications.
- [ ] Preserve the evidence and content version supporting each decision.
- [ ] Add expiring-certification alerts and manager queues.

### TH-704 - Content governance

- [ ] Draft, review, approve, publish, supersede, and archive states.
- [ ] Assign a content owner.
- [ ] Add effective dates and required review dates.
- [ ] Preserve version and approval history.
- [ ] Support rollback or republishing of a prior version.
- [ ] Notify owners about stale content.

### TH-705 - Manager operations and compliance

- [ ] Overdue and expiring-training queues.
- [ ] Team and market compliance views.
- [ ] Exception-focused reporting.
- [ ] Controlled exports with audit records.
- [ ] Privacy-preserving aggregate reporting.

### TH-706 - Decide privacy and retention policy

- [!] Decide how long attempts and answers are retained.
- [!] Decide whether PDFs are operationally necessary.
- [!] Decide who may view individual answers.
- [!] Decide when identities must be hidden in aggregate reporting.
- [!] Decide how corrections, deletion requests, and legal holds are handled.

### Phase 7 exit criteria

- [ ] Learners have an authoritative assigned-training and certification state.
- [ ] Managers can act on exceptions without broad unnecessary data exposure.
- [ ] Content versions and certification evidence are traceable.
- [ ] Retention and privacy rules are implemented and documented.

## Recommended release sequence

| Release | Scope                                                              | Required production outcome              |
| ------- | ------------------------------------------------------------------ | ---------------------------------------- |
| 1       | Baseline, backup, migration replay, CI, and RLS tests              | Safe implementation foundation           |
| 2       | Profile protection, private reports, and debug removal             | Immediate exposure reduced               |
| 3       | New assessment service operating in parallel                       | Server-authoritative path available      |
| 4       | Frontend migration and observation window                          | Production traffic uses the replacement  |
| 5       | Revoke legacy code, result, answer, and report access              | Assessment integrity boundary complete   |
| 6       | Auth lifecycle, route permissions, mobile admin, and accessibility | Reliable daily operation                 |
| 7       | Modularization, typed contracts, and analytics optimization        | Maintainability and performance improved |
| 8       | Assignments, certifications, and content governance                | Complete training lifecycle              |

## Decisions required before relevant work begins

| Decision                                        | Recommended default                                                    | Needed by |
| ----------------------------------------------- | ---------------------------------------------------------------------- | --------- |
| Can signed-out users take official assessments? | Yes, using a securely validated single-purpose access code             | Phase 2   |
| Are result PDFs required?                       | Keep temporarily, validate operational need, then simplify if possible | Phase 1   |
| Report and answer retention period              | Business/privacy owner decision; do not guess                          | Phase 1/7 |
| Mobile admin scope                              | Support core daily tasks at 390px and 768px                            | Phase 5   |
| Deployment approval                             | Require validation and an explicit protected production gate           | Phase 4   |
| Legacy code compatibility window                | Short, measured window with logging and a defined retirement date      | Phase 2/3 |
| Certification source of truth                   | Dedicated certification records, not inferred solely from attempts     | Phase 7   |

## Verification matrix

| Layer                | Required verification                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Git                  | Clean preflight, explicit changed-file review, no unrelated staging, `main` tracking verified         |
| Migration            | Apply to local/staging, rollback test, replay from baseline, migration ledger verified                |
| Grants/RLS           | Positive and negative tests as `anon`, ordinary user, each manager role, admin, and cross-market user |
| Privileged functions | Execute grants, `search_path`, caller checks, malformed input, replay, and concurrency                |
| Storage              | Direct URL denial, signed URL success, expiry, cross-user denial, MIME/size rejection                 |
| Assessment           | No answer leakage, deterministic grading, idempotency, code locking, immutable result                 |
| Frontend             | Unit tests, error states, responsive layouts, keyboard operation, screen-reader semantics             |
| End-to-end           | Learner assessment, admin management, approval, analytics scope, report access                        |
| Deployment           | CI green, controlled promotion, production smoke test, rollback readiness                             |
| Observability        | No sensitive logs, errors correlated, security denials visible without exposing secrets               |

## Definition of done

Every implementation ticket requires:

- [ ] Reviewed code, configuration, or SQL.
- [ ] Positive and negative automated tests.
- [ ] A reproducible migration when schema behavior changes.
- [ ] A rollback or recovery procedure.
- [ ] Updated operator and developer documentation.
- [ ] Appropriate audit logging and PII-safe telemetry.
- [ ] Verification with realistic roles and data boundaries.
- [ ] Explicit review of the complete Git diff.
- [ ] No unrelated working-tree changes.
- [ ] Successful CI and production smoke verification.
- [ ] The relevant acceptance criteria in this plan updated with evidence.

## Effort summary

Approximate effort for one experienced engineer, excluding stakeholder response time:

- Security and assessment integrity: 3-5 weeks.
- Engineering safeguards and UX reliability: 3-5 additional weeks.
- Architecture and performance refactoring: 2-4 additional weeks.
- Assignment, certification, and governance lifecycle: 3-6 additional weeks.

Phases 0-3 are substantially sequential. After the assessment boundary is secure, engineering quality, UX, architecture, and product-system work can be parallelized where ownership permits.

## Development-session startup checklist

At the beginning of each development session:

1. [ ] Read this plan and identify the current ticket and phase gate.
2. [ ] Run `git status --short --branch` and confirm `main` tracks `origin/main`.
3. [ ] Review existing uncommitted changes and preserve user-owned work.
4. [ ] Refresh Supabase changelog and current documentation for the feature being changed.
5. [ ] Verify live state if the task touches production data, Auth, RLS, functions, triggers, or Storage.
6. [ ] State the exact implementation and verification boundary before editing.
7. [ ] Keep changes scoped to the selected ticket.
8. [ ] Update this plan only with verified progress and evidence.

## Reference documentation

- Supabase RLS: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Securing the Data API: <https://supabase.com/docs/guides/api/securing-your-api>
- Storage access control: <https://supabase.com/docs/guides/storage/security/access-control>
- Edge Functions: <https://supabase.com/docs/guides/functions>
- Supabase changelog: <https://supabase.com/changelog?types=breaking-change>
