/*
# Auto-create profile row on signup

## Problem
When a user signs up via the public Signup or Register page, Supabase Auth
creates a row in `auth.users` but NO corresponding row in `public.profiles`.
This means:
1. `getProfile()` in the frontend calls `.single()` which THROWS when no row
   exists, crashing the portal immediately after login.
2. Role-based access checks (`AdminRoute`, `InstructorRoute`) fail because
   there is no profile to read a role from.
3. The `link_profile_to_admission` trigger on `profiles` (BEFORE INSERT)
   never fires because the INSERT never happens — so admitted students who
   self-register via /register never get linked to their application.

## Fix
Create a database trigger `on_auth_user_created` that fires AFTER INSERT on
`auth.users` and inserts a matching row into `public.profiles`. This mirrors
what the admin `create-student` edge function already does explicitly, but
covers self-service signups.

The trigger:
1. Copies `full_name` and `admission_number` from `raw_user_meta_data`.
2. Sets `email` from `auth.users.email`.
3. Defaults `role` to 'student' (the profiles table default).
4. The existing `link_profile_to_admission` BEFORE INSERT trigger on
   `profiles` then enriches the row with admission data if the
   `admission_number` metadata is present, or falls back to matching by email.

## Security
- The trigger function is SECURITY DEFINER so it can write to `profiles`
  even though the calling context (auth system) does not have direct INSERT
  privileges.
- The function runs with a locked-down search_path.
- No new grants are added — existing profile policies still apply.
- `profiles` already has RLS enabled; the trigger inserts as the owner
  (postgres), so RLS does not block it, and subsequent user reads are still
  governed by the existing `read_own_profile` policy.
*/

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, pg_temp
AS $$
DECLARE
  v_full_name text;
  v_admission_number text;
BEGIN
  v_full_name := nullif(btrim(coalesce(NEW.raw_user_meta_data ->> 'full_name', '')), '');
  v_admission_number := nullif(btrim(coalesce(NEW.raw_user_meta_data ->> 'admission_number', '')), '');

  INSERT INTO public.profiles (id, email, full_name, admission_number)
  VALUES (
    NEW.id,
    coalesce(NEW.email, ''),
    coalesce(v_full_name, ''),
    v_admission_number
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Supabase provides a special hook trigger on auth.users.
-- Drop and recreate so the migration is idempotent.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Revoke direct public execution of the handler (it is only called by the trigger).
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;
