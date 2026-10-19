-- LMS helper functions and RLS policies

-- Helper functions
CREATE OR REPLACE FUNCTION is_lms_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'lms_admin')); $$;
GRANT EXECUTE ON FUNCTION is_lms_admin() TO authenticated;

CREATE OR REPLACE FUNCTION can_manage_course(target_course_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM lms_courses c WHERE c.id = target_course_id
    AND (
      c.created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = target_course_id AND instructor_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
$$;
GRANT EXECUTE ON FUNCTION can_manage_course(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION is_course_instructor(target_course_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT can_manage_course(target_course_id); $$;
GRANT EXECUTE ON FUNCTION is_course_instructor(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION course_id_for_lesson(target_lesson_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT m.course_id FROM lessons l JOIN modules m ON m.id = l.module_id WHERE l.id = target_lesson_id; $$;
GRANT EXECUTE ON FUNCTION course_id_for_lesson(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION can_manage_lesson(target_lesson_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT can_manage_course(course_id_for_lesson(target_lesson_id)); $$;
GRANT EXECUTE ON FUNCTION can_manage_lesson(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION is_lesson_instructor(target_lesson_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT can_manage_lesson(target_lesson_id); $$;
GRANT EXECUTE ON FUNCTION is_lesson_instructor(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION is_lesson_enrolled(target_lesson_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM lms_enrollments e JOIN modules m ON m.course_id = e.course_id JOIN lessons l ON l.module_id = m.id
    WHERE l.id = target_lesson_id AND e.student_id = auth.uid() AND e.status = 'active'
  );
$$;
GRANT EXECUTE ON FUNCTION is_lesson_enrolled(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION is_enrolled(target_course_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = target_course_id AND student_id = auth.uid() AND status = 'active'); $$;
GRANT EXECUTE ON FUNCTION is_enrolled(uuid) TO authenticated;

-- RLS on all LMS tables
ALTER TABLE lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

-- lms_courses policies
CREATE POLICY "select_courses" ON lms_courses FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = lms_courses.id AND instructor_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR status = 'published'
);
CREATE POLICY "insert_courses" ON lms_courses FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() OR is_admin());
CREATE POLICY "update_courses" ON lms_courses FOR UPDATE TO authenticated USING (can_manage_course(id)) WITH CHECK (can_manage_course(id));
CREATE POLICY "delete_courses" ON lms_courses FOR DELETE TO authenticated USING (created_by = auth.uid() OR is_admin());

-- course_instructors
CREATE POLICY "select_course_instructors" ON course_instructors FOR SELECT TO authenticated USING (instructor_id = auth.uid() OR is_admin());
CREATE POLICY "insert_course_instructors" ON course_instructors FOR INSERT TO authenticated WITH CHECK (instructor_id = auth.uid() OR is_admin());
CREATE POLICY "delete_course_instructors" ON course_instructors FOR DELETE TO authenticated USING (instructor_id = auth.uid() OR is_admin());

-- modules
CREATE POLICY "select_modules" ON modules FOR SELECT TO authenticated USING (can_manage_course(course_id) OR EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = modules.course_id AND student_id = auth.uid() AND status = 'active'));
CREATE POLICY "insert_modules" ON modules FOR INSERT TO authenticated WITH CHECK (can_manage_course(course_id));
CREATE POLICY "update_modules" ON modules FOR UPDATE TO authenticated USING (can_manage_course(course_id)) WITH CHECK (can_manage_course(course_id));
CREATE POLICY "delete_modules" ON modules FOR DELETE TO authenticated USING (can_manage_course(course_id));

-- lessons
CREATE POLICY "select_lessons" ON lessons FOR SELECT TO authenticated USING (can_manage_lesson(id) OR (status = 'published' AND is_lesson_enrolled(id)));
CREATE POLICY "insert_lessons" ON lessons FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM modules WHERE id = module_id AND can_manage_course(course_id)));
CREATE POLICY "update_lessons" ON lessons FOR UPDATE TO authenticated USING (can_manage_lesson(id)) WITH CHECK (can_manage_lesson(id));
CREATE POLICY "delete_lessons" ON lessons FOR DELETE TO authenticated USING (can_manage_lesson(id));

-- lesson_resources
CREATE POLICY "select_lesson_resources" ON lesson_resources FOR SELECT TO authenticated USING (can_manage_lesson(lesson_id) OR EXISTS (SELECT 1 FROM lessons l WHERE l.id = lesson_resources.lesson_id AND l.status = 'published' AND is_lesson_enrolled(l.id)));
CREATE POLICY "insert_lesson_resources" ON lesson_resources FOR INSERT TO authenticated WITH CHECK (can_manage_lesson(lesson_id));
CREATE POLICY "update_lesson_resources" ON lesson_resources FOR UPDATE TO authenticated USING (can_manage_lesson(lesson_id)) WITH CHECK (can_manage_lesson(lesson_id));
CREATE POLICY "delete_lesson_resources" ON lesson_resources FOR DELETE TO authenticated USING (can_manage_lesson(lesson_id));

-- lms_enrollments
CREATE POLICY "select_enrollments" ON lms_enrollments FOR SELECT TO authenticated USING (student_id = auth.uid() OR can_manage_course(course_id));
CREATE POLICY "insert_enrollments" ON lms_enrollments FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() AND EXISTS (SELECT 1 FROM lms_courses WHERE id = course_id AND status = 'published'));
CREATE POLICY "update_enrollments" ON lms_enrollments FOR UPDATE TO authenticated USING (student_id = auth.uid() OR is_admin());
CREATE POLICY "delete_enrollments" ON lms_enrollments FOR DELETE TO authenticated USING (student_id = auth.uid() OR is_admin());

-- lesson_progress
CREATE POLICY "select_lesson_progress" ON lesson_progress FOR SELECT TO authenticated USING (student_id = auth.uid() OR can_manage_lesson(lesson_id) OR is_admin());
CREATE POLICY "insert_lesson_progress" ON lesson_progress FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "update_lesson_progress" ON lesson_progress FOR UPDATE TO authenticated USING (student_id = auth.uid());
CREATE POLICY "delete_lesson_progress" ON lesson_progress FOR DELETE TO authenticated USING (student_id = auth.uid());

-- quizzes
CREATE POLICY "select_quizzes" ON quizzes FOR SELECT TO authenticated USING (is_lesson_instructor(lesson_id) OR is_lesson_enrolled(lesson_id) OR is_lms_admin());
CREATE POLICY "insert_quizzes" ON quizzes FOR INSERT TO authenticated WITH CHECK (is_lesson_instructor(lesson_id));
CREATE POLICY "update_quizzes" ON quizzes FOR UPDATE TO authenticated USING (is_lesson_instructor(lesson_id)) WITH CHECK (is_lesson_instructor(lesson_id));
CREATE POLICY "delete_quizzes" ON quizzes FOR DELETE TO authenticated USING (is_lesson_instructor(lesson_id));

-- quiz_questions
CREATE POLICY "select_quiz_questions" ON quiz_questions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM quizzes q WHERE q.id = quiz_id AND (is_lesson_instructor(q.lesson_id) OR is_lesson_enrolled(q.lesson_id) OR is_lms_admin())));
CREATE POLICY "insert_quiz_questions" ON quiz_questions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM quizzes q WHERE q.id = quiz_id AND is_lesson_instructor(q.lesson_id)));
CREATE POLICY "update_quiz_questions" ON quiz_questions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM quizzes q WHERE q.id = quiz_id AND is_lesson_instructor(q.lesson_id))) WITH CHECK (EXISTS (SELECT 1 FROM quizzes q WHERE q.id = quiz_id AND is_lesson_instructor(q.lesson_id)));
CREATE POLICY "delete_quiz_questions" ON quiz_questions FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM quizzes q WHERE q.id = quiz_id AND is_lesson_instructor(q.lesson_id)));

