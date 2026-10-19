-- ============================================================
-- Tutor Course Management System
-- Tables: course_instructors, lms_courses, modules, lessons
-- with RLS, review workflow, and SECURITY DEFINER functions
-- ============================================================

-- --------------------------------------------------------
-- course_instructors — links tutors to their courses
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  instructor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'primary' CHECK (role IN ('primary', 'co_instructor', 'assistant')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, instructor_id)
);

ALTER TABLE course_instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_course_instructors" ON course_instructors
  FOR SELECT TO authenticated
  USING (
    instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "insert_course_instructors" ON course_instructors
  FOR INSERT TO authenticated
  WITH CHECK (
    instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "delete_course_instructors" ON course_instructors
  FOR DELETE TO authenticated
  USING (
    instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- --------------------------------------------------------
-- lms_courses — extended with new fields for course creation
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS lms_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  code text,
  description text DEFAULT '',
  thumbnail_path text DEFAULT '',
  category text DEFAULT '',
  level text DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
  duration text DEFAULT '',
  language text DEFAULT 'English',
  requirements text DEFAULT '',
  learning_outcomes jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'published', 'rejected', 'changes_requested')),
  created_by uuid REFERENCES auth.users(id),
  reviewer_id uuid REFERENCES auth.users(id),
  reviewer_notes text DEFAULT '',
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lms_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_courses" ON lms_courses
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = lms_courses.id AND instructor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "insert_courses" ON lms_courses
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "update_own_courses" ON lms_courses
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = lms_courses.id AND instructor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = lms_courses.id AND instructor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "delete_own_courses" ON lms_courses
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add FK now that lms_courses exists
ALTER TABLE course_instructors
  ADD CONSTRAINT course_instructors_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE;

-- --------------------------------------------------------
-- modules — course sections, ordered
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_modules" ON modules
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lms_courses WHERE id = modules.course_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = modules.course_id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
  );

CREATE POLICY "insert_modules" ON modules
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM lms_courses WHERE id = modules.course_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = modules.course_id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
  );

CREATE POLICY "update_modules" ON modules
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lms_courses WHERE id = modules.course_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = modules.course_id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM lms_courses WHERE id = modules.course_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = modules.course_id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
  );

CREATE POLICY "delete_modules" ON modules
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lms_courses WHERE id = modules.course_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = modules.course_id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
  );

-- --------------------------------------------------------
-- lessons — ordered within modules
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'pdf', 'audio', 'presentation', 'link')),
  content text DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_lessons" ON lessons
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM modules WHERE id = lessons.module_id AND EXISTS (SELECT 1 FROM lms_courses WHERE id = modules.course_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = modules.course_id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))))
  );

CREATE POLICY "insert_lessons" ON lessons
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM modules WHERE id = lessons.module_id AND EXISTS (SELECT 1 FROM lms_courses WHERE id = modules.course_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = modules.course_id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))))
  );

CREATE POLICY "update_lessons" ON lessons
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM modules WHERE id = lessons.module_id AND EXISTS (SELECT 1 FROM lms_courses WHERE id = modules.course_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = modules.course_id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM modules WHERE id = lessons.module_id AND EXISTS (SELECT 1 FROM lms_courses WHERE id = modules.course_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = modules.course_id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))))
  );

CREATE POLICY "delete_lessons" ON lessons
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM modules WHERE id = lessons.module_id AND EXISTS (SELECT 1 FROM lms_courses WHERE id = modules.course_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = modules.course_id AND instructor_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))))
  );

-- --------------------------------------------------------
-- Storage bucket for course thumbnails
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "upload_course_thumbnail" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-thumbnails');

CREATE POLICY "read_course_thumbnail" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY "update_course_thumbnail" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'course-thumbnails');

-- --------------------------------------------------------
-- updated_at triggers
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lms_courses_updated ON lms_courses;
CREATE TRIGGER trg_lms_courses_updated BEFORE UPDATE ON lms_courses
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_modules_updated ON modules;
CREATE TRIGGER trg_modules_updated BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_lessons_updated ON lessons;
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- --------------------------------------------------------
-- SECURITY DEFINER functions for course review workflow
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION submit_course_for_review(p_course_id uuid)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM lms_courses c
    WHERE c.id = p_course_id
    AND (c.created_by = auth.uid() OR EXISTS (SELECT 1 FROM course_instructors WHERE course_id = p_course_id AND instructor_id = auth.uid()))
  ) THEN
    RAISE EXCEPTION 'You can only submit your own courses for review.';
  END IF;

  UPDATE lms_courses
  SET status = 'submitted', reviewer_notes = '', reviewer_id = NULL, reviewed_at = NULL
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_course_under_review(p_course_id uuid)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only staff can review courses.';
  END IF;

  UPDATE lms_courses SET status = 'under_review' WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_course(p_course_id uuid)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only staff can approve courses.';
  END IF;

  UPDATE lms_courses
  SET status = 'approved', reviewer_id = auth.uid(), reviewed_at = now()
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION publish_course(p_course_id uuid)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only staff can publish courses.';
  END IF;

  UPDATE lms_courses SET status = 'published' WHERE id = p_course_id AND status = 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_course(p_course_id uuid, p_notes text)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only staff can reject courses.';
  END IF;

  UPDATE lms_courses
  SET status = 'rejected', reviewer_id = auth.uid(), reviewer_notes = p_notes, reviewed_at = now()
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION request_course_changes(p_course_id uuid, p_notes text)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only staff can request changes.';
  END IF;

  UPDATE lms_courses
  SET status = 'changes_requested', reviewer_id = auth.uid(), reviewer_notes = p_notes, reviewed_at = now()
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reorder_modules(p_course_id uuid, p_module_ids uuid[])
RETURNS void AS $$
DECLARE
  i integer;
BEGIN
  FOR i IN 1..array_length(p_module_ids, 1) LOOP
    UPDATE modules SET position = i - 1 WHERE id = p_module_ids[i] AND course_id = p_course_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reorder_lessons(p_module_id uuid, p_lesson_ids uuid[])
RETURNS void AS $$
DECLARE
  i integer;
BEGIN
  FOR i IN 1..array_length(p_lesson_ids, 1) LOOP
    UPDATE lessons SET position = i - 1 WHERE id = p_lesson_ids[i] AND module_id = p_module_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
