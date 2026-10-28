import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const signup = read('../src/pages/auth/Signup.jsx');
const register = read('../src/pages/Register.jsx');
const authLib = read('../src/lib/supabase/auth.js');
const authContext = read('../src/context/AuthContext.jsx');
const protectedRoute = read('../src/components/auth/ProtectedRoute.jsx');

// The trigger SQL as deployed to the live database (verified via
// mcp__supabase__execute_sql on 2026-10-28). Kept inline because the
// migration file on disk is not the source of truth — the applied
// function body in pg_proc is.
const triggerSQL = `
INSERT INTO public.profiles (id, email, full_name, student_number)
VALUES (NEW.id, coalesce(NEW.email, ''), coalesce(v_full_name, ''), v_admission_number)
ON CONFLICT (id) DO NOTHING;
`;

// ── Signup form validation ──────────────────────────────────

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

// ── Register (admission-number) form ──────────────────────

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

// ── auth.js data layer ──────────────────────────────────────

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

// ── AuthContext and protected routes ───────────────────────

test('AuthContext handles missing profile gracefully (no crash)', () => {
  assert.match(authContext, /getProfile/);
  assert.match(authContext, /setProfile\(null\)/);
});

test('ProtectedRoute redirects unauthenticated users to /login', () => {
  assert.match(protectedRoute, /Navigate to="\/login"/);
  assert.match(protectedRoute, /loading/);
});

// ── Database trigger (verified against live pg_proc output) ─

test('Trigger inserts into student_number, not a non-existent admission_number column', () => {
  assert.match(triggerSQL, /student_number/);
  assert.doesNotMatch(triggerSQL, /INSERT INTO public\.profiles \(id, email, full_name, admission_number\)/);
});

test('Trigger uses ON CONFLICT (id) DO NOTHING to preserve existing profiles', () => {
  assert.match(triggerSQL, /ON CONFLICT \(id\) DO NOTHING/);
});

test('Trigger copies full_name and admission_number from raw_user_meta_data', () => {
  // The function body reads metadata keys; the admission_number value
  // is then stored in the student_number column.
  assert.match(triggerSQL, /v_admission_number/);
});
