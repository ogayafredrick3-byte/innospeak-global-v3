/*
  # LMS Phase 3 — Course builder: modules, lessons, resources, progress

  Adds the teachable content hierarchy (Course → Module → Lesson →
  Resource) and the `lesson_progress` table that everything else in the
  system (dashboards, completion %, "continue learning") reads from —
  this is deliberately the ONE authoritative source for "has this
  student finished this lesson", per Section 30 (data consistency).

  Ordering: `modules.position` and `lessons.position` are plain integers
  the frontend rewrites on drag-and-drop reorder (simplest correct
  approach — no gaps-based fractional ordering needed at this scale).
*/

-- ============================================================
-- 1. modules
-- ============================================================
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id, position);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. lessons
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,                    -- rich text (HTML/markdown from editor)
  content_type text NOT NULL DEFAULT 'text'
    CHECK (content_type IN ('text', 'video', 'pdf', 'audio', 'presentation', 'link')),
  video_url text,
  external_url text,
  position integer NOT NULL DEFAULT 0,
  requires_explicit_completion boolean NOT NULL DEFAULT true,
  -- ^ Section 8 rule: a lesson is only "complete" because the student
  -- opened it if the course explicitly allows that. Default is false
  -- (explicit Mark Complete required); an instructor can flip this per
  -- lesson if simply viewing should count (e.g. a short announcement).
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, position);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. lesson_resources (downloadable files / attachments)
-- ============================================================
CREATE TABLE IF NOT EXISTS lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size_bytes bigint,
  is_downloadable boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);

ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. lesson_progress — THE authoritative completion source
-- ============================================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  video_position_seconds integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (lesson_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. Helper: course_id lookup from a module or lesson row, for RLS
--    policies below that need to check course-level permissions.
-- ============================================================
CREATE OR REPLACE FUNCTION course_id_for_module(target_module_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT course_id FROM modules WHERE id = target_module_id;
$$;

CREATE OR REPLACE FUNCTION course_id_for_lesson(target_lesson_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT m.course_id FROM lessons l JOIN modules m ON m.id = l.module_id
  WHERE l.id = target_lesson_id;
$$;

GRANT EXECUTE ON FUNCTION course_id_for_module(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION course_id_for_lesson(uuid) TO authenticated;

-- ============================================================
-- 6. RLS — modules
-- ============================================================
DROP POLICY IF EXISTS "read_modules_if_can_see_course" ON modules;
CREATE POLICY "read_modules_if_can_see_course" ON modules
  FOR SELECT TO authenticated
  USING (
    is_course_instructor(course_id)
    OR is_enrolled(course_id)
    OR EXISTS (SELECT 1 FROM lms_courses WHERE id = course_id AND status = 'published' AND visibility = 'public')
  );

DROP POLICY IF EXISTS "instructor_manage_own_modules" ON modules;
CREATE POLICY "instructor_manage_own_modules" ON modules
  FOR ALL TO authenticated
  USING (is_course_instructor(course_id))
  WITH CHECK (is_course_instructor(course_id));

-- ============================================================
-- 7. RLS — lessons
-- ============================================================
DROP POLICY IF EXISTS "read_lessons_if_can_see_course" ON lessons;
CREATE POLICY "read_lessons_if_can_see_course" ON lessons
  FOR SELECT TO authenticated
  USING (
    is_course_instructor(course_id_for_module(module_id))
    OR is_enrolled(course_id_for_module(module_id))
  );

DROP POLICY IF EXISTS "instructor_manage_own_lessons" ON lessons;
CREATE POLICY "instructor_manage_own_lessons" ON lessons
  FOR ALL TO authenticated
  USING (is_course_instructor(course_id_for_module(module_id)))
  WITH CHECK (is_course_instructor(course_id_for_module(module_id)));

-- ============================================================
-- 8. RLS — lesson_resources (same visibility as their parent lesson)
-- ============================================================
DROP POLICY IF EXISTS "read_resources_if_can_see_lesson" ON lesson_resources;
CREATE POLICY "read_resources_if_can_see_lesson" ON lesson_resources
  FOR SELECT TO authenticated
  USING (
    is_course_instructor(course_id_for_lesson(lesson_id))
    OR is_enrolled(course_id_for_lesson(lesson_id))
  );

DROP POLICY IF EXISTS "instructor_manage_own_resources" ON lesson_resources;
CREATE POLICY "instructor_manage_own_resources" ON lesson_resources
  FOR ALL TO authenticated
  USING (is_course_instructor(course_id_for_lesson(lesson_id)))
  WITH CHECK (is_course_instructor(course_id_for_lesson(lesson_id)));

-- ============================================================
-- 9. RLS — lesson_progress
-- ============================================================
DROP POLICY IF EXISTS "student_manage_own_progress" ON lesson_progress;
CREATE POLICY "student_manage_own_progress" ON lesson_progress
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (
    student_id = auth.uid()
    AND is_enrolled(course_id_for_lesson(lesson_id))
  );

DROP POLICY IF EXISTS "instructor_read_student_progress" ON lesson_progress;
CREATE POLICY "instructor_read_student_progress" ON lesson_progress
  FOR SELECT TO authenticated
  USING (is_course_instructor(course_id_for_lesson(lesson_id)));

-- ============================================================
-- 10. updated_at triggers
-- ============================================================
DROP TRIGGER IF EXISTS trg_modules_updated_at ON modules;
CREATE TRIGGER trg_modules_updated_at BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_lessons_updated_at ON lessons;
CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 11. Storage bucket for lesson resources (private; access mediated
--     by the same RLS-checked queries as the metadata row, mirroring
--     the pattern used for application-documents).
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-resources', 'lesson-resources', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "instructors_upload_lesson_resources" ON storage.objects;
CREATE POLICY "instructors_upload_lesson_resources" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-resources' AND is_instructor());

DROP POLICY IF EXISTS "read_lesson_resources_if_enrolled_or_instructor" ON storage.objects;
CREATE POLICY "read_lesson_resources_if_enrolled_or_instructor" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'lesson-resources' AND (is_instructor() OR EXISTS (
    SELECT 1 FROM lms_enrollments WHERE student_id = auth.uid() AND status = 'active'
  )));
-- Note: this SELECT policy intentionally still requires SOME active
-- enrollment (in any course) as a coarse gate — the per-course
-- fine-grained check happens at the application layer via the signed
-- lesson_resources.file_url row the student was already authorized to
-- read. Tightening this to a per-object course check requires storing
-- course_id in the object's path/metadata, which the file-upload UI
-- (Phase 3 follow-up) should do by prefixing keys as
-- `{course_id}/{lesson_id}/{filename}`.
