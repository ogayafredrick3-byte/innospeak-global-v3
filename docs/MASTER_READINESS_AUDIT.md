# InnoSpeak Global — Master Readiness Audit

**Audit basis:** the latest uploaded source archive, reviewed 19 October 2026. This document distinguishes source-level changes from live-environment work that cannot be proven from a ZIP alone.

## Executive assessment

The platform has a substantial product foundation: a public catalogue, 368 course codes, Academy and Labs pathways, learner and instructor LMS routes, admin tools, admissions/student services, career/employer and sponsor areas, Supabase migrations and payment Edge Functions. The priority is not to add more routes; it is to make the data model, learner journeys, permissions, payment lifecycle and educational content dependable end to end.

## Findings and changes included in this source package

| Area | Finding | Change included |
|---|---|---|
| Source integrity | An unused component imported a nonexistent `trustedData.js`. | Removed the orphan component; source import audit now reports zero missing relative imports. |
| Catalogue/LMS bridge | Seeded courses use `lms_courses.code`, while the resolver only checked `programme_code`. | Resolver supports both fields; regression tests cover catalogue-linked and standalone LMS courses. |
| Catalogue consistency | Catalogue, curriculum records and LMS delivery records can drift. | Audit now checks 368 course curricula, six modules each, rollout migration coverage and assessment totals. |
| Curriculum quality | 2,208 module records reused the same generic module outcomes. | All 368 generated curricula now have six modules with course-specific outcome sets, domain-pattern activities and capstones; the audit rejects the old generic outcome template. |
| LMS enrolment | Earlier client paths wrote enrolment rows directly and the legacy update policy allowed learners to change their own status. | New `enroll_in_free_course` RPC validates auth, publication and canonical free-course price, is idempotent, reactivates dropped free enrolments, and blocks direct browser inserts; enrolment status mutation is admin-only. |
| LMS progress | Learners could write progress rows directly without an active-enrolment check, and lesson loading began before enrolment verification. | New start/complete RPCs enforce active enrolment and published lessons; direct progress writes are revoked; the player waits for enrolment, filters to published lessons and rejects cross-course lesson IDs. |
| Paid-course security | Browser requests could provide payment amount and student identifiers; direct paid enrolment was not constrained by a canonical price record. | Added course price fields, server-side payment creation, free-only direct enrolment and service-role-only payment confirmation. |
| M-PESA | Initiation trusted client-supplied payment details and callback success alone. | Initiation checks authenticated ownership and uses stored payment details; callback checks amount and performs provider STK Query verification before granting access. |
| PayPal | Function dispatch did not match the root `functions.invoke` pattern, return/capture flow was incomplete, and amount/currency needed server-side checks. | Dispatch supports body actions, create/capture checks stored payment ownership and amount/currency, and a dedicated `/payment-return` route completes capture. |
| Global pricing | Catalogue prices are currently KES; an automatic exchange rate is not configured. | PayPal is disabled for KES-priced courses until approved USD pricing is supplied; the UI no longer implies an unsupported checkout path. |
| Release safety | The uploaded archive included `.env`, `.git`, dependencies and local build/log artefacts. | The prepared release package excludes secrets, Git history, dependencies, caches, logs and build output. |
| Continuous checks | No tests covered the course resolver/curriculum contract. | Added Node tests, expanded project audit and a GitHub Actions quality workflow. |

## Complete readiness workstream

### 1. Technical stability

- Keep a single shared design system and remove orphan/duplicate UI code.
- Run clean install, production build, linting and automated regression tests in CI.
- Add browser end-to-end tests for public routes, authentication, learner, instructor and admin journeys.
- Test responsive layouts, keyboard navigation, screen-reader labels, focus states, loading/empty/error states and slow networks.
- Add production error monitoring, uptime monitoring, structured logs and release rollback procedures.

### 2. Data architecture and catalogue

- Keep stable course codes and one authoritative mapping between catalogue courses and LMS records.
- Check all 368 courses, modules, lessons, assessments and progress records for referential integrity.
- Make all count widgets query authoritative data and label catalogue entries separately from actual learners, enrolments and completions.
- Version course content and record publication/review changes.
- Prevent accidental duplication when seeding or retrying migrations.

### 3. LMS learning flow

