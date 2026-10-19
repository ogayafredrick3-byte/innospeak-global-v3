-- LMS RPC functions — quiz, grading, progress, review workflow

-- submit_quiz_attempt
CREATE OR REPLACE FUNCTION submit_quiz_attempt(target_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_attempt quiz_attempts%ROWTYPE;
  v_quiz quizzes%ROWTYPE;
  v_total_marks numeric := 0;
  v_earned_marks numeric := 0;
  v_pass boolean := false;
  v_pct numeric;
  v_question record;
  v_answer record;
  v_correct_option_ids uuid[];
  v_selected_ids uuid[];
BEGIN
  SELECT * INTO v_attempt FROM quiz_attempts WHERE id = target_attempt_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Attempt not found'; END IF;
  IF v_attempt.status = 'submitted' OR v_attempt.status = 'graded' THEN RAISE EXCEPTION 'Attempt already submitted'; END IF;

  SELECT * INTO v_quiz FROM quizzes WHERE id = v_attempt.quiz_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Quiz not found'; END IF;

  FOR v_question IN SELECT * FROM quiz_questions WHERE quiz_id = v_quiz.id ORDER BY position
  LOOP
    v_total_marks := v_total_marks + v_question.marks;
    SELECT * INTO v_answer FROM quiz_answers WHERE attempt_id = v_attempt.id AND question_id = v_question.id;

    IF v_question.question_type IN ('multiple_choice', 'true_false') THEN
      SELECT array_agg(id ORDER BY position) INTO v_correct_option_ids
      FROM quiz_question_options WHERE question_id = v_question.id AND is_correct = true;
      v_selected_ids := COALESCE(v_answer.selected_option_ids::uuid[], ARRAY[]::uuid[]);
      IF array_length(v_selected_ids, 1) = array_length(v_correct_option_ids, 1)
         AND v_selected_ids = v_correct_option_ids THEN
        v_earned_marks := v_earned_marks + v_question.marks;
        UPDATE quiz_answers SET is_correct = true, awarded_marks = v_question.marks WHERE attempt_id = v_attempt.id AND question_id = v_question.id;
      ELSE
        UPDATE quiz_answers SET is_correct = false, awarded_marks = 0 WHERE attempt_id = v_attempt.id AND question_id = v_question.id;
      END IF;
    ELSIF v_question.question_type = 'short_answer' THEN
      IF v_answer.text_answer IS NOT NULL
         AND LOWER(TRIM(v_answer.text_answer)) = LOWER(TRIM(COALESCE(v_question.correct_short_answer, ''))) THEN
        v_earned_marks := v_earned_marks + v_question.marks;
        UPDATE quiz_answers SET is_correct = true, awarded_marks = v_question.marks WHERE attempt_id = v_attempt.id AND question_id = v_question.id;
      ELSE
        UPDATE quiz_answers SET is_correct = false, awarded_marks = 0 WHERE attempt_id = v_attempt.id AND question_id = v_question.id;
      END IF;
    END IF;
  END LOOP;

  v_pct := CASE WHEN v_total_marks > 0 THEN ROUND((v_earned_marks / v_total_marks) * 100) ELSE 0 END;
  v_pass := v_pct >= v_quiz.passing_score_percent;

  UPDATE quiz_attempts
  SET status = 'graded', score = v_earned_marks, max_score = v_total_marks, score_percent = v_pct, passed = v_pass, submitted_at = now()
  WHERE id = v_attempt.id;

  RETURN jsonb_build_object('attempt_id', v_attempt.id, 'score', v_earned_marks, 'max_score', v_total_marks, 'percent', v_pct, 'passed', v_pass);
END;
$$;
GRANT EXECUTE ON FUNCTION submit_quiz_attempt(uuid) TO authenticated;

-- grade_submission
CREATE OR REPLACE FUNCTION grade_submission(p_submission_id uuid, p_score integer, p_feedback text DEFAULT '', p_status text DEFAULT 'graded')
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM submissions s JOIN assignments a ON a.id = s.assignment_id JOIN lms_courses c ON c.id = a.course_id
    WHERE s.id = p_submission_id AND can_manage_course(c.id)
  ) THEN
    RAISE EXCEPTION 'You can only grade submissions for your own courses.';
  END IF;
  UPDATE submissions SET score = p_score, feedback = p_feedback, status = p_status, graded_by = auth.uid(), graded_at = now()
  WHERE id = p_submission_id;
END;
$$;
GRANT EXECUTE ON FUNCTION grade_submission(uuid, integer, text, text) TO authenticated;

-- request_resubmission
CREATE OR REPLACE FUNCTION request_resubmission(p_submission_id uuid, p_feedback text DEFAULT '')
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM submissions s JOIN assignments a ON a.id = s.assignment_id JOIN lms_courses c ON c.id = a.course_id
    WHERE s.id = p_submission_id AND can_manage_course(c.id)
  ) THEN
    RAISE EXCEPTION 'You can only manage submissions for your own courses.';
  END IF;
  UPDATE submissions SET status = 'resubmission_required', feedback = p_feedback, graded_by = auth.uid(), graded_at = now()
  WHERE id = p_submission_id;
END;
$$;
GRANT EXECUTE ON FUNCTION request_resubmission(uuid, text) TO authenticated;