-- quiz_question_options — students see options only for published quizzes, instructors see all
CREATE POLICY "select_quiz_options" ON quiz_question_options FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM quiz_questions qq JOIN quizzes q ON q.id = qq.quiz_id WHERE qq.id = question_id AND (is_lesson_instructor(q.lesson_id) OR is_lms_admin()))
  OR EXISTS (SELECT 1 FROM quiz_questions qq JOIN quizzes q ON q.id = qq.quiz_id WHERE qq.id = question_id AND is_lesson_enrolled(q.lesson_id) AND q.status = 'published')
);
CREATE POLICY "insert_quiz_options" ON quiz_question_options FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM quiz_questions qq JOIN quizzes q ON q.id = qq.quiz_id WHERE qq.id = question_id AND is_lesson_instructor(q.lesson_id)));
CREATE POLICY "update_quiz_options" ON quiz_question_options FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM quiz_questions qq JOIN quizzes q ON q.id = qq.quiz_id WHERE qq.id = question_id AND is_lesson_instructor(q.lesson_id))) WITH CHECK (EXISTS (SELECT 1 FROM quiz_questions qq JOIN quizzes q ON q.id = qq.quiz_id WHERE qq.id = question_id AND is_lesson_instructor(q.lesson_id)));
CREATE POLICY "delete_quiz_options" ON quiz_question_options FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM quiz_questions qq JOIN quizzes q ON q.id = qq.quiz_id WHERE qq.id = question_id AND is_lesson_instructor(q.lesson_id)));

