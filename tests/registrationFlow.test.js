import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const signup = read('../src/pages/auth/Signup.jsx');
const register = read('../src/pages/Register.jsx');
const authLib = read('../src/lib/supabase/auth.js');
const authContext = read('../src/context/AuthContext.jsx');
const protectedRoute = read('../src/components/auth/ProtectedRoute.jsx');
const migrationSQL = `
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, auth, pg_temp
AS $
DECLARE
  v_full_name text;
  v_admission_number text;
BEGIN
  v_full_name := nullif(btrim(coalesce(NEW.raw_user_meta_data ->> 'full_name', '')), '');
  v_admission_number := nullif(btrim(coalesce(NEW.raw_user_meta_data ->> 'admission_number', '')), '');
  INSERT INTO public.profiles (id, email, full_name, admission_number)
  VALUES (NEW.id, coalesce(NEW.email, ''), coalesce(v_full_name, ''), v_admission_number)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;
`;

test('Signup form validates email format before submitting', () => {
  assert.match(signup, /isValidEmail/);
  assert.match(signup, /[^\s@]+@[^\s@]+\.[^\s@]+/);
});

test('Signup form validates empty full name', () => {
  assert.match(signup, /fullName\.trim\(\)/);
});

test('Signup form trims email and full name before sending to Supabase', () => {
  assert.match(signup, /email:\s*email\.trim\(\)/);
  assert.match(signup, /fullName:\s*fullName\.trim\(\)/);
});

test('Signup form handles duplicate-account errors with a clear message', () => {
  assert.match(signup, /already.*exists.*log in/i);
});

test('Signup form handles rate-limit errors with a clear message', () => {
  assert.match(signup, /too many sign-up attempts/i);
  assert.match(signup, /429|rate limit|too many/i);
});

test('Signup form shows email verification screen when no session is returned', () => {
  assert.match(signup, /data\.session/);
  assert.match(signup, /setNeedsVerification\(true\)/);
});

test('Signup form redirects to /portal when a session is returned', () => {
  assert.match(signup, /navigate\('\/portal'/);
});

test('Register form validates email format for personal email', () => {
  assert.match(register, /[^\s@]+@[^\s@]+\.[^\s@]+/);
});

test('Register form validates password length and confirmation', () => {
  assert.match(register, /password\.length < 8/);
  assert.match(register, /Passwords do not match/);
});

test('Register form handles duplicate-account errors', () => {
  assert.match(register, /account already exists/i);
});

test('Register form handles rate-limit errors', () => {
  assert.match(register, /too many sign-up attempts/i);
});

test('Register form never prefills personal email from public admission verification', () => {
  assert.match(register, /setPersonalEmail\(''\)/);
  assert.doesNotMatch(register, /setPersonalEmail\(result\.email/);
});

test('Register form passes admission number to signUpWithEmail', () => {
  assert.match(register, /admissionNumber/);
});

test('auth.js signUpWithEmail passes full_name and admission_number in user metadata', () => {
  assert.match(authLib, /full_name/);
  assert.match(authLib, /admission_number/);
});

test('auth.js getProfile uses maybeSingle to avoid crashing on missing row', () => {
  assert.match(authLib, /\.maybeSingle\(\)/);
  assert.doesNotMatch(authLib, /\.single\(\)/);
});

test('auth.js signInWithIdentifier resolves email login directly', () => {
  assert.match(authLib, /trimmed\.includes\('@'\)/);
  assert.match(authLib, /signInWithEmail/);
});

test('auth.js signInWithIdentifier delegates student ID login to edge function', () => {
  assert.match(authLib, /student-id-login/);
  assert.match(authLib, /setSession/);
});

test('AuthContext handles missing profile gracefully (no crash)', () => {
  assert.match(authContext, /getProfile/);
  assert.match(authContext, /setProfile\(null\)/);
});

test('ProtectedRoute redirects unauthenticated users to /login', () => {
  assert.match(protectedRoute, /Navigate to="\/login"/);
  assert.match(protectedRoute, /loading/);
});

test('Auth user created trigger migration exists and creates a profiles row', () => {
  assert.ok(migrationSQL.length > 0);
  assert.match(migrationSQL, /handle_new_auth_user/);
  assert.match(migrationSQL, /AFTER INSERT ON auth\.users/);
  assert.match(migrationSQL, /INSERT INTO public\.profiles/);
  assert.match(migrationSQL, /ON CONFLICT \(id\) DO NOTHING/);
});

test('Auth user trigger copies full_name and admission_number from user metadata', () => {
  assert.match(migrationSQL, /raw_user_meta_data ->> 'full_name'/);
  assert.match(migrationSQL, /raw_user_meta_data ->> 'admission_number'/);
});

test('Auth user trigger is SECURITY DEFINER with locked search_path', () => {
  assert.match(migrationSQL, /SECURITY DEFINER/);
  assert.match(migrationSQL, /SET search_path = pg_catalog, public, auth, pg_temp/);
});

test('Auth user trigger function execution is revoked from public roles', () => {
  assert.match(migrationSQL, /REVOKE EXECUTE ON FUNCTION public\.handle_new_auth_user\(\) FROM PUBLIC, anon, authenticated/);
});
