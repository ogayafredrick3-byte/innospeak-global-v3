/**
 * admissions — client-side helpers for the admission-number flow.
 * Works alongside the course/year admissions workflow migration.
 */

import { supabase } from './client';

function assertConfigured() {
  if (!supabase) {
    throw new Error('Admissions services are unavailable because Supabase has not been configured.');
  }
  return supabase;
}

/* ──────────────────────────────────────────────────────────────
   Admin: approve + issue admission number
   ────────────────────────────────────────────────────────────── */

export async function approveApplicationWithAdmission(applicationId) {
  const c = assertConfigured();
  const { data, error } = await c.rpc('approve_application_with_admission', {
    p_application_id: applicationId,
  });
  if (error) throw error;
  return data;
  // → { admission_number, institutional_email, already_issued }
}

/* ──────────────────────────────────────────────────────────────
   Public: verify an admission number on the /register page
   ────────────────────────────────────────────────────────────── */

export async function verifyAdmissionNumber(admissionNumber) {
  const c = assertConfigured();
  const normalized = String(admissionNumber || '').trim().toUpperCase();
  const { data, error } = await c.rpc('verify_admission_number', {
    p_admission_number: normalized,
  });
  if (error) throw error;
  return data;
  // → { valid, already_registered, name, institutional_email, status }; never returns personal email.
}

/* ──────────────────────────────────────────────────────────────
   Login helper: resolve an admission number → the personal email
   the auth account was created with.
   ────────────────────────────────────────────────────────────── */

export async function resolveAdmissionLogin(admissionNumber) {
  const c = assertConfigured();
  const { data, error } = await c.rpc('resolve_admission_login', {
    p_admission_number: admissionNumber,
  });
  if (error) throw error;
  return data;  // string email | null
}

/* ──────────────────────────────────────────────────────────────
   Format check — is this string shaped like an admission number?
   ────────────────────────────────────────────────────────────── */

export function looksLikeAdmissionNumber(value) {
  if (!value) return false;
  const normalized = String(value).trim();
  return /^ISG[A-Z]{3}\d{6}$/i.test(normalized) || /^ISG-\d{4}-\d{4,5}$/i.test(normalized);
}