import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Play, CheckCircle2, XCircle, Clock, Award,
  RotateCcw, AlertCircle, ArrowRight, Lock, Circle,
} from 'lucide-react';
import {
  getLessonQuiz, getQuizForStudent, listMyQuizAttempts,
  startQuizAttempt, saveQuizAnswer, submitQuizAttempt, getQuizAttemptResults,
} from '../../lib/supabase/lms';

function ResultSummary({ result, quiz, onRetry, canRetry, onReview }) {
  const passed = result.passed;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col items-center text-center">
        <span className={`flex h-16 w-16 items-center justify-center rounded-full ${passed ? 'bg-emerald-100' : 'bg-rose-100'}`}>
          {passed ? <Award size={30} className="text-emerald-600" /> : <XCircle size={30} className="text-rose-600" />}
        </span>
        <p className={`mt-3 font-display text-xl font-bold ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>
          {passed ? 'Passed!' : 'Not Passed'}
        </p>
        <p className="mt-1 font-body text-sm text-navy-500">
          Score: {result.score} / {result.max_score} ({result.percent}%)
        </p>
        <p className="mt-0.5 font-body text-xs text-navy-400">
          Passing score: {quiz.passing_score_percent}%
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onReview} className="btn-outline text-sm">
            Review Answers
          </button>
          {canRetry && (
            <button type="button" onClick={onRetry} className="btn-gold inline-flex items-center gap-2 text-sm">
              <RotateCcw size={15} /> Try Again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AnswerReview({ quiz, attempt }) {
  const questions = (quiz.quiz_questions || []).sort((a, b) => a.position - b.position);
  const answers = attempt.quiz_answers || [];
  const answerMap = {};
  answers.forEach((a) => { answerMap[a.question_id] = a; });

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const ans = answerMap[q.id];
        const isCorrect = ans?.is_correct;
        return (
          <div key={q.id} className="rounded-xl border border-navy-100 bg-white p-4">
            <div className="flex items-start gap-2">
              {isCorrect ? (
                <CheckCircle2 size={17} className="mt-0.5 flex-shrink-0 text-emerald-600" />
              ) : (
                <XCircle size={17} className="mt-0.5 flex-shrink-0 text-rose-600" />
              )}
              <div className="flex-1">
                <p className="font-body text-sm font-semibold text-navy-900">
                  {qi + 1}. {q.question_text}
                  <span className="ml-2 font-normal text-navy-400">({q.marks} {q.marks !== 1 ? 'marks' : 'mark'})</span>
                </p>

                {q.question_type === 'short_answer' ? (
                  <div className="mt-2 space-y-1">
                    <p className="font-body text-xs text-navy-500">
                      Your answer: <span className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{ans?.text_answer || '(no answer)'}</span>
                    </p>
                    {!isCorrect && q.correct_short_answer && (
                      <p className="font-body text-xs text-emerald-700">Correct answer: {q.correct_short_answer}</p>
                    )}
                  </div>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {(q.quiz_question_options || []).sort((a, b) => a.position - b.position).map((o) => {
                      const selected = (ans?.selected_option_ids || []).includes(o.id);
                      return (
                        <li key={o.id} className="flex items-center gap-2 font-body text-xs">
                          {o.is_correct ? (
                            <CheckCircle2 size={13} className="text-emerald-600" />
                          ) : selected ? (
                            <XCircle size={13} className="text-rose-600" />
                          ) : (
                            <Circle size={13} className="text-navy-200" />
                          )}
                          <span className={
                            o.is_correct ? 'font-semibold text-emerald-700' :
                            selected ? 'text-rose-700' : 'text-navy-500'
                          }>
                            {o.option_text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {q.explanation && (
                  <p className="mt-2 rounded-lg bg-gold-50 px-3 py-2 font-body text-xs text-gold-800">
                    {q.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function QuizPlayer({ lessonId, enrollmentId, onComplete }) {
  const [state, setState] = useState({ loading: true, error: null, quiz: null });
  const [attempts, setAttempts] = useState([]);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const submittingRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const quiz = await getLessonQuiz(lessonId);
      setState({ loading: false, error: null, quiz });
      if (quiz) {
        const atts = await listMyQuizAttempts(quiz.id);
        setAttempts(atts || []);
        const active = (atts || []).find((a) => a.status === 'in_progress') || null;
        setActiveAttempt(active);
        if (active && quiz.time_limit_minutes) {
          const elapsed = (Date.now() - new Date(active.started_at).getTime()) / 1000;
          setSecondsLeft(Math.max(0, Math.round(quiz.time_limit_minutes * 60 - elapsed)));
        }
      }
    } catch (err) {
      setState({ loading: false, error: err.message || 'Could not load quiz.', quiz: null });
    }
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft === null || result || !activeAttempt) return undefined;
    if (secondsLeft <= 0) {
      handleSubmit();
      return undefined;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, result, activeAttempt]);

  async function handleStart() {
    if (!state.quiz) return;
    try {
      const attemptNumber = attempts.length + 1;
      const att = await startQuizAttempt(state.quiz.id, attemptNumber, enrollmentId);
      await load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not start quiz.' }));
    }
  }

  async function handleAnswerChange(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (activeAttempt) {
      await saveQuizAnswer(activeAttempt.id, questionId, value).catch(() => {});
    }
  }

  async function handleSubmit() {
    if (submittingRef.current || !activeAttempt) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(activeAttempt.id);
      setResult(res);
      await load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not submit quiz.' }));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  async function handleReview() {
    if (!activeAttempt && !result) return;
    const attemptId = activeAttempt?.id || attempts.find((a) => a.status === 'submitted')?.id;
    if (!attemptId) return;
    try {
      const data = await getQuizAttemptResults(attemptId);
      setReviewData(data);
      setReviewMode(true);
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not load review.' }));
    }
  }

  function handleRetry() {
    setResult(null);
    setReviewMode(false);
    setReviewData(null);
    setAnswers({});
    handleStart();
  }

  if (state.loading) return null;
  if (state.error) return (
    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
      <AlertCircle size={16} className="text-rose-600" />
      <p className="font-body text-sm text-rose-700">{state.error}</p>
    </div>
  );

  const quiz = state.quiz;
  if (!quiz) return null;

  // Don't show draft quizzes to students
  if (quiz.status !== 'published') return null;

  const completedAttempts = attempts.filter((a) => a.status === 'submitted');
  const bestAttempt = completedAttempts.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  const usedAttempts = completedAttempts.length;
  const canRetry = usedAttempts < quiz.max_attempts;
  const questions = (quiz.quiz_questions || []).sort((a, b) => a.position - b.position);

  // Review mode
  if (reviewMode && reviewData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-navy-900">Review: {quiz.title}</h3>
          <button type="button" onClick={() => setReviewMode(false)} className="btn-outline text-xs">
            Back to Quiz
          </button>
        </div>
        <AnswerReview quiz={quiz} attempt={reviewData} />
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div className="space-y-4">
        <ResultSummary
          result={result}
          quiz={quiz}
          onRetry={handleRetry}
          canRetry={canRetry}
          onReview={handleReview}
        />
      </div>
    );
  }

  // Pre-start screen
  if (!activeAttempt) {
    return (
      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
            <HelpCircle size={24} />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-navy-900">{quiz.title}</h3>
            <p className="font-body text-xs text-navy-400">
              {questions.length} questions · Pass {quiz.passing_score_percent}% · {quiz.max_attempts} attempts allowed
              {quiz.time_limit_minutes ? ` · ${quiz.time_limit_minutes} min limit` : ''}
            </p>
          </div>
        </div>

        {quiz.instructions && (
          <p className="mt-4 font-body text-sm text-navy-600">{quiz.instructions}</p>
        )}

        {bestAttempt && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-navy-50 px-4 py-3">
            <span className="font-body text-sm text-navy-700">
              Best score: {bestAttempt.score} / {bestAttempt.max_score} ({Math.round((bestAttempt.score / bestAttempt.max_score) * 100)}%)
            </span>
            {bestAttempt.passed && <CheckCircle2 size={15} className="text-emerald-600" />}
          </div>
        )}

        {usedAttempts > 0 && (
          <p className="mt-3 font-body text-xs text-navy-400">
            Attempts used: {usedAttempts} / {quiz.max_attempts}
          </p>
        )}

        {canRetry ? (
          <button type="button" onClick={handleStart} className="btn-gold mt-4 inline-flex items-center gap-2 text-sm">
            <Play size={15} /> {usedAttempts > 0 ? 'Start New Attempt' : 'Start Quiz'}
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3">
            <Lock size={15} className="text-rose-600" />
            <p className="font-body text-sm text-rose-700">No attempts remaining.</p>
          </div>
        )}
      </div>
    );
  }

  // Active attempt — question answering
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-navy-900">{quiz.title}</h3>
          <p className="font-body text-xs text-navy-400">
            Attempt {activeAttempt.attempt_number} of {quiz.max_attempts}
          </p>
        </div>
        {secondsLeft !== null && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-gold-500/10 px-3 py-2 font-body text-sm font-semibold text-gold-700">
            <Clock size={15} />
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {quiz.instructions && (
        <p className="font-body text-sm text-navy-600">{quiz.instructions}</p>
      )}

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl border border-navy-100 bg-white p-4">
            <p className="font-body text-sm font-semibold text-navy-900">
              {qi + 1}. {q.question_text}
              <span className="ml-2 font-normal text-navy-400">({q.marks} {q.marks !== 1 ? 'marks' : 'mark'})</span>
            </p>

            {(q.question_type === 'multiple_choice' || q.question_type === 'true_false') && (
              <div className="mt-3 space-y-2">
                {(q.quiz_question_options || []).sort((a, b) => a.position - b.position).map((o) => (
                  <label key={o.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-navy-50 px-3 py-2 font-body text-sm text-navy-700 hover:bg-navy-50/40">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id]?.selectedOptionIds?.[0] === o.id}
                      onChange={() => handleAnswerChange(q.id, { selectedOptionIds: [o.id] })}
                      className="h-4 w-4 text-gold-600 focus:ring-gold-500"
                    />
                    {o.option_text}
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'short_answer' && (
              <input
                type="text"
                value={answers[q.id]?.textAnswer || ''}
                onChange={(e) => handleAnswerChange(q.id, { textAnswer: e.target.value })}
                placeholder="Type your answer..."
                className="mt-3 w-full rounded-lg border border-navy-200 px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-60"
      >
        <CheckCircle2 size={16} /> {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
}
