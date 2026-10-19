import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState } from '../../components/portal/PortalStates.jsx';
import {
  getQuizForStudent,
  listMyQuizAttempts,
  startQuizAttempt,
  saveQuizAnswer,
  submitQuizAttempt,
} from '../../lib/supabase/lms';

export default function QuizAttempt() {
  const { quizId } = useParams();
  const [state, setState] = useState({ loading: true, error: null, quiz: null, attempts: [], activeAttempt: null });
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const submittingRef = useRef(false);

  const load = useCallback(() => {
    Promise.all([getQuizForStudent(quizId), listMyQuizAttempts(quizId)])
      .then(([quiz, attempts]) => {
        const active = attempts.find((a) => a.status === 'in_progress') || null;
        setState({ loading: false, error: null, quiz, attempts, activeAttempt: active });
        if (active && quiz.time_limit_minutes) {
          const elapsedSec = (Date.now() - new Date(active.started_at).getTime()) / 1000;
          const remaining = Math.max(0, quiz.time_limit_minutes * 60 - elapsedSec);
          setSecondsLeft(Math.round(remaining));
        }
      })
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load this quiz.', quiz: null, attempts: [], activeAttempt: null }));
  }, [quizId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || !state.activeAttempt) return;
    submittingRef.current = true;
    try {
      const res = await submitQuizAttempt(state.activeAttempt.id);
      setResult(res);
      load();
    } finally {
      submittingRef.current = false;
    }
  }, [state.activeAttempt, load]);

  useEffect(() => {
    if (secondsLeft === null || result) return undefined;
    if (secondsLeft <= 0) { handleSubmit(); return undefined; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, result, handleSubmit]);

  async function handleStart() {
    const attemptNumber = state.attempts.length + 1;
    await startQuizAttempt(quizId, attemptNumber);
    load();
  }

  async function handleAnswerChange(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (state.activeAttempt) {
      await saveQuizAnswer(state.activeAttempt.id, questionId, value).catch(() => {});
    }
  }

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  const { quiz, attempts, activeAttempt } = state;
  const bestAttempt = attempts.filter((a) => a.status !== 'in_progress').sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  const questions = (quiz.quiz_questions || []).sort((a, b) => a.position - b.position);

  return (
    <>
      <Seo title={quiz.title} description="Quiz." path={`/learn/quizzes/${quizId}`} />

      <Link to="/learn" className="font-body text-sm font-semibold text-navy-500 hover:text-navy-800">
        ← Back to My Learning
      </Link>

      <SectionCard title={quiz.title} description={quiz.instructions} className="mt-4">
        <div className="flex flex-wrap gap-4 font-body text-xs text-navy-500">
          <span>Attempts: {attempts.filter((a) => a.status !== 'in_progress').length} / {quiz.max_attempts}</span>
          <span>Passing score: {quiz.passing_score_percent}%</span>
          {quiz.time_limit_minutes && <span>Time limit: {quiz.time_limit_minutes} min</span>}
        </div>

        {result && (
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3">
            <p className="font-body text-sm font-semibold text-emerald-800">
              <CheckCircle2 size={15} className="mr-1 inline" />
              Submitted — score {result.score} / {result.max_score} ({result.percent}%)
            </p>
          </div>
        )}

        {!activeAttempt && !result && bestAttempt && (
          <div className="mt-4 rounded-xl bg-navy-50 px-4 py-3">
            <p className="font-body text-sm text-navy-800">
              Last attempt: {bestAttempt.score} / {bestAttempt.max_score} — {bestAttempt.passed ? 'Passed' : 'Not passed'}
            </p>
          </div>
        )}

        {!activeAttempt && !result && attempts.filter((a) => a.status !== 'in_progress').length < quiz.max_attempts && (
          <button type="button" onClick={handleStart} className="btn-gold mt-4">
            {attempts.length > 0 ? 'Start New Attempt' : 'Start Quiz'}
          </button>
        )}

        {activeAttempt && !result && (
          <>
            {secondsLeft !== null && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold-500/10 px-4 py-2 font-body text-sm font-semibold text-gold-700">
                <Clock size={15} />
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')} remaining
              </div>
            )}

            <div className="mt-6 space-y-6">
              {questions.map((q, i) => (
                <div key={q.id} className="border-b border-navy-100 pb-6">
                  <p className="font-body text-sm font-semibold text-navy-900">{i + 1}. {q.question_text} <span className="font-normal text-navy-400">({q.marks} marks)</span></p>

                  {(q.question_type === 'multiple_choice' || q.question_type === 'true_false') && (
                    <div className="mt-3 space-y-2">
                      {(q.quiz_question_options || []).sort((a, b) => a.position - b.position).map((o) => (
                        <label key={o.id} className="flex items-center gap-2 font-body text-sm text-navy-700">
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={answers[q.id]?.selectedOptionIds?.[0] === o.id}
                            onChange={() => handleAnswerChange(q.id, { selectedOptionIds: [o.id] })}
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
                      className="mt-3 w-full rounded-lg border border-navy-200 px-3 py-2 font-body text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <button type="button" onClick={handleSubmit} className="btn-gold mt-4">
              Submit Quiz
            </button>
          </>
        )}
      </SectionCard>
    </>
  );
}