-- quiz_attempts
CREATE POLICY "select_own_attempts" ON quiz_attempts FOR SELECT TO authenticated USING (student_id = auth.uid() OR is_lms_admin());
CREATE POLICY "insert_own_attempts" ON quiz_attempts FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "update_own_attempts" ON quiz_attempts FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- quiz_answers
CREATE POLICY "select_own_answers" ON quiz_answers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM quiz_attempts a WHERE a.id = attempt_id AND a.student_id = auth.uid()) OR is_lms_admin());
CREATE POLICY "insert_own_answers" ON quiz_answers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM quiz_attempts a WHERE a.id = attempt_id AND a.student_id = auth.uid()));
CREATE POLICY "update_own_answers" ON quiz_answers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM quiz_attempts a WHERE a.id = attempt_id AND a.student_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM quiz_attempts a WHERE a.id = attempt_id AND a.student_id = auth.uid()));

-- assignments
CREATE POLICY "select_assignments" ON assignments FOR SELECT TO authenticated USING (can_manage_course(course_id) OR EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = assignments.course_id AND student_id = auth.uid() AND status = 'active'));
CREATE POLICY "insert_assignments" ON assignments FOR INSERT TO authenticated WITH CHECK (can_manage_course(course_id));
CREATE POLICY "update_assignments" ON assignments FOR UPDATE TO authenticated USING (can_manage_course(course_id));
CREATE POLICY "delete_assignments" ON assignments FOR DELETE TO authenticated USING (can_manage_course(course_id));

-- submissions
CREATE POLICY "select_submissions" ON submissions FOR SELECT TO authenticated USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM assignments a JOIN lms_courses c ON c.id = a.course_id WHERE a.id = submissions.assignment_id AND can_manage_course(c.id)));
CREATE POLICY "insert_submissions" ON submissions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() AND EXISTS (SELECT 1 FROM assignments a JOIN lms_enrollments e ON e.course_id = a.course_id WHERE a.id = submissions.assignment_id AND e.student_id = auth.uid() AND e.status = 'active'));
CREATE POLICY "update_submissions" ON submissions FOR UPDATE TO authenticated USING ((student_id = auth.uid() AND status = 'submitted') OR EXISTS (SELECT 1 FROM assignments a JOIN lms_courses c ON c.id = a.course_id WHERE a.id = submissions.assignment_id AND can_manage_course(c.id)));
CREATE POLICY "delete_submissions" ON submissions FOR DELETE TO authenticated USING (student_id = auth.uid());

