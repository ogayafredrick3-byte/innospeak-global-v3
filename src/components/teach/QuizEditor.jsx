import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Save, CheckCircle2, AlertCircle, X,
  GripVertical, ArrowUp, ArrowDown, HelpCircle, ToggleLeft, ToggleRight,
  Pencil, Circle,
} from 'lucide-react';
import SectionCard from '../portal/SectionCard.jsx';
import {
  getLessonQuizForAdmin, createLessonQuiz, updateLessonQuiz, deleteLessonQuiz,
  createQuizQuestion, updateQuizQuestion, deleteQuizQuestion, saveQuizOptions,
} from '../../lib/supabase/lms';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
];

function QuestionEditor({ question, onSave, onCancel, quizId }) {
  const [form, setForm] = useState({
    question_type: question?.question_type || 'multiple_choice',
    question_text: question?.question_text || '',
    marks: question?.marks ?? 1,
    explanation: question?.explanation || '',
    correct_short_answer: question?.correct_short_answer || '',
  });
  const [options, setOptions] = useState(
    question?.quiz_question_options
      ? [...question.quiz_question_options].sort((a, b) => a.position - b.position)
      : [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function updateOption(idx, field, value) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, [field]: value } : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, { option_text: '', is_correct: false }]);
  }

  function removeOption(idx) {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function setCorrectOption(idx) {
    setOptions((prev) => prev.map((o, i) => ({ ...o, is_correct: i === idx })));
  }

  function toggleCorrectOption(idx) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, is_correct: !o.is_correct } : o)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.question_text.trim()) {
      setError('Question text is required.');
      return;
    }
    if (form.question_type === 'multiple_choice' && options.filter((o) => o.option_text.trim()).length < 2) {
      setError('Multiple choice questions need at least 2 options.');
      return;
    }
    if (form.question_type === 'multiple_choice' && !options.some((o) => o.is_correct)) {
      setError('Select at least one correct answer.');
      return;
    }
    if (form.question_type === 'true_false' && !options.some((o) => o.is_correct)) {
      setError('Select the correct answer (True or False).');
      return;
    }
    if (form.question_type === 'short_answer' && !form.correct_short_answer.trim()) {
      setError('Provide the expected answer for short answer questions.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form, options);
    } catch (err) {
      setError(err.message || 'Could not save question.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-navy-100 bg-cream/40 p-5">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm font-bold text-navy-900">
          {question ? 'Edit Question' : 'New Question'}
        </p>
        <button type="button" onClick={onCancel} className="text-navy-400 hover:text-rose-500"><X size={16} /></button>
      </div>

      <div>
        <label className="font-body text-sm font-bold text-navy-900">Question Type</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUESTION_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                update('question_type', t.value);
                if (t.value === 'true_false') {
                  setOptions([
                    { option_text: 'True', is_correct: true },
                    { option_text: 'False', is_correct: false },
                  ]);
                } else if (t.value === 'short_answer') {
                  setOptions([]);
                } else {
                  setOptions([
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                  ]);
                }
              }}
              className={`rounded-lg px-3 py-2 font-body text-xs font-semibold transition-colors ${
                form.question_type === t.value
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-white text-navy-600 hover:bg-navy-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-body text-sm font-bold text-navy-900">Question Text</label>
        <textarea
          value={form.question_text}
          onChange={(e) => update('question_text', e.target.value)}
          rows={2}
          placeholder="Enter your question..."
          className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="font-body text-sm font-bold text-navy-900">Marks</label>
          <input
            type="number"
            min="1"
            max="100"
            value={form.marks}
            onChange={(e) => update('marks', parseInt(e.target.value) || 1)}
            className="mt-2 w-20 rounded-xl border border-navy-100 bg-white px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
      </div>

      {(form.question_type === 'multiple_choice' || form.question_type === 'true_false') && (
        <div>
          <label className="font-body text-sm font-bold text-navy-900">Answer Options</label>
          <p className="mt-0.5 font-body text-xs text-navy-400">
            {form.question_type === 'true_false'
              ? 'Select the correct answer.'
              : 'Click the circle to mark correct answer(s).'}
          </p>
          <div className="mt-2 space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => form.question_type === 'true_false' ? setCorrectOption(idx) : toggleCorrectOption(idx)}
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    opt.is_correct
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-navy-200 bg-white text-transparent hover:border-emerald-400'
                  }`}
                >
                  <CheckCircle2 size={14} />
                </button>
                <input
                  type="text"
                  value={opt.option_text}
                  onChange={(e) => updateOption(idx, 'option_text', e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  disabled={form.question_type === 'true_false'}
                  className="flex-1 rounded-lg border border-navy-100 bg-white px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none disabled:bg-navy-50 disabled:text-navy-500"
                />
                {form.question_type === 'multiple_choice' && options.length > 2 && (
                  <button type="button" onClick={() => removeOption(idx)} className="text-navy-400 hover:text-rose-500">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {form.question_type === 'multiple_choice' && (
              <button type="button" onClick={addOption} className="font-body text-sm font-semibold text-gold-700 hover:text-gold-800">
                <Plus size={14} className="mr-1 inline" />Add option
              </button>
            )}
          </div>
        </div>
      )}

      {form.question_type === 'short_answer' && (
        <div>
          <label className="font-body text-sm font-bold text-navy-900">Expected Answer</label>
          <input
            type="text"
            value={form.correct_short_answer}
            onChange={(e) => update('correct_short_answer', e.target.value)}
            placeholder="The answer students must type (case-insensitive)"
            className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
      )}

      <div>
        <label className="font-body text-sm font-bold text-navy-900">Explanation / Feedback (optional)</label>
        <textarea
          value={form.explanation}
          onChange={(e) => update('explanation', e.target.value)}
          rows={2}
          placeholder="Shown to students after they submit, explaining why the answer is correct"
          className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5">
          <AlertCircle size={15} className="text-rose-600" />
          <p className="font-body text-sm text-rose-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-60">
          <Save size={15} /> {saving ? 'Saving...' : 'Save Question'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm">Cancel</button>
      </div>
    </form>
  );
}

export default function QuizEditor({ lessonId }) {
  const [state, setState] = useState({ loading: true, error: null, quiz: null });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [quizConfigOpen, setQuizConfigOpen] = useState(false);
  const [configForm, setConfigForm] = useState({
    title: '',
    instructions: '',
    passing_score_percent: 70,
    max_attempts: 3,
    time_limit_minutes: '',
    require_pass_to_complete: false,
    status: 'draft',
  });
  const [configError, setConfigError] = useState(null);

  const load = useCallback(async () => {
    try {
      const quiz = await getLessonQuizForAdmin(lessonId);
      setState({ loading: false, error: null, quiz });
      if (quiz) {
        setConfigForm({
          title: quiz.title || '',
          instructions: quiz.instructions || '',
          passing_score_percent: quiz.passing_score_percent ?? 70,
          max_attempts: quiz.max_attempts ?? 3,
          time_limit_minutes: quiz.time_limit_minutes || '',
          require_pass_to_complete: quiz.require_pass_to_complete || false,
          status: quiz.status || 'draft',
        });
      }
    } catch (err) {
      setState({ loading: false, error: err.message || 'Could not load quiz.', quiz: null });
    }
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreateQuiz() {
    setSaving(true);
    setConfigError(null);
    try {
      await createLessonQuiz(lessonId, {
        title: 'Knowledge Check',
        instructions: '',
        passing_score_percent: 70,
        max_attempts: 3,
        status: 'draft',
      });
      await load();
    } catch (err) {
      setConfigError(err.message || 'Could not create quiz.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveConfig() {
    setSaving(true);
    setConfigError(null);
    try {
      await updateLessonQuiz(state.quiz.id, {
        title: configForm.title.trim() || 'Knowledge Check',
        instructions: configForm.instructions,
        passing_score_percent: parseInt(configForm.passing_score_percent) || 70,
        max_attempts: parseInt(configForm.max_attempts) || 3,
        time_limit_minutes: configForm.time_limit_minutes ? parseInt(configForm.time_limit_minutes) : null,
        require_pass_to_complete: configForm.require_pass_to_complete,
      });
      await load();
      setQuizConfigOpen(false);
    } catch (err) {
      setConfigError(err.message || 'Could not save quiz settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishQuiz() {
    setSaving(true);
    setConfigError(null);
    try {
      await updateLessonQuiz(state.quiz.id, { status: 'published' });
      await load();
    } catch (err) {
      setConfigError(err.message || 'Could not publish quiz.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublishQuiz() {
    setSaving(true);
    setConfigError(null);
    try {
      await updateLessonQuiz(state.quiz.id, { status: 'draft' });
      await load();
    } catch (err) {
      setConfigError(err.message || 'Could not unpublish quiz.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuiz() {
    if (!confirm('Delete this quiz and all its questions? This cannot be undone.')) return;
    setSaving(true);
    try {
      await deleteLessonQuiz(state.quiz.id);
      await load();
    } catch (err) {
      setConfigError(err.message || 'Could not delete quiz.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveQuestion(form, options) {
    const cleanOptions = options
      .filter((o) => o.option_text.trim())
      .map((o) => ({ option_text: o.option_text.trim(), is_correct: !!o.is_correct }));

    if (editingQuestion) {
      await updateQuizQuestion(editingQuestion.id, {
        question_type: form.question_type,
        question_text: form.question_text.trim(),
        marks: form.marks,
        explanation: form.explanation || null,
        correct_short_answer: form.question_type === 'short_answer' ? form.correct_short_answer.trim() : null,
      });
      await saveQuizOptions(editingQuestion.id, cleanOptions);
    } else {
      await createQuizQuestion(state.quiz.id, {
        question_type: form.question_type,
        question_text: form.question_text.trim(),
        marks: form.marks,
        explanation: form.explanation || null,
        correct_short_answer: form.question_type === 'short_answer' ? form.correct_short_answer.trim() : null,
        position: (state.quiz.quiz_questions || []).length,
      }, cleanOptions);
    }
    setShowQuestionForm(false);
    setEditingQuestion(null);
    await load();
  }

  async function handleDeleteQuestion(questionId) {
    if (!confirm('Delete this question?')) return;
    try {
      await deleteQuizQuestion(questionId);
      await load();
    } catch (err) {
      setConfigError(err.message || 'Could not delete question.');
    }
  }

  async function handleMoveQuestion(idx, direction) {
    const questions = [...(state.quiz.quiz_questions || [])].sort((a, b) => a.position - b.position);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= questions.length) return;
    const tmp = questions[idx];
    questions[idx] = questions[swapIdx];
    questions[swapIdx] = tmp;
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].position !== i) {
        await updateQuizQuestion(questions[i].id, { position: i }).catch(() => {});
      }
    }
    await load();
  }

  if (state.loading) return null;
  if (state.error) return (
    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
      <AlertCircle size={16} className="text-rose-600" />
      <p className="font-body text-sm text-rose-700">{state.error}</p>
    </div>
  );

  const quiz = state.quiz;

  if (!quiz) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-700">
          <HelpCircle size={26} />
        </span>
        <div>
          <p className="font-body text-sm font-bold text-navy-900">No quiz attached to this lesson</p>
          <p className="mt-1 font-body text-xs text-navy-400">Add a knowledge check or quiz to test student understanding.</p>
        </div>
        <button type="button" onClick={handleCreateQuiz} disabled={saving} className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-60">
          <Plus size={15} /> Create Quiz
        </button>
      </div>
    );
  }

  const sortedQuestions = [...(quiz.quiz_questions || [])].sort((a, b) => a.position - b.position);
  const isPublished = quiz.status === 'published';

  return (
    <div className="space-y-4">
      {/* Quiz header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 font-body text-xs font-semibold ${
              isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
            <span className="font-body text-xs text-navy-400">
              {sortedQuestions.length} questions · Pass {quiz.passing_score_percent}% · Max {quiz.max_attempts} attempts
            </span>
          </div>
          <h3 className="mt-1 font-display text-base font-bold text-navy-900">{quiz.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setQuizConfigOpen((v) => !v)} className="btn-outline text-xs">
            Settings
          </button>
          {isPublished ? (
            <button type="button" onClick={handleUnpublishQuiz} disabled={saving} className="btn-outline text-xs disabled:opacity-60">
              Unpublish
            </button>
          ) : (
            <button type="button" onClick={handlePublishQuiz} disabled={saving || sortedQuestions.length === 0} className="btn-gold text-xs disabled:opacity-60">
              Publish Quiz
            </button>
          )}
          <button type="button" onClick={handleDeleteQuiz} disabled={saving} className="rounded-lg px-3 py-2 font-body text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Config panel */}
      <AnimatePresence>
        {quizConfigOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 rounded-2xl border border-navy-100 bg-cream/40 p-5">
              <div>
                <label className="font-body text-sm font-bold text-navy-900">Quiz Title</label>
                <input
                  type="text"
                  value={configForm.title}
                  onChange={(e) => setConfigForm((p) => ({ ...p, title: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-body text-sm font-bold text-navy-900">Instructions (optional)</label>
                <textarea
                  value={configForm.instructions}
                  onChange={(e) => setConfigForm((p) => ({ ...p, instructions: e.target.value }))}
                  rows={2}
                  placeholder="Instructions shown to students before starting..."
                  className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <label className="font-body text-sm font-bold text-navy-900">Pass Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={configForm.passing_score_percent}
                    onChange={(e) => setConfigForm((p) => ({ ...p, passing_score_percent: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-bold text-navy-900">Max Attempts</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={configForm.max_attempts}
                    onChange={(e) => setConfigForm((p) => ({ ...p, max_attempts: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-bold text-navy-900">Time Limit (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={configForm.time_limit_minutes}
                    onChange={(e) => setConfigForm((p) => ({ ...p, time_limit_minutes: e.target.value }))}
                    placeholder="None"
                    className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-3 py-2 font-body text-sm text-navy-900 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfigForm((p) => ({ ...p, require_pass_to_complete: !p.require_pass_to_complete }))}
                  className={configForm.require_pass_to_complete ? 'text-gold-600' : 'text-navy-300'}
                >
                  {configForm.require_pass_to_complete ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
                <div>
                  <p className="font-body text-sm font-semibold text-navy-900">Require passing quiz to complete lesson</p>
                  <p className="font-body text-xs text-navy-400">Students must pass this quiz before they can mark the lesson complete.</p>
                </div>
              </label>
              {configError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5">
                  <AlertCircle size={15} className="text-rose-600" />
                  <p className="font-body text-sm text-rose-700">{configError}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={handleSaveConfig} disabled={saving} className="btn-gold text-sm disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                <button type="button" onClick={() => setQuizConfigOpen(false)} className="btn-outline text-sm">Close</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions list */}
      <div className="space-y-3">
        {sortedQuestions.map((q, idx) => (
          <div key={q.id} className="rounded-xl border border-navy-100 bg-white p-4">
            <div className="flex items-start gap-3">
              <GripVertical size={14} className="mt-1 text-navy-300" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-navy-900 font-body text-xs font-bold text-gold-400">
                    {idx + 1}
                  </span>
                  <span className="rounded-md bg-navy-50 px-2 py-0.5 font-body text-xs font-semibold text-navy-500">
                    {QUESTION_TYPES.find((t) => t.value === q.question_type)?.label || q.question_type}
                  </span>
                  <span className="font-body text-xs text-navy-400">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                </div>
                <p className="mt-2 font-body text-sm font-semibold text-navy-900">{q.question_text}</p>
                {q.quiz_question_options && q.quiz_question_options.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {q.quiz_question_options.sort((a, b) => a.position - b.position).map((o) => (
                      <li key={o.id} className="flex items-center gap-2 font-body text-xs">
                        {o.is_correct ? (
                          <CheckCircle2 size={13} className="text-emerald-600" />
                        ) : (
                          <Circle size={13} className="text-navy-200" />
                        )}
                        <span className={o.is_correct ? 'font-semibold text-emerald-700' : 'text-navy-500'}>
                          {o.option_text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {q.question_type === 'short_answer' && q.correct_short_answer && (
                  <p className="mt-1 font-body text-xs text-emerald-700">Answer: {q.correct_short_answer}</p>
                )}
                {q.explanation && (
                  <p className="mt-2 rounded-lg bg-gold-50 px-3 py-1.5 font-body text-xs text-gold-800">
                    {q.explanation}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" disabled={idx === 0} onClick={() => handleMoveQuestion(idx, 'up')} className="text-navy-400 hover:text-gold-600 disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button type="button" disabled={idx === sortedQuestions.length - 1} onClick={() => handleMoveQuestion(idx, 'down')} className="text-navy-400 hover:text-gold-600 disabled:opacity-30">
                  <ArrowDown size={14} />
                </button>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => { setEditingQuestion(q); setShowQuestionForm(true); }} className="text-navy-400 hover:text-gold-600">
                  <Pencil size={14} />
                </button>
                <button type="button" onClick={() => handleDeleteQuestion(q.id)} className="text-navy-400 hover:text-rose-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sortedQuestions.length === 0 && !showQuestionForm && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="font-body text-sm text-navy-400">No questions yet. Add your first question.</p>
          </div>
        )}

        <AnimatePresence>
          {showQuestionForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <QuestionEditor
                question={editingQuestion}
                quizId={quiz.id}
                onSave={handleSaveQuestion}
                onCancel={() => { setShowQuestionForm(false); setEditingQuestion(null); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!showQuestionForm && (
          <button type="button" onClick={() => { setEditingQuestion(null); setShowQuestionForm(true); }} className="btn-outline inline-flex items-center gap-2 text-sm">
            <Plus size={15} /> Add Question
          </button>
        )}
      </div>
    </div>
  );
}
