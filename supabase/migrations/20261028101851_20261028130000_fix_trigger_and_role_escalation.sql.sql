/*
# Fix registration trigger and profile role-escalation risk

## Problems found during verification

1. **Trigger would crash every signup.** The `handle_new_auth_user`
   trigger INSERTs into `profiles(admission_number, ...)`, but the
   `admission_number` column does NOT exist on the live `profiles`
   table. Every new auth.user would error out and fail to create a
   profile row — the exact bug we were trying to fix. The admission
   number is already stored in `student_number` (which does exist) by
   the admin `create-student` edge function, and the frontend already
   reads `profile.admission_number || profile.student_number`.

2. **Role-escalation vulnerability.** `authenticated` and `anon` hold
   table-level INSERT and UPDATE grants on `profiles` that include the
   `role` column. The `profiles_update_own` RLS policy allows
   `auth.uid() = id`, so a logged-in user could run
   `.update({ role: 'admin' })` on their own profile and escalate to
   administrator. Fix: revoke column-level INSERT/UPDATE on `role`
   from `authenticated` and `anon` so the grant no longer covers that
   column. Admin role assignment continues to work through the
   service-role edge function (which bypasses RLS).

3. **Anon should not write profiles.** `anon` had INSERT/UPDATE/DELETE
   on `profiles`. Sign-ups go through Supabase Auth (the trigger
   inserts the profile as SECURITY DEFINER), and profile edits require
   a session, so anon writes are unnecessary and dangerous. Revoke
   all write verbs from `anon`; keep SELECT for any anon-readable
   views that may join profiles.

## Changes

1. Recreate `handle_new_auth_user()` to INSERT into the columns that
   actually exist: `id`, `email`, `full_name`, and `student_number`
   (used to carry the admission number when provided in user
   metadata).
2. Revoke table-level INSERT/UPDATE/DELETE from `anon` on `profiles`.
3. Revoke column-level INSERT/UPDATE on `role` from `authenticated`.
4. Re-grant column-level INSERT on the safe columns authenticated
   users need to self-insert their profile row (id, email, full_name,
   student_number, phone, avatar_url, created_at) — excluding `role`.
5. Re-grant column-level UPDATE on the safe columns authenticated
   users may edit on their own profile (full_name, phone, avatar_url)
   — excluding `role`, `email`, `student_number`, `id`.
*/

-- ============================================================
-- 1. Fix the trigger function
-- ============================================================
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

  INSERT INTO public.profiles (id, email, full_name, student_number)
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

-- Trigger is already in place; recreate to pick up the new function body.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Keep execution locked to the trigger only.
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 2. Revoke anon write access on profiles
-- ============================================================
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon;

-- ============================================================
-- 3. Revoke authenticated ability to write the `role` column
--    (table-level grant currently covers it → privilege escalation)
-- ============================================================
-- Revoke the broad table-level grants so we can re-grant at
-- column level, excluding `role`.
REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;

-- Re-grant INSERT on safe columns only (no `role`).
GRANT INSERT (id, email, full_name, student_number, phone, avatar_url, created_at)
  ON public.profiles TO authenticated;

-- Re-grant UPDATE on safe columns only (no `role`, no `id`,
-- no `student_number`, no `email` — those are institution-controlled).
GRANT UPDATE (full_name, phone, avatar_url)
  ON public.profiles TO authenticated;