-- discussions
CREATE POLICY "select_discussions" ON discussions FOR SELECT TO authenticated USING (can_manage_course(course_id) OR EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = discussions.course_id AND student_id = auth.uid() AND status = 'active'));
CREATE POLICY "insert_discussions" ON discussions FOR INSERT TO authenticated WITH CHECK (can_manage_course(course_id) OR EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = discussions.course_id AND student_id = auth.uid() AND status = 'active'));
CREATE POLICY "update_discussions" ON discussions FOR UPDATE TO authenticated USING (author_id = auth.uid() OR can_manage_course(course_id));
CREATE POLICY "delete_discussions" ON discussions FOR DELETE TO authenticated USING (author_id = auth.uid() OR can_manage_course(course_id));

-- discussion_replies
CREATE POLICY "select_replies" ON discussion_replies FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM discussions d WHERE d.id = discussion_id AND (can_manage_course(d.course_id) OR EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = d.course_id AND student_id = auth.uid() AND status = 'active'))));
CREATE POLICY "insert_replies" ON discussion_replies FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM discussions d WHERE d.id = discussion_id AND (can_manage_course(d.course_id) OR EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = d.course_id AND student_id = auth.uid() AND status = 'active'))));
CREATE POLICY "update_replies" ON discussion_replies FOR UPDATE TO authenticated USING (author_id = auth.uid());
CREATE POLICY "delete_replies" ON discussion_replies FOR DELETE TO authenticated USING (author_id = auth.uid() OR EXISTS (SELECT 1 FROM discussions d WHERE d.id = discussion_id AND can_manage_course(d.course_id)));

-- announcements
CREATE POLICY "select_announcements" ON announcements FOR SELECT TO authenticated USING (can_manage_course(course_id) OR EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = announcements.course_id AND student_id = auth.uid() AND status = 'active'));
CREATE POLICY "insert_announcements" ON announcements FOR INSERT TO authenticated WITH CHECK (can_manage_course(course_id));
CREATE POLICY "update_announcements" ON announcements FOR UPDATE TO authenticated USING (can_manage_course(course_id));
CREATE POLICY "delete_announcements" ON announcements FOR DELETE TO authenticated USING (can_manage_course(course_id));

-- notifications
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
CREATE POLICY "insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (recipient_id = auth.uid());
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE TO authenticated USING (recipient_id = auth.uid());

-- grade_components
CREATE POLICY "select_grade_components" ON grade_components FOR SELECT TO authenticated USING (can_manage_course(course_id));
CREATE POLICY "insert_grade_components" ON grade_components FOR INSERT TO authenticated WITH CHECK (can_manage_course(course_id));
CREATE POLICY "update_grade_components" ON grade_components FOR UPDATE TO authenticated USING (can_manage_course(course_id));
CREATE POLICY "delete_grade_components" ON grade_components FOR DELETE TO authenticated USING (can_manage_course(course_id));

-- certificates
CREATE POLICY "select_own_certificates" ON certificates FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "admin_select_all_certificates" ON certificates FOR SELECT TO authenticated USING (is_lms_admin());
CREATE POLICY "admin_update_certificates" ON certificates FOR UPDATE TO authenticated USING (is_lms_admin()) WITH CHECK (is_lms_admin());

-- course_completions
CREATE POLICY "select_own_completions" ON course_completions FOR SELECT TO authenticated USING (student_id = auth.uid() OR is_lms_admin());

