# Training Hub Authorization Matrix

**Status:** Draft for approval
**Created:** 2026-09-02
**Applies to:** Application routes, UI actions, Data API grants, RLS, RPCs, Edge Functions, and Storage

## Purpose

This document defines the proposed access model that implementation and tests should enforce. It is intentionally expressed as capabilities, not merely hidden navigation items.

The current role hierarchy is:

`super_admin > admin > aom > supervisor > lead_tech > technician`

A signed-out quiz taker is not an application role. It is a narrowly scoped public actor that may use a valid assessment code through dedicated operations only.

## Notation

- **Allow:** The operation is expected to succeed within the stated scope.
- **Deny:** No direct or indirect access should be available.
- **Own:** Only the caller's own record or content.
- **Market:** Only records belonging to the caller's assigned market.
- **Managed:** Only users the role hierarchy explicitly allows the caller to manage.
- **Nationwide:** Published nationwide content.
- **RPC only:** No direct table access; use a validated operation with a minimal return type.
- **Internal:** Server/service implementation only, not exposed to client roles.

## Non-negotiable rules

1. No user may change their own role, market, activation state, reporting relationship, or administrative permissions.
2. Official correct answers are never returned directly to learners before grading.
3. Official scores and result identity fields are determined server-side.
4. Access codes are never directly listed or updated by signed-out or ordinary authenticated clients.
5. Result creation and access-code consumption occur atomically.
6. Result PDFs are private and require an authorized, short-lived access path.
7. Hidden UI elements do not constitute authorization.
8. Nationwide administrators are not implicitly allowed to impersonate users or silently alter historical results.
9. Cross-market access is denied unless a specific nationwide administrative capability requires it.
10. Every allow rule requires at least one positive test; every boundary requires a negative test.

## Capability summary by role

| Capability | Signed out | Technician | Lead Tech | Supervisor | AOM | Admin | Super Admin |
| --- | --- | --- | --- | --- | --- | --- | --- |
| View published nationwide learning content | Allow | Allow | Allow | Allow | Allow | Allow | Allow |
| View published market content | Deny | Market | Market | Market | Market | Allow | Allow |
| Take practice quizzes | Allow, learner-safe data | Allow | Allow | Allow | Allow | Allow | Allow |
| Take an assigned official quiz | RPC only with valid code | RPC only | RPC only | RPC only | RPC only | RPC only | RPC only |
| Read official correct answers directly | Deny | Deny | Deny | Deny | Deny | Deny through learner API | Deny through learner API |
| Create content | Deny | Deny | Own market draft | Market | Market | Allow | Allow |
| Edit content | Deny | Deny | Own market content | Market | Market | Allow | Allow |
| Publish market content | Deny | Deny | Deny | Market, if approved policy permits | Market, if approved policy permits | Allow | Allow |
| Approve nationwide content | Deny | Deny | Deny | Deny | Deny | Allow | Allow |
| Generate assessment codes | Deny | Deny | Proposed deny | Market | Market | Allow | Allow |
| View assessment results | Deny | Own result summary only if product requires | Proposed managed team only | Managed/market | Market | Allow | Allow |
| Download result PDF | Deny | Own only if product requires | Managed only if approved | Managed/market | Market | Allow | Allow |
| Manage users | Deny | Deny | Deny | Managed lead techs/technicians | Managed supervisors/lead techs/technicians | Non-admin roles | All except unsafe self-demotion workflows |
| Change roles/markets/activation | Deny | Deny | Deny | Managed scope | Managed scope | Non-admin roles | Administrative workflow |
| Configure system-wide settings | Deny | Deny | Deny | Deny | Deny | Allow | Allow |
| View nationwide analytics | Deny | Deny | Deny | Deny | Deny | Allow | Allow |
| View market analytics | Deny | Deny | Proposed managed only | Market | Market | Allow | Allow |

Items marked “proposed” need product-owner confirmation before implementation.

