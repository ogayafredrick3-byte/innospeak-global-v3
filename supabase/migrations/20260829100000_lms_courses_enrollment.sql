/*
  # LMS Phase 2 — Course management & enrollment

  Adds the LMS's own `lms_courses` table — distinct from the marketing
  "Academy" catalog (which is static JS data, not a DB table) and
  distinct from the Student Portal's `units` (registrable, fee-bearing
  academic units). An `lms_course` can optionally reference a `unit`
  so a registered unit has real teaching content behind it, but a
  course can also exist independently for standalone/CPD learning.

  New tables:
    - lms_courses            — the top-level teachable course
    - course_instructors — many-to-many: who may edit a given course
    - lms_enrollments        — which students are enrolled in which course

  Security model:
    - Anyone authenticated can SELECT a *published* course (course
      catalog browsing). Only assigned instructors / LMS admins can
      see draft/archived lms_courses or write to any course.
    - course_instructors: LMS admins manage assignments; an instructor
      can see who else teaches their own course.
    - lms_enrollments: a student sees only their own enrollment rows.
      Instructors assigned to a course see lms_enrollments for THAT course
      only (not every course) — this is the first policy that needs a
      per-course check, not just a role check.
*/

-- ============================================================
-- 1. lms_courses
-- ============================================================
CREATE TABLE IF NOT EXISTS lms_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  code text UNIQUE,
  description text,
  thumbnail_url text,
  category text,
  department text,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  unit_id uuid REFERENCES units(id) ON DELETE SET NULL,
  learning_objectives text,
  learning_outcomes text,
  prerequisites text,
  duration_weeks integer,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
  visibility text NOT NULL DEFAULT 'enrolled_only'
    CHECK (visibility IN ('public', 'enrolled_only')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_status ON lms_courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_unit_id ON lms_courses(unit_id);

ALTER TABLE lms_courses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. course_instructors
-- ============================================================
CREATE TABLE IF NOT EXISTS course_instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'primary' CHECK (role IN ('primary', 'co_instructor')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (course_id, instructor_id)
);

CREATE INDEX IF NOT EXISTS idx_course_instructors_course ON course_instructors(course_id);
CREATE INDEX IF NOT EXISTS idx_course_instructors_instructor ON course_instructors(instructor_id);

ALTER TABLE course_instructors ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an instructor ASSIGNED to this specific
-- course (or an LMS/Super Admin, who can act on any course)?
CREATE OR REPLACE FUNCTION is_course_instructor(target_course_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    is_lms_admin()
    OR EXISTS (
      SELECT 1 FROM course_instructors
      WHERE course_id = target_course_id AND instructor_id = auth.uid()
    );
$$;

GRANT EXECUTE ON FUNCTION is_course_instructor(uuid) TO authenticated;

-- ============================================================
-- 3. lms_enrollments
-- ============================================================
CREATE TABLE IF NOT EXISTS lms_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_course ON lms_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON lms_enrollments(student_id);

ALTER TABLE lms_enrollments ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user enrolled (active) in this course?
CREATE OR REPLACE FUNCTION is_enrolled(target_course_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM lms_enrollments
    WHERE course_id = target_course_id AND student_id = auth.uid() AND status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION is_enrolled(uuid) TO authenticated;

-- ============================================================
-- 4. RLS policies — lms_courses
-- ============================================================
DROP POLICY IF EXISTS "read_published_courses" ON lms_courses;
CREATE POLICY "read_published_courses" ON lms_courses
  FOR SELECT TO authenticated
  USING (status = 'published' OR is_course_instructor(id));

DROP POLICY IF EXISTS "lms_admin_insert_courses" ON lms_courses;
CREATE POLICY "lms_admin_insert_courses" ON lms_courses
  FOR INSERT TO authenticated
  WITH CHECK (is_lms_admin() OR is_instructor());

DROP POLICY IF EXISTS "instructor_update_own_course" ON lms_courses;
CREATE POLICY "instructor_update_own_course" ON lms_courses
  FOR UPDATE TO authenticated
  USING (is_course_instructor(id))
  WITH CHECK (is_course_instructor(id));

DROP POLICY IF EXISTS "lms_admin_delete_courses" ON lms_courses;
CREATE POLICY "lms_admin_delete_courses" ON lms_courses
  FOR DELETE TO authenticated
  USING (is_lms_admin());

-- ============================================================
-- 5. RLS policies — course_instructors
-- ============================================================
DROP POLICY IF EXISTS "read_own_course_instructor_rows" ON course_instructors;
CREATE POLICY "read_own_course_instructor_rows" ON course_instructors
  FOR SELECT TO authenticated
  USING (instructor_id = auth.uid() OR is_course_instructor(course_id));

DROP POLICY IF EXISTS "lms_admin_manage_course_instructors" ON course_instructors;
CREATE POLICY "lms_admin_manage_course_instructors" ON course_instructors
  FOR ALL TO authenticated
  USING (is_lms_admin())
  WITH CHECK (is_lms_admin());

-- An instructor creating their OWN course (see above policy) also needs
-- to be able to attach themself as its primary instructor in the same
-- flow, before an LMS admin has done anything:
DROP POLICY IF EXISTS "instructor_self_assign_own_new_course" ON course_instructors;
CREATE POLICY "instructor_self_assign_own_new_course" ON course_instructors
  FOR INSERT TO authenticated
  WITH CHECK (
    instructor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM lms_courses WHERE id = course_id AND created_by = auth.uid())
  );

-- ============================================================
-- 6. RLS policies — lms_enrollments
-- ============================================================
DROP POLICY IF EXISTS "student_read_own_enrollments" ON lms_enrollments;
CREATE POLICY "student_read_own_enrollments" ON lms_enrollments
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR is_course_instructor(course_id));

DROP POLICY IF EXISTS "lms_admin_manage_enrollments" ON lms_enrollments;
CREATE POLICY "lms_admin_manage_enrollments" ON lms_enrollments
  FOR ALL TO authenticated
  USING (is_lms_admin())
  WITH CHECK (is_lms_admin());

-- Students may self-enroll in a published, open course.
DROP POLICY IF EXISTS "student_self_enroll" ON lms_enrollments;
CREATE POLICY "student_self_enroll" ON lms_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (SELECT 1 FROM lms_courses WHERE id = course_id AND status = 'published')
  );

-- ============================================================
-- 7. updated_at trigger for lms_courses (reused pattern for later tables)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_courses_updated_at ON lms_courses;
CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON lms_courses
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 8. Audit: course status changes (publish/archive are meaningful
--    institutional events worth tracking from day one).
-- ============================================================
CREATE OR REPLACE FUNCTION log_course_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(),
      'course_status_changed',
      'lms_courses',
      NEW.id,
      jsonb_build_object('from_status', OLD.status, 'to_status', NEW.status, 'title', NEW.title)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_course_status_change ON lms_courses;
CREATE TRIGGER trg_log_course_status_change
  AFTER UPDATE ON lms_courses
  FOR EACH ROW
  EXECUTE FUNCTION log_course_status_change();
