import { supabase } from './client';

/**
 * lms — data layer for the Learning Management System.
 *
 * Every function here assumes RLS is the real enforcement boundary
 * (see the LMS migrations); this layer just shapes queries and throws
 * on error so pages can show a proper ErrorState instead of crashing.
 */

function assertConfigured() {
  if (!supabase) {
    throw new Error('The LMS is unavailable because Supabase has not been configured.');
  }
}

function privateObjectPath(bucket, value) {
  if (!value || typeof value !== 'string') return null;
  if (!/^https?:\/\//i.test(value)) return value;
  try {
    const url = new URL(value);
    for (const marker of [`/object/sign/${bucket}/`, `/object/public/${bucket}/`]) {
      const index = url.pathname.indexOf(marker);
      if (index >= 0) return decodeURIComponent(url.pathname.slice(index + marker.length));
    }
  } catch {
    // Non-URL values are treated as storage paths by the caller.
  }
  return null;
}

async function signPrivateObject(bucket, value) {
  if (!value) return { url: value || null, path: null };
  const path = privateObjectPath(bucket, value);
  if (!path) return { url: value, path: null };
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return { url: data?.signedUrl || null, path };
}

async function signSubmissionFile(row) {
  if (!row?.file_url) return row;
  const signed = await signPrivateObject('assignment-submissions', row.file_url);
  return { ...row, file_url: signed.url, file_path: signed.path || row.file_url };
}

async function requireUserId(message = 'Please sign in to continue.') {
  assertConfigured();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data?.user?.id;
  if (!userId) throw new Error(message);
  return userId;
}

// ============================================================
// Courses (instructor + admin)
// ============================================================
export async function listMyCourses() {
  assertConfigured();
  const uid = await requireUserId('Please sign in to view your teaching courses.');
  const { data, error } = await supabase
    .from('lms_courses')
    .select('*, course_instructors!inner(instructor_id)')
    .eq('course_instructors.instructor_id', uid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCourse(fields) {
  assertConfigured();
  const uid = await requireUserId('Please sign in before creating a course.');
  const { data: course, error } = await supabase
    .from('lms_courses')
    .insert([{ ...fields, created_by: uid }])
    .select()
    .single();
  if (error) throw error;

  const { error: instructorError } = await supabase
    .from('course_instructors')
    .insert([{ course_id: course.id, instructor_id: uid, role: 'primary' }]);
  if (instructorError) throw instructorError;

  return course;
}

export async function updateCourse(courseId, fields) {
  assertConfigured();
  const { data, error } = await supabase.from('lms_courses').update(fields).eq('id', courseId).select().single();
  if (error) throw error;
  return data;
}

export async function getCourse(courseId) {
  assertConfigured();
  const { data, error } = await supabase.from('lms_courses').select('*').eq('id', courseId).single();
  if (error) throw error;
  return data;
}

export async function listPublishedCourses() {
  assertConfigured();
  const { data, error } = await supabase.from('lms_courses').select('*').eq('status', 'published').order('title');
  if (error) throw error;
  return data || [];
}

// Admin: list all courses for review
export async function listAllCourses() {
  assertConfigured();
  const { data, error } = await supabase
    .from('lms_courses')
    .select('*, course_instructors(instructor_id, profiles!course_instructors_instructor_id_fkey(full_name, email))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Admin: get a single course with instructor info
export async function getCourseForAdmin(courseId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('lms_courses')
    .select('*, course_instructors(instructor_id, profiles!course_instructors_instructor_id_fkey(full_name, email))')
    .eq('id', courseId)
    .single();
  if (error) throw error;
  return data;
}

// Upload course thumbnail
export async function uploadCourseThumbnail(courseId, file) {
  const uid = await requireUserId('Please sign in before uploading a course thumbnail.');
  if (!file) throw new Error('Choose a thumbnail file first.');
  if (!String(file.type || '').startsWith('image/')) throw new Error('Course thumbnails must be image files.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Course thumbnails must be 5 MB or smaller.');
  const ext = String(file.name || '').split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'img';
  const path = `${courseId || uid}/thumb-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('course-thumbnails').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: pub } = supabase.storage.from('course-thumbnails').getPublicUrl(path);
  return pub?.publicUrl || path;
}

// Course review workflow
export async function submitCourseForReview(courseId) {
  assertConfigured();
  const { error } = await supabase.rpc('submit_course_for_review', { p_course_id: courseId });
  if (error) throw error;
}

export async function setCourseUnderReview(courseId) {
  assertConfigured();
  const { error } = await supabase.rpc('set_course_under_review', { p_course_id: courseId });
  if (error) throw error;
}

export async function approveCourse(courseId) {
  assertConfigured();
  const { error } = await supabase.rpc('approve_course', { p_course_id: courseId });
  if (error) throw error;
}

export async function publishCourse(courseId) {
  assertConfigured();
  const { error } = await supabase.rpc('publish_course', { p_course_id: courseId });
  if (error) throw error;
}

export async function rejectCourse(courseId, notes) {
  assertConfigured();
  const { error } = await supabase.rpc('reject_course', { p_course_id: courseId, p_notes: notes });
  if (error) throw error;
}

export async function requestCourseChanges(courseId, notes) {
  assertConfigured();
  const { error } = await supabase.rpc('request_course_changes', { p_course_id: courseId, p_notes: notes });
  if (error) throw error;
}

// Reorder modules
export async function reorderModules(courseId, moduleIds) {
  assertConfigured();
  const { error } = await supabase.rpc('reorder_modules', { p_course_id: courseId, p_module_ids: moduleIds });
  if (error) throw error;
}

// Reorder lessons
export async function reorderLessons(moduleId, lessonIds) {
  assertConfigured();
  const { error } = await supabase.rpc('reorder_lessons', { p_module_id: moduleId, p_lesson_ids: lessonIds });
  if (error) throw error;
}

// ============================================================
// Course structure: modules, lessons, resources
// ============================================================
export async function listModulesWithLessons(courseId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', courseId)
    .order('position');
  if (error) throw error;
  return (data || []).map((m) => ({ ...m, lessons: (m.lessons || []).sort((a, b) => a.position - b.position) }));
}

export async function createModule(courseId, { title, description, position }) {
  assertConfigured();
  const { data, error } = await supabase
    .from('modules')
    .insert([{ course_id: courseId, title, description, position }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateModule(moduleId, fields) {
  assertConfigured();
  const { data, error } = await supabase.from('modules').update(fields).eq('id', moduleId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteModule(moduleId) {
  assertConfigured();
  const { error } = await supabase.from('modules').delete().eq('id', moduleId);
  if (error) throw error;
}

export async function createLesson(moduleId, fields) {
  assertConfigured();
  const { data, error } = await supabase.from('lessons').insert([{ module_id: moduleId, ...fields }]).select().single();
  if (error) throw error;
  return data;
}

export async function updateLesson(lessonId, fields) {
  assertConfigured();
  const { data, error } = await supabase.from('lessons').update(fields).eq('id', lessonId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteLesson(lessonId) {
  assertConfigured();
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) throw error;
}

export async function getLesson(lessonId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('lessons')
    .select('*, lesson_resources(*), modules(id, title, course_id)')
    .eq('id', lessonId)
    .single();
  if (error) throw error;
  const lessonResources = await Promise.all((data.lesson_resources || []).map(async (resource) => {
    if (!resource.file_url) return { ...resource, storage_path: null };
    const signed = await signPrivateObject('lesson-resources', resource.file_url);
    return { ...resource, file_url: signed.url, storage_path: signed.path };
  }));
  return { ...data, lesson_resources: lessonResources };
}

// ============================================================
// Lesson resources (files, links, downloads)
// ============================================================
export async function createLessonResource(lessonId, fields) {
  assertConfigured();
  const { data, error } = await supabase
    .from('lesson_resources')
    .insert([{ lesson_id: lessonId, ...fields }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLessonResource(resourceId, fields) {
  assertConfigured();
  const { data, error } = await supabase
    .from('lesson_resources')
    .update(fields)
    .eq('id', resourceId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLessonResource(resourceId) {
  assertConfigured();
  const { error } = await supabase.from('lesson_resources').delete().eq('id', resourceId);
  if (error) throw error;
}

export async function listLessonResources(lessonId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('lesson_resources')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('position');
  if (error) throw error;
  return Promise.all((data || []).map(async (resource) => {
    if (!resource.file_url) return { ...resource, storage_path: null };
    const signed = await signPrivateObject('lesson-resources', resource.file_url);
    return { ...resource, file_url: signed.url, storage_path: signed.path };
  }));
}

export async function uploadLessonResourceFile(lessonId, file) {
  const uid = await requireUserId('Please sign in before uploading lesson resources.');
  if (!lessonId || !file) throw new Error('A lesson and resource file are required.');
  if (file.size > 25 * 1024 * 1024) throw new Error('Lesson resources must be 25 MB or smaller.');
  const safeName = String(file.name || 'resource').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  const path = `${uid}/${lessonId}/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage.from('lesson-resources').upload(path, file);
  if (error) throw error;
  return path;
}

// ============================================================
// Enrollment
// ============================================================
export async function enrollInCourse(courseId) {
  await requireUserId('Please sign in before enrolling in a course.');
  if (!courseId || typeof courseId !== 'string') throw new Error('A valid course is required to enroll.');

  const { data: course, error: courseError } = await supabase
    .from('lms_courses')
    .select('id, status, title, is_free')
    .eq('id', courseId)
    .maybeSingle();
  if (courseError) throw courseError;
  if (!course || course.status !== 'published') {
    throw new Error('This course is not currently available for enrolment. Please choose a published course.');
  }
  if (course.is_free !== true) {
    throw new Error('This course requires checkout. Open its public course page to complete payment before enrolment.');
  }

  // The server-side RPC is the single write path. It is idempotent and can
  // reactivate a dropped free-course enrolment without granting table updates.
  const { data, error } = await supabase.rpc('enroll_in_free_course', {
    p_course_id: courseId,
    p_course_code: null,
  });
  if (error) throw error;
  return data?.enrollment || data;
}

export async function listMyEnrollments() {
  const uid = await requireUserId('Please sign in to view your courses.');
  const { data, error } = await supabase
    .from('lms_enrollments')
    .select('*, lms_courses(*)')
    .eq('student_id', uid)
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function listCourseEnrollments(courseId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('lms_enrollments')
    .select('*, profiles(id, full_name, student_number)')
    .eq('course_id', courseId);
  if (error) throw error;
  return data || [];
}

export async function getMyEnrollment(courseId) {
  const uid = await requireUserId('Please sign in to view your enrolment.');
  const { data, error } = await supabase
    .from('lms_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .eq('student_id', uid)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============================================================
// Progress (single source — always call these, never compute
// completion % inline in a component)
// ============================================================
export async function getCourseProgress(courseId, studentId) {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_course_progress_secure', {
    target_course_id: courseId,
    target_student_id: studentId,
  });
  if (error) throw error;
  return data;
}

export async function getLessonProgress(lessonId) {
  const uid = await requireUserId('Please sign in to view lesson progress.');
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('student_id', uid)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllLessonProgress(courseId) {
  const uid = await requireUserId('Please sign in to view lesson progress.');
  const { data: modulesData, error: modulesError } = await supabase
    .from('modules')
    .select('lessons(id)')
    .eq('course_id', courseId);
  if (modulesError) throw modulesError;
  const lessonIds = (modulesData || []).flatMap((m) => (m.lessons || []).map((l) => l.id));
  if (lessonIds.length === 0) return [];
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id, status, started_at, completed_at, updated_at')
    .in('lesson_id', lessonIds)
    .eq('student_id', uid);
  if (error) throw error;
  return data || [];
}

export async function markLessonStarted(lessonId) {
  await requireUserId('Please sign in to track lesson progress.');
  if (!lessonId) throw new Error('A valid lesson is required to track progress.');
  const { data, error } = await supabase.rpc('start_lesson_progress_secure', { p_lesson_id: lessonId });
  if (error) throw error;
  return data;
}

export async function markLessonComplete(lessonId) {
  await requireUserId('Please sign in to complete a lesson.');
  if (!lessonId) throw new Error('A valid lesson is required to complete progress.');
  const { data, error } = await supabase.rpc('complete_lesson_progress_secure', { p_lesson_id: lessonId });
  if (error) throw error;
  return data;
}

// ============================================================
// Assignments & submissions
// ============================================================
export async function createAssignment(lessonId, courseId, moduleId, fields) {
  const uid = await requireUserId('Please sign in before creating an assignment.');
  const { data, error } = await supabase
    .from('assignments')
    .insert([{ lesson_id: lessonId, course_id: courseId, module_id: moduleId, created_by: uid, ...fields }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAssignment(assignmentId, fields) {
  assertConfigured();
  const { data, error } = await supabase.from('assignments').update(fields).eq('id', assignmentId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAssignment(assignmentId) {
  assertConfigured();
  const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);
  if (error) throw error;
}

export async function getAssignment(assignmentId) {
  assertConfigured();
  const { data, error } = await supabase.from('assignments').select('*').eq('id', assignmentId).single();
  if (error) throw error;
  return data;
}

export async function getLessonAssignment(lessonId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listModuleAssignments(moduleId) {
  assertConfigured();
  const { data, error } = await supabase.from('assignments').select('*').eq('module_id', moduleId).order('created_at');
  if (error) throw error;
  return data || [];
}

export async function listCourseAssignments(courseId) {
  assertConfigured();
  const { data, error } = await supabase.from('assignments').select('*, lessons(id, title)').eq('course_id', courseId).order('created_at');
  if (error) throw error;
  return data || [];
}

// Student: get own submission status for an assignment
export async function getMySubmissionStatus(assignmentId) {
  const uid = await requireUserId('Please sign in to view your submission status.');
  const { data, error } = await supabase.rpc('get_student_assignment_status', {
    p_assignment_id: assignmentId,
    p_student_id: uid,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? signSubmissionFile(row) : null;
}

// Student: submit assignment
export async function submitAssignment(assignmentId, { textResponse, fileUrl, fileName, attemptNumber, isLate, enrollmentId }) {
  const uid = await requireUserId('Please sign in before submitting an assignment.');
  const { data, error } = await supabase
    .from('submissions')
    .insert([{
      assignment_id: assignmentId,
      student_id: uid,
      enrollment_id: enrollmentId || null,
      attempt_number: attemptNumber,
      text_response: textResponse || '',
      file_url: fileUrl || '',
      file_name: fileName || '',
      is_late: isLate,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Student: replace submission (update existing ungraded submission)
export async function replaceSubmission(submissionId, { textResponse, fileUrl, fileName, isLate }) {
  assertConfigured();
  const { data, error } = await supabase
    .from('submissions')
    .update({
      text_response: textResponse || '',
      file_url: fileUrl || '',
      file_name: fileName || '',
      is_late: isLate,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadSubmissionFile(assignmentId, file) {
  const uid = await requireUserId('Please sign in before uploading an assignment.');
  if (!assignmentId || !file) throw new Error('An assignment and file are required.');
  if (file.size > 25 * 1024 * 1024) throw new Error('Assignment files must be 25 MB or smaller.');
  const safeName = String(file.name || 'submission').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  const path = `${uid}/${assignmentId}/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage.from('assignment-submissions').upload(path, file);
  if (error) throw error;
  return { path };
}

// Instructor: list all submissions for an assignment
export async function listAssignmentSubmissions(assignmentId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('submissions')
    .select('*, profiles(id, full_name, student_number)')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return Promise.all((data || []).map(signSubmissionFile));
}

// Instructor: list all submissions across a course
export async function listCourseSubmissions(courseId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('submissions')
    .select('*, assignments!inner(id, title, max_score, course_id, lessons(id, title)), profiles(id, full_name, student_number)')
    .eq('assignments.course_id', courseId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return Promise.all((data || []).map(signSubmissionFile));
}

// Instructor: grade a submission
export async function gradeSubmission(submissionId, { score, feedback }) {
  assertConfigured();
  const { error } = await supabase.rpc('grade_submission', {
    p_submission_id: submissionId,
    p_score: score,
    p_feedback: feedback || '',
    p_status: 'graded',
  });
  if (error) throw error;
}

// Instructor: request resubmission
export async function requestResubmission(submissionId, feedback) {
  assertConfigured();
  const { error } = await supabase.rpc('request_resubmission', {
    p_submission_id: submissionId,
    p_feedback: feedback || '',
  });
  if (error) throw error;
}

// Admin: get assignments for course review
export async function getCourseAssignmentsForAdmin(courseId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('assignments')
    .select('id, title, description, instructions, due_date, max_score, submission_type, status, lessons(id, title)')
    .eq('course_id', courseId)
    .order('created_at');
  if (error) throw error;
  return data || [];
}

// ============================================================
// Quizzes (lesson-scoped)
// ============================================================
export async function listModuleQuizzes(moduleId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, status, passing_score_percent, max_attempts, lessons!inner(id, title)')
    .eq('lessons.module_id', moduleId)
    .order('created_at');
  if (error) throw error;
  return data || [];
}

export async function getLessonQuiz(lessonId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      id, lesson_id, title, instructions, status, passing_score_percent,
      max_attempts, time_limit_minutes, require_pass_to_complete,
      quiz_questions (
        id, question_type, question_text, marks, position, explanation,
        quiz_question_options (id, option_text, position)
      )
    `)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createLessonQuiz(lessonId, fields) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quizzes')
    .insert([{ lesson_id: lessonId, ...fields }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLessonQuiz(quizId, fields) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quizzes')
    .update(fields)
    .eq('id', quizId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLessonQuiz(quizId) {
  assertConfigured();
  const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
  if (error) throw error;
}

export async function createQuizQuestion(quizId, fields, options = []) {
  assertConfigured();
  const { data: question, error } = await supabase
    .from('quiz_questions')
    .insert([{ quiz_id: quizId, ...fields }])
    .select()
    .single();
  if (error) throw error;

  if (options.length > 0) {
    const { error: optionsError } = await supabase
      .from('quiz_question_options')
      .insert(options.map((o, i) => ({ question_id: question.id, position: i, ...o })));
    if (optionsError) throw optionsError;
  }
  return question;
}

export async function updateQuizQuestion(questionId, fields) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quiz_questions')
    .update(fields)
    .eq('id', questionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteQuizQuestion(questionId) {
  assertConfigured();
  const { error } = await supabase.from('quiz_questions').delete().eq('id', questionId);
  if (error) throw error;
}

export async function createQuizOption(questionId, fields) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quiz_question_options')
    .insert([{ question_id: questionId, ...fields }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateQuizOption(optionId, fields) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quiz_question_options')
    .update(fields)
    .eq('id', optionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteQuizOption(optionId) {
  assertConfigured();
  const { error } = await supabase.from('quiz_question_options').delete().eq('id', optionId);
  if (error) throw error;
}

export async function saveQuizOptions(questionId, options) {
  assertConfigured();
  const existing = await supabase
    .from('quiz_question_options')
    .select('*')
    .eq('question_id', questionId);
  if (existing.error) throw existing.error;

  const existingIds = (existing.data || []).map((o) => o.id);
  const newIds = options.filter((o) => o.id).map((o) => o.id);
  const toDelete = existingIds.filter((id) => !newIds.includes(id));

  if (toDelete.length > 0) {
    const { error: delErr } = await supabase
      .from('quiz_question_options')
      .delete()
      .in('id', toDelete);
    if (delErr) throw delErr;
  }

  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    if (opt.id) {
      const { error } = await supabase
        .from('quiz_question_options')
        .update({ option_text: opt.option_text, is_correct: opt.is_correct, position: i })
        .eq('id', opt.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('quiz_question_options')
        .insert([{ question_id: questionId, option_text: opt.option_text, is_correct: opt.is_correct, position: i }]);
      if (error) throw error;
    }
  }
}

// Student-side: get quiz without correct answers
export async function getQuizForStudent(quizId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      id, lesson_id, title, instructions, status, passing_score_percent,
      max_attempts, time_limit_minutes, require_pass_to_complete,
      quiz_questions!inner (
        id, question_type, question_text, marks, position, explanation,
        quiz_question_options (id, option_text, position)
      )
    `)
    .eq('id', quizId)
    .single();
  if (error) throw error;
  return data;
}

export async function getQuizForInstructor(quizId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, quiz_questions(*, quiz_question_options(*))')
    .eq('id', quizId)
    .single();
  if (error) throw error;
  return data;
}

export async function startQuizAttempt(quizId, attemptNumber, enrollmentId) {
  const uid = await requireUserId('Please sign in before starting a quiz.');
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([{ quiz_id: quizId, student_id: uid, attempt_number: attemptNumber, enrollment_id: enrollmentId || null }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listMyQuizAttempts(quizId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .order('attempt_number', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveQuizAnswer(attemptId, questionId, { selectedOptionIds, textAnswer }) {
  assertConfigured();
  const { error } = await supabase
    .from('quiz_answers')
    .upsert(
      [{ attempt_id: attemptId, question_id: questionId, selected_option_ids: selectedOptionIds || [], text_answer: textAnswer || null, updated_at: new Date().toISOString() }],
      { onConflict: 'attempt_id,question_id' }
    );
  if (error) throw error;
}

export async function submitQuizAttempt(attemptId) {
  assertConfigured();
  const { data, error } = await supabase.rpc('submit_quiz_attempt', { target_attempt_id: attemptId });
  if (error) throw error;
  return data;
}

// Get quiz attempt results with answers for review
export async function getQuizAttemptResults(attemptId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quiz_answers (
        id, question_id, selected_option_ids, text_answer, is_correct, awarded_marks
      ),
      quiz:quizzes (
        id, title, passing_score_percent,
        quiz_questions (
          id, question_type, question_text, marks, position, explanation, correct_short_answer,
          quiz_question_options (id, option_text, is_correct, position)
        )
      )
    `)
    .eq('id', attemptId)
    .single();
  if (error) throw error;
  return data;
}

// Admin: get quiz info for a lesson (for course review)
export async function getLessonQuizForAdmin(lessonId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, instructions, status, passing_score_percent, max_attempts, require_pass_to_complete, quiz_questions(id, question_type, question_text, marks, position, explanation, quiz_question_options(id, option_text, is_correct, position))')
    .eq('lesson_id', lessonId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============================================================
// Grading config
// ============================================================
export async function listGradeComponents(courseId) {
  assertConfigured();
  const { data, error } = await supabase.from('grade_components').select('*').eq('course_id', courseId);
  if (error) throw error;
  return data || [];
}

export async function createGradeComponent(courseId, fields) {
  assertConfigured();
  const { data, error } = await supabase.from('grade_components').insert([{ course_id: courseId, ...fields }]).select().single();
  if (error) throw error;
  return data;
}

export async function getCourseGrade(courseId, studentId) {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_course_grade', { target_course_id: courseId, target_student_id: studentId });
  if (error) throw error;
  return data;
}

// ============================================================
// Discussions
// ============================================================
export async function listDiscussions(courseId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('discussions')
    .select('*, profiles(full_name)')
    .eq('course_id', courseId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createDiscussion(courseId, { title, body }) {
  const uid = await requireUserId('Please sign in before starting a discussion.');
  const { data, error } = await supabase.from('discussions').insert([{ course_id: courseId, author_id: uid, title, body }]).select().single();
  if (error) throw error;
  return data;
}

export async function listReplies(discussionId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('discussion_replies')
    .select('*, profiles(full_name)')
    .eq('discussion_id', discussionId)
    .order('created_at');
  if (error) throw error;
  return data || [];
}

export async function replyToDiscussion(discussionId, body, isInstructorReply) {
  const uid = await requireUserId('Please sign in before replying.');
  const { data, error } = await supabase
    .from('discussion_replies')
    .insert([{ discussion_id: discussionId, author_id: uid, body, is_instructor_reply: !!isInstructorReply }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setDiscussionState(discussionId, fields) {
  assertConfigured();
  const { error } = await supabase.from('discussions').update(fields).eq('id', discussionId);
  if (error) throw error;
}

// ============================================================
// Announcements
// ============================================================
export async function listCourseAnnouncements(courseId) {
  assertConfigured();
  const { data, error } = await supabase.from('announcements').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createAnnouncement(courseId, { title, body }) {
  const uid = await requireUserId('Please sign in before publishing an announcement.');
  const { data, error } = await supabase.from('announcements').insert([{ course_id: courseId, author_id: uid, title, body }]).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// Notifications
// ============================================================
export async function listMyNotifications(limit = 20) {
  assertConfigured();
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(notificationId) {
  assertConfigured();
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const uid = await requireUserId('Please sign in to update notifications.');
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', uid).eq('is_read', false);
  if (error) throw error;
}

// ============================================================
// Analytics
// ============================================================
export async function getCourseAnalytics(courseId) {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_course_analytics', { target_course_id: courseId });
  if (error) throw error;
  return data;
}

export async function getLmsOverview() {
  assertConfigured();
  const { data, error } = await supabase.rpc('get_lms_overview');
  if (error) throw error;
  return data;
}

// ============================================================
// Student academic progress & performance
// ============================================================
export async function getStudentAcademicSummary() {
  assertConfigured();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  const { data, error } = await supabase.rpc('get_student_academic_summary', { p_student_id: uid });
  if (error) throw error;
  return data;
}

export async function getStudentCoursePerformance() {
  assertConfigured();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  const { data, error } = await supabase.rpc('get_student_course_performance', { p_student_id: uid });
  if (error) throw error;
  return data || [];
}

export async function getStudentRecentActivity(limit = 20) {
  assertConfigured();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  const { data, error } = await supabase.rpc('get_student_recent_activity', { p_student_id: uid, p_limit: limit });
  if (error) throw error;
  return data || [];
}

export async function getStudentCourseDetail(courseId) {
  assertConfigured();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  const { data, error } = await supabase.rpc('get_student_course_detail', { p_student_id: uid, p_course_id: courseId });
  if (error) throw error;
  return data;
}

export async function getStudentAssessmentPerformance() {
  assertConfigured();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  const { data, error } = await supabase.rpc('get_student_assessment_performance', { p_student_id: uid });
  if (error) throw error;
  return data || [];
}

// ============================================================
// Course Completion & Certificates
// ============================================================

export async function checkCourseCompletion(enrollmentId) {
  assertConfigured();
  const { data, error } = await supabase.rpc('check_and_record_completion', { p_enrollment_id: enrollmentId });
  if (error) throw error;
  return data;
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

export async function getMyCertificate(certificateId) {
  assertConfigured();
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  const { data, error } = await supabase
    .from('certificates')
    .select('*, lms_courses(title, code, description)')
    .eq('id', certificateId)
    .eq('student_id', uid)
    .single();
  if (error) throw error;
  return data;
}

// Admin: list all certificates
export async function listAllCertificates(search = '') {
  assertConfigured();
  let query = supabase
    .from('certificates')
    .select('*, lms_courses(title, code), profiles(full_name, email, student_number)')
    .order('created_at', { ascending: false });
  if (search) {
    query = query.or(`certificate_number.ilike.%${search}%,student_name.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Admin: revoke a certificate
export async function revokeCertificate(certificateId, reason) {
  assertConfigured();
  const { error } = await supabase.rpc('revoke_certificate', {
    p_certificate_id: certificateId,
    p_reason: reason || '',
  });
  if (error) throw error;
}

// Admin: reactivate a certificate
export async function reactivateCertificate(certificateId) {
  assertConfigured();
  const { error } = await supabase.rpc('reactivate_certificate', { p_certificate_id: certificateId });
  if (error) throw error;
}

// Admin: update course completion settings
export async function updateCourseCompletionConfig(courseId, fields) {
  assertConfigured();
  const { error } = await supabase
    .from('lms_courses')
    .update({
      awards_certificate: fields.awards_certificate,
      requires_lesson_completion: fields.requires_lesson_completion,
      requires_quiz_pass: fields.requires_quiz_pass,
      requires_assignment_completion: fields.requires_assignment_completion,
    })
    .eq('id', courseId);
  if (error) throw error;
}
