# InnoSpeak Global Platform Upgrade

## Implemented in this delivery

### Public experience
- Added a real `/programs` catalogue instead of the previous placeholder page.
- Programmes are grouped into realistic learning areas and expose actual course records from the existing catalogue.
- Added program/course search and learning-area filtering.
- Reworked Labs naming away from the generic `School of ...` presentation while preserving stable internal IDs and project relationships.
- Removed fake social `#` links and the placeholder telephone number from the footer.
- Replaced application `alert()` feedback with an inline, accessible error state.

### Learner experience
- Added `/learn/sessions` for scheduled live classes, tutorials, workshops, practicals and office hours.
- Added `/learn/calendar` for a unified schedule view.
- Added `/learn/portfolio` for learner project evidence and issued certificates.
- Added navigation entries for the new learner areas.
- Portfolio supports creating/deleting project evidence and skill tags when Supabase is configured.

### Data foundation
Added a Supabase migration for:
- course sessions
- session attendance
- course prerequisites
- certificates
- portfolio items
- learning goals
- certificate verification RPC foundation

Added a learner service layer in `src/lib/supabase/learning.js`.

### Codebase cleanup
- Removed an unused duplicate legacy router/layout tree that contained unresolved imports and duplicate `Outlet` declarations.
- Source syntax and local-import checks pass for the `src` tree.

## Still requires production configuration

The project deliberately does not fake external services. The following need real institutional configuration/integrations before they can be considered production-live:

- Supabase project and RLS deployment
- payment gateway / M-Pesa credentials
- real video-conferencing provider links
- email/SMS provider credentials
- production certificate issuance workflow
- real instructor/session data
- real institutional contact/social URLs

The frontend presents honest empty/error states where data is not configured.

## Full-system additions in this build
- Cohorts & intake records
- Live session scheduling + learner attendance check-in
- Instructor session manager
- Instructor course gradebook for manual/practical components
- Learning goals CRUD
- Practical projects + milestone submission foundation
- Mentorship request workflow
- Career opportunity catalogue
- Certificate verification endpoint/page
- Expanded learner navigation and platform routes
- Course enrollment made idempotent

## Production integrations intentionally kept truthful
Google Meet/Zoom/Teams links are stored as session URLs rather than pretending InnoSpeak is its own video platform. Payments and M-Pesa require real merchant credentials and webhook infrastructure; the application does not fake successful transactions. Email/SMS providers likewise require deployment credentials.
