/**
 * career — Supabase queries for opportunity applications.
 * Kept separate from platform.js to avoid bloating that module.
 */

import { supabase } from './client';

function requireClient() {
  if (!supabase) throw new Error('Career services are unavailable because Supabase has not been configured.');
  return supabase;
}

async function uid() {
  const client = requireClient();
  const { data } = await client.auth.getUser();
  if (!data?.user?.id) throw new Error('Please sign in to continue.');
  return data.user.id;
}

/* ──────────────────────────────────────────────────────────────
   Student side
   ────────────────────────────────────────────────────────────── */

export async function listMyApplications() {
  const c = requireClient();
  const id = await uid();
  const { data, error } = await c
    .from('opportunity_applications')
    .select(`
      *,
      career_opportunities (id, title, organisation, opportunity_type, location, closing_date)
    `)
    .eq('student_id', id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMyApplicationForOpportunity(opportunityId) {
  const c = requireClient();
  const id = await uid();
  const { data, error } = await c
    .from('opportunity_applications')
    .select('*')
    .eq('student_id', id)
    .eq('opportunity_id', opportunityId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitApplication(opportunityId, fields) {
  const c = requireClient();
  const id = await uid();
  const payload = {
    opportunity_id: opportunityId,
    student_id: id,
    status: 'submitted',
    message: fields.message?.trim() || null,
    phone: fields.phone?.trim() || null,
    portfolio_url: fields.portfolio_url?.trim() || null,
    resume_url: fields.resume_url?.trim() || null,
  };
  const { data, error } = await c
    .from('opportunity_applications')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function withdrawApplication(applicationId) {
  const c = requireClient();
  const { data, error } = await c
    .from('opportunity_applications')
    .update({ status: 'withdrawn' })
    .eq('id', applicationId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ──────────────────────────────────────────────────────────────
   Admin side
   ────────────────────────────────────────────────────────────── */

export async function listAllApplications() {
  const c = requireClient();
  const { data, error } = await c
    .from('opportunity_applications')
    .select(`
      *,
      career_opportunities (id, title, organisation, opportunity_type),
      profiles!opportunity_applications_student_id_fkey (full_name, email, student_number)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateApplicationStatus(applicationId, status, notes = '') {
  const c = requireClient();
  const id = await uid();
  const { data, error } = await c
    .from('opportunity_applications')
    .update({
      status,
      review_notes: notes || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: id,
    })
    .eq('id', applicationId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ──────────────────────────────────────────────────────────────
   Status metadata — shared by student + admin views
   ────────────────────────────────────────────────────────────── */

export const APPLICATION_STATUSES = ['submitted', 'reviewing', 'shortlisted', 'offered', 'rejected', 'withdrawn'];

export const APPLICATION_STATUS_LABELS = {
  submitted:   'Submitted',
  reviewing:   'Under Review',
  shortlisted: 'Shortlisted',
  offered:     'Offer Extended',
  rejected:    'Not Selected',
  withdrawn:   'Withdrawn',
};

export const APPLICATION_STATUS_TONES = {
  submitted:   'neutral',
  reviewing:   'pending',
  shortlisted: 'positive',
  offered:     'positive',
  rejected:    'negative',
  withdrawn:   'neutral',
};