-- Reconcile historical RPC return-type drift and harden SECURITY DEFINER
-- entry points. Older migrations declared these same signatures with
-- incompatible return types; this additive migration establishes one current
-- contract for the deployed database as well as fresh installations.
BEGIN;

-- Internal progress calculator. Browser clients use get_course_progress_secure;
-- this function remains available only to its owner and trusted definer RPCs.
DROP FUNCTION IF EXISTS public.get_course_progress(uuid, uuid);
CREATE FUNCTION public.get_course_progress(target_course_id uuid, target_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_total_lessons integer;
  v_completed_lessons integer;
  v_last_lesson_id uuid;
BEGIN
  SELECT count(*) INTO v_total_lessons
  FROM public.lessons AS lesson
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE module.course_id = target_course_id AND lesson.status = 'published';

  SELECT count(DISTINCT lesson.id) INTO v_completed_lessons
  FROM public.lesson_progress AS progress
  JOIN public.lessons AS lesson ON lesson.id = progress.lesson_id
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE module.course_id = target_course_id
    AND lesson.status = 'published'
    AND progress.student_id = target_student_id
    AND progress.status = 'completed';

  SELECT lesson.id INTO v_last_lesson_id
  FROM public.lesson_progress AS progress
  JOIN public.lessons AS lesson ON lesson.id = progress.lesson_id
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE module.course_id = target_course_id
    AND lesson.status = 'published'
    AND progress.student_id = target_student_id
  ORDER BY progress.updated_at DESC NULLS LAST
  LIMIT 1;

  RETURN jsonb_build_object(
    'total_lessons', v_total_lessons,
    'completed_lessons', v_completed_lessons,
    'last_lesson_id', v_last_lesson_id,
    'percent', CASE WHEN v_total_lessons = 0 THEN 0 ELSE round(v_completed_lessons::numeric / v_total_lessons * 100, 1) END
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_course_progress(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Completion may be requested by the learner for their own enrolment, or by
-- an assigned instructor/admin. A caller cannot complete someone else's course.
CREATE OR REPLACE FUNCTION public.check_and_record_completion(p_enrollment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrollment public.lms_enrollments%ROWTYPE;
  v_course public.lms_courses%ROWTYPE;
  v_student public.profiles%ROWTYPE;
  v_total_lessons integer;
  v_completed_lessons integer;
  v_total_quizzes integer;
  v_passed_quizzes integer;
  v_total_assignments integer := 0;
  v_completed_assignments integer := 0;
  v_instructor_name text;
  v_completion_id uuid;
  v_certificate_id uuid;
  v_certificate_number text;
  v_existing_completion uuid;
  v_existing_cert uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;

  SELECT * INTO v_enrollment FROM public.lms_enrollments WHERE id = p_enrollment_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Enrollment not found'); END IF;
  IF v_enrollment.student_id <> auth.uid()
     AND NOT is_course_instructor(v_enrollment.course_id)
     AND NOT is_lms_admin() THEN
    RAISE EXCEPTION 'Not authorized to complete this enrolment';
  END IF;

  SELECT * INTO v_course FROM public.lms_courses WHERE id = v_enrollment.course_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Course not found'); END IF;
  SELECT * INTO v_student FROM public.profiles WHERE id = v_enrollment.student_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Student not found'); END IF;

  SELECT id INTO v_existing_completion FROM public.course_completions WHERE enrollment_id = p_enrollment_id;
  IF v_existing_completion IS NOT NULL THEN
    SELECT id INTO v_existing_cert FROM public.certificates WHERE enrollment_id = p_enrollment_id AND status = 'active';
    RETURN jsonb_build_object('success', true, 'already_completed', true, 'certificate_id', v_existing_cert, 'completion_id', v_existing_completion);
  END IF;

  SELECT count(*) INTO v_total_lessons
  FROM public.lessons AS lesson JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE module.course_id = v_enrollment.course_id AND lesson.status = 'published';

  SELECT count(DISTINCT lesson.id) INTO v_completed_lessons
  FROM public.lesson_progress AS progress
  JOIN public.lessons AS lesson ON lesson.id = progress.lesson_id
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE module.course_id = v_enrollment.course_id
    AND lesson.status = 'published'
    AND progress.student_id = v_enrollment.student_id
    AND progress.status = 'completed';

  SELECT count(*) INTO v_total_quizzes
  FROM public.quizzes AS quiz
  JOIN public.lessons AS lesson ON lesson.id = quiz.lesson_id
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE module.course_id = v_enrollment.course_id AND quiz.status = 'published';

  SELECT count(DISTINCT attempt.quiz_id) INTO v_passed_quizzes
  FROM public.quiz_attempts AS attempt
  JOIN public.quizzes AS quiz ON quiz.id = attempt.quiz_id
  JOIN public.lessons AS lesson ON lesson.id = quiz.lesson_id
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE module.course_id = v_enrollment.course_id
    AND attempt.student_id = v_enrollment.student_id
    AND attempt.status = 'graded'
    AND attempt.passed = true;

  IF v_course.requires_lesson_completion AND v_completed_lessons < v_total_lessons THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Requirements not met', 'lessons_completed', v_completed_lessons, 'lessons_total', v_total_lessons);
  END IF;
  IF v_course.requires_quiz_pass AND v_total_quizzes > 0 AND v_passed_quizzes < v_total_quizzes THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Requirements not met', 'quizzes_passed', v_passed_quizzes, 'quizzes_total', v_total_quizzes);
  END IF;

  SELECT profile.full_name INTO v_instructor_name
  FROM public.course_instructors AS instructor
  JOIN public.profiles AS profile ON profile.id = instructor.instructor_id
  WHERE instructor.course_id = v_enrollment.course_id AND instructor.role = 'primary'
  LIMIT 1;

  INSERT INTO public.course_completions
    (student_id, course_id, enrollment_id, lessons_total, lessons_completed, quizzes_total, quizzes_passed, assignments_total, assignments_completed)
  VALUES
    (v_enrollment.student_id, v_enrollment.course_id, p_enrollment_id, v_total_lessons, v_completed_lessons, v_total_quizzes, v_passed_quizzes, v_total_assignments, v_completed_assignments)
  RETURNING id INTO v_completion_id;

  UPDATE public.lms_enrollments SET status = 'completed', completed_at = now() WHERE id = p_enrollment_id;

  IF v_course.awards_certificate THEN
    SELECT id INTO v_existing_cert FROM public.certificates WHERE enrollment_id = p_enrollment_id AND status = 'active';
    IF v_existing_cert IS NULL THEN
      v_certificate_number := public.generate_certificate_number();
      INSERT INTO public.certificates
        (certificate_number, student_id, enrollment_id, course_id, student_name, course_title, instructor_name, issue_date, completion_date, status)
      VALUES
        (v_certificate_number, v_enrollment.student_id, p_enrollment_id, v_enrollment.course_id, v_student.full_name, v_course.title, v_instructor_name, now(), COALESCE(v_enrollment.completed_at, now()), 'active')
      RETURNING id INTO v_certificate_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'completed', true, 'completion_id', v_completion_id, 'certificate_id', v_certificate_id, 'certificate_number', v_certificate_number);
END;
$$;
REVOKE ALL ON FUNCTION public.check_and_record_completion(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_and_record_completion(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.generate_certificate_number() FROM PUBLIC, anon, authenticated;

-- Normalize certificate verification to one JSONB response contract.
DROP FUNCTION IF EXISTS public.verify_certificate(text);
CREATE FUNCTION public.verify_certificate(input_number text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_cert public.certificates%ROWTYPE;
BEGIN
  SELECT * INTO v_cert FROM public.certificates WHERE certificate_number = trim(input_number) LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('valid', false, 'found', false); END IF;
  RETURN jsonb_build_object(
    'valid', v_cert.status = 'active',
    'found', true,
    'certificate_number', v_cert.certificate_number,
    'student_name', v_cert.student_name,
    'course_title', v_cert.course_title,
    'issuing_organization', 'InnoSpeak Global',
    'issue_date', v_cert.issue_date,
    'completion_date', v_cert.completion_date,
    'status', v_cert.status,
    'instructor_name', v_cert.instructor_name
  );
END;
$$;
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- Course analytics are instructor/admin-only even though the result is aggregate.
DROP FUNCTION IF EXISTS public.get_course_analytics(uuid);
CREATE FUNCTION public.get_course_analytics(target_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_lms_admin() AND NOT is_course_instructor(target_course_id) THEN
    RAISE EXCEPTION 'Not authorized to view course analytics';
  END IF;
  RETURN (
    SELECT jsonb_build_object(
      'total_enrollments', count(DISTINCT enrollment.student_id),
      'active_enrollments', count(DISTINCT enrollment.student_id) FILTER (WHERE enrollment.status = 'active'),
      'completed_enrollments', count(DISTINCT enrollment.student_id) FILTER (WHERE enrollment.status = 'completed'),
      'total_lessons', count(DISTINCT lesson.id),
      'total_quizzes', count(DISTINCT quiz.id)
    )
    FROM public.lms_enrollments AS enrollment
    LEFT JOIN public.modules AS module ON module.course_id = enrollment.course_id
    LEFT JOIN public.lessons AS lesson ON lesson.module_id = module.id AND lesson.status = 'published'
    LEFT JOIN public.quizzes AS quiz ON quiz.lesson_id = lesson.id AND quiz.status = 'published'
    WHERE enrollment.course_id = target_course_id
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_course_analytics(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_course_analytics(uuid) TO authenticated;

DROP FUNCTION IF EXISTS public.get_lms_overview();
CREATE FUNCTION public.get_lms_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_lms_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
  RETURN (
    SELECT jsonb_build_object(
      'total_courses', count(DISTINCT course.id),
      'published_courses', count(DISTINCT course.id) FILTER (WHERE course.status = 'published'),
      'total_students', count(DISTINCT enrollment.student_id),
      'total_enrollments', count(DISTINCT enrollment.id)
    )
    FROM public.lms_courses AS course
    LEFT JOIN public.lms_enrollments AS enrollment ON enrollment.course_id = course.id
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_lms_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_lms_overview() TO authenticated;

COMMIT;
