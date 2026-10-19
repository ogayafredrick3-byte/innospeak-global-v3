-- LMS RPC functions — certificates, completion, analytics, student progress

-- generate_certificate_number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE candidate text; attempt integer := 0;
BEGIN
  LOOP
    candidate := 'ISG-' || to_char(now(), 'YYYY') || '-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM certificates WHERE certificate_number = candidate);
    attempt := attempt + 1;
    IF attempt > 10 THEN
      candidate := 'ISG-' || to_char(now(), 'YYYY') || '-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 12));
      EXIT;
    END IF;
  END LOOP;
  RETURN candidate;
END;
$$;

-- check_and_record_completion
CREATE OR REPLACE FUNCTION check_and_record_completion(p_enrollment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_enrollment lms_enrollments%ROWTYPE;
  v_course lms_courses%ROWTYPE;
  v_student profiles%ROWTYPE;
  v_total_lessons integer; v_completed_lessons integer;
  v_total_quizzes integer; v_passed_quizzes integer;
  v_total_assignments integer; v_completed_assignments integer;
  v_instructor_name text;
  v_completion_id uuid; v_certificate_id uuid; v_certificate_number text;
  v_existing_completion uuid; v_existing_cert uuid;
BEGIN
  SELECT * INTO v_enrollment FROM lms_enrollments WHERE id = p_enrollment_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Enrollment not found'); END IF;

  SELECT * INTO v_course FROM lms_courses WHERE id = v_enrollment.course_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Course not found'); END IF;

  SELECT * INTO v_student FROM profiles WHERE id = v_enrollment.student_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Student not found'); END IF;

  SELECT id INTO v_existing_completion FROM course_completions WHERE enrollment_id = p_enrollment_id;
  IF v_existing_completion IS NOT NULL THEN
    SELECT id INTO v_existing_cert FROM certificates WHERE enrollment_id = p_enrollment_id AND status = 'active';
    RETURN jsonb_build_object('success', true, 'already_completed', true, 'certificate_id', v_existing_cert, 'completion_id', v_existing_completion);
  END IF;

  SELECT count(*) INTO v_total_lessons
  FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = v_enrollment.course_id AND l.status = 'published';

  SELECT count(*) INTO v_completed_lessons
  FROM lesson_progress p JOIN lessons l ON l.id = p.lesson_id JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = v_enrollment.course_id AND p.student_id = v_enrollment.student_id AND p.status = 'completed';

  SELECT count(*) INTO v_total_quizzes
  FROM quizzes q JOIN lessons l ON l.id = q.lesson_id JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = v_enrollment.course_id AND q.status = 'published';

  SELECT count(DISTINCT qa.quiz_id) INTO v_passed_quizzes
  FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id JOIN lessons l ON l.id = q.lesson_id JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = v_enrollment.course_id AND qa.student_id = v_enrollment.student_id AND qa.status = 'graded' AND qa.passed = true;

  v_total_assignments := 0; v_completed_assignments := 0;

  IF NOT (NOT v_course.requires_lesson_completion OR v_completed_lessons >= v_total_lessons) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Requirements not met', 'lessons_completed', v_completed_lessons, 'lessons_total', v_total_lessons);
  END IF;
  IF NOT (NOT v_course.requires_quiz_pass OR (v_total_quizzes = 0 OR v_passed_quizzes >= v_total_quizzes)) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Requirements not met', 'quizzes_passed', v_passed_quizzes, 'quizzes_total', v_total_quizzes);
  END IF;

  SELECT p.full_name INTO v_instructor_name
  FROM course_instructors ci JOIN profiles p ON p.id = ci.instructor_id
  WHERE ci.course_id = v_enrollment.course_id AND ci.role = 'primary' LIMIT 1;

  INSERT INTO course_completions (student_id, course_id, enrollment_id, lessons_total, lessons_completed, quizzes_total, quizzes_passed, assignments_total, assignments_completed)
  VALUES (v_enrollment.student_id, v_enrollment.course_id, p_enrollment_id, v_total_lessons, v_completed_lessons, v_total_quizzes, v_passed_quizzes, v_total_assignments, v_completed_assignments)
  RETURNING id INTO v_completion_id;

  UPDATE lms_enrollments SET status = 'completed', completed_at = now() WHERE id = p_enrollment_id;

  IF v_course.awards_certificate THEN
    SELECT id INTO v_existing_cert FROM certificates WHERE enrollment_id = p_enrollment_id AND status = 'active';
    IF v_existing_cert IS NULL THEN
      v_certificate_number := generate_certificate_number();
      INSERT INTO certificates (certificate_number, student_id, enrollment_id, course_id, student_name, course_title, instructor_name, issue_date, completion_date, status)
      VALUES (v_certificate_number, v_enrollment.student_id, p_enrollment_id, v_enrollment.course_id, v_student.full_name, v_course.title, v_instructor_name, now(), COALESCE(v_enrollment.completed_at, now()), 'active')
      RETURNING id INTO v_certificate_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'completed', true, 'completion_id', v_completion_id, 'certificate_id', v_certificate_id, 'certificate_number', v_certificate_number);
