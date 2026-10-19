# InnoSpeak Global — Upgrade and Verification Notes

Prepared from the supplied source archive on 19 October 2026.

## Latest source improvements

### Catalogue and course identity
- Preserved the 368 unique catalogue course codes and fixed the LMS-to-catalogue bridge so seeded `lms_courses.code` values resolve correctly; instructor-linked `programme_code` remains supported.
- Removed an unused component that imported a missing `trustedData.js` file and was not referenced elsewhere.
- Kept public course identity/marketing metadata separate from operational LMS course, module, lesson and enrolment data.

### Curriculum quality baseline
- Updated all 368 generated curricula with six modules each (2,208 total), course-specific module outcomes, subject-pattern practice activities, assessment plans and applied capstones.
- Replaced the repeated generic module-outcome template with distinct outcome sets for each of the 2,208 modules.
- Added an additive SQL migration that populates lesson learning objectives and practical activity fields only where the seeded generic template remains and authored content is absent.
- Owner authorisation enables catalogue publication and self-paced study; it is not represented as external accreditation or independent specialist validation.

### LMS learner flow
- Added the `enroll_in_free_course` server-side RPC as the single free-course enrolment path. It verifies authentication, published status, canonical free-course pricing and duplicate state; direct browser enrolment inserts are revoked.
- Restricted learner enrolment status updates/deletes to admin policy and moved lesson start/completion to authenticated server-side RPCs that require an active enrolment and a published lesson.
- Prevented lesson progress from regressing a completed lesson to in-progress, and stopped the player from requesting module/lesson content until active enrolment has been verified.
- Added request sequencing to reduce stale content when learners move quickly between courses/lessons.
- Sanitised lesson HTML, rendered generated Markdown safely, validated external media URLs and restricted YouTube embeds to known hosts.
- Signed private lesson resource URLs before the player receives them.
- Made learner enrolment reads explicitly filter by the current user and made completed-course states clearer.
- Fixed auth/profile hydration timing so admin, instructor and employer routes do not redirect before profile loading finishes.
- Replaced the old destructive LMS reset migration with a non-destructive no-op in this source tree.
- Added regression tests for enrolment/progress RPCs, URL safety, private resource signing and migration safety.

### Payment and enrolment security
- Added canonical price fields to LMS courses and a server-side payment-creation RPC that derives price, currency, course ID and student identity from trusted records.
- Restricted direct browser self-enrolment to published free courses. Paid-course enrolment must come from trusted server-side payment confirmation.
- Restricted `confirm_payment_and_enroll` execution to the Supabase service role.
- Hardened M-PESA initiation to validate the signed-in user, payment ownership, stored provider, amount, currency and phone; callback processing checks amount and calls STK Query before confirming enrolment.
- Hardened PayPal order creation/capture to validate user/payment ownership, match order and capture amounts/currency to the stored payment, and route the return through `/payment-return`.
- Disabled PayPal for KES-priced courses until an approved USD price is configured rather than silently inventing a conversion rate.

### Quality automation and source hygiene
- Added `npm test`, a curriculum-quality-aware project audit and a GitHub Actions quality workflow.
- Added `docs/LMS_STABILITY_AND_RELEASE_STANDARD.md` and `docs/MASTER_READINESS_AUDIT.md`.
- The release archive excludes `.env`, `.git`, `node_modules`, local logs, caches and generated build output.

## Source checks performed

- Node tests: 17 passed.
- Project audit: passed with 368 unique catalogue courses, no missing relative imports, 368 curriculum records, six modules per course, 2,208 unique module-outcome sets, no old generic module outcome template, and no assessment-weighting errors.
- Public catalogue audit: 12 Academy pathways, seven Labs tracks and 368 catalogue entries verified.
- Babel syntax scan: 431 JS/JSX/TS source files parsed with zero syntax errors.
- ZIP integrity: passed for the reviewed source package.

## Not yet verified

A clean production Vite build could not be completed because dependency installation timed out in this environment. The SQL migrations have not been applied to the user's live Supabase project. M-PESA/PayPal sandbox round trips, real RLS isolation tests, storage policy tests, all browser end-to-end flows and production deployment remain unverified. Do not treat source checks as a live-production certification.

## Required deployment actions

1. Back up the real Supabase database and inspect migration history.
2. Reconcile local/remote migration history, then rehearse only genuinely pending migrations in staging. The legacy reset migration is a no-op in this source tree; never run database resets or replay older migration files blindly against live data.
3. Set server-side M-PESA/PayPal credentials and `PUBLIC_SITE_URL` in Supabase Edge Function secrets.
4. Configure approved USD pricing before enabling PayPal for international checkout.
5. Run `npm ci`, `npm test`, `npm run audit:project` and `npm run build` on the target platform.
6. Complete the release checks in `docs/LMS_STABILITY_AND_RELEASE_STANDARD.md`.