## Resource-level matrix

### Profiles and authorization attributes

| Actor | Select | Insert | Update | Delete |
| --- | --- | --- | --- | --- |
| Signed out | Deny | Deny | Deny | Deny |
| Technician | Own safe profile fields | Deny | Own preferences through narrow API | Deny |
| Lead Tech | Own plus managed display fields if required | Deny | Own preferences only | Deny |
| Supervisor | Own plus managed users | Through approved user workflow if allowed | Managed users, restricted fields | Deny |
| AOM | Own plus market/managed users | Through approved user workflow | Managed users, restricted fields | Deny |
| Admin | All profiles except unnecessary secret/auth data | Approved user workflow | Non-admin roles and account state | Prefer deactivate; no hard delete |
| Super Admin | All profiles except unnecessary secret/auth data | Approved user workflow | Administrative hierarchy | Exceptional audited workflow only |

Direct user-owned profile updates must never include `role`, `market_id`, `reports_to_user_id`, `is_active`, `email`, or `user_id`. User-editable preferences should live in a separate table or be updated through a narrow function.

### Public learning content

Applies to sections, categories, study guides, and public media.

| Actor | Select | Insert | Update | Delete |
| --- | --- | --- | --- | --- |
| Signed out | Published nationwide only | Deny | Deny | Deny |
| Technician | Published nationwide and own market | Deny | Deny | Deny |
| Lead Tech | View scope plus own drafts | Own market drafts | Own content | Own draft/archive workflow only |
| Supervisor | Market plus nationwide | Market | Market | Market archive workflow |
| AOM | Market plus nationwide | Market | Market | Market archive workflow |
| Admin | All | All | All | Archive preferred |
| Super Admin | All | All | All | Archive preferred |

Raw HTML or editor JSON must pass schema and sanitization rules independently of authorization.

### Quizzes, questions, and correct answers

| Surface | Signed out/learner | Content editor | Admin |
| --- | --- | --- | --- |
| Practice quiz metadata | Learner-safe read | Scoped management | Full management |
| Official quiz metadata | RPC-only, valid-code scope | Scoped management | Full management |
| Official question prompt/options | RPC-only, valid-code scope | Scoped management | Full management |
| Official `correct_answer` | Deny direct access | Only when permission requires authoring | Management access |
| Official explanation | Return only under approved feedback rule | Scoped management | Management access |
| Quiz-question membership | No direct broad listing | Scoped management | Management access |

Learner-safe DTOs must be database/API projections that omit answer columns, not browser-side deletion after retrieving full rows.

### Access codes

| Actor | Direct select | Direct insert | Direct update | Direct delete | Allowed operation |
| --- | --- | --- | --- | --- | --- |
| Signed out | Deny | Deny | Deny | Deny | Validate and submit through narrow RPC only |
| Technician/Lead Tech | Deny | Deny | Deny | Deny | Use own issued code through narrow RPC |
| Supervisor | Deny broad table access | Deny direct | Deny direct | Deny direct | Create/revoke/list market-scoped codes through management API |
| AOM | Deny broad table access | Deny direct | Deny direct | Deny direct | Create/revoke/list market-scoped codes through management API |
| Admin | Management projection | Management API | Management API | Revoke rather than delete | Nationwide management |
| Super Admin | Management projection | Management API | Management API | Exceptional audited delete | Nationwide management |

Management projections should mask or omit the full bearer code after issuance where operationally possible.

### Official attempts and results

| Actor | Select | Insert | Update | Delete |
| --- | --- | --- | --- | --- |
| Signed out | Submitted result response only | RPC only | Deny | Deny |
| Technician | Own summary if required | RPC only | Deny | Deny |
| Lead Tech | Own plus explicitly managed summaries if approved | RPC only | Deny | Deny |
| Supervisor | Managed/market results | RPC only for own attempt | Correction request only | Deny |
| AOM | Market results | RPC only for own attempt | Correction request/approval per policy | Deny |
| Admin | All results | RPC only for own attempt | Audited correction workflow | Deny |
| Super Admin | All results | RPC only for own attempt | Audited correction workflow | Exceptional retention workflow only |

