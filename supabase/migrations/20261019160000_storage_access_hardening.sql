-- Tighten object-level access for LMS files and stop storing long-lived signed
-- URLs in database rows. Object names use {owner_id}/{lesson_or_assignment_id}/{file}.
BEGIN;

DO $$
DECLARE policy_row record;
BEGIN
  FOR policy_row IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        COALESCE(qual, '') ILIKE '%course-thumbnails%'
        OR COALESCE(with_check, '') ILIKE '%course-thumbnails%'
        OR COALESCE(qual, '') ILIKE '%lesson-resources%'
        OR COALESCE(with_check, '') ILIKE '%lesson-resources%'
        OR COALESCE(qual, '') ILIKE '%assignment-submissions%'
        OR COALESCE(with_check, '') ILIKE '%assignment-submissions%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_row.policyname);
  END LOOP;
END $$;

UPDATE storage.buckets SET file_size_limit = 5242880 WHERE id = 'course-thumbnails';
UPDATE storage.buckets SET file_size_limit = 26214400 WHERE id IN ('lesson-resources', 'assignment-submissions');

-- Public reads are intentional for course thumbnails; writes remain restricted.
CREATE POLICY inno_course_thumbnail_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY inno_course_thumbnail_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'course-thumbnails'
    AND (
      (split_part(name, '/', 1) = auth.uid()::text AND (is_instructor() OR is_lms_admin()))
      OR EXISTS (
        SELECT 1 FROM public.lms_courses AS course
        WHERE course.id::text = split_part(name, '/', 1)
          AND (is_course_instructor(course.id) OR is_lms_admin())
      )
    )
  );

CREATE POLICY inno_course_thumbnail_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'course-thumbnails'
    AND (
      (split_part(name, '/', 1) = auth.uid()::text AND (is_instructor() OR is_lms_admin()))
      OR EXISTS (
        SELECT 1 FROM public.lms_courses AS course
        WHERE course.id::text = split_part(name, '/', 1)
          AND (is_course_instructor(course.id) OR is_lms_admin())
      )
    )
  )
  WITH CHECK (
    bucket_id = 'course-thumbnails'
    AND (
      (split_part(name, '/', 1) = auth.uid()::text AND (is_instructor() OR is_lms_admin()))
      OR EXISTS (
        SELECT 1 FROM public.lms_courses AS course
        WHERE course.id::text = split_part(name, '/', 1)
          AND (is_course_instructor(course.id) OR is_lms_admin())
      )
    )
  );

-- Lesson resources: only course instructors/admins may upload; only learners
-- enrolled in that specific course, its instructor or admins may read them.
CREATE POLICY inno_lesson_resource_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lesson-resources'
    AND split_part(name, '/', 1) = auth.uid()::text
    AND EXISTS (
      SELECT 1
      FROM public.lessons AS lesson
      JOIN public.modules AS module ON module.id = lesson.module_id
      WHERE lesson.id::text = split_part(name, '/', 2)
        AND (is_course_instructor(module.course_id) OR is_lms_admin())
    )
  );

CREATE POLICY inno_lesson_resource_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'lesson-resources'
    AND EXISTS (
      SELECT 1
      FROM public.lessons AS lesson
      JOIN public.modules AS module ON module.id = lesson.module_id
      WHERE lesson.id::text = split_part(name, '/', 2)
        AND (
          is_course_instructor(module.course_id)
          OR is_lms_admin()
          OR EXISTS (
            SELECT 1 FROM public.lms_enrollments AS enrollment
            WHERE enrollment.course_id = module.course_id
              AND enrollment.student_id = auth.uid()
              AND enrollment.status IN ('active', 'completed')
          )
        )
    )
  );

-- Assignment files: only an enrolled learner can upload to their own folder;
-- only that learner, the assigned course instructor or an admin can read.
CREATE POLICY inno_submission_file_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'assignment-submissions'
    AND split_part(name, '/', 1) = auth.uid()::text
    AND EXISTS (
      SELECT 1
      FROM public.assignments AS assignment
      LEFT JOIN public.modules AS module ON module.id = assignment.module_id
      JOIN public.lms_enrollments AS enrollment
        ON enrollment.course_id = COALESCE(assignment.course_id, module.course_id)
       AND enrollment.student_id = auth.uid()
       AND enrollment.status IN ('active', 'completed')
      WHERE assignment.id::text = split_part(name, '/', 2)
    )
  );

CREATE POLICY inno_submission_file_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'assignment-submissions'
    AND (
      split_part(name, '/', 1) = auth.uid()::text
      OR is_lms_admin()
      OR EXISTS (
        SELECT 1
        FROM public.assignments AS assignment
        LEFT JOIN public.modules AS module ON module.id = assignment.module_id
        WHERE assignment.id::text = split_part(name, '/', 2)
          AND is_course_instructor(COALESCE(assignment.course_id, module.course_id))
      )
    )
  );

COMMIT;
