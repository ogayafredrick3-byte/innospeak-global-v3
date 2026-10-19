-- LMS flow hardening: one trusted path for self-enrolment and lesson progress.
-- Additive and data-preserving. This migration never drops tables or rows.
BEGIN;

-- Enrolment status is a server-owned state machine. Learners may read their own
-- rows, but cannot mark themselves completed, change status, or delete a row.
DO $$
DECLARE policy_row record;
BEGIN
  FOR policy_row IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lms_enrollments'
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.lms_enrollments', policy_row.policyname);
  END LOOP;
END $$;

CREATE POLICY lms_admin_update_enrollments ON public.lms_enrollments
  FOR UPDATE TO authenticated
  USING (public.is_lms_admin())
  WITH CHECK (public.is_lms_admin());

CREATE POLICY lms_admin_delete_enrollments ON public.lms_enrollments
  FOR DELETE TO authenticated
  USING (public.is_lms_admin());

REVOKE INSERT ON TABLE public.lms_enrollments FROM anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.lms_enrollments TO authenticated;

-- Idempotent free-course enrolment. The server resolves the canonical course,
-- checks its published/free state, and safely reactivates a dropped enrolment.
CREATE OR REPLACE FUNCTION public.enroll_in_free_course(
  p_course_id uuid DEFAULT NULL,
  p_course_code text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_course public.lms_courses%ROWTYPE;
  v_enrollment public.lms_enrollments%ROWTYPE;
  v_code text := upper(trim(COALESCE(p_course_code, '')));
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_course_id IS NULL AND v_code = '' THEN
    RAISE EXCEPTION 'A course ID or course code is required';
  END IF;

  SELECT * INTO v_course
  FROM public.lms_courses
  WHERE status = 'published'
    AND (
      (p_course_id IS NOT NULL AND id = p_course_id)
      OR (p_course_id IS NULL AND code = v_code)
    )
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Published course not found';
  END IF;
  IF p_course_id IS NOT NULL AND v_code <> '' AND upper(COALESCE(v_course.code, '')) <> v_code THEN
    RAISE EXCEPTION 'Course ID and course code do not match';
  END IF;
  IF v_course.is_free IS DISTINCT FROM true OR COALESCE(v_course.price_amount, 0) > 0 THEN
    RAISE EXCEPTION 'This course requires verified checkout before enrolment';
  END IF;

  INSERT INTO public.lms_enrollments AS existing_enrollment (course_id, student_id, status, enrolled_at, completed_at)
  VALUES (v_course.id, v_user_id, 'active', now(), NULL)
  ON CONFLICT (course_id, student_id) DO UPDATE
    SET status = 'active', enrolled_at = now(), completed_at = NULL
    WHERE existing_enrollment.status = 'dropped'
  RETURNING * INTO v_enrollment;

  IF NOT FOUND THEN
    SELECT * INTO v_enrollment
    FROM public.lms_enrollments
    WHERE course_id = v_course.id AND student_id = v_user_id;
  END IF;

  RETURN to_jsonb(v_enrollment);
END;
$$;

REVOKE ALL ON FUNCTION public.enroll_in_free_course(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enroll_in_free_course(uuid, text) TO authenticated;

-- Progress writes are only allowed for the authenticated learner's own active
-- enrolment and published lesson in that same course. The client cannot forge
-- student IDs or write progress directly to the table.
DO $$
DECLARE policy_row record;
BEGIN
  FOR policy_row IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_progress'
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.lesson_progress', policy_row.policyname);
  END LOOP;
END $$;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.lesson_progress FROM anon, authenticated;
GRANT SELECT ON TABLE public.lesson_progress TO authenticated;

CREATE OR REPLACE FUNCTION public.start_lesson_progress_secure(p_lesson_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_course_id uuid;
  v_lesson_status text;
  v_progress public.lesson_progress%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT lesson.status, module.course_id
    INTO v_lesson_status, v_course_id
  FROM public.lessons AS lesson
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE lesson.id = p_lesson_id;
  IF NOT FOUND OR v_lesson_status <> 'published' THEN
    RAISE EXCEPTION 'Published lesson not found';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.lms_enrollments AS enrollment
    WHERE enrollment.course_id = v_course_id
      AND enrollment.student_id = v_user_id
      AND enrollment.status = 'active'
  ) THEN
    RAISE EXCEPTION 'An active course enrolment is required to track progress';
  END IF;

  INSERT INTO public.lesson_progress AS existing_progress (lesson_id, student_id, status, started_at, updated_at)
  VALUES (p_lesson_id, v_user_id, 'in_progress', now(), now())
  ON CONFLICT (lesson_id, student_id) DO UPDATE
    SET status = CASE WHEN existing_progress.status = 'completed' THEN 'completed' ELSE 'in_progress' END,
        started_at = COALESCE(existing_progress.started_at, now()),
        updated_at = now()
  RETURNING * INTO v_progress;

  RETURN to_jsonb(v_progress);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_lesson_progress_secure(p_lesson_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_course_id uuid;
  v_lesson_status text;
  v_progress public.lesson_progress%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT lesson.status, module.course_id
    INTO v_lesson_status, v_course_id
  FROM public.lessons AS lesson
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE lesson.id = p_lesson_id;
  IF NOT FOUND OR v_lesson_status <> 'published' THEN
    RAISE EXCEPTION 'Published lesson not found';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.lms_enrollments AS enrollment
    WHERE enrollment.course_id = v_course_id
      AND enrollment.student_id = v_user_id
      AND enrollment.status = 'active'
  ) THEN
    RAISE EXCEPTION 'An active course enrolment is required to complete a lesson';
  END IF;

  INSERT INTO public.lesson_progress AS existing_progress (lesson_id, student_id, status, started_at, completed_at, updated_at)
  VALUES (p_lesson_id, v_user_id, 'completed', now(), now(), now())
  ON CONFLICT (lesson_id, student_id) DO UPDATE
    SET status = 'completed',
        started_at = COALESCE(existing_progress.started_at, now()),
        completed_at = COALESCE(existing_progress.completed_at, now()),
        updated_at = now()
  RETURNING * INTO v_progress;

  RETURN to_jsonb(v_progress);
END;
$$;

REVOKE ALL ON FUNCTION public.start_lesson_progress_secure(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.complete_lesson_progress_secure(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_lesson_progress_secure(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_lesson_progress_secure(uuid) TO authenticated;

COMMIT;