- Verify the complete learner journey: discover → account → enrol → start lesson → save progress → submit quiz/assignment → receive feedback → complete course → verify eligibility/certificate.
- Verify resume-learning behaviour, progress calculations, completion rules, quiz attempts, assignment submissions, grading and notifications.
- Ensure learners cannot view or alter other learners' private records.
- Keep enrolment and lesson-progress state changes behind authenticated server-side RPCs; verify RLS with distinct learner accounts.
- Ensure instructors can only edit assigned courses and administrators have appropriate audited privileges.
- Add idempotency and recovery for interrupted writes, duplicate submissions and network retries.

### 4. Payments and access control

- Rehearse the new price/payment migration in staging and verify all 368 prices match the catalogue.
- Verify that direct browser insertion of a paid-course enrolment is denied by RLS.
- Test pending, paid, failed, cancelled and repeated payment events.
- Test provider callbacks, amount/currency matching, transaction references and duplicate callbacks.
- Confirm that no frontend can call payment-confirmation RPCs directly.
- Configure and test M-PESA with real sandbox credentials and callback URL.
- Configure `PUBLIC_SITE_URL` and PayPal credentials, and test create-order, return, capture and cancellation.
- Approve and store USD prices or an explicit currency-conversion policy before offering PayPal to international learners. Do not derive prices from an unapproved live exchange rate.

### 5. Curriculum and assessment quality

- Validate course-specific scope, level, prerequisite requirements, current terminology and references.
- Check module sequencing and advertised duration against actual expected learner workload.
- Review all assessment briefs, rubrics, answer keys, pass thresholds, moderation and reassessment rules.
- Review high-risk practical content for safety, supervision, equipment and local regulatory requirements.
- Distinguish owner-authorised publication from independent academic review, external accreditation and professional licensing.
- Test that the LMS lessons surfaced from Supabase reflect the enriched curriculum and do not contain stale generic content after the additive migration is applied.

### 6. Security, privacy and safeguarding

- Test Row Level Security using separate learner, instructor, administrator, employer and sponsor accounts.
- Audit all `SECURITY DEFINER` functions, RPC grants, storage policies and Edge Function authorization.
- Keep service-role, payment, email and AI provider secrets server-side; rotate any credential that has ever been committed to a shared repository.
- Apply rate limits, input validation, file type/size limits, audit logs and secure error handling.
- Review privacy notice, retention, data export/deletion, consent and access controls for portfolios and employer sharing.
- Review safeguarding and moderation for younger learners and community spaces where applicable.

### 7. Global learner experience

- Improve low-bandwidth and mobile performance; offer transcripts, captions and accessible resources.
- Add localisation-ready date/time/currency formatting and translated learning content where supported.
- Establish international payment options, clear fees, refund rules, learner support hours and time-zone handling.
- Ensure portfolio sharing is consent-based and employers only see the evidence a learner chooses to share.
- Make career, scholarship and sponsorship opportunities clearly distinguish confirmed opportunities from proposals.

### 8. Growth, retention and outcomes

- Build search-friendly course pages and useful open learning resources.
- Introduce a goal-based pathway builder and transparent recommendations.
- Centre the product around a Proof-to-Opportunity Loop: learn, build, demonstrate, share evidence and discover next steps.
- Measure activation, lesson completion, assessment success, course completion, learner retention and demonstrable outcomes—not just sign-ups or page views.
- Establish real partnerships and collect consent for testimonials and learner stories.

## Migration safety warning

The source-tree version of `supabase/migrations/20260829080000_reset_lms_tables_before_rebuild.sql` has been replaced with a non-destructive no-op. A previously deployed copy may differ, so inspect the Supabase migration ledger and never reset or replay old migrations against live learner records. Back up the database, test pending migrations in staging, and reconcile data before production deployment.

## Validation performed on this archive

- `npm test`: 17 tests passed.
- `npm run audit:project`: passed with 368 unique courses, 368 curricula, 2,208 modules, six modules per course, 2,208 unique module outcome sets, zero missing relative imports, zero missing curriculum records and zero assessment weighting errors.
- Catalogue audits: 12 Academy pathways, seven Labs tracks and 368 course entries verified.
- Babel syntax scan: 431 JS/JSX/TS source files, zero syntax errors.
- ZIP integrity: passed.

## Not yet verified

A clean production Vite build could not be completed because dependency installation timed out in this environment. No migration was applied to the live Supabase project, and no real payment-provider round trip, browser E2E suite, live RLS penetration test or deployment was verified. The project is improved and better guarded, but must not be described as production-certified until those checks pass in the actual deployment environment.
