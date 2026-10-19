import { supabase } from './client';

/**
 * studentPortal — data layer for the institutional Student Portal.
 *
 * Every function is scoped to the signed-in student via Supabase RLS
 * (student_id = auth.uid()). Functions that read institution-issued
 * records (grades, exam results, fee transactions, attendance, documents)
 * are read-only from the client; writes happen through a trusted backend.
 * Functions that represent student actions (registering a unit,
 * submitting a request/ticket, applying for graduation) perform inserts.
 */

function assertConfigured() {
  if (!supabase) {
    throw new Error('The student portal is unavailable because Supabase has not been configured.');
  }
}

async function requireUserId() {
  assertConfigured();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data?.user) throw new Error('You must be signed in.');
  return data.user.id;
}

/* ------------------------------------------------------------------ */
/* B. Student profile                                                  */
/* ------------------------------------------------------------------ */

export async function updateStudentProfile(updates) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ------------------------------------------------------------------ */
/* Reference data                                                       */
/* ------------------------------------------------------------------ */

export async function getCurrentSemester() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('is_current', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/* ------------------------------------------------------------------ */
/* C. Academic registration                                             */
/* ------------------------------------------------------------------ */

export async function getMyRegistrations() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('unit_registrations')
    .select('id, status, registered_at, units ( id, code, title, credit_hours, lecturer_name ), semesters ( id, name, academic_year )')
    .order('registered_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAvailableUnits(programId, semesterId) {
  if (!supabase) return [];
  let query = supabase.from('units').select('*');
  if (programId) query = query.eq('program_id', programId);
  if (semesterId) query = query.eq('semester_id', semesterId);
  const { data, error } = await query.order('code');
  if (error) throw error;
  return data || [];
}

export async function registerForUnit(unitId, semesterId) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('unit_registrations')
    .insert({ student_id: userId, unit_id: unitId, semester_id: semesterId, status: 'registered' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function dropRegistration(registrationId) {
  assertConfigured();
  const { error } = await supabase
    .from('unit_registrations')
    .update({ status: 'dropped' })
    .eq('id', registrationId);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* D. Academic records                                                  */
/* ------------------------------------------------------------------ */

export async function getAcademicRecords() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('academic_records')
    .select('id, score, grade, grade_points, created_at, units ( code, title ), semesters ( name, academic_year )')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export function computeGpa(records) {
  const withPoints = (records || []).filter((r) => typeof r.grade_points === 'number');
  if (withPoints.length === 0) return null;
  const total = withPoints.reduce((sum, r) => sum + r.grade_points, 0);
  return Number((total / withPoints.length).toFixed(2));
}

/* ------------------------------------------------------------------ */
/* E. Fees & finance                                                    */
/* ------------------------------------------------------------------ */

export async function getFeeStructure(programId, semesterId) {
  if (!supabase) return [];
  let query = supabase.from('fee_structures').select('*');
  if (programId) query = query.eq('program_id', programId);
  if (semesterId) query = query.eq('semester_id', semesterId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getFeeTransactions() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('fee_transactions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export function computeFeeBalance(transactions) {
  return (transactions || []).reduce((balance, t) => {
    if (t.type === 'payment') return balance - Number(t.amount || 0);
    return balance + Number(t.amount || 0);
  }, 0);
}

/* ------------------------------------------------------------------ */
/* F. Timetable                                                         */
/* ------------------------------------------------------------------ */

export async function getTimetable(semesterId) {
  if (!supabase) return [];
  let query = supabase
    .from('timetable_entries')
    .select('id, day_of_week, start_time, end_time, venue, session_type, lecturer_name, units ( code, title )');
  if (semesterId) query = query.eq('semester_id', semesterId);
  const { data, error } = await query.order('day_of_week').order('start_time');
  if (error) throw error;
  return data || [];
}

/* ------------------------------------------------------------------ */
/* G. Attendance                                                        */
/* ------------------------------------------------------------------ */

export async function getAttendance() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('attendance_records')
    .select('id, session_date, status, units ( code, title )')
    .order('session_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export function summarizeAttendanceByUnit(records) {
  const byUnit = new Map();
  (records || []).forEach((r) => {
    const key = r.units?.code || 'unit';
    const entry = byUnit.get(key) || { code: r.units?.code, title: r.units?.title, attended: 0, missed: 0, total: 0 };
    entry.total += 1;
    if (r.status === 'present') entry.attended += 1;
    else entry.missed += 1;
    byUnit.set(key, entry);
  });
  return Array.from(byUnit.values()).map((entry) => ({
    ...entry,
    percentage: entry.total ? Math.round((entry.attended / entry.total) * 100) : 0,
  }));
}

/* ------------------------------------------------------------------ */
/* H. Exams                                                              */
/* ------------------------------------------------------------------ */

export async function getExamTimetable(semesterId) {
  if (!supabase) return [];
  let query = supabase
    .from('exams')
    .select('id, exam_date, start_time, end_time, venue, exam_type, units ( code, title )');
  if (semesterId) query = query.eq('semester_id', semesterId);
  const { data, error } = await query.order('exam_date');
  if (error) throw error;
  return data || [];
}

export async function getExamResults() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('exam_results')
    .select('id, score, grade, status, exams ( exam_date, exam_type, units ( code, title ) )')
    .order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

/* ------------------------------------------------------------------ */
/* I. Documents                                                          */
/* ------------------------------------------------------------------ */

export async function getStudentDocuments() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('student_documents')
    .select('*')
    .order('issued_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/* ------------------------------------------------------------------ */
/* J. Communication                                                      */
/* ------------------------------------------------------------------ */

export async function getAnnouncements() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data || [];
}

export async function getMyMessages() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('student_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function markMessageRead(messageId) {
  assertConfigured();
  const { error } = await supabase
    .from('student_messages')
    .update({ is_read: true })
    .eq('id', messageId);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* K. Services / requests                                               */
/* ------------------------------------------------------------------ */

export const SERVICE_REQUEST_TYPES = [
  { value: 'transcript', label: 'Official Transcript' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'recommendation_letter', label: 'Recommendation Letter' },
  { value: 'academic_letter', label: 'Academic Letter' },
  { value: 'leave', label: 'Leave of Absence' },
  { value: 'unit_change', label: 'Unit Change' },
  { value: 'program_change', label: 'Program Change' },
  { value: 'deferment', label: 'Deferment' },
  { value: 'clearance', label: 'Clearance' },
  { value: 'graduation_application', label: 'Graduation Application' },
];

export async function getMyServiceRequests() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function submitServiceRequest(requestType, details = {}) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('service_requests')
    .insert({ student_id: userId, request_type: requestType, details })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ------------------------------------------------------------------ */
/* L. Support                                                            */
/* ------------------------------------------------------------------ */

export const SUPPORT_CATEGORIES = [
  { value: 'technical', label: 'Technical Support' },
  { value: 'academic', label: 'Academic Support' },
  { value: 'finance', label: 'Finance Query' },
  { value: 'general', label: 'General / Help Desk' },
];

export async function getMySupportTickets() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function submitSupportTicket({ category, subject, message }) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({ student_id: userId, category, subject, message })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ------------------------------------------------------------------ */
/* M. Graduation                                                         */
/* ------------------------------------------------------------------ */

export async function getGraduationStatus() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('graduation_applications')
    .select('*')
    .order('applied_at', { ascending: false })
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function applyForGraduation() {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('graduation_applications')
    .insert({ student_id: userId, status: 'applied', applied_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}
