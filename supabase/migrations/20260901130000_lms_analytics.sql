/*
  # LMS Phase 11 — Analytics

  Every number here is computed from real rows at query time — nothing
  cached or pre-aggregated into a drifting summary table, per Section 29
  (no mock data) and Section 30 (one authoritative source: this reuses
  get_course_progress() rather than recomputing completion a third way).
*/

-- ============================================================
-- 1. Per-course analytics for an instructor
-- ============================================================
CREATE OR REPLACE FUNCTION get_course_analytics(target_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_enrolled integer;
  v_active integer;
  v_completed integer;
  v_avg_progress numeric;
  v_avg_quiz_score numeric;
  v_submission_rate numeric;
  v_total_assignments integer;
  v_total_possible_submissions integer;
  v_actual_submissions integer;
  v_needs_attention jsonb;
BEGIN
  IF NOT is_course_instructor(target_course_id) THEN
    RAISE EXCEPTION 'Not authorized to view analytics for this course';
  END IF;

  SELECT count(*) FILTER (WHERE status IN ('active','completed')),
         count(*) FILTER (WHERE status = 'active'),
         count(*) FILTER (WHERE status = 'completed')
  INTO v_enrolled, v_active, v_completed
  FROM lms_enrollments WHERE course_id = target_course_id;

  SELECT COALESCE(AVG((get_course_progress(target_course_id, student_id)->>'percent')::numeric), 0)
  INTO v_avg_progress
  FROM lms_enrollments WHERE course_id = target_course_id AND status IN ('active', 'completed');

  SELECT COALESCE(AVG(qa.score / NULLIF(qa.max_score, 0) * 100), 0) INTO v_avg_quiz_score
  FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id JOIN modules m ON m.id = q.module_id
  WHERE m.course_id = target_course_id AND qa.score IS NOT NULL;

  SELECT count(*) INTO v_total_assignments FROM assignments a JOIN modules m ON m.id = a.module_id WHERE m.course_id = target_course_id;
  v_total_possible_submissions := v_total_assignments * GREATEST(v_enrolled, 0);

  SELECT count(*) INTO v_actual_submissions
  FROM submissions s JOIN assignments a ON a.id = s.assignment_id JOIN modules m ON m.id = a.module_id
  WHERE m.course_id = target_course_id;

  v_submission_rate := CASE WHEN v_total_possible_submissions = 0 THEN 0
    ELSE round(LEAST(v_actual_submissions, v_total_possible_submissions)::numeric / v_total_possible_submissions * 100, 1) END;

  -- Students needing attention: enrolled >14 days, under 20% progress, no recent activity
  SELECT jsonb_agg(jsonb_build_object('student_id', e.student_id, 'full_name', p.full_name, 'progress_percent', (get_course_progress(target_course_id, e.student_id)->>'percent')::numeric))
  INTO v_needs_attention
  FROM lms_enrollments e
  JOIN profiles p ON p.id = e.student_id
  WHERE e.course_id = target_course_id
    AND e.status = 'active'
    AND e.enrolled_at < now() - interval '14 days'
    AND (get_course_progress(target_course_id, e.student_id)->>'percent')::numeric < 20;

  RETURN jsonb_build_object(
    'enrolled', v_enrolled,
    'active', v_active,
    'completed', v_completed,
    'completion_rate_percent', CASE WHEN v_enrolled = 0 THEN 0 ELSE round(v_completed::numeric / v_enrolled * 100, 1) END,
    'avg_progress_percent', round(v_avg_progress, 1),
    'avg_quiz_score_percent', round(v_avg_quiz_score, 1),
    'assignment_submission_rate_percent', v_submission_rate,
    'students_needing_attention', COALESCE(v_needs_attention, '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_course_analytics(uuid) TO authenticated;

-- ============================================================
-- 2. LMS-wide analytics for Super Admin / LMS Admin
-- ============================================================
CREATE OR REPLACE FUNCTION get_lms_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_total_courses integer;
  v_published integer;
  v_draft integer;
  v_students integer;
  v_instructors integer;
  v_active_learners integer;
  v_avg_completion numeric;
BEGIN
  IF NOT is_lms_admin() THEN
    RAISE EXCEPTION 'Not authorized to view LMS-wide analytics';
  END IF;

  SELECT count(*) FILTER (WHERE true),
         count(*) FILTER (WHERE status = 'published'),
         count(*) FILTER (WHERE status = 'draft')
  INTO v_total_courses, v_published, v_draft
  FROM lms_courses;

  SELECT count(*) FILTER (WHERE role = 'student') INTO v_students FROM profiles;
  SELECT count(*) FILTER (WHERE role IN ('instructor', 'lms_admin', 'admin')) INTO v_instructors FROM profiles;

  SELECT count(DISTINCT student_id) INTO v_active_learners
  FROM lesson_progress WHERE updated_at > now() - interval '14 days';

  SELECT COALESCE(AVG(CASE WHEN status = 'completed' THEN 100 ELSE 0 END), 0) INTO v_avg_completion FROM lms_enrollments;

  RETURN jsonb_build_object(
    'total_courses', v_total_courses,
    'published_courses', v_published,
    'draft_courses', v_draft,
    'students', v_students,
    'instructors', v_instructors,
    'active_learners_last_14_days', v_active_learners,
    'overall_completion_rate_percent', round(v_avg_completion, 1)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_lms_overview() TO authenticated;
