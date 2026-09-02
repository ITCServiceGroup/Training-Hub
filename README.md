# Training Hub

Training Hub is ITC Service Group's React and Supabase application for learning content, code-based assessments, training assignments, learning paths, certifications, content governance, and manager compliance workflows.

## What is in this repository

- A Vite/React single-page application deployed to GitHub Pages.
- A server-authoritative assessment API implemented with Supabase PostgreSQL functions.
- Private assessment-report storage and two Supabase Edge Functions.
- Role- and market-scoped authorization enforced in both the application and database.
- Training lifecycle tables and workflows for assignments, enrollments, paths, certifications, content review, and compliance.
- Unit, contract, browser, accessibility, migration-contract, bundle-budget, dependency, and code-scanning gates.
- Privacy-preserving question analytics aggregated behind an authorized database function instead of downloading learner answers.

The historical SQL under `database/migrations` is retained as deployment evidence. New forward-only migrations live in `supabase/migrations` and must be reconciled with the live migration ledger before they are applied.

## Prerequisites

- Node.js 22 LTS
- npm
- Docker Desktop for the local Supabase stack
- Supabase CLI 2.116.0 or the version locked in `package-lock.json`
- Access to the Training Hub Supabase project for staging or production operations

## Local setup

```bash
git clone https://github.com/ITCServiceGroup/Training-Hub.git
cd Training-Hub
npm ci
cp .env.example .env
```

Set the public browser configuration in `.env`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Never place a service-role key, database password, access token, or signing key in a `VITE_` variable or commit it to Git.

Start the application:

```bash
npm run dev
```

The development server uses <http://127.0.0.1:3333>. The production preview command uses Vite's preview server.

## Verification

Run the local application verification suite:

```bash
npm run verify
npm run test:e2e
```

`npm run verify` runs lint, incremental contract type checking, unit tests with coverage, static Supabase migration checks, Edge Function parsing, the production build, and bundle budgets.

With Docker running, also execute the real database replay and pgTAP suite:

```bash
npx supabase start
npx supabase db reset
npm run db:test
npm run db:lint
```

The static SQL check is useful in restricted environments, but it does not replace a clean PostgreSQL replay, pgTAP execution, staging verification, or live migration-ledger reconciliation.

## Architecture

```text
React application
  |-- public learner experience
  |-- permission-gated admin experience
  |-- learner-safe assessment gateway
  `-- training operations workspace
          |
          v
Supabase
  |-- Auth and user profiles
  |-- RLS-protected application tables
  |-- transactional assessment RPCs
  |-- training lifecycle RPCs
  |-- append-only audit and evidence records
  `-- private quiz-pdfs Storage bucket
          |
          v
Edge Functions
  |-- admin-create-user (authenticated user provisioning)
  `-- upload-quiz-pdf (one-time server-issued upload token)
```

Official assessment answers are loaded and graded in PostgreSQL. The browser receives learner-safe questions and cannot authoritatively write a result. Submission is transactional and idempotent: the access code is locked and consumed in the same operation that validates answers, grades the attempt, writes immutable evidence, and records the audit event.

## Important directories

| Path                          | Purpose                                                                   |
| ----------------------------- | ------------------------------------------------------------------------- |
| `src/features`                | Domain-owned application features                                         |
| `src/services/api`            | Browser-to-Supabase service boundaries                                    |
| `src/config/authorization.js` | Named frontend permission model                                           |
| `supabase/migrations`         | Forward-only canonical migrations                                         |
| `supabase/functions`          | Supabase Edge Functions                                                   |
| `supabase/tests`              | pgTAP authorization and integrity tests                                   |
| `e2e`                         | Playwright browser and accessibility smoke tests                          |
| `project_docs`                | Architecture, authorization, deployment, operations, and decision records |
| `database/audits`             | Read-only live inventory queries                                          |
| `tools`                       | Local-only authoring utilities excluded from the production bundle        |

## Deployment

Pushing to `main` validates the application but does not publish it. Production deployment is a manual GitHub Actions dispatch with the `deploy` input enabled, after the database and Edge Function rollout has passed staging verification.

Do not deploy this frontend before the matching Supabase migrations and functions are available. Follow [Deployment and rollback](project_docs/DEPLOYMENT_AND_ROLLBACK.md) for the required sequence, smoke tests, and recovery rules.

## Operational references

- [Implementation plan](IMPLEMENTATION_PLAN.md)
- [Authorization matrix](project_docs/AUTHORIZATION_MATRIX.md)
- [Supabase local development](project_docs/SUPABASE_LOCAL_DEVELOPMENT.md)
- [Deployment and rollback](project_docs/DEPLOYMENT_AND_ROLLBACK.md)
- [Training operations](project_docs/TRAINING_OPERATIONS.md)
- [Privacy and retention decisions](project_docs/PRIVACY_RETENTION_DECISIONS.md)
- [Security policy](SECURITY.md)
- [Security remediation record](project_docs/SECURITY_REMEDIATION.md)

## Contribution rules

- Work directly on `main` unless the repository owner explicitly requests another workflow.
- Use forward-only timestamped migrations; never rewrite a migration that may have been applied.
- Treat navigation visibility as presentation, not authorization. Enforce permissions at the RPC/table and RLS layers.
- Keep official results, completion records, adjustments, and security audit events append-only.
- Add positive and negative tests for every authorization change.
- Review the full diff and run all applicable verification before dispatching a deployment.
