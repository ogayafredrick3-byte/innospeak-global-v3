/*
  # LMS Phase 6 — Quizzes & question bank

  Objective question types (multiple_choice, multiple_response,
  true_false) are auto-graded by `grade_quiz_attempt()` on submission.
  short_answer and matching are stored ungraded (score left null) for
  the instructor to mark manually — auto-grading free text correctly
  is out of scope and shouldn't be faked.

  Attempts write answers progressively (Section 12's "answers saved
  progressively, not only on Submit" requirement, reused here even
  though this table is 'quizzes' — the exam system in a later phase
  reuses this same attempt/answer shape).
*/

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions text,
  time_limit_minutes integer,
  max_attempts integer NOT NULL DEFAULT 1,
  passing_score_percent numeric NOT NULL DEFAULT 50,
  randomize_questions boolean NOT NULL DEFAULT false,
  show_feedback_after_submit boolean NOT NULL DEFAULT true,
  available_from timestamptz,
  available_until timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_module ON quizzes(module_id);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION course_id_for_quiz(target_quiz_id uuid)
RETURNS uuid
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT course_id_for_module(q.module_id) FROM quizzes q WHERE q.id = target_quiz_id;
$$;

GRANT EXECUTE ON FUNCTION course_id_for_quiz(uuid) TO authenticated;

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL
    CHECK (question_type IN ('multiple_choice', 'multiple_response', 'true_false', 'short_answer', 'matching', 'fill_blank')),
  marks numeric NOT NULL DEFAULT 1,
  position integer NOT NULL DEFAULT 0,
  correct_short_answer text,   -- for short_answer/fill_blank exact-match auto-grading attempt; instructor can still override
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id, position);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_question_options_question ON question_options(question_id);

ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL DEFAULT 1,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted', 'auto_submitted', 'graded')),
  score numeric,
  max_score numeric,
  passed boolean,
  UNIQUE (quiz_id, student_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_ids uuid[] DEFAULT '{}',   -- multiple_choice / multiple_response / true_false
  text_answer text,                          -- short_answer / fill_blank
  is_correct boolean,
  marks_awarded numeric,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt ON quiz_answers(attempt_id);

ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS — quizzes / questions / question_options
--       (students never see is_correct / correct_short_answer
--       directly outside the answer-grading function — enforced by
--       simply not selecting those columns in the student-facing
--       query the frontend uses; Postgres RLS is row-level, not
--       column-level, so this is documented here as an APPLICATION
--       responsibility: src/lib/supabase/lms.js's getQuizForStudent()
--       must strip is_correct before returning to the client.)
-- ============================================================
DROP POLICY IF EXISTS "read_published_quizzes_if_enrolled" ON quizzes;
CREATE POLICY "read_published_quizzes_if_enrolled" ON quizzes
  FOR SELECT TO authenticated
  USING (
    is_course_instructor(course_id_for_module(module_id))
    OR (status = 'published' AND is_enrolled(course_id_for_module(module_id)))
  );

DROP POLICY IF EXISTS "instructor_manage_own_quizzes" ON quizzes;
CREATE POLICY "instructor_manage_own_quizzes" ON quizzes
  FOR ALL TO authenticated
  USING (is_course_instructor(course_id_for_module(module_id)))
  WITH CHECK (is_course_instructor(course_id_for_module(module_id)));

DROP POLICY IF EXISTS "read_questions_if_can_read_quiz" ON questions;
CREATE POLICY "read_questions_if_can_read_quiz" ON questions
  FOR SELECT TO authenticated
  USING (is_course_instructor(course_id_for_quiz(quiz_id)) OR is_enrolled(course_id_for_quiz(quiz_id)));

DROP POLICY IF EXISTS "instructor_manage_own_questions" ON questions;
CREATE POLICY "instructor_manage_own_questions" ON questions
  FOR ALL TO authenticated
  USING (is_course_instructor(course_id_for_quiz(quiz_id)))
  WITH CHECK (is_course_instructor(course_id_for_quiz(quiz_id)));

DROP POLICY IF EXISTS "read_options_if_can_read_question" ON question_options;
CREATE POLICY "read_options_if_can_read_question" ON question_options
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM questions q WHERE q.id = question_id
    AND (is_course_instructor(course_id_for_quiz(q.quiz_id)) OR is_enrolled(course_id_for_quiz(q.quiz_id)))
  ));

DROP POLICY IF EXISTS "instructor_manage_own_options" ON question_options;
CREATE POLICY "instructor_manage_own_options" ON question_options
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM questions q WHERE q.id = question_id AND is_course_instructor(course_id_for_quiz(q.quiz_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM questions q WHERE q.id = question_id AND is_course_instructor(course_id_for_quiz(q.quiz_id))));

