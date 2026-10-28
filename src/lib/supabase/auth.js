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
 * Supports email or institutional student ID login.
 * Student-ID resolution happens server-side.
 */
export async function signInWithIdentifier({ identifier, password }) {
  assertConfigured();

  const trimmed = (identifier || '').trim();
  if (!trimmed || !password) {
    throw new Error('Enter your login ID and password.');
  }

  if (trimmed.includes('@')) {
    return signInWithEmail({ email: trimmed, password });
  }

  const { data, error } = await supabase.functions.invoke('student-id-login', {
    body: { studentNumber: trimmed, password },
  });

  if (error) throw error;
  if (!data?.access_token || !data?.refresh_token) {
    throw new Error(data?.error || 'Unable to sign in. Please try again.');
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

  if (sessionError) throw sessionError;
  return sessionData;
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
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export function isAuthConfigured() {
  return Boolean(supabase);
}