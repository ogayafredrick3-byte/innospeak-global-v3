# Supabase frontend wiring and release handoff

The frontend separates public catalogue content, learner-facing workflows and privileged operations. Configure local development with `.env.example`; only the Supabase URL and publishable/anon key belong in browser variables.

## Browser configuration

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The public site should render if these are absent. Authenticated actions should show clear service/configuration errors rather than pretending that data was saved.

## Catalogue-to-LMS contract

- `src/lib/data/programmeData.js` is the public catalogue source for course identity and marketing metadata.
- `lms_courses` is the operational source for published teaching records, modules, lessons, enrolments and progress.
- `lms_courses.code` is the canonical bridge for seeded catalogue courses; `programme_code` is also accepted for instructor-linked courses.
- `src/lib/data/lmsCourse.js` resolves this bridge and preserves standalone LMS courses that have no public catalogue match.
- Free published courses may use direct self-enrolment. Paid catalogue courses must route through checkout and only become active after server-verified payment confirmation.
- Owner-authorised self-paced publication is distinct from external accreditation, specialist review and a fixed-date cohort.

## Payment and server-side configuration

Set provider secrets in Supabase Edge Function secrets, never in `VITE_*` variables. Required configuration includes the Supabase-provided `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, the relevant M-PESA/PayPal provider credentials, the M-PESA callback URL, `MPESA_ENV` (`sandbox` for testing), and `PUBLIC_SITE_URL` for the PayPal return flow. The actual provider configuration must be tested with sandbox/test transactions before production.

`create_course_payment` derives the amount, currency, course ID and learner identity from the server-owned published course record. `confirm_payment_and_enroll` is restricted to the trusted server role. Do not grant direct browser execution of payment-confirmation RPCs.

## Database safety

1. Inspect the real Supabase migration history.
2. Back up the database and rehearse pending migrations in staging.
3. Never replay `20260829080000_reset_lms_tables_before_rebuild.sql` against live learner data; it contains destructive table drops.
4. Verify row counts, course codes, module/lesson counts, foreign keys and RLS policies after the rollout.
5. Test access as a learner, instructor, administrator, employer and sponsor using separate test accounts.

## Pre-launch checks

- Run `npm ci`, `npm test`, `npm run audit:project` and `npm run build`.
- Test sign-up, login, logout, password reset and expired sessions.
- Test free enrolment and verify paid-course direct insert is denied by RLS.
- Test M-PESA STK initiation, provider verification, callback amount matching and idempotent enrolment.
- Test PayPal create-order, return route, capture amount/currency checks and cancellation.
- Test course player, lesson progress, quiz/assignment submissions, grading, certificate eligibility and learner dashboard.
- Test Row Level Security, storage access and Edge Function authorization.
- Verify backup and recovery procedures.

No claim is made here that the live Supabase database, payment providers or production deployment have been verified.
