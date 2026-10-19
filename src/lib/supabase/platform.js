import { supabase } from './client';

function requireClient() {
  if (!supabase) throw new Error('This feature needs Supabase configuration. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  return supabase;
}

async function uid() {
  const client = requireClient();
  const { data } = await client.auth.getUser();
  if (!data?.user?.id) throw new Error('Please sign in to continue.');
  return data.user.id;
}

export async function listMyGoals() { const c = requireClient(); const { data, error } = await c.from('learning_goals').select('*').order('created_at', { ascending: false }); if (error) throw error; return data || []; }
export async function createGoal(fields) { const c = requireClient(); const id = await uid(); const { data, error } = await c.from('learning_goals').insert([{ ...fields, student_id: id }]).select().single(); if (error) throw error; return data; }
export async function updateGoal(id, fields) { const c = requireClient(); const { data, error } = await c.from('learning_goals').update(fields).eq('id', id).select().single(); if (error) throw error; return data; }
export async function deleteGoal(id) { const c = requireClient(); const { error } = await c.from('learning_goals').delete().eq('id', id); if (error) throw error; }

export async function listMySessions() { const c = requireClient(); const id = await uid(); const { data, error } = await c.from('course_sessions').select('*, lms_courses(title), session_attendance(*)').eq('published', true).order('starts_at'); if (error) throw error; return (data || []).filter((s) => !s.session_attendance?.length || s.session_attendance.some((a) => a.student_id === id)); }
export async function createSession(fields) { const c = requireClient(); const id = await uid(); const { data, error } = await c.from('course_sessions').insert([{ ...fields, instructor_id: id }]).select().single(); if (error) throw error; return data; }
export async function updateSession(id, fields) { const c = requireClient(); const { data, error } = await c.from('course_sessions').update(fields).eq('id', id).select().single(); if (error) throw error; return data; }
export async function deleteSession(id) { const c = requireClient(); const { error } = await c.from('course_sessions').delete().eq('id', id); if (error) throw error; }
export async function checkInSession(sessionId) { const c = requireClient(); const id = await uid(); const { data, error } = await c.from('session_attendance').upsert([{ session_id: sessionId, student_id: id, status: 'present', joined_at: new Date().toISOString() }], { onConflict: 'session_id,student_id' }).select().single(); if (error) throw error; return data; }
export async function listSessionAttendance(sessionId) { const c = requireClient(); const { data, error } = await c.from('session_attendance').select('*, profiles(full_name, student_number)').eq('session_id', sessionId); if (error) throw error; return data || []; }
export async function setAttendance(id, fields) { const c = requireClient(); const { data, error } = await c.from('session_attendance').update(fields).eq('id', id).select().single(); if (error) throw error; return data; }

export async function listMyCohorts() { const c = requireClient(); const id = await uid(); const { data, error } = await c.from('cohort_members').select('*, cohorts(*)').eq('student_id', id).order('joined_at', { ascending: false }); if (error) throw error; return data || []; }
export async function listCohorts() { const c = requireClient(); const { data, error } = await c.from('cohorts').select('*').order('start_date', { ascending: false }); if (error) throw error; return data || []; }
export async function createCohort(fields) { const c = requireClient(); const { data, error } = await c.from('cohorts').insert([fields]).select().single(); if (error) throw error; return data; }
export async function updateCohort(id, fields) { const c = requireClient(); const { data, error } = await c.from('cohorts').update(fields).eq('id', id).select().single(); if (error) throw error; return data; }

export async function listCourseGradeEntries(courseId, studentId = null) { const c = requireClient(); let q = c.from('grade_entries').select('*, profiles(full_name, student_number)').eq('course_id', courseId).order('graded_at', { ascending: false }); if (studentId) q = q.eq('student_id', studentId); const { data, error } = await q; if (error) throw error; return data || []; }
export async function upsertGradeEntry(fields) { const c = requireClient(); const id = await uid(); const { data, error } = await c.from('grade_entries').upsert([{ ...fields, graded_by: id, graded_at: new Date().toISOString() }], { onConflict: 'course_id,student_id,component_name' }).select().single(); if (error) throw error; return data; }

export async function listProjects(courseId = null) { const c = requireClient(); let q = c.from('learning_projects').select('*, project_milestones(*)').order('created_at', { ascending: false }); if (courseId) q = q.eq('course_id', courseId); const { data, error } = await q; if (error) throw error; return data || []; }
export async function joinProject(projectId) { const c = requireClient(); const id = await uid(); const { data, error } = await c.from('project_members').insert([{ project_id: projectId, student_id: id }]).select().single(); if (error) throw error; return data; }
export async function submitProjectMilestone(milestoneId, fields) { const c = requireClient(); const id = await uid(); const { data, error } = await c.from('project_submissions').upsert([{ milestone_id: milestoneId, student_id: id, ...fields, submitted_at: new Date().toISOString() }], { onConflict: 'milestone_id,student_id' }).select().single(); if (error) throw error; return data; }

export async function listCareerOpportunities() { const c = requireClient(); const { data, error } = await c.from('career_opportunities').select('*').eq('published', true).order('closing_date', { ascending: true }); if (error) throw error; return data || []; }
export async function listMentorshipRequests() { const c = requireClient(); const id = await uid(); const { data, error } = await c.from('mentorship_requests').select('*').eq('student_id', id).order('created_at', { ascending: false }); if (error) throw error; return data || []; }
export async function createMentorshipRequest(fields) { const c = requireClient(); const id = await uid(); const { data, error } = await c.from('mentorship_requests').insert([{ ...fields, student_id: id }]).select().single(); if (error) throw error; return data; }

export async function verifyCertificate(number) { const c = requireClient(); const { data, error } = await c.rpc('verify_certificate', { input_number: number.trim() }); if (error) throw error; return data || null; }

export async function listMyApplications(email) { const c = requireClient(); const { data, error } = await c.from('applications').select('application_number, programme, course_code, intake, status, created_at, review_notes').eq('email', email).order('created_at', { ascending: false }); if (error) throw error; return data || []; }
export async function updateApplicationStatus(id, fields) { const c = requireClient(); const { data, error } = await c.from('applications').update(fields).eq('id', id).select().single(); if (error) throw error; return data; }
