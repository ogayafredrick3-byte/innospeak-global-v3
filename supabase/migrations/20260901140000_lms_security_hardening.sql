/*
  # Hardening — remove student write access to graded/controlled fields

  A static audit found three RLS policies that were broader than any
  frontend flow actually needs, which matters because RLS is the real
  enforcement boundary — anyone can bypass the UI and call the REST API
  directly. Each of these `FOR ALL` policies let a student issue an
  UPDATE that the UI never sends, but the database still allowed:

    - submissions:    a student could PATCH their own score/graded_by/
                       status directly — self-grading.
    - quiz_attempts:  a student could PATCH their own score/passed/
                       status directly — bypassing submit_quiz_attempt().
    - discussions:    a student could set is_pinned/is_closed on their
                       own thread — instructor-only controls.

  Fix: narrow each to exactly what the product needs. Resubmission and
  quiz attempts are each a new INSERT row (attempt_number increments),
  never an UPDATE of an existing one — so students lose UPDATE entirely
  on those two tables. Discussions keep student UPDATE (for editing
  their own title/body) but gain a trigger that blocks changes to the
  instructor-only columns from non-instructors.
*/

-- ============================================================
-- 1. submissions — students get SELECT + INSERT only
-- ============================================================
DROP POLICY IF EXISTS "student_manage_own_submissions" ON submissions;

CREATE POLICY "student_read_own_submissions" ON submissions
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "student_insert_own_submissions" ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND is_enrolled(course_id_for_assignment(assignment_id))
    AND status = 'submitted'
    AND score IS NULL
    AND graded_by IS NULL
  );

-- ============================================================
-- 2. quiz_attempts — students get SELECT + INSERT only
-- ============================================================
DROP POLICY IF EXISTS "student_manage_own_attempts" ON quiz_attempts;

CREATE POLICY "student_read_own_attempts" ON quiz_attempts
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "student_insert_own_attempts" ON quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND is_enrolled(course_id_for_quiz(quiz_id)));

-- submit_quiz_attempt() is SECURITY DEFINER, so it can still write the
-- score/status/passed columns on the student's behalf even with no
-- client-facing UPDATE policy — that's the only intended write path now.

-- ============================================================
-- 3. discussions — block non-instructor changes to pin/close
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_discussion_moderation_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.is_pinned IS DISTINCT FROM OLD.is_pinned OR NEW.is_closed IS DISTINCT FROM OLD.is_closed)
     AND NOT is_course_instructor(OLD.course_id) THEN
    RAISE EXCEPTION 'Only an instructor can pin or close a discussion';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_discussion_moderation_columns ON discussions;
CREATE TRIGGER trg_enforce_discussion_moderation_columns
  BEFORE UPDATE ON discussions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_discussion_moderation_columns();