Official attempts are immutable evidence. Corrections create linked adjustment records rather than overwriting the original score or identity.

### Result PDFs

| Actor | List objects | Download | Upload | Update/Delete |
| --- | --- | --- | --- | --- |
| Signed out | Deny | Deny | Deny | Deny |
| Technician | Deny | Own signed URL only if required | Deny | Deny |
| Lead Tech | Deny | Approved managed scope only | Deny | Deny |
| Supervisor | Deny direct listing | Managed/market signed URL | Deny | Deny |
| AOM | Deny direct listing | Market signed URL | Deny | Deny |
| Admin | Authorized report index | Signed URL | Internal generation only | Retention workflow |
| Super Admin | Authorized report index | Signed URL | Internal generation only | Retention workflow |

The bucket must be private. Object names must be opaque and must not embed LDAP, email, or other personal identifiers.

### Media library

Public training media and private result evidence must not share an access model.

- Public/published training images may use a public bucket after content approval.
- Draft, internal, or employee-specific media requires a private bucket and scoped policies.
- Upload, replacement, and deletion are restricted to authorized content managers.
- MIME type, file size, and filename/path rules apply independently of role.

### Content approval requests

| Actor | Create | View | Decide | Delete |
| --- | --- | --- | --- | --- |
| Technician | Deny | Deny | Deny | Deny |
| Lead Tech | Own content request | Own requests | Deny | Withdraw pending own request |
| Supervisor | Market request | Market requests | Deny unless explicitly delegated | Withdraw pending market request |
| AOM | Market request | Market requests | Deny unless explicitly delegated | Withdraw pending market request |
| Admin | Create if needed | All | Approve/reject | Audited cleanup only |
| Super Admin | Create if needed | All | Approve/reject | Audited cleanup only |

### Analytics and exports

- Technicians: own progress/completion only.
- Lead Techs: managed-team summaries only if approved by the product owner.
- Supervisors: market/managed-team detail.
- AOMs: market detail and aggregates.
- Admins/Super Admins: nationwide detail and aggregates.
- Aggregate queries must preserve the same row boundaries as detail queries.
- Exports require an explicit capability and an audit event.
- Personally identifiable fields should be omitted from aggregates by default.

## Route and UI enforcement

The application should define named permissions such as:

- `content.view`
- `content.create`
- `content.edit_market`
- `content.approve_nationwide`
- `quiz.manage`
- `access_code.manage_market`
- `result.view_market`
- `result.correct`
- `report.download_market`
- `user.manage`
- `settings.manage`
- `analytics.view_market`
- `analytics.view_nationwide`

Every protected route must declare required permissions. Navigation, page actions, API behavior, and RLS tests must derive from the same approved matrix.

## Required test identities

Create non-production fixtures for:

- one super admin;
- one admin;
- an AOM in Market A;
- an AOM in Market B;
- a supervisor in each market;
- a lead tech in each market;
- a technician in each market;
- an inactive user;
- an authenticated user with no profile; and
- a signed-out caller.

For every allowed market operation, test the same operation against the other market and expect denial.

## Approval questions

The following choices need confirmation before the matrix is considered approved:

1. May lead techs view individual results for technicians they oversee, or only aggregates?
2. May supervisors approve market publication, or only create/edit and request admin approval?
3. May AOMs approve market publication?
4. Should technicians be able to download their own result PDF?
5. Are supervisors and AOMs both allowed to generate official assessment codes?
6. Should admin users be prevented from managing peer admins, leaving that solely to super admins?
7. Which roles may export identifiable result data?
8. Are result corrections two-person approvals or single-admin audited actions?

Until approved, ambiguous capabilities should default to deny.