-- ============================================================
-- RLS — quiz_attempts / quiz_answers
-- ============================================================
DROP POLICY IF EXISTS "student_manage_own_attempts" ON quiz_attempts;
CREATE POLICY "student_manage_own_attempts" ON quiz_attempts
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid() AND is_enrolled(course_id_for_quiz(quiz_id)));

DROP POLICY IF EXISTS "instructor_read_attempts" ON quiz_attempts;
CREATE POLICY "instructor_read_attempts" ON quiz_attempts
  FOR SELECT TO authenticated
  USING (is_course_instructor(course_id_for_quiz(quiz_id)));

DROP POLICY IF EXISTS "student_manage_own_answers" ON quiz_answers;
CREATE POLICY "student_manage_own_answers" ON quiz_answers
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM quiz_attempts a WHERE a.id = attempt_id AND a.student_id = auth.uid() AND a.status = 'in_progress'))
  WITH CHECK (EXISTS (SELECT 1 FROM quiz_attempts a WHERE a.id = attempt_id AND a.student_id = auth.uid() AND a.status = 'in_progress'));
  -- Answers are only writable while the attempt is 'in_progress' — once
  -- submitted/auto_submitted, this policy blocks further writes, so a
  -- student cannot edit answers after time expires or after submitting.

DROP POLICY IF EXISTS "instructor_read_answers" ON quiz_answers;
CREATE POLICY "instructor_read_answers" ON quiz_answers
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM quiz_attempts a WHERE a.id = attempt_id AND is_course_instructor(course_id_for_quiz(a.quiz_id))));

-- ============================================================
-- Auto-grading function — call via RPC when a student submits.
-- SECURITY DEFINER because it needs to write is_correct/marks_awarded,
-- which students' own quiz_answers policy does not allow them to set
-- directly (prevents a student from POSTing is_correct=true themself).
-- ============================================================
CREATE OR REPLACE FUNCTION submit_quiz_attempt(target_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt quiz_attempts%ROWTYPE;
  v_total_score numeric := 0;
  v_max_score numeric := 0;
  v_quiz quizzes%ROWTYPE;
  v_question RECORD;
  v_answer RECORD;
  v_correct_ids uuid[];
  v_is_correct boolean;
  v_marks numeric;
BEGIN
  SELECT * INTO v_attempt FROM quiz_attempts WHERE id = target_attempt_id AND student_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found or not owned by current user';
  END IF;
  IF v_attempt.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Attempt already submitted';
  END IF;

  SELECT * INTO v_quiz FROM quizzes WHERE id = v_attempt.quiz_id;

  FOR v_question IN SELECT * FROM questions WHERE quiz_id = v_attempt.quiz_id LOOP
    v_max_score := v_max_score + v_question.marks;
    SELECT * INTO v_answer FROM quiz_answers WHERE attempt_id = target_attempt_id AND question_id = v_question.id;

    IF v_question.question_type IN ('multiple_choice', 'multiple_response', 'true_false') THEN
      SELECT array_agg(id) INTO v_correct_ids FROM question_options WHERE question_id = v_question.id AND is_correct = true;
      v_is_correct := (v_answer IS NOT NULL AND v_answer.selected_option_ids IS NOT NULL
        AND v_correct_ids IS NOT NULL
        AND v_answer.selected_option_ids @> v_correct_ids
        AND v_correct_ids @> v_answer.selected_option_ids);
      v_marks := CASE WHEN v_is_correct THEN v_question.marks ELSE 0 END;

    ELSIF v_question.question_type IN ('short_answer', 'fill_blank') THEN
      IF v_question.correct_short_answer IS NOT NULL AND v_answer IS NOT NULL THEN
        v_is_correct := lower(trim(v_answer.text_answer)) = lower(trim(v_question.correct_short_answer));
        v_marks := CASE WHEN v_is_correct THEN v_question.marks ELSE 0 END;
      ELSE
        -- No reference answer configured, or a type (e.g. matching)
        -- that needs a human — leave ungraded for instructor review.
        v_is_correct := NULL;
        v_marks := NULL;
      END IF;
    ELSE
      v_is_correct := NULL;
      v_marks := NULL;
    END IF;

    IF v_answer IS NOT NULL THEN
      UPDATE quiz_answers SET is_correct = v_is_correct, marks_awarded = v_marks, updated_at = now()
      WHERE id = v_answer.id;
    END IF;

    v_total_score := v_total_score + COALESCE(v_marks, 0);
  END LOOP;

  UPDATE quiz_attempts SET
    status = 'submitted',
    submitted_at = now(),
    score = v_total_score,
    max_score = v_max_score,
    passed = (v_max_score > 0 AND (v_total_score / v_max_score * 100) >= v_quiz.passing_score_percent)
  WHERE id = target_attempt_id;

  RETURN jsonb_build_object('score', v_total_score, 'max_score', v_max_score);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_quiz_attempt(uuid) TO authenticated;
