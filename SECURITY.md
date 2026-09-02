# Security policy

## Reporting a vulnerability

Do not open a public issue containing employee data, access codes, answer keys, tokens, credentials, exploit details, or production identifiers. Report the issue privately to the ITC Service Group repository/security owner with:

- the affected route, RPC, table, function, or release;
- reproducible steps using non-sensitive test data;
- the observed and expected authorization boundary;
- impact and whether exploitation is ongoing;
- any safe correlation ID or timestamp needed to find redacted logs.

If active unauthorized access is suspected, stop testing, preserve evidence, rotate exposed credentials through the owning platform, and begin the organization's incident process.

## Security invariants

- Official assessment answers are server-held and grading is server-authoritative.
- Access codes are hashed at rest, single-purpose, expiring, and consumed transactionally.
- Official results, completion evidence, corrections, and audit events cannot be silently rewritten or deleted.
- Browser roles never receive service-role credentials.
- User provisioning uses the hosted Auth Admin API through an authenticated, authorized Edge Function.
- Report objects are private and accessed only through an authorized short-lived path.
- Role, market, active state, and reporting hierarchy are changed only through scoped privileged operations.
- Every exposed table has reviewed grants and RLS; hiding a route is not authorization.
- Security-definer functions use a fixed empty search path, fully qualified objects, explicit execute grants, and in-body authorization.
- Logs exclude tokens, plaintext codes, complete answer payloads, and unnecessary employee PII.

## Change requirements

Authorization, assessment, Storage, user-provisioning, and evidence changes require:

1. a forward-only migration or reviewed server-function change;
2. positive and negative tests for every affected role and market boundary;
3. clean local replay and staging verification;
4. explicit recovery/rollback instructions;
5. full diff review and passing CI;
6. controlled production smoke tests after deployment.

See `project_docs/DEPLOYMENT_AND_ROLLBACK.md` and `project_docs/AUTHORIZATION_MATRIX.md` for the operational details.