-- course_sessions
CREATE POLICY "sessions_accessible" ON course_sessions FOR SELECT TO authenticated USING (published = true AND (is_lms_admin() OR is_course_instructor(course_id) OR is_enrolled(course_id)));
CREATE POLICY "sessions_instructor_insert" ON course_sessions FOR INSERT TO authenticated WITH CHECK (is_course_instructor(course_id));
CREATE POLICY "sessions_instructor_update" ON course_sessions FOR UPDATE TO authenticated USING (is_course_instructor(course_id)) WITH CHECK (is_course_instructor(course_id));
CREATE POLICY "sessions_instructor_delete" ON course_sessions FOR DELETE TO authenticated USING (is_course_instructor(course_id));

-- session_attendance
CREATE POLICY "attendance_own_or_instructor" ON session_attendance FOR SELECT TO authenticated USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM course_sessions s WHERE s.id = session_id AND is_course_instructor(s.course_id)));
CREATE POLICY "attendance_student_insert" ON session_attendance FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "attendance_student_update" ON session_attendance FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "attendance_instructor_update" ON session_attendance FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM course_sessions s WHERE s.id = session_id AND is_course_instructor(s.course_id))) WITH CHECK (EXISTS (SELECT 1 FROM course_sessions s WHERE s.id = session_id AND is_course_instructor(s.course_id)));

-- portfolio_items
CREATE POLICY "portfolio_own" ON portfolio_items FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- learning_goals
CREATE POLICY "goals_own" ON learning_goals FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- course_prerequisites
CREATE POLICY "prerequisites_read" ON course_prerequisites FOR SELECT TO authenticated USING (true);

-- cohorts
CREATE POLICY "cohorts_read" ON cohorts FOR SELECT TO authenticated USING (true);
CREATE POLICY "cohorts_admin_manage" ON cohorts FOR ALL TO authenticated USING (is_lms_admin()) WITH CHECK (is_lms_admin());

-- cohort_members
CREATE POLICY "cohort_members_own_or_staff" ON cohort_members FOR SELECT TO authenticated USING (student_id = auth.uid() OR is_lms_admin());
CREATE POLICY "cohort_members_admin_manage" ON cohort_members FOR ALL TO authenticated USING (is_lms_admin()) WITH CHECK (is_lms_admin());

-- grade_entries
CREATE POLICY "grade_entries_student_read_own" ON grade_entries FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "grade_entries_instructor_manage" ON grade_entries FOR ALL TO authenticated USING (is_course_instructor(course_id)) WITH CHECK (is_course_instructor(course_id));

-- learning_projects
CREATE POLICY "projects_readable" ON learning_projects FOR SELECT TO authenticated USING (published = true OR is_lms_admin() OR created_by = auth.uid());
CREATE POLICY "projects_staff_manage" ON learning_projects FOR ALL TO authenticated USING (is_lms_admin() OR created_by = auth.uid()) WITH CHECK (is_lms_admin() OR created_by = auth.uid());

-- project_milestones
CREATE POLICY "milestones_readable" ON project_milestones FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM learning_projects p WHERE p.id = project_id AND (p.published OR p.created_by = auth.uid() OR is_lms_admin())));
CREATE POLICY "milestones_staff_manage" ON project_milestones FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM learning_projects p WHERE p.id = project_id AND (p.created_by = auth.uid() OR is_lms_admin()))) WITH CHECK (EXISTS (SELECT 1 FROM learning_projects p WHERE p.id = project_id AND (p.created_by = auth.uid() OR is_lms_admin())));

-- project_members
CREATE POLICY "project_members_own_or_staff" ON project_members FOR SELECT TO authenticated USING (student_id = auth.uid() OR is_lms_admin());
CREATE POLICY "project_members_self_join" ON project_members FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() AND EXISTS (SELECT 1 FROM learning_projects p WHERE p.id = project_id AND p.published = true));
CREATE POLICY "project_members_staff" ON project_members FOR ALL TO authenticated USING (is_lms_admin()) WITH CHECK (is_lms_admin());

