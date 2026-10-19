-- ============================================================
-- Assignment & Submission System + missing LMS tables
-- ============================================================

-- Add missing columns to lessons table
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS external_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS learning_objectives jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  ADD COLUMN IF NOT EXISTS practical_activity text DEFAULT '';

-- --------------------------------------------------------
-- lms_enrollments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS lms_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_id)
);

ALTER TABLE lms_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_enrollments" ON lms_enrollments
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM lms_courses WHERE id = lms_enrollments.course_id AND (
      created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = lms_enrollments.course_id AND instructor_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    ))
  );

CREATE POLICY "insert_enrollments" ON lms_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "update_enrollments" ON lms_enrollments
  FOR UPDATE TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "delete_enrollments" ON lms_enrollments
  FOR DELETE TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- --------------------------------------------------------
-- lesson_progress
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, student_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_lesson_progress" ON lesson_progress
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN lms_courses c ON c.id = m.course_id
      WHERE l.id = lesson_progress.lesson_id
      AND (c.created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = c.id AND instructor_id = auth.uid()))
    )
  );

CREATE POLICY "insert_lesson_progress" ON lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "update_lesson_progress" ON lesson_progress
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "delete_lesson_progress" ON lesson_progress
  FOR DELETE TO authenticated
  USING (student_id = auth.uid());

-- --------------------------------------------------------
-- lesson_resources
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  resource_type text NOT NULL DEFAULT 'downloadable',
  external_url text DEFAULT '',
  file_url text DEFAULT '',
  file_type text DEFAULT '',
  description text DEFAULT '',
  is_downloadable boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_lesson_resources" ON lesson_resources
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN lms_courses c ON c.id = m.course_id
      WHERE l.id = lesson_resources.lesson_id
      AND (
        c.created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = c.id AND instructor_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        OR EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = c.id AND student_id = auth.uid() AND status = 'active')
      )
    )
  );

CREATE POLICY "insert_lesson_resources" ON lesson_resources
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN lms_courses c ON c.id = m.course_id
      WHERE l.id = lesson_resources.lesson_id
      AND (c.created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = c.id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "update_lesson_resources" ON lesson_resources
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN lms_courses c ON c.id = m.course_id
      WHERE l.id = lesson_resources.lesson_id
      AND (c.created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = c.id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "delete_lesson_resources" ON lesson_resources
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN lms_courses c ON c.id = m.course_id
      WHERE l.id = lesson_resources.lesson_id
      AND (c.created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = c.id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- Storage bucket for lesson resources
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-resources', 'lesson-resources', false) ON CONFLICT DO NOTHING;

CREATE POLICY "upload_lesson_resources" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson-resources');

CREATE POLICY "read_lesson_resources" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'lesson-resources');

-- --------------------------------------------------------
-- assignments — attached to lessons
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  instructions text DEFAULT '',
  description text DEFAULT '',
  learning_objectives jsonb DEFAULT '[]'::jsonb,
  due_date timestamptz,
  max_score integer NOT NULL DEFAULT 100,
  submission_type text NOT NULL DEFAULT 'text' CHECK (submission_type IN ('text', 'file', 'text_file')),
  allowed_file_types text DEFAULT '',
  max_file_size_mb integer DEFAULT 10,
  allow_multiple_submissions boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_assignments" ON assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lms_courses WHERE id = assignments.course_id AND (
      created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = assignments.course_id AND instructor_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    ))
    OR EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = assignments.course_id AND student_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "insert_assignments" ON assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM lms_courses WHERE id = assignments.course_id AND (
      created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = assignments.course_id AND instructor_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    ))
  );

CREATE POLICY "update_assignments" ON assignments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lms_courses WHERE id = assignments.course_id AND (
      created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = assignments.course_id AND instructor_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    ))
  );

CREATE POLICY "delete_assignments" ON assignments
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lms_courses WHERE id = assignments.course_id AND (
      created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = assignments.course_id AND instructor_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    ))
  );

-- --------------------------------------------------------
-- submissions — student work
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES lms_enrollments(id) ON DELETE SET NULL,
  attempt_number integer NOT NULL DEFAULT 1,
  text_response text DEFAULT '',
  file_url text DEFAULT '',
  file_name text DEFAULT '',
  is_late boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmission_required')),
  score integer,
  feedback text DEFAULT '',
  graded_by uuid REFERENCES auth.users(id),
  graded_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id, attempt_number)
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_submissions" ON submissions
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM assignments a
      JOIN lms_courses c ON c.id = a.course_id
      WHERE a.id = submissions.assignment_id
      AND (
        c.created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = a.course_id AND instructor_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "insert_submissions" ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM assignments a
      JOIN lms_enrollments e ON e.course_id = a.course_id
      WHERE a.id = submissions.assignment_id
      AND e.student_id = auth.uid()
      AND e.status = 'active'
    )
  );

