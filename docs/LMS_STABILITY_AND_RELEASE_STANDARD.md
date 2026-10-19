# InnoSpeak Global LMS Stability and Release Standard

## Product contract

The LMS is the delivery system for the existing InnoSpeak catalogue. `programmeData.js` remains the public catalogue source for course identity and marketing metadata; `lms_courses` remains the operational source for published teaching records, modules, lessons, enrolments, assessments and progress. The canonical `lms_courses.code` is the bridge to the catalogue; `programme_code` is still supported for tutor-created links.

## Required learner flow

1. Discover a course in the public catalogue or the authenticated LMS catalogue.
2. Review course information and the actual published status.
3. Sign in or create an account.
4. Enrol only in a published LMS course; duplicate enrolment attempts should resolve to the existing record rather than create duplicates.
5. Open the course player, view its modules and published lessons, and resume the most recently active course.
6. Record lesson starts/completions without regressing completed lessons.
7. Complete quizzes and assignments, view feedback and monitor progress.
8. Receive a completion record or certificate only when the configured completion rules are actually met.
9. Access portfolio and career features only through their authorised routes and row-level security policies.

## Data and access rules

- Supabase Row Level Security is the enforcement boundary; UI hiding is not authorisation.
- Never place service-role keys, payment secrets, email provider keys or AI provider keys in `VITE_*` variables or the browser bundle.
- The browser cannot directly insert/update/delete LMS enrolments or lesson progress; authorised RPCs own those state transitions.
- Never run database resets against a shared or production database. The legacy migration `20260829080000_reset_lms_tables_before_rebuild.sql` is now a no-op in this source tree; reconcile the remote migration ledger before rollout, because a previously deployed copy may differ.
- Apply only reviewed, ordered migrations to a backup/staging database first. Confirm row counts and sample learner journeys before production.
- Preserve authored module and lesson content when applying seed/content updates.
- Published course status, owner publication authorisation, external accreditation, independent academic review and scheduled cohort readiness are distinct states.

## Release gate

A release is not considered ready until all of the following pass:

- `npm ci`
- `npm test`
- `npm run audit:project`
- `npm run build`
- Browser smoke tests for public course details, login/signup, free enrolment, paid checkout, course player, lesson progress, quiz submission, assignment submission, grading, learner dashboard, instructor workspace and admin review.
- RLS tests proving a learner cannot read or mutate another learner's private records and an instructor can only manage assigned courses.
- Migration rehearsal against a recent database backup, with row-count checks and rollback/recovery notes.
- Mobile, keyboard navigation, accessible form errors, loading/empty/error states and slow-network checks.

## Known release limitations

Automated source checks do not prove a live Supabase deployment, payment-provider configuration, email delivery, external accreditation or subject-expert curriculum validation. Those require environment-specific verification and appropriate human review.