-- project_submissions
CREATE POLICY "project_submissions_own_read" ON project_submissions FOR SELECT TO authenticated USING (student_id = auth.uid() OR is_lms_admin() OR EXISTS (SELECT 1 FROM project_milestones pm JOIN learning_projects p ON p.id = pm.project_id WHERE pm.id = milestone_id AND is_course_instructor(p.course_id)));
CREATE POLICY "project_submissions_own_write" ON project_submissions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "project_submissions_own_update" ON project_submissions FOR UPDATE TO authenticated USING (student_id = auth.uid() OR is_lms_admin() OR EXISTS (SELECT 1 FROM project_milestones pm JOIN learning_projects p ON p.id = pm.project_id WHERE pm.id = milestone_id AND is_course_instructor(p.course_id))) WITH CHECK (student_id = auth.uid() OR is_lms_admin());

-- career_opportunities
CREATE POLICY "career_read" ON career_opportunities FOR SELECT TO authenticated USING (published = true OR is_lms_admin());
CREATE POLICY "career_staff_manage" ON career_opportunities FOR ALL TO authenticated USING (is_lms_admin()) WITH CHECK (is_lms_admin());

-- mentorship_requests
CREATE POLICY "mentorship_own_or_staff" ON mentorship_requests FOR SELECT TO authenticated USING (student_id = auth.uid() OR mentor_id = auth.uid() OR is_lms_admin());
CREATE POLICY "mentorship_student_create" ON mentorship_requests FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "mentorship_student_update" ON mentorship_requests FOR UPDATE TO authenticated USING (student_id = auth.uid() OR mentor_id = auth.uid() OR is_lms_admin()) WITH CHECK (student_id = auth.uid() OR mentor_id = auth.uid() OR is_lms_admin());

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('course-thumbnails', 'course-thumbnails', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-resources', 'lesson-resources', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('assignment-submissions', 'assignment-submissions', false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "upload_course_thumbnail" ON storage.objects;
CREATE POLICY "upload_course_thumbnail" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-thumbnails');
DROP POLICY IF EXISTS "read_course_thumbnail" ON storage.objects;
CREATE POLICY "read_course_thumbnail" ON storage.objects FOR SELECT USING (bucket_id = 'course-thumbnails');
DROP POLICY IF EXISTS "update_course_thumbnail" ON storage.objects;
CREATE POLICY "update_course_thumbnail" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'course-thumbnails');
DROP POLICY IF EXISTS "upload_lesson_resources" ON storage.objects;
CREATE POLICY "upload_lesson_resources" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson-resources' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'lms_admin', 'instructor')));
DROP POLICY IF EXISTS "read_lesson_resources" ON storage.objects;
CREATE POLICY "read_lesson_resources" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'lesson-resources');
DROP POLICY IF EXISTS "upload_submission_files" ON storage.objects;
CREATE POLICY "upload_submission_files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assignment-submissions');
DROP POLICY IF EXISTS "read_submission_files" ON storage.objects;
CREATE POLICY "read_submission_files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'assignment-submissions');

-- Triggers
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_lms_courses_updated ON lms_courses;
CREATE TRIGGER trg_lms_courses_updated BEFORE UPDATE ON lms_courses FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trg_modules_updated ON modules;
CREATE TRIGGER trg_modules_updated BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trg_lessons_updated ON lessons;
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trg_assignments_updated ON assignments;
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trg_lesson_progress_updated ON lesson_progress;
CREATE TRIGGER trg_lesson_progress_updated BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE FUNCTION update_timestamp();
DROP TRIGGER IF EXISTS trg_cohorts_updated_at ON cohorts;
CREATE TRIGGER trg_cohorts_updated_at BEFORE UPDATE ON cohorts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_mentorship_updated_at ON mentorship_requests;
CREATE TRIGGER trg_mentorship_updated_at BEFORE UPDATE ON mentorship_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_certificates_updated ON certificates;
CREATE TRIGGER trg_certificates_updated BEFORE UPDATE ON certificates FOR EACH ROW EXECUTE FUNCTION update_timestamp();