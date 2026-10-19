# Deployment and Release Checklist

## Local source verification

```bash
npm ci
npm test
npm run audit:project
npm run build
```

`npm ci` and `npm run build` must be run on the operating system where the app will be built. Do not copy `node_modules` from Windows into Linux or vice versa.

## Supabase safety

- Take a fresh backup before database deployment.
- Inspect `supabase migration list` and reconcile local/remote history before pushing.
- Never run `supabase db reset` against production or a shared database.
- Do not manually replay old migrations. The legacy LMS reset migration is now intentionally a no-op in this source tree; databases where it was already applied will not replay it.
- Test the new LMS flow hardening migration on staging before production.
- Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in local `.env` for frontend configuration only. Never expose the service-role key, payment provider secrets or email provider secrets in `VITE_*` variables.

## Learner acceptance journey

1. A learner can register, confirm their account if required and sign in.
2. A published free course can be enrolled in once; repeating the request returns the same active enrolment.
3. A paid course cannot be enrolled in until the trusted payment flow confirms payment.
4. A learner can open only published lessons belonging to an active enrolment.
5. Starting and completing a lesson persists progress through the secured RPCs.
6. A learner cannot read or write another learner's progress or change their own enrolment status directly.
7. Course completion and certificates are issued only after server-side completion rules are met.
8. A dropped free-course enrolment can be reactivated through the same trusted enrolment path.
9. An unauthenticated learner, an unconfigured backend and a failed network request each receive a clear, recoverable state.
10. Instructor, administrator, sponsor and employer routes are checked with separate accounts and correct role permissions.

## Release hygiene

The source release must exclude `.env`, `.git`, `node_modules`, build output and local editor caches. Commit only the `.env.example` template; never commit real secrets.
