-- Student academic progress RPCs

CREATE OR REPLACE FUNCTION get_student_academic_summary(p_student_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE result json;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_student_id THEN RAISE EXCEPTION 'Access denied'; END IF;
  SELECT json_build_object(
    'courses_enrolled', count(DISTINCT e.course_id),
    'courses_in_progress', count(DISTINCT e.course_id) FILTER (WHERE e.status = 'active'),
    'courses_completed', count(DISTINCT e.course_id) FILTER (WHERE e.status = 'completed'),
    'lessons_completed', count(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'completed'),
    'lessons_total', count(DISTINCT l.id),
    'quizzes_completed', count(DISTINCT qa.id) FILTER (WHERE qa.status = 'graded'),
    'assignments_submitted', count(DISTINCT sub.id),
    'assignments_graded', count(DISTINCT sub.id) FILTER (WHERE sub.status = 'graded'),
    'overall_progress_percent', COALESCE(round(count(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'completed')::numeric / NULLIF(count(DISTINCT l.id), 0) * 100, 1), 0)
  ) INTO result
  FROM lms_enrollments e
  LEFT JOIN modules m ON m.course_id = e.course_id
  LEFT JOIN lessons l ON l.module_id = m.id
  LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = e.student_id
  LEFT JOIN quiz_attempts qa ON qa.student_id = e.student_id
  LEFT JOIN submissions sub ON sub.student_id = e.student_id
  WHERE e.student_id = p_student_id;
  RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_student_academic_summary(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION get_student_course_performance(p_student_id uuid)
RETURNS TABLE (
  course_id uuid, course_title text, progress_percent numeric,
  lessons_completed int, lessons_total int, quiz_average numeric,
  assignment_average numeric, performance_percent numeric,
  completion_status text, last_activity_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_student_id THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
  SELECT c.id, c.title,
    COALESCE(round(count(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'completed')::numeric / NULLIF(count(DISTINCT l.id), 0) * 100, 1), 0),
    count(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'completed')::int, count(DISTINCT l.id)::int,
    0::numeric, 0::numeric, 0::numeric, e.status, max(lp.updated_at)
  FROM lms_enrollments e
  JOIN lms_courses c ON c.id = e.course_id
  LEFT JOIN modules m ON m.course_id = c.id
  LEFT JOIN lessons l ON l.module_id = m.id
  LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = e.student_id
  WHERE e.student_id = p_student_id
  GROUP BY c.id, c.title, e.status;
END;
$$;
GRANT EXECUTE ON FUNCTION get_student_course_performance(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION get_student_recent_activity(p_student_id uuid, p_limit int DEFAULT 20)
RETURNS TABLE (activity_type text, activity_id uuid, course_title text, lesson_title text, created_at timestamptz, details json)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_student_id THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
  SELECT 'lesson_completed'::text, lp.lesson_id, c.title, l.title, lp.completed_at, json_build_object('status', lp.status)
  FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id JOIN modules m ON m.id = l.module_id JOIN lms_courses c ON c.id = m.course_id
  WHERE lp.student_id = p_student_id AND lp.status = 'completed'
  ORDER BY lp.completed_at DESC LIMIT p_limit;
END;
$$;
GRANT EXECUTE ON FUNCTION get_student_recent_activity(uuid, int) TO authenticated;

CREATE OR REPLACE FUNCTION get_student_course_detail(p_student_id uuid, p_course_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE result json;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_student_id THEN RAISE EXCEPTION 'Access denied'; END IF;
  SELECT json_build_object('course_id', c.id, 'course_title', c.title, 'progress', 0)
  INTO result FROM lms_courses c WHERE c.id = p_course_id;
  RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_student_course_detail(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION get_student_assessment_performance(p_student_id uuid)
RETURNS TABLE (
  assessment_type text, assessment_id uuid, assessment_title text,
  course_id uuid, course_title text, score numeric, max_score numeric,
  passing_status text, attempts int, grading_status text, feedback text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_student_id THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
  SELECT 'quiz'::text, q.id, q.title, c.id, c.title, max(qa.score_percent), 100::numeric,
    CASE WHEN max(qa.score_percent) >= q.passing_score_percent THEN 'passed' WHEN max(qa.score_percent) IS NOT NULL THEN 'failed' ELSE NULL END,
    count(qa.id)::int, CASE WHEN max(qa.status) = 'graded' THEN 'graded' WHEN max(qa.status) = 'in_progress' THEN 'in_progress' ELSE 'not_attempted' END, NULL::text
  FROM quizzes q JOIN lessons l ON l.id = q.lesson_id JOIN modules m ON m.id = l.module_id JOIN lms_courses c ON c.id = m.course_id
  LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = p_student_id
  GROUP BY q.id, q.title, q.passing_score_percent, c.id, c.title
  UNION ALL
  SELECT 'assignment'::text, a.id, a.title, c.id, c.title, max(sub.score), max(a.max_score), NULL::text, 0::int,
    CASE WHEN max(sub.status) = 'graded' THEN 'graded' WHEN max(sub.status) = 'submitted' THEN 'submitted' WHEN max(sub.status) = 'resubmission_required' THEN 'resubmission_required' ELSE 'not_submitted' END, max(sub.feedback)
  FROM assignments a JOIN lms_courses c ON c.id = a.course_id
  LEFT JOIN submissions sub ON sub.assignment_id = a.id AND sub.student_id = p_student_id
  GROUP BY a.id, a.title, a.max_score, c.id, c.title
  ORDER BY assessment_type, assessment_title;
END;
$$;
GRANT EXECUTE ON FUNCTION get_student_assessment_performance(uuid) TO authenticated;