END;
$$;
GRANT EXECUTE ON FUNCTION check_and_record_completion(uuid) TO authenticated;

-- verify_certificate (public, no auth)
DROP FUNCTION IF EXISTS public.verify_certificate(text);
CREATE FUNCTION verify_certificate(input_number text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_cert certificates%ROWTYPE;
BEGIN
  SELECT * INTO v_cert FROM certificates WHERE certificate_number = input_number LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('valid', false, 'found', false); END IF;
  RETURN jsonb_build_object(
    'valid', (v_cert.status = 'active'), 'found', true,
    'certificate_number', v_cert.certificate_number,
    'student_name', v_cert.student_name, 'course_title', v_cert.course_title,
    'issuing_organization', 'InnoSpeak Global',
    'issue_date', v_cert.issue_date, 'completion_date', v_cert.completion_date,
    'status', v_cert.status, 'instructor_name', v_cert.instructor_name
  );
END;
$$;
GRANT EXECUTE ON FUNCTION verify_certificate(text) TO anon, authenticated;

-- revoke_certificate
CREATE OR REPLACE FUNCTION revoke_certificate(p_certificate_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_lms_admin() THEN RAISE EXCEPTION 'Only admins can revoke certificates.'; END IF;
  UPDATE certificates SET status = 'revoked', revoke_reason = p_reason, revoked_at = now(), updated_at = now() WHERE id = p_certificate_id;
END;
$$;
GRANT EXECUTE ON FUNCTION revoke_certificate(uuid, text) TO authenticated;

-- reactivate_certificate
CREATE OR REPLACE FUNCTION reactivate_certificate(p_certificate_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_lms_admin() THEN RAISE EXCEPTION 'Only admins can reactivate certificates.'; END IF;
  UPDATE certificates SET status = 'active', revoke_reason = null, revoked_at = null, updated_at = now() WHERE id = p_certificate_id;
END;
$$;
GRANT EXECUTE ON FUNCTION reactivate_certificate(uuid) TO authenticated;

-- get_course_analytics
DROP FUNCTION IF EXISTS public.get_course_analytics(uuid);
CREATE FUNCTION get_course_analytics(target_course_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE result json;
BEGIN
  SELECT json_build_object(
    'total_enrollments', count(DISTINCT e.student_id),
    'active_enrollments', count(DISTINCT e.student_id) FILTER (WHERE e.status = 'active'),
    'completed_enrollments', count(DISTINCT e.student_id) FILTER (WHERE e.status = 'completed'),
    'total_lessons', count(DISTINCT l.id),
    'total_quizzes', count(DISTINCT q.id)
  ) INTO result
  FROM lms_enrollments e
  LEFT JOIN modules m ON m.course_id = e.course_id
  LEFT JOIN lessons l ON l.module_id = m.id
  LEFT JOIN quizzes q ON q.lesson_id = l.id
  WHERE e.course_id = target_course_id;
  RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_course_analytics(uuid) TO authenticated;

-- get_lms_overview
DROP FUNCTION IF EXISTS public.get_lms_overview();
CREATE FUNCTION get_lms_overview()
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE result json;
BEGIN
  IF NOT is_lms_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
  SELECT json_build_object(
    'total_courses', count(DISTINCT c.id),
    'published_courses', count(DISTINCT c.id) FILTER (WHERE c.status = 'published'),
    'total_students', count(DISTINCT e.student_id),
    'total_enrollments', count(DISTINCT e.id)
  ) INTO result
  FROM lms_courses c
  LEFT JOIN lms_enrollments e ON e.course_id = c.id;
  RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_lms_overview() TO authenticated;