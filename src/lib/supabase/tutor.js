import { supabase } from './client';

function assertConfigured() {
  if (!supabase) {
    throw new Error('Tutor portal is unavailable because Supabase has not been configured.');
  }
}

const USER_FIELDS = [
  'id', 'user_id', 'status', 'full_name', 'email', 'phone', 'nationality',
  'country', 'city', 'highest_qualification', 'institution', 'field_of_study',
  'year_completed', 'years_experience', 'teaching_experience', 'current_occupation',
  'subjects', 'languages', 'availability', 'preferred_schedule', 'bio',
  'profile_photo_path', 'cv_path', 'documents', 'declaration_accepted',
  'reviewer_notes', 'submitted_at', 'created_at', 'updated_at',
];

const PROTECTED_FIELDS = ['status', 'reviewer_id', 'reviewer_notes', 'reviewed_at'];

function stripProtected(fields) {
  const safe = { ...fields };
  for (const key of PROTECTED_FIELDS) delete safe[key];
  return safe;
}

export async function getMyTutorApplication() {
  assertConfigured();
  const { data, error } = await supabase
    .from('tutor_applications')
    .select(USER_FIELDS.join(','))
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveTutorApplication(fields) {
  assertConfigured();
  const safe = stripProtected(fields);
  const { data: existing } = await supabase
    .from('tutor_applications')
    .select('id')
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('tutor_applications')
      .update(safe)
      .eq('id', existing.id)
      .select(USER_FIELDS.join(','))
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('tutor_applications')
    .insert(safe)
    .select(USER_FIELDS.join(','))
    .single();
  if (error) throw error;
  return data;
}

export async function submitTutorApplication(appId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('tutor_applications')
    .update({ status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', appId)
    .select(USER_FIELDS.join(','))
    .single();
  if (error) throw error;
  return data;
}

export async function uploadTutorFile(file, category) {
  assertConfigured();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('You must be signed in to upload files.');

  const ext = file.name.split('.').pop();
  const fileName = `${category}-${Date.now()}.${ext}`;
  const path = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from('tutor-documents')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function getTutorFileSignedUrl(path) {
  assertConfigured();
  const { data, error } = await supabase.storage
    .from('tutor-documents')
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function listTutorApplications() {
  assertConfigured();
  const { data, error } = await supabase
    .from('tutor_applications')
    .select('*, profile:profiles!tutor_applications_user_id_fkey(full_name, email, avatar_url)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTutorApplicationById(appId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('tutor_applications')
    .select('*, profile:profiles!tutor_applications_user_id_fkey(full_name, email, avatar_url)')
    .eq('id', appId)
    .single();
  if (error) throw error;
  return data;
}

export async function approveTutorApplication(appId) {
  assertConfigured();
  const { error } = await supabase.rpc('approve_tutor_application', { p_app_id: appId });
  if (error) throw error;
}

export async function rejectTutorApplication(appId, notes) {
  assertConfigured();
  const { error } = await supabase.rpc('reject_tutor_application', { p_app_id: appId, p_notes: notes });
  if (error) throw error;
}

export async function requestTutorChanges(appId, notes) {
  assertConfigured();
  const { error } = await supabase.rpc('request_tutor_changes', { p_app_id: appId, p_notes: notes });
  if (error) throw error;
}

export async function setTutorAppUnderReview(appId) {
  assertConfigured();
  const { error } = await supabase.rpc('set_tutor_app_under_review', { p_app_id: appId });
  if (error) throw error;
}
