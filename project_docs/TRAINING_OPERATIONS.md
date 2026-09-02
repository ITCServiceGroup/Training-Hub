# Training operations guide

## Roles and scope

The database is authoritative. The interface may hide unavailable actions, but every change is also checked by a scoped RPC and RLS.

- Supervisors manage authorized direct-report training in their market.
- AOMs manage their authorized market hierarchy.
- Administrators and super administrators manage system-wide training operations where the authorization matrix permits it.
- Learners can view and act on only their own enrollments, learning-path progress, and certifications.

## Assignment workflow

1. Open **Admin > Training** and create a draft assignment.
2. Choose a versioned quiz, study guide, or learning path.
3. Select a scoped audience: specific employees, reporting hierarchy, role, market, or team as supported by the composer.
4. Set required/optional status, priority, due date, grace period, and any prerequisites.
5. Review the projected audience and activate the assignment.
6. Activation creates or updates enrollments without erasing historical enrollment evidence.

Use assignment status changes instead of deleting an assignment. Cancellation must preserve past enrollment and audit records.

## Learner workflow

The learner home prioritizes active and overdue assignments. Starting a quiz assignment issues a single-purpose authoritative access code. Study-guide work can be marked complete only through the enrollment RPC. Learning-path steps enforce sequence and required prerequisites in PostgreSQL; changing browser state cannot bypass them.

Official quiz completion is recorded by the assessment-result trigger after a committed server-graded result. Operators must not manually insert a result to satisfy an assignment.

## Exceptions and waivers

Waive an enrollment only for a documented operational reason. The waiver operation requires authorization, records the actor and reason, and preserves the original assignment history. Do not use a waiver to repair a technical failure; resolve the failure and let the learner complete the authoritative workflow.

## Certification lifecycle

Certification status is a dedicated record, not an inference from the latest quiz row. Authorized operators can issue, suspend, revoke, expire, or renew a certification with a reason. The supporting content version and evidence must remain traceable. Never rewrite the original assessment or completion record to change certification status.

Review the expiring-certification queue routinely and coordinate renewals before the expiration date. Product owners must define reminder intervals and formal issuance rules before production automation is enabled.

## Content governance

1. Create an immutable content-version snapshot with an owner, effective date, and review date.
2. Submit the version for review.
3. An authorized reviewer approves or rejects it with a recorded decision.
4. Publish only an approved version.
5. Supersede or archive old content; do not overwrite evidence used by an existing completion or certification.
6. Use a new version to roll back content behavior while retaining the publication trail.

The content-governance queue should be reviewed for rejected, awaiting-review, and stale/overdue versions.

## Compliance workspace

The compliance panel is exception-oriented. Managers should work from overdue enrollment and expiring certification queues, then drill into permitted detail. Exports contain personal information and must remain scoped, minimal, auditable, and handled according to the approved privacy policy.

Do not use client-side aggregation as proof of compliance. Database views/RPCs and immutable evidence are the source of truth.

## Scheduled deadline refresh

`refresh_training_deadlines()` updates eligible enrollment and certification states. Until a reviewed scheduler is configured, an authorized operator must run it from the Training workspace after confirming the environment and then review the returned counts.

For production automation, use a least-privilege scheduled database job or trusted server process. Record the schedule, owner, alert path, retry policy, and last successful run. Never call the function from an anonymous browser session or place privileged credentials in GitHub Pages.

Recommended operational checks:

- daily: refresh deadlines and inspect failures/overdue spikes;
- weekly: review overdue training, expiring certifications, pending content reviews, and stale content;
- monthly: sample authorization/audit events, reconcile completion evidence, and review privileged exports;
- each release: run the complete deployment smoke matrix.

## Corrections and incident handling

Quiz results, completion records, result adjustments, and audit records are historical evidence. They are append-only. Use `record_quiz_result_adjustment` with a reason for an authorized correction; do not update or delete the original row.

If report generation fails, the assessment remains complete. Retry or regenerate the report from committed result data. Never ask the learner to retake solely to obtain a PDF.

Report suspected unauthorized access, unexpected cross-market visibility, duplicate result evidence, or broken deadline transitions as a security/operations incident. Preserve logs and correlation identifiers without copying tokens or full answer payloads.
