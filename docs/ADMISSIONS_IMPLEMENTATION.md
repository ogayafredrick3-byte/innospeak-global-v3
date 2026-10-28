# InnoSpeak Global Admissions Implementation

## Implemented in this project copy

- Admin approval is routed through `approve_application_with_admission`, rather than a direct browser update to `approved`.
- Admission numbers are allocated from a per-course/per-year sequence under a row update, with unique indexes on application and profile admission numbers.
- Legacy issued student numbers are preserved and copied into the admission-number field when missing. Legacy `accepted` applications with an existing identifier are normalized to `approved`.
- Public verification returns the applicant name, institutional email, and registration state; it does not return the applicant's personal email.
- Registration asks the applicant to use the same personal email that was submitted with the application. A database trigger enforces this before linking the new profile.
- Profile linking requires an approved application and rejects an admission number already linked to a different profile.
- A database trigger blocks direct inserts/updates that would approve an application without the server-side issuance workflow.
- Admission helper RPC permissions are restricted; the approval RPC checks the authenticated user's admin role.
- Regression tests cover the frontend/database contract.

## Verification performed on this uploaded project copy

- `node --test`: **28 passed, 0 failed**.
- `npm run audit:project`: **passed**; 427 source files scanned, 368 catalogue entries, no missing relative imports, 2,208 generated curriculum modules verified.
- `npm ci`: **could not complete** because the environment could not reach `registry.npmjs.org` (`EAI_AGAIN`). Therefore `vite build` has **not** been run successfully in this environment.
- The migration has **not** been executed against PostgreSQL or Supabase. No live database was changed.

## Wiring sequence

1. Review the existing production schema and migration history.
2. Apply the migrations to a separate staging Supabase project.
3. Test approval, unique number generation under concurrent requests, correct-email registration, duplicate registration rejection, profile linking, and student-ID login.
4. Run `npm ci`, `npm run check`, and browser smoke tests in the actual VS Code working copy.
5. Only after staging sign-off, apply the reviewed migrations to production.

This is an implemented code change in the supplied project copy, but the release is not marked production-validated until the build and database integration tests pass.
