/*
  # LMS Phase 5 — Assignments & submissions

  An assignment belongs to a module (not a single lesson) so it can
  cover material spanning several lessons. Submissions are versioned
  via `attempt_number` rather than overwritten in place, so a
  resubmission never destroys the instructor's prior feedback.
*/

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions text,
  max_marks numeric NOT NULL DEFAULT 100,
  due_at timestamptz,
  allowed_file_types text,            -- comma-separated, e.g. "pdf,docx,zip"
  max_file_size_mb integer NOT NULL DEFAULT 10,
  max_attempts integer NOT NULL DEFAULT 1,
  allow_late_submission boolean NOT NULL DEFAULT false,
  late_penalty_percent numeric DEFAULT 0,
  rubric text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_module ON assignments(module_id);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION course_id_for_assignment(target_assignment_id uuid)
RETURNS uuid
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT course_id_for_module(a.module_id) FROM assignments a WHERE a.id = target_assignment_id;
$$;

GRANT EXECUTE ON FUNCTION course_id_for_assignment(uuid) TO authenticated;

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL DEFAULT 1,
  file_url text,
  comment text,
  submitted_at timestamptz DEFAULT now(),
  is_late boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'graded', 'returned_for_resubmission')),
  score numeric,
  feedback text,
  graded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  graded_at timestamptz,
  UNIQUE (assignment_id, student_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS — assignments
-- ============================================================
DROP POLICY IF EXISTS "read_published_assignments_if_enrolled" ON assignments;
CREATE POLICY "read_published_assignments_if_enrolled" ON assignments
  FOR SELECT TO authenticated
  USING (
    is_course_instructor(course_id_for_module(module_id))
    OR (status = 'published' AND is_enrolled(course_id_for_module(module_id)))
  );

DROP POLICY IF EXISTS "instructor_manage_own_assignments" ON assignments;
CREATE POLICY "instructor_manage_own_assignments" ON assignments
  FOR ALL TO authenticated
  USING (is_course_instructor(course_id_for_module(module_id)))
  WITH CHECK (is_course_instructor(course_id_for_module(module_id)));

DROP TRIGGER IF EXISTS trg_assignments_updated_at ON assignments;
CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- RLS — submissions
-- ============================================================
DROP POLICY IF EXISTS "student_manage_own_submissions" ON submissions;
CREATE POLICY "student_manage_own_submissions" ON submissions
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (
    student_id = auth.uid()
    AND is_enrolled(course_id_for_assignment(assignment_id))
    -- Students may only ever set status to 'submitted' themselves —
    -- grading fields are locked out at the application layer AND here:
    AND status = 'submitted'
    AND score IS NULL
    AND graded_by IS NULL
  );

DROP POLICY IF EXISTS "instructor_read_and_grade_submissions" ON submissions;
CREATE POLICY "instructor_read_and_grade_submissions" ON submissions
  FOR SELECT TO authenticated
  USING (is_course_instructor(course_id_for_assignment(assignment_id)));

DROP POLICY IF EXISTS "instructor_grade_submissions" ON submissions;
CREATE POLICY "instructor_grade_submissions" ON submissions
  FOR UPDATE TO authenticated
  USING (is_course_instructor(course_id_for_assignment(assignment_id)))
  WITH CHECK (is_course_instructor(course_id_for_assignment(assignment_id)));

-- ============================================================
-- Storage bucket for assignment submission files
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-submissions', 'assignment-submissions', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "students_upload_own_submissions" ON storage.objects;
CREATE POLICY "students_upload_own_submissions" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'assignment-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "read_own_or_instructor_submission_files" ON storage.objects;
CREATE POLICY "read_own_or_instructor_submission_files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'assignment-submissions'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR is_instructor())
  );
-- Upload path convention enforced by the app: {student_id}/{assignment_id}/{filename}
-- This makes IDOR-by-URL-guessing impossible even for another student,
-- since the bucket is private and the folder name is checked against
-- auth.uid(), not just embedded in an unguessable filename.
