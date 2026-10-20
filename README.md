# InnoSpeak Global

InnoSpeak Global is a React/Vite learning ecosystem combining a public course catalogue, admissions and student services, an authenticated learning management system (LMS), practical Labs, instructor tools, career connections, employer tools, and Foundation/sponsor workflows.

## Current source baseline

- 368 unique public catalogue courses.
- 368 generated course curriculum records.
- Six modules per course: 2,208 modules in total.
- Course-specific module outcomes, practice activities, assessment plans and applied capstones are generated for all catalogue courses.
- The public catalogue and LMS delivery records are bridged by stable course codes. `lms_courses.code` is the canonical bridge for seeded catalogue courses; `programme_code` remains supported for instructor-linked courses.
- The LMS includes learner, instructor and admin experiences for course delivery, lessons, progress, assignments, quizzes, grading, discussions, notifications, portfolio and certificates.

Generated course content has been authorised by the platform owner for catalogue publication and self-paced study. This is **not** evidence of independent subject-expert validation, external accreditation, formal qualification recognition, or availability of live instructors/labs/cohorts. Those claims must only be made when supported by appropriate records.

## Technology

- React 18, Vite 5, React Router 6
- Tailwind CSS and Framer Motion
- Supabase Auth, Postgres, Row Level Security, Storage and Edge Functions
- Node.js 20+ recommended for local checks and CI

## Run locally

1. Install Node.js LTS.
2. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only.
3. Run `npm ci`.
4. Run `npm test`.
5. Run `npm run audit:project`.
6. Run `npm run dev`.
7. Before release, run `npm run build` and complete the release checklist in [`docs/LMS_STABILITY_AND_RELEASE_STANDARD.md`](./docs/LMS_STABILITY_AND_RELEASE_STANDARD.md).

The current release archive intentionally excludes `.env`, Git metadata, dependencies, caches, logs and build output. Never put Supabase service-role keys, payment credentials, AI provider keys or email-provider secrets in `VITE_*` variables or browser code.

## Core routes

### Public

- `/`, `/about`, `/academy`, `/programs`, `/programs/:slug`
- `/courses`, `/courses/:courseCode`, `/labs`
- `/apply`, `/contact`, `/faq`, `/privacy`, `/terms`
- `/payment-return` for verified PayPal return handling

### Learner

- `/learn`, `/learn/catalog`, `/learn/sessions`, `/learn/calendar`
- `/learn/portfolio`, `/learn/goals`, `/learn/projects`, `/learn/mentorship`
- `/learn/courses/:courseId`, `/learn/courses/:courseId/lessons/:lessonId`
- `/learn/assignments/:assignmentId`, `/learn/quizzes/:quizId`

### Instructor and administration

- `/teach`, `/teach/courses`, `/teach/courses/:courseId`, `/teach/materials`
- `/teach/assignments`, `/teach/assessments`, `/teach/courses/:courseId/gradebook`
- `/admin`, `/admin/lms`, `/admin/course-review`, `/admin/payments`

Other existing portal, employer, career and sponsor routes remain in `src/App.jsx`.

## Supabase migration safety

Do **not** blindly run every SQL file against a live database. First inspect the actual Supabase migration history, back up the database, rehearse pending migrations in staging, and compare schema/data before and after. The historical migration `20260829080000_reset_lms_tables_before_rebuild.sql` has been replaced in this source tree with a non-destructive no-op. If an older copy was already applied remotely, Supabase should not replay that version; reconcile the remote migration ledger before deployment and never run `supabase db reset` against production.

The latest additive migrations include:

- `20261019100000_owner_authorized_catalogue_rollout.sql` — seeds the 368 catalogue course records and module/lesson scaffolds.
- `20261019130000_lms_learning_content_hardening.sql` — fills empty generic lesson objectives/activity fields without overwriting authored content.
- `20261019140000_payment_and_enrollment_security.sql` — adds canonical prices, server-created payment records, free-course self-enrolment policy and restricts payment confirmation to the trusted server role.
- `20261019150000_lms_progress_rpc_security.sql` — restricts learner progress reads to the learner or authorised staff.
- `20261019160000_storage_access_hardening.sql` — applies role- and enrolment-aware storage access for private LMS files.
- `20261019170000_rpc_signature_and_authorization_reconciliation.sql` — reconciles legacy RPC contracts and completion permissions.
- `20261019180000_lms_flow_hardening.sql` — routes free enrolment and lesson progress writes through authenticated, server-authorised RPCs and blocks direct learner mutation of enrolment/progress records.

Apply only migrations that are genuinely pending in the target project's migration history. Verify table names, columns, foreign keys, RLS policies, storage policies, Edge Function secrets and RPC grants in staging before production.

## Payments and global readiness

Course prices currently use KES in the public catalogue. M-PESA checkout requires real Safaricom credentials and a verified callback and `MPESA_ENV` set to `sandbox` for testing or `production` for live use. PayPal return/capture requires PayPal credentials and the server-side `PUBLIC_SITE_URL` secret. PayPal is intentionally disabled in the UI for KES-priced courses until an approved USD price is supplied; no exchange rate or price is invented. Global payment coverage therefore remains a launch item.

Payment creation now derives price and learner identity from the server-owned course/payment record. The browser must not be trusted to set amount, paid status or learner ID. Payment-provider secrets stay in Supabase Edge Function secrets.

## Validation and release status

The latest source-level checks recorded in the project include:

- Twenty-three Node tests pass, covering catalogue-to-LMS resolution, curriculum coverage, enrolment/progress RPC guards, safe lesson rendering, URL safety, tutor lesson publication validation, and the non-destructive legacy reset migration.
- Project audit passes: 368 unique course codes, no missing relative imports, all 368 curriculum records present, six modules per course, 2,208 unique module-outcome sets, no old generic outcome templates, safe enrolment/progress migration checks, and assessment weights total 100.
- The project source audit reports zero missing relative imports and zero duplicate catalogue course codes. A fresh production build remains unverified in this environment because dependency installation did not complete.
- Public catalogue audits pass for all 12 Academy pathways, seven Labs tracks and 368 course entries.

A production build, live Supabase migration, payment-provider round trip, RLS penetration test and browser-based end-to-end test suite have **not** been verified in this environment. Passing source audits are not proof of a live production deployment.

See [`docs/MASTER_READINESS_AUDIT.md`](./docs/MASTER_READINESS_AUDIT.md) for findings and remaining work, [`docs/LMS_STABILITY_REVIEW.md`](./docs/LMS_STABILITY_REVIEW.md) for the implemented LMS hardening, [`docs/DEPLOYMENT_STABILITY_CHECKLIST.md`](./docs/DEPLOYMENT_STABILITY_CHECKLIST.md) for safe rollout steps, and [`docs/LMS_STABILITY_AND_RELEASE_STANDARD.md`](./docs/LMS_STABILITY_AND_RELEASE_STANDARD.md) for acceptance criteria.

## Curriculum quality review

Run `npm run audit:curriculum` to generate the curriculum quality summary and the per-course CSV review queue. The screening highlights content that needs human review; it does not claim independent academic validation.



## Tutor lesson workflow

Tutors author and upload their own lesson notes and resources in the LMS; this repository does not preload full teaching notes. The lesson editor supports drafts, content editing, practical activities, lesson resources, quizzes and assignments. Publishing now checks that a lesson has a title and at least one meaningful learning item, and rejects unsafe video/external URL schemes. Resource uploads are limited to 25 MB per file by the client data layer. Live upload, storage permissions, role access, and publication behavior must be verified after Supabase is wired in a staging environment.
