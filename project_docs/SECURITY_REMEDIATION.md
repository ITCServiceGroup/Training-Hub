# Security remediation record

## Scope and status

A standard repository security scan was completed on 2026-09-02 against the pre-remediation worktree. It validated 20 findings: six high, ten medium, and four low. Every finding has a deployed code or removal remediation. Static, unit, database, build, dependency, browser, mobile, accessibility, and live release checks pass.

Production closure was completed on 2026-09-02 using the deny-by-default authorization model and preserve-all-data retention default. The protected recovery point, restoration rehearsal, migration-ledger registration, 12 forward migrations, both Edge Functions, controlled Pages release, and post-release checks all completed without a stop condition.

## Remediation map

| Finding                                     | Local remediation                                                                                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate multi-select score inflation      | Reject malformed, out-of-range, and duplicate selections; constrain official scores to 0-1.                                                                |
| Supervisor peer-team profile access         | Restrict profile management and reads to direct or lead-mediated reports; preserve hierarchy with a trigger.                                               |
| Supervisor peer-team training access        | Make training authorization hierarchy-aware for user-scoped records and creator-scoped for manager objects.                                                |
| Arbitrary supervisor assignment audiences   | Validate every inserted or changed audience against the supervisor's reporting tree.                                                                       |
| Inactive privileged content writes          | Require an active profile in every historical authorization helper.                                                                                        |
| Broad Storage overwrite/delete              | Remove media object update access; scope inserts to the authenticated owner folder and deletes to authorized metadata ownership.                           |
| Unbounded public media upload               | Enforce 50 MiB and an image/video/audio MIME allowlist in Storage and the browser service.                                                                 |
| Shared template CRUD for all users          | Replace template policies with active content-manager policies and explicit grants.                                                                        |
| Bulk answer/timing exposure                 | Grant only result-summary columns and aggregate question performance inside an authorized RPC.                                                             |
| Legacy plaintext access codes               | Backfill hashes, erase plaintext, and enforce `code IS NULL` with a validated constraint.                                                                  |
| Unauthenticated Apps Script Drive writes    | Remove the Apps Script source, browser service, setup documents, environment hook, UI, and CSP origins.                                                    |
| Cross-origin Vite source writes             | Add same-origin validation, a random server token, 128 KiB limit, item schema/range checks, and one atomic write; exclude the editor HTML from production. |
| Supervisor provisioning under peer managers | Require new lead technicians and technicians to report to the caller or the caller's active lead.                                                          |
| Access codes in URL/history                 | Transfer credentials through transient route state and immediately replace both legacy URL and history state.                                              |
| Ignored persistence toggle                  | Remove the misleading control; the configured session behavior is now explicit and consistent.                                                             |
| Full login/session console logging          | Remove the login logger and return a generic authentication failure.                                                                                       |
| Broken Pages password recovery              | Redirect to the current project base, respond to the recovery auth event, and route through `HashRouter`.                                                  |
| Non-atomic report audit                     | Finalize result link, report state, and audit event in one service-only database transaction.                                                              |
| Spreadsheet formula injection               | Remove the obsolete Apps Script spreadsheet export path in full.                                                                                           |
| Mutable GitHub Action tags                  | Pin every workflow action to the exact official commit resolved on 2026-09-02 and retain release comments.                                                 |

## Local verification evidence

- One checksum-locked production baseline and 12 forward migrations replay from a blank PostgreSQL 15 database.
- Static contracts validate 59 privileged functions and 167 pgTAP assertions across two test files.
- Database lint reports no errors or warnings in the final `public` and `private` schemas.
- The pgTAP suite executes the learner-safe load, authoritative grading, atomic hash-only code consumption, result creation, idempotent replay, and real-claim role/market/hierarchy authorization paths with synthetic data.
- A separate two-session concurrency check accepted exactly one attempt against a single-use synthetic code and committed exactly one result.
- Both Edge Function entrypoints parse as TypeScript.
- Fifty-six unit/contract tests pass; scoped coverage is 97.18% for statements and lines.
- Production build, source and route/template budgets, and the 119-asset diagnostic prohibition pass; no source maps or local editor page are published.
- Nine browser/mobile/accessibility checks pass and one non-applicable desktop case is skipped. Authenticated production navigation across all admin destinations also completed without browser console warnings or errors.
- Full and production-only npm audits report zero vulnerabilities.

## Production closure evidence

- The local recovery set contains restricted schema, data, roles, and Storage backups with checksums recorded in `IMPLEMENTATION_PLAN.md`; restoration against the production snapshot succeeded.
- The production ledger contains the baseline plus all 12 forward migrations. Pre/post counts were preserved, codes are hash-only, result integrity checks are clean, and all 33 public tables have RLS enabled.
- The live pgTAP suite passed all 167 assertions and rolled back its fixtures. Public-schema lint is clean, `PUBLIC` has no function execution grants, and `anon` retains only the four documented assessment RPCs.
- `admin-create-user` version 1 and `upload-quiz-pdf` version 4 are active with their documented gateway settings. Missing/invalid authorization probes were rejected.
- GitHub validation run `33695747059`, CodeQL run `33695747042`, and Pages release run `33696823237` succeeded for application commit `73add2acb9f2ccf448729477c3ca7aeb89e48950`.
- The live Pages entry document exactly matched the workflow artifact at SHA-256 `ab0ad5bc886fd5e24bcc1f8c539d10dd31131025bb78008af9178f8bfe453ea5`. All authenticated admin destinations loaded without application or console errors, and the mobile admin drawer passed a 390-pixel interaction check.

Residual account-level recommendations are not concealed: breached-password protection is unavailable on the current Supabase free tier, additional MFA enrollment remains a product/account decision, and 598 legacy ESLint warnings remain behind a zero-regression budget. These do not reopen the 20 remediated repository findings.

After the generated full-repository scan, a direct review covered the additional validation-rate-limit, aggregate-analytics, content-republish, template-loading, telemetry, and build-output changes. That review fixed a historical-code limiter bypass, added per-guide publication serialization, and constrained telemetry fields. The desktop diff-scan workbench returned no scan ID because its working-tree selection was stale after `HEAD` changed; no replacement scan was created, and the earlier full scan remains the canonical generated report.