-- get_student_assignment_status
CREATE OR REPLACE FUNCTION get_student_assignment_status(p_assignment_id uuid, p_student_id uuid)
RETURNS TABLE (
  id uuid, attempt_number integer, status text, score integer, feedback text,
  is_late boolean, submitted_at timestamptz, graded_at timestamptz,
  text_response text, file_url text, file_name text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.attempt_number, s.status, s.score, s.feedback, s.is_late, s.submitted_at, s.graded_at, s.text_response, s.file_url, s.file_name
  FROM submissions s WHERE s.assignment_id = p_assignment_id AND s.student_id = p_student_id
  ORDER BY s.attempt_number DESC LIMIT 1;
END;
$$;
GRANT EXECUTE ON FUNCTION get_student_assignment_status(uuid, uuid) TO authenticated;

-- get_course_progress (returns jsonb matching frontend expectation)
DROP FUNCTION IF EXISTS public.get_course_progress(uuid, uuid);
CREATE FUNCTION get_course_progress(target_course_id uuid, target_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  total_lessons integer;
  completed_lessons integer;
  pct numeric;
  last_lesson_id uuid;
BEGIN
  SELECT count(*) INTO total_lessons
  FROM lessons l JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = target_course_id AND l.status = 'published';

  SELECT count(*) INTO completed_lessons
  FROM lesson_progress p JOIN lessons l ON l.id = p.lesson_id JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = target_course_id AND p.student_id = target_student_id AND p.status = 'completed';

  SELECT l.id INTO last_lesson_id
  FROM lesson_progress p JOIN lessons l ON l.id = p.lesson_id JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = target_course_id AND p.student_id = target_student_id
  ORDER BY p.updated_at DESC LIMIT 1;

  pct := CASE WHEN total_lessons > 0 THEN ROUND((completed_lessons::numeric / total_lessons) * 100) ELSE 0 END;

  RETURN jsonb_build_object('total_lessons', total_lessons, 'completed_lessons', completed_lessons, 'percent', pct, 'last_lesson_id', last_lesson_id);
END;
$$;
GRANT EXECUTE ON FUNCTION get_course_progress(uuid, uuid) TO authenticated;

-- Course review workflow functions
CREATE OR REPLACE FUNCTION submit_course_for_review(p_course_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT can_manage_course(p_course_id) THEN RAISE EXCEPTION 'You can only submit your own courses for review.'; END IF;
  UPDATE lms_courses SET status = 'submitted', reviewer_notes = '', reviewer_id = NULL, reviewed_at = NULL WHERE id = p_course_id;
END;
$$;
GRANT EXECUTE ON FUNCTION submit_course_for_review(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION set_course_under_review(p_course_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Only staff can review courses.'; END IF;
  UPDATE lms_courses SET status = 'under_review' WHERE id = p_course_id;
END;
$$;
GRANT EXECUTE ON FUNCTION set_course_under_review(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION approve_course(p_course_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Only staff can approve courses.'; END IF;
  UPDATE lms_courses SET status = 'approved', reviewer_id = auth.uid(), reviewed_at = now() WHERE id = p_course_id;
END;
$$;
GRANT EXECUTE ON FUNCTION approve_course(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION publish_course(p_course_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Only staff can publish courses.'; END IF;
  UPDATE lms_courses SET status = 'published' WHERE id = p_course_id AND status = 'approved';
END;
$$;
GRANT EXECUTE ON FUNCTION publish_course(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION reject_course(p_course_id uuid, p_notes text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Only staff can reject courses.'; END IF;
  UPDATE lms_courses SET status = 'rejected', reviewer_id = auth.uid(), reviewer_notes = p_notes, reviewed_at = now() WHERE id = p_course_id;
END;
$$;
GRANT EXECUTE ON FUNCTION reject_course(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION request_course_changes(p_course_id uuid, p_notes text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Only staff can request changes.'; END IF;
  UPDATE lms_courses SET status = 'changes_requested', reviewer_id = auth.uid(), reviewer_notes = p_notes, reviewed_at = now() WHERE id = p_course_id;
END;
$$;
GRANT EXECUTE ON FUNCTION request_course_changes(uuid, text) TO authenticated;

-- reorder_modules
CREATE OR REPLACE FUNCTION reorder_modules(p_course_id uuid, p_module_ids uuid[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE i integer;
BEGIN
  FOR i IN 1..array_length(p_module_ids, 1) LOOP
    UPDATE modules SET position = i - 1 WHERE id = p_module_ids[i] AND course_id = p_course_id;
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION reorder_modules(uuid, uuid[]) TO authenticated;

-- reorder_lessons
CREATE OR REPLACE FUNCTION reorder_lessons(p_module_id uuid, p_lesson_ids uuid[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE i integer;
BEGIN
  FOR i IN 1..array_length(p_lesson_ids, 1) LOOP
    UPDATE lessons SET position = i - 1 WHERE id = p_lesson_ids[i] AND module_id = p_module_id;
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION reorder_lessons(uuid, uuid[]) TO authenticated;

-- generate_student_number
CREATE OR REPLACE FUNCTION generate_student_number()
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_next integer;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Only an admin can generate a student number.'; END IF;
  v_next := nextval('student_number_seq');
  RETURN 'ISG-' || to_char(now(), 'YYYY') || '-' || lpad(v_next::text, 4, '0');
END;
$$;
GRANT EXECUTE ON FUNCTION generate_student_number() TO authenticated;