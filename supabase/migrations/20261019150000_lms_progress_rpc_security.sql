-- Keep learner-facing progress reads private. The historical get_course_progress
-- RPC accepted an arbitrary student UUID and is SECURITY DEFINER. Internal
-- instructor analytics and completion triggers may continue to call it as the
-- function owner; browser clients must use the guarded function below.
BEGIN;

CREATE OR REPLACE FUNCTION public.get_course_progress_secure(
  target_course_id uuid,
  target_student_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  total_lessons integer;
  completed_lessons integer;
  last_lesson_id uuid;
  pct numeric;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF target_student_id IS NULL OR target_course_id IS NULL THEN
    RAISE EXCEPTION 'Course and learner are required';
  END IF;

  IF target_student_id <> auth.uid()
     AND NOT is_course_instructor(target_course_id)
     AND NOT is_lms_admin() THEN
    RAISE EXCEPTION 'Not authorized to view this learner progress';
  END IF;

  SELECT count(*) INTO total_lessons
  FROM public.lessons AS lesson
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE module.course_id = target_course_id
    AND lesson.status = 'published';

  SELECT count(DISTINCT lesson.id) INTO completed_lessons
  FROM public.lesson_progress AS progress
  JOIN public.lessons AS lesson ON lesson.id = progress.lesson_id
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE module.course_id = target_course_id
    AND lesson.status = 'published'
    AND progress.student_id = target_student_id
    AND progress.status = 'completed';

  SELECT lesson.id INTO last_lesson_id
  FROM public.lesson_progress AS progress
  JOIN public.lessons AS lesson ON lesson.id = progress.lesson_id
  JOIN public.modules AS module ON module.id = lesson.module_id
  WHERE module.course_id = target_course_id
    AND lesson.status = 'published'
    AND progress.student_id = target_student_id
  ORDER BY progress.updated_at DESC NULLS LAST
  LIMIT 1;

  pct := CASE WHEN total_lessons > 0
    THEN round((completed_lessons::numeric / total_lessons) * 100, 1)
    ELSE 0 END;

  RETURN jsonb_build_object(
    'total_lessons', total_lessons,
    'completed_lessons', completed_lessons,
    'percent', pct,
    'last_lesson_id', last_lesson_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_course_progress_secure(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_course_progress_secure(uuid, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_course_progress(uuid, uuid) FROM PUBLIC, anon, authenticated;

COMMIT;
