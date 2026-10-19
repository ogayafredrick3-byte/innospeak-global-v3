/**
 * organisations — Supabase queries for employer accounts and
 * organisation-scoped opportunity management.
 */

import { supabase } from './client';

function requireClient() {
  if (!supabase) throw new Error('Organisation services are unavailable because Supabase has not been configured.');
  return supabase;
}

async function uid() {
  const client = requireClient();
  const { data } = await client.auth.getUser();
  if (!data?.user?.id) throw new Error('Please sign in to continue.');
  return data.user.id;
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/* ──────────────────────────────────────────────────────────────
   Organisation reads / writes
   ────────────────────────────────────────────────────────────── */

export async function getMyOrganisation() {
  const c = requireClient();
  const id = await uid();
  const { data, error } = await c
    .from('profiles')
    .select('organisation_id, organisations(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data?.organisations || null;
}

export async function createOrganisation(fields) {
  const c = requireClient();
  const id = await uid();
  const baseSlug = slugify(fields.name);
  const slug = baseSlug ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}` : null;

  const { data: org, error: orgErr } = await c
    .from('organisations')
    .insert([{
      name: fields.name.trim(),
      slug,
      website: fields.website?.trim() || null,
      industry: fields.industry?.trim() || null,
      description: fields.description?.trim() || null,
      location: fields.location?.trim() || null,
      contact_email: fields.contact_email?.trim() || null,
      contact_phone: fields.contact_phone?.trim() || null,
      logo_url: fields.logo_url?.trim() || null,
      created_by: id,
    }])
    .select()
    .single();

  if (orgErr) throw orgErr;

  const { error: profErr } = await c
    .from('profiles')
    .update({ organisation_id: org.id })
    .eq('id', id);

  if (profErr) throw profErr;

  return org;
}

export async function updateOrganisation(orgId, fields) {
  const c = requireClient();
  const { data, error } = await c
    .from('organisations')
    .update({
      name: fields.name?.trim(),
      website: fields.website?.trim() || null,
      industry: fields.industry?.trim() || null,
      description: fields.description?.trim() || null,
      location: fields.location?.trim() || null,
      contact_email: fields.contact_email?.trim() || null,
      contact_phone: fields.contact_phone?.trim() || null,
      logo_url: fields.logo_url?.trim() || null,
    })
    .eq('id', orgId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ──────────────────────────────────────────────────────────────
   Organisation-scoped opportunities
   ────────────────────────────────────────────────────────────── */

export async function listMyOrganisationOpportunities() {
  const c = requireClient();
  const org = await getMyOrganisation();
  if (!org) return [];
  const { data, error } = await c
    .from('career_opportunities')
    .select('*')
    .eq('organisation_id', org.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

function buildOpportunityPayload(org, fields) {
  return {
    organisation_id: org.id,
    organisation: org.name,
    title: fields.title.trim(),
    opportunity_type: fields.opportunity_type || 'internship',
    category: fields.category || null,
    description: fields.description?.trim() || null,
    skills: fields.skills || [],
    level: fields.level || null,
    mode: fields.mode || null,
    location: fields.location?.trim() || null,
    remote: fields.mode === 'Remote',
    duration: fields.duration?.trim() || null,
    compensation: fields.compensation?.trim() || null,
    start_date: fields.start_date || null,
    closing_date: fields.closing_date || null,
    requirements: fields.requirements || [],
    application_url: fields.application_url?.trim() || null,
    application_method: fields.application_method || 'both',
    status: fields.status || 'published',
    published: (fields.status || 'published') === 'published',
  };
}

export async function createMyOrganisationOpportunity(fields) {
  const c = requireClient();
  const org = await getMyOrganisation();
  if (!org) throw new Error('No organisation linked to your account.');

  const { data, error } = await c
    .from('career_opportunities')
    .insert([buildOpportunityPayload(org, fields)])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMyOrganisationOpportunity(id, fields) {
  const c = requireClient();
  const org = await getMyOrganisation();
  if (!org) throw new Error('No organisation linked to your account.');

  const { data, error } = await c
    .from('career_opportunities')
    .update(buildOpportunityPayload(org, fields))
    .eq('id', id)
    .eq('organisation_id', org.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMyOrganisationOpportunity(id) {
  const c = requireClient();
  const org = await getMyOrganisation();
  if (!org) throw new Error('No organisation linked to your account.');
  const { error } = await c
    .from('career_opportunities')
    .delete()
    .eq('id', id)
    .eq('organisation_id', org.id);
  if (error) throw error;
}

/* ──────────────────────────────────────────────────────────────
   Organisation-scoped applications
   ────────────────────────────────────────────────────────────── */

export async function listMyOrganisationApplications() {
  const c = requireClient();
  const org = await getMyOrganisation();
  if (!org) return [];
  const { data, error } = await c
    .from('opportunity_applications')
    .select(`
      *,
      career_opportunities!inner (id, title, opportunity_type, organisation_id),
      profiles!opportunity_applications_student_id_fkey (full_name, email, student_number)
    `)
    .eq('career_opportunities.organisation_id', org.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateMyOrganisationApplicationStatus(applicationId, status, notes = '') {
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