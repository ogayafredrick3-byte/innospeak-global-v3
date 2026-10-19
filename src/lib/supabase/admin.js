import { supabase } from './client';

/**
 * admin — data layer for the Admin panel. Every read/write here relies on
 * the `admin_all_*` RLS policies (see the admin_role_and_policies
 * migration), which only grant access when the caller's `profiles.role`
 * is 'admin'. Account creation goes through the `create-student` Edge
 * Function since it needs the service-role key to call the Auth admin API.
 */

function assertConfigured() {
  if (!supabase) {
    throw new Error('The admin panel is unavailable because Supabase has not been configured.');
  }
}

/* ------------------------------------------------------------------ */
/* Students                                                              */
/* ------------------------------------------------------------------ */

export async function listStudents() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, student_number, department, level_year, student_status, program_id, programs ( name )')
    .neq('role', 'admin')
    .order('full_name');
  if (error) throw error;
  return data || [];
}

export async function getStudent(id) {
  assertConfigured();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function updateStudent(id, updates) {
  assertConfigured();
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function createStudentAccount(payload) {
  assertConfigured();
  const { data, error } = await supabase.functions.invoke('create-student', { body: payload });
  if (error) throw new Error(error.message || 'Could not create the student account.');
  if (data?.error) throw new Error(data.error);
  return data;
}

/* ------------------------------------------------------------------ */
/* Programs, semesters, units                                           */
/* ------------------------------------------------------------------ */

export async function listPrograms() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('programs').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createProgram(payload) {
  assertConfigured();
  const { error } = await supabase.from('programs').insert(payload);
  if (error) throw error;
}

export async function deleteProgram(id) {
  assertConfigured();
  const { error } = await supabase.from('programs').delete().eq('id', id);
  if (error) throw error;
}

export async function listSemesters() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('semesters').select('*').order('start_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createSemester(payload) {
  assertConfigured();
  const { error } = await supabase.from('semesters').insert(payload);
  if (error) throw error;
}

export async function setCurrentSemester(id) {
  assertConfigured();
  const { error: clearError } = await supabase.from('semesters').update({ is_current: false }).neq('id', id);
  if (clearError) throw clearError;
  const { error } = await supabase.from('semesters').update({ is_current: true }).eq('id', id);
  if (error) throw error;
}

export async function deleteSemester(id) {
  assertConfigured();
  const { error } = await supabase.from('semesters').delete().eq('id', id);
  if (error) throw error;
}

export async function listUnits() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('units')
    .select('*, programs ( name ), semesters ( name, academic_year )')
    .order('code');
  if (error) throw error;
  return data || [];
}

export async function createUnit(payload) {
  assertConfigured();
  const { error } = await supabase.from('units').insert(payload);
  if (error) throw error;
}

export async function deleteUnit(id) {
  assertConfigured();
  const { error } = await supabase.from('units').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Per-student academic, fee & attendance entry                         */
/* ------------------------------------------------------------------ */

export async function listStudentRegistrations(studentId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('unit_registrations')
    .select('id, status, registered_at, units ( code, title )')
    .eq('student_id', studentId)
    .order('registered_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function registerStudentForUnit(studentId, unitId, semesterId) {
  assertConfigured();
  const { error } = await supabase
    .from('unit_registrations')
    .insert({ student_id: studentId, unit_id: unitId, semester_id: semesterId, status: 'registered' });
  if (error) throw error;
}

export async function listStudentRecords(studentId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('academic_records')
    .select('id, score, grade, grade_points, units ( code, title ), semesters ( name )')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addAcademicRecord(studentId, payload) {
  assertConfigured();
  const { error } = await supabase.from('academic_records').insert({ student_id: studentId, ...payload });
  if (error) throw error;
}

export async function listStudentFeeTransactions(studentId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('fee_transactions')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addFeeTransaction(studentId, payload) {
  assertConfigured();
  const { error } = await supabase.from('fee_transactions').insert({ student_id: studentId, ...payload });
  if (error) throw error;
}

export async function addAttendanceRecord(studentId, payload) {
  assertConfigured();
  const { error } = await supabase.from('attendance_records').insert({ student_id: studentId, ...payload });
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Moderation: requests, tickets, graduation                            */
/* ------------------------------------------------------------------ */

export async function listAllServiceRequests() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('service_requests')
    .select('*, profiles ( full_name, student_number )')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateServiceRequestStatus(id, status) {
  assertConfigured();
  const { error } = await supabase
    .from('service_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function listAllSupportTickets() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*, profiles ( full_name, student_number )')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateSupportTicketStatus(id, status) {
  assertConfigured();
  const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function listAllGraduationApplications() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('graduation_applications')
    .select('*, profiles ( full_name, student_number )')
    .order('applied_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateGraduationApplication(id, updates) {
  assertConfigured();
  const { error } = await supabase.from('graduation_applications').update(updates).eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Announcements                                                        */
/* ------------------------------------------------------------------ */

export async function listAnnouncementsAdmin() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createAnnouncement(payload) {
  assertConfigured();
  const { error } = await supabase.from('announcements').insert(payload);
  if (error) throw error;
}

export async function deleteAnnouncement(id) {
  assertConfigured();
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Admissions (applications)                                            */
/* ------------------------------------------------------------------ */

export async function listApplications() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateApplicationStatus(id, status, reviewerNotes) {
  assertConfigured();
  const { error } = await supabase
    .from('applications')
    .update({ status, reviewer_notes: reviewerNotes ?? null, reviewed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Contact messages                                                      */
/* ------------------------------------------------------------------ */

export async function listContactMessages() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateContactMessageStatus(id, status) {
  assertConfigured();
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteContactMessage(id) {
  assertConfigured();
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Fee structures                                                        */
/* ------------------------------------------------------------------ */

export async function listFeeStructures() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('fee_structures')
    .select('*, programs ( name ), semesters ( name, academic_year )')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createFeeStructure(payload) {
  assertConfigured();
  const { error } = await supabase.from('fee_structures').insert(payload);
  if (error) throw error;
}

export async function deleteFeeStructure(id) {
  assertConfigured();
  const { error } = await supabase.from('fee_structures').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Timetable entries & exams                                             */
/* ------------------------------------------------------------------ */

export async function listTimetableEntriesAdmin() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('timetable_entries')
    .select('*, units ( code, title ), semesters ( name, academic_year )')
    .order('day_of_week');
  if (error) throw error;
  return data || [];
}

export async function createTimetableEntry(payload) {
  assertConfigured();
  const { error } = await supabase.from('timetable_entries').insert(payload);
  if (error) throw error;
}

export async function deleteTimetableEntry(id) {
  assertConfigured();
  const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
  if (error) throw error;
}

export async function listExamsAdmin() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('exams')
    .select('*, units ( code, title ), semesters ( name, academic_year )')
    .order('exam_date');
  if (error) throw error;
  return data || [];
}

export async function createExam(payload) {
  assertConfigured();
  const { error } = await supabase.from('exams').insert(payload);
  if (error) throw error;
}

export async function deleteExam(id) {
  assertConfigured();
  const { error } = await supabase.from('exams').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Student documents (admin issues official documents)                  */
/* ------------------------------------------------------------------ */

const DOCUMENTS_BUCKET = 'student-documents';

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

export async function listStudentDocumentsAdmin(studentId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('student_documents')
    .select('*')
    .eq('student_id', studentId)
    .order('issued_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function issueStudentDocument(studentId, { file, docType, title }) {
  assertConfigured();
  let filePath = null;

  if (file) {
    filePath = `${studentId}/${docType}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (uploadError) throw uploadError;
  }

  const { error } = await supabase.from('student_documents').insert({
    student_id: studentId,
    doc_type: docType,
    title,
    file_path: filePath,
    status: 'available',
  });
  if (error) throw error;
}

export async function deleteStudentDocument(id) {
  assertConfigured();
  const { error } = await supabase.from('student_documents').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Dashboard overview                                                    */
/* ------------------------------------------------------------------ */

export async function getAdminOverview() {
  if (!supabase) return { students: 0, pendingRequests: 0, openTickets: 0, unpaidBalance: 0, pendingApplications: 0, newMessages: 0 };
  const [
    { count: students },
    { count: pendingRequests },
    { count: openTickets },
    feeRows,
    { count: pendingApplications },
    { count: newMessages },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'admin'),
    supabase.from('service_requests').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
    supabase.from('fee_transactions').select('type, amount'),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);
  const unpaidBalance = (feeRows.data || []).reduce(
    (sum, t) => sum + (t.type === 'payment' ? -Number(t.amount || 0) : Number(t.amount || 0)),
    0
  );
  return {
    students: students || 0,
    pendingRequests: pendingRequests || 0,
    openTickets: openTickets || 0,
    unpaidBalance,
    pendingApplications: pendingApplications || 0,
    newMessages: newMessages || 0,
  };
}
