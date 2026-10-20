# InnoSpeak Global — LMS Stability Review

Review date: 2026-10-19

## Changes implemented in this source update

- Added a single server-authorised RPC path for free-course enrolment. It checks authentication, publication state, canonical course pricing and existing enrolment state; repeated requests are idempotent, and a dropped free enrolment can be reactivated without direct table writes.
- Restricted direct browser inserts into `lms_enrollments`; learners can no longer change their own enrolment status or delete their enrolment through the table API. Administrative status changes remain governed by RLS.
- Added server-authorised lesson-start and lesson-completion RPCs. They require a published lesson and an active enrolment, bind progress to `auth.uid()`, and preserve completed status when a learner revisits a lesson.
- Removed direct client-side writes to `lesson_progress`; browser code now uses the guarded RPCs.
- Made learner enrolment reads explicitly filter by the authenticated user ID, in addition to relying on RLS.
- Prevented the learning player from loading lesson content or writing progress until the course enrolment and lesson membership have been verified.
- Added request sequencing to reduce stale course/lesson results when users navigate quickly between lessons or courses.
- Sanitised lesson HTML with a strict allowlist, removed script/embed/event-handler content and unsafe URL schemes, and added readable Markdown rendering for generated lesson text.
- Restricted lesson video embeds to recognised YouTube hosts and validated external/media URLs as HTTP(S).
- Signed private lesson resource URLs before returning them from the LMS lesson query, so player downloads work with private storage policies.
- Improved authentication initial-session handling and profile-loading state so a slow profile request does not race with an auth event or prematurely redirect a role-protected user.
- Added a completed-course state to the public enrolment panel and a clear backend-not-configured state instead of presenting a broken enrolment action.
- Replaced the historical destructive LMS reset migration with a non-destructive no-op. This avoids accidental table loss if the migration version was not recorded in a database's history.
- Added automated regression tests and audit checks for these behaviours.

## Verification performed

- `npm test`: 17 tests passed.
- `npm run audit:project`: passed; 368 unique catalogue courses, 2,208 generated modules, 368 curriculum records, zero missing relative imports, zero duplicate course codes, zero catalogue/registry mismatches and zero assessment-weighting total errors.
- Static syntax parsing: 431 JavaScript/JSX/TypeScript files parsed, zero syntax errors.
- ZIP integrity: checked after release packaging.

## Verification not performed

- Production Vite build: blocked in this environment because the uploaded `node_modules` contains Windows-specific optional native packages while this runtime is Linux. Installing the Linux packages failed because the npm registry was unreachable (`EAI_AGAIN`). The release package therefore excludes `node_modules`; install dependencies on the target machine with `npm ci` before building.
- SQL execution against a live PostgreSQL/Supabase instance: not performed. The new migration is included but has not been applied to any live database.
- Live authentication, payment provider callbacks, Row Level Security behaviour, storage policies and full browser learner journey: not verified against the deployed Supabase project.
- Independent subject-expert validation of the 368 curricula: not performed. Course-specific structured drafts exist, but course content depth and practical assessment quality still need a separate educational quality programme.

## Safe rollout checklist

1. Back up the Supabase project before deploying any database change.
2. Inspect migration history with `supabase migration list` and compare local and remote versions. Do not run `supabase db reset` against a shared or production project.
3. Review the pending migration list carefully. Historical migrations may already have been applied on the live project; do not manually replay them.
4. Apply changes first to a staging project that has a recent copy of the schema and representative test data.
5. Run the new `20261019180000_lms_flow_hardening.sql` migration only after the migration history has been reconciled and its prerequisites (`lms_courses.is_free`, `lms_courses.price_amount`, `public.is_lms_admin()`, `modules`, `lessons`, `lesson_progress`, `lms_enrollments`) are confirmed.
6. Test free enrolment, paid checkout, repeated enrolment, dropped enrolment reactivation, lesson start, lesson completion, progress privacy, certificate eligibility and admin access using separate test accounts.
7. Run `npm ci`, `npm test`, `npm run audit:project` and `npm run build` on the target environment.
8. Deploy frontend and edge functions only after staging tests pass. Keep a rollback plan and monitor errors after rollout.

## Critical architecture rule

The public catalogue is the source of truth for course identity and display metadata. Supabase is the source of truth for live course availability, enrolments, learning content, assessment state, progress and certificates. A catalogue flag alone must never grant access to LMS lessons. The database must enforce enrolment and ownership, and the interface must handle backend errors without pretending a learner has been enrolled.


## Tutor-authored lesson content (2026-10-20)

- Teaching notes are not bundled into the application; tutors create and upload lesson materials.
- The rich-text editor initializes lesson content once per lesson rather than replacing the editor HTML on every keystroke, preserving normal caret/editing behavior.
- Lesson draft/publish validation checks the title, rejects unsafe media URLs, and requires meaningful content, media, a practical activity, or a saved resource before publishing.
- Resource forms validate external links and prevent saving while a file upload is still running.
- These are source-level safeguards. Confirm storage bucket permissions, role-based access, and end-to-end upload/publication after Supabase is configured in staging.