CREATE POLICY "update_submissions" ON submissions
  FOR UPDATE TO authenticated
  USING (
    (student_id = auth.uid() AND status = 'submitted')
    OR EXISTS (
      SELECT 1 FROM assignments a
      JOIN lms_courses c ON c.id = a.course_id
      WHERE a.id = submissions.assignment_id
      AND (
        c.created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = a.course_id AND instructor_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "delete_submissions" ON submissions
  FOR DELETE TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM assignments a
      JOIN lms_courses c ON c.id = a.course_id
      WHERE a.id = submissions.assignment_id
      AND (
        c.created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = a.course_id AND instructor_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Storage bucket for assignment submissions (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('assignment-submissions', 'assignment-submissions', false) ON CONFLICT DO NOTHING;

CREATE POLICY "upload_submission_files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assignment-submissions');

CREATE POLICY "read_submission_files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'assignment-submissions');

-- --------------------------------------------------------
-- Triggers
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS trg_assignments_updated ON assignments;
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_lesson_progress_updated ON lesson_progress;
CREATE TRIGGER trg_lesson_progress_updated BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- --------------------------------------------------------
-- SECURITY DEFINER functions
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION grade_submission(
  p_submission_id uuid,
  p_score integer,
  p_feedback text DEFAULT '',
  p_status text DEFAULT 'graded'
)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM submissions s
    JOIN assignments a ON a.id = s.assignment_id
    JOIN lms_courses c ON c.id = a.course_id
    WHERE s.id = p_submission_id
    AND (
      c.created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = a.course_id AND instructor_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  ) THEN
    RAISE EXCEPTION 'You can only grade submissions for your own courses.';
  END IF;

  UPDATE submissions
  SET score = p_score, feedback = p_feedback, status = p_status,
      graded_by = auth.uid(), graded_at = now()
  WHERE id = p_submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION request_resubmission(
  p_submission_id uuid,
  p_feedback text DEFAULT ''
)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM submissions s
    JOIN assignments a ON a.id = s.assignment_id
    JOIN lms_courses c ON c.id = a.course_id
    WHERE s.id = p_submission_id
    AND (
      c.created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = a.course_id AND instructor_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  ) THEN
    RAISE EXCEPTION 'You can only manage submissions for your own courses.';
  END IF;

  UPDATE submissions
  SET status = 'resubmission_required', feedback = p_feedback,
      graded_by = auth.uid(), graded_at = now()
  WHERE id = p_submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_student_assignment_status(
  p_assignment_id uuid,
  p_student_id uuid
)
RETURNS TABLE (
  id uuid,
  attempt_number integer,
  status text,
  score integer,
  feedback text,
  is_late boolean,
  submitted_at timestamptz,
  graded_at timestamptz,
  text_response text,
  file_url text,
  file_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.attempt_number, s.status, s.score, s.feedback,
         s.is_late, s.submitted_at, s.graded_at,
         s.text_response, s.file_url, s.file_name
  FROM submissions s
  WHERE s.assignment_id = p_assignment_id
    AND s.student_id = p_student_id
  ORDER BY s.attempt_number DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get course progress
DROP FUNCTION IF EXISTS public.get_course_progress(uuid, uuid);
CREATE FUNCTION get_course_progress(
  target_course_id uuid,
  target_student_id uuid
)
RETURNS TABLE (
  percent integer,
  completed_lessons integer,
  total_lessons integer
) AS $$
DECLARE
  total_count integer;
  completed_count integer;
BEGIN
  SELECT count(*) INTO total_count
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = target_course_id AND l.status = 'published';

  SELECT count(*) INTO completed_count
  FROM lesson_progress lp
  JOIN lessons l ON l.id = lp.lesson_id
  JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = target_course_id
    AND lp.student_id = target_student_id
    AND lp.status = 'completed';

  percent := CASE WHEN total_count > 0 THEN round((completed_count::numeric / total_count) * 100) ELSE 0 END;
  completed_lessons := completed_count;
  total_lessons := total_count;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
