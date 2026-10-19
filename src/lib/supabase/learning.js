import { supabase } from './client';

function assertConfigured() {
  if (!supabase) throw new Error('Learning services are unavailable because Supabase has not been configured.');
}

export async function listPublishedSessions(courseId = null) {
  assertConfigured();
  let query = supabase.from('course_sessions').select('*, lms_courses(title)').eq('published', true).order('starts_at');
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function listMyPortfolio() {
  assertConfigured();
  const { data, error } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createPortfolioItem(fields) {
  assertConfigured();
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('portfolio_items').insert([{ ...fields, student_id: auth?.user?.id }]).select().single();
  if (error) throw error;
  return data;
}

export async function deletePortfolioItem(id) {
  assertConfigured();
  const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
  if (error) throw error;
}

export async function listMyCertificates() {
  assertConfigured();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  const { data, error } = await supabase
    .from('certificates')
    .select('*, lms_courses(title, code)')
    .eq('student_id', uid)
    .order('issue_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function listLearningGoals() {
  assertConfigured();
  const { data, error } = await supabase.from('learning_goals').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
