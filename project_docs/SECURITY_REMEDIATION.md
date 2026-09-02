# Security remediation record

## Scope and status

A standard repository security scan was completed on 2026-09-02 against the pre-remediation worktree. It validated 20 findings: six high, ten medium, and four low. Every finding has a local remediation in this worktree. Local static, unit, build, dependency, browser, mobile, and accessibility checks pass.

This record does not claim production closure. Database replay, pgTAP execution, role/market negative tests, Edge Function deployment, migration-ledger reconciliation, controlled release, and post-release verification still require an authorized staging and Training Hub Supabase project.

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

- Nine forward migrations parse with PostgreSQL's parser.
- Static contracts validate 59 privileged functions and 115 pgTAP assertions.
- Both Edge Function entrypoints parse as TypeScript.
- Fifty-six unit/contract tests pass; scoped coverage is 97.18% for statements and lines.
- Production build, source and route/template budgets, and the 119-asset diagnostic prohibition pass; no source maps or local editor page are published.
- Nine browser/mobile/accessibility checks pass and one non-applicable desktop case is skipped.
- Full and production-only npm audits report zero vulnerabilities.

## Required closure evidence

Follow `DEPLOYMENT_AND_ROLLBACK.md`. Do not publish the frontend until the matching migrations and Edge Functions have passed clean staging replay, the 115 pgTAP checks, cross-role negative testing, data-integrity checks, and a reviewed production dry run.

After the generated full-repository scan, a direct review covered the additional validation-rate-limit, aggregate-analytics, content-republish, template-loading, telemetry, and build-output changes. That review fixed a historical-code limiter bypass, added per-guide publication serialization, and constrained telemetry fields. The desktop diff-scan workbench returned no scan ID because its working-tree selection was stale after `HEAD` changed; no replacement scan was created, and the earlier full scan remains the canonical generated report.
