/*
  # LMS Phase 8-9 — Centralized grading config & single-source progress

  Section 16 requires grading weights to live in the database, not be
  hardcoded per page (e.g. CAT 30% + Exam 70%). `grade_components`
  stores that config per course; `get_course_grade()` computes the
  final weighted score on demand from real submission/attempt data —
  never a value written once and left to drift out of sync.

  Section 30 requires ONE progress calculation used everywhere
  (dashboard, course page, instructor analytics, reports). That single
  source is `get_course_progress()` below — every page must call this
  function (via the lms.js API layer) rather than computing its own
  percentage.
*/

-- ============================================================
-- 1. grade_components — per-course weighted grading config
-- ============================================================
CREATE TABLE IF NOT EXISTS grade_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  name text NOT NULL,                 -- e.g. "CAT", "Final Exam", "Assignments"
  component_type text NOT NULL CHECK (component_type IN ('assignments', 'quizzes', 'custom')),
  weight_percent numeric NOT NULL CHECK (weight_percent >= 0 AND weight_percent <= 100),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grade_components_course ON grade_components(course_id);

ALTER TABLE grade_components ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_grade_components_if_can_see_course" ON grade_components;
CREATE POLICY "read_grade_components_if_can_see_course" ON grade_components
  FOR SELECT TO authenticated
  USING (is_course_instructor(course_id) OR is_enrolled(course_id));

DROP POLICY IF EXISTS "instructor_manage_own_grade_components" ON grade_components;
CREATE POLICY "instructor_manage_own_grade_components" ON grade_components
  FOR ALL TO authenticated
  USING (is_course_instructor(course_id))
  WITH CHECK (is_course_instructor(course_id));

-- A course's component weights must sum to at most 100 — checked in a
-- trigger since CHECK constraints can't aggregate across rows.
CREATE OR REPLACE FUNCTION check_grade_component_weights()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_total numeric;
BEGIN
  SELECT COALESCE(SUM(weight_percent), 0) INTO v_total
  FROM grade_components
  WHERE course_id = NEW.course_id AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF v_total + NEW.weight_percent > 100 THEN
    RAISE EXCEPTION 'Grade component weights for this course would exceed 100%% (currently % + new %)', v_total, NEW.weight_percent;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_grade_component_weights ON grade_components;
CREATE TRIGGER trg_check_grade_component_weights
  BEFORE INSERT OR UPDATE ON grade_components
  FOR EACH ROW EXECUTE FUNCTION check_grade_component_weights();

-- ============================================================
-- 2. get_course_grade — single source for a student's final score
-- ============================================================
CREATE OR REPLACE FUNCTION get_course_grade(target_course_id uuid, target_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_component RECORD;
  v_breakdown jsonb := '[]'::jsonb;
  v_final numeric := 0;
  v_component_pct numeric;
BEGIN
  -- Caller must be the student themself, their instructor, or an LMS admin.
  IF target_student_id <> auth.uid() AND NOT is_course_instructor(target_course_id) THEN
    RAISE EXCEPTION 'Not authorized to view this grade';
  END IF;

  FOR v_component IN SELECT * FROM grade_components WHERE course_id = target_course_id LOOP
    IF v_component.component_type = 'assignments' THEN
      SELECT COALESCE(AVG(s.score / NULLIF(a.max_marks, 0) * 100), 0) INTO v_component_pct
      FROM submissions s
      JOIN assignments a ON a.id = s.assignment_id
      JOIN modules m ON m.id = a.module_id
      WHERE m.course_id = target_course_id AND s.student_id = target_student_id AND s.score IS NOT NULL;

    ELSIF v_component.component_type = 'quizzes' THEN
      SELECT COALESCE(AVG(qa.score / NULLIF(qa.max_score, 0) * 100), 0) INTO v_component_pct
      FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id
      JOIN modules m ON m.id = q.module_id
      WHERE m.course_id = target_course_id AND qa.student_id = target_student_id AND qa.score IS NOT NULL;

    ELSE
      v_component_pct := 0;  -- 'custom' components need a manual grade entry point (future work)
    END IF;

    v_final := v_final + (v_component_pct * v_component.weight_percent / 100);
    v_breakdown := v_breakdown || jsonb_build_object(
      'name', v_component.name,
      'weight_percent', v_component.weight_percent,
      'component_score_percent', round(v_component_pct, 1)
    );
  END LOOP;

  RETURN jsonb_build_object('final_score_percent', round(v_final, 1), 'breakdown', v_breakdown);
END;
$$;

GRANT EXECUTE ON FUNCTION get_course_grade(uuid, uuid) TO authenticated;

-- ============================================================
-- 3. get_course_progress — the ONE completion-percentage source
--    (lesson completion is the unit of progress; assignments/quizzes
--    feed the grade, not the progress bar, per Section 15).
-- ============================================================
CREATE OR REPLACE FUNCTION get_course_progress(target_course_id uuid, target_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_total_lessons integer;
  v_completed_lessons integer;
BEGIN
  IF target_student_id <> auth.uid() AND NOT is_course_instructor(target_course_id) THEN
    RAISE EXCEPTION 'Not authorized to view this progress';
  END IF;

  SELECT COUNT(*) INTO v_total_lessons
  FROM lessons l JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = target_course_id;

  SELECT COUNT(*) INTO v_completed_lessons
  FROM lesson_progress lp
  JOIN lessons l ON l.id = lp.lesson_id
  JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = target_course_id AND lp.student_id = target_student_id AND lp.status = 'completed';

  RETURN jsonb_build_object(
    'total_lessons', v_total_lessons,
    'completed_lessons', v_completed_lessons,
    'percent', CASE WHEN v_total_lessons = 0 THEN 0 ELSE round(v_completed_lessons::numeric / v_total_lessons * 100, 1) END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_course_progress(uuid, uuid) TO authenticated;

-- ============================================================
-- 4. Auto-mark enrollment 'completed' when progress hits 100%
-- ============================================================
CREATE OR REPLACE FUNCTION check_course_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_id uuid;
  v_progress jsonb;
BEGIN
  SELECT course_id_for_lesson(NEW.lesson_id) INTO v_course_id;
  v_progress := get_course_progress(v_course_id, NEW.student_id);

  IF (v_progress->>'percent')::numeric >= 100 THEN
    UPDATE lms_enrollments
    SET status = 'completed', completed_at = now()
    WHERE course_id = v_course_id AND student_id = NEW.student_id AND status = 'active';

    INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (NEW.student_id, 'course_completed', 'lms_courses', v_course_id, jsonb_build_object('student_id', NEW.student_id));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_course_completion ON lesson_progress;
CREATE TRIGGER trg_check_course_completion
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION check_course_completion();
