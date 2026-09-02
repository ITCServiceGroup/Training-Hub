# Training Hub documentation map

## Current references

- `../IMPLEMENTATION_PLAN.md` - master roadmap, implementation evidence, and remaining live gates.
- `PHASE_0_BASELINE.md` - repository and read-only production baseline evidence.
- `AUTHORIZATION_MATRIX.md` - intended role, hierarchy, resource, and action boundaries.
- `SUPABASE_LOCAL_DEVELOPMENT.md` - canonical migration/replay workflow.
- `DEPLOYMENT_AND_ROLLBACK.md` - required staging, release, smoke, and recovery sequence.
- `TRAINING_OPERATIONS.md` - assignment, learner, certification, governance, compliance, and scheduler procedures.
- `SYSTEM_TEMPLATE_PIPELINE.md` - generated-template registry, validation, size budgets, and update workflow.
- `FORMATTING_BASELINE.md` - enforced maintenance formatting boundary and legacy-debt expansion rule.
- `PRIVACY_RETENTION_DECISIONS.md` - unresolved business/privacy/legal decisions and safe defaults.

## Historical references

The RBAC implementation documents, archived plans, old project status files, and `quiz-implementation` notes describe earlier iterations. They remain useful evidence but are not deployment instructions. Where they conflict with the current references above or with `supabase/migrations`, the current references and reviewed forward-only migrations control.

Never run SQL from a historical guide directly in production without reconciling the live migration ledger and converting the intended behavior into a reviewed timestamped migration.
