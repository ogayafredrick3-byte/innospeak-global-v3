import { supabase } from './client';

/**
 * auth — data layer for the student portal's authentication.
 */

function assertConfigured() {
  if (!supabase) {
    throw new Error('The student portal is unavailable because Supabase has not been configured.');
  }
}

export async function signUpWithEmail({ email, password, fullName, admissionNumber }) {
  assertConfigured();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, admission_number: admissionNumber || null } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail({ email, password }) {
  assertConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * getEmailForStudentNumber — resolves a student ID (issued by the
 * institution at admission) to its account email via a SECURITY DEFINER
 * database function, so the login form never needs direct read access
 * to the `profiles` table before the student is authenticated.
 */
export async function getEmailForStudentNumber(studentNumber) {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_login_email', { p_student_number: studentNumber });
  if (error) throw error;
  if (!data) throw new Error('No account was found for that Student ID.');
  return data;
}

/**
 * signInWithIdentifier — accepts either an email address or a student ID
 * in the same field. Institution-issued credentials are a Student ID +
 * password, while self-registered accounts use their email + password.
 */
export async function signInWithIdentifier({ identifier, password }) {
  const trimmed = (identifier || '').trim();
  const email = trimmed.includes('@') ? trimmed : await getEmailForStudentNumber(trimmed);
  return signInWithEmail({ email, password });
}

export async function signOutUser() {
  assertConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordResetEmail(email) {
  assertConfigured();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updateOwnPassword(newPassword) {
  assertConfigured();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function getProfile(userId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export function isAuthConfigured() {
  return Boolean(supabase);
}