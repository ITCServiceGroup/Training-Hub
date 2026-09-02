# Privacy and retention decision record

## Status

The application implements least-privilege access, private report storage, bounded queries, opaque report object keys, and append-only evidence. The business retention and legal-hold policy is not a technical default and remains an explicit owner decision before production lifecycle automation or deletion is enabled.

## Decisions requiring approval

| Data class                        | Required owner decision                                       | Safe interim behavior                                                         |
| --------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Official attempts and scores      | Retention period and regulatory/contract basis                | Preserve; restrict to authorized learner hierarchy and administrators         |
| Individual answers                | Whether they are required after grading and who may view them | Keep access tightly restricted; do not expose in learner/admin bulk responses |
| Result PDFs                       | Whether PDFs are operationally necessary and their retention  | Keep private; authorize each access; do not make the bucket public            |
| Access-code metadata              | Retention for fraud/audit analysis                            | Store only the hash and lifecycle metadata; never recover plaintext codes     |
| Completion/certification evidence | Retention and legal significance                              | Preserve as immutable evidence                                                |
| Security/training audit events    | Retention, monitoring, and incident needs                     | Preserve and restrict; redact secrets and direct answer payloads              |
| Exported reports                  | Allowed destinations, expiry, and deletion responsibilities   | Minimize and audit exports; no unapproved persistent copies                   |
| User/profile records              | Deactivation, deletion, and historical attribution rules      | Deactivate accounts; do not erase evidence or orphan attribution              |

## Questions the privacy and business owners must answer

1. Which contractual, regulatory, safety, or employment obligations require training evidence, and for how long?
2. Are question-level answers necessary after the authoritative score is committed?
3. Are generated PDFs required, or can the application render a report on demand from immutable data?
4. Which roles may see individual answers versus only score/completion status?
5. At what group size must aggregate analytics suppress or coarsen identity-sensitive results?
6. How are employee access, correction, deletion, and appeal requests handled when records are also compliance evidence?
7. Who may place and release a legal hold, and which tables/objects must the hold cover?
8. Which systems may receive exports and who owns deletion from those systems?
9. What incident-notification and audit-review periods apply?

## Implementation rules after approval

- Encode retention in a reviewed forward migration or trusted scheduled process, never in browser code.
- Enforce legal holds before any deletion or anonymization.
- Delete private Storage objects and their database metadata consistently and idempotently.
- Preserve the minimum audit fact needed to prove what happened without retaining unnecessary answer content.
- Use aggregation thresholds and authorization checks in database queries, not only in chart components.
- Test active retention, expired retention, legal hold, failed deletion, retry, and audit behavior in staging.
- Document the approving owner, decision date, policy version, effective date, and next review date in this file.

## Approval record

| Field                   | Value   |
| ----------------------- | ------- |
| Business owner          | Pending |
| Privacy/legal owner     | Pending |
| Security owner          | Pending |
| Approved policy version | Pending |
| Effective date          | Pending |
| Next review date        | Pending |

No automated destructive retention job may be enabled while this record remains pending.
