/**
 * CompassAssistButton — AI drafting assist for instructors.
 *
 * The tutor describes what they want ("a lesson on Python loops for beginners"),
 * Compass drafts lesson content using the linked course's pathway + level as
 * context, and the tutor can insert it (or copy it) into the rich-text editor.
 *
 * Uses the same tutorApi as the student-facing Compass. Non-streaming — the
 * draft appears in one block, which is easier to review than streaming.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, ArrowRight, Copy, Loader2, Sparkles, Wand2, X, Check,
} from 'lucide-react';
import { askTutor } from '../../lib/tutor/tutorApi';
import { cn } from '../../utils/cn.js';

const MODE_OPTIONS = [
  { value: 'lesson_body',    label: 'Lesson body',       hint: 'Full lesson content with headings and examples' },
  { value: 'objectives',     label: 'Learning objectives', hint: '3-5 clear, action-verb objectives' },
  { value: 'practical',      label: 'Practical activity', hint: 'A hands-on exercise students can complete' },
  { value: 'quiz_ideas',     label: 'Quiz question ideas', hint: '5 questions with answers, ready to adapt' },
];

function buildPrompt(mode, { course, lessonTitle, lessonObjectives, tutorPrompt }) {
  const ctx = [];
  if (course?.title) ctx.push(`Course: ${course.title}${course.code ? ` (${course.code})` : ''}`);
  if (course?.pathway) ctx.push(`Pathway: ${course.pathway}`);
  if (course?.level) ctx.push(`Level: ${course.level}`);
  if (lessonTitle) ctx.push(`Lesson: ${lessonTitle}`);
  if (lessonObjectives?.length > 0) {
    ctx.push('Existing objectives:\n' + lessonObjectives.map((o) => `- ${o}`).join('\n'));
  }

  const modeInstructions = {
    lesson_body:
      "Write the body content for this lesson. Use H2 headings, short paragraphs, and bullet lists. " +
      "Aim for 400-600 words. Include concrete examples and reference real tools/scenarios where relevant. " +
      "Do not include a title — the tutor will add that. Output plain text with markdown-style formatting " +
      "(## for headings, - for bullets, **bold** for emphasis).",
    objectives:
      "Write 3-5 learning objectives for this lesson. Each objective must start with an action verb " +
      "(Define, Explain, Build, Analyse, Apply, Evaluate) and be specific and measurable. " +
      "Output one objective per line, no numbering, no bullets.",
    practical:
      "Design one hands-on practical activity for this lesson. Include: the goal, the steps (numbered), " +
      "what students should submit or show, and roughly how long it should take. " +
      "Output plain text with markdown-style formatting.",
    quiz_ideas:
      "Suggest 5 quiz questions for this lesson. Mix multiple-choice and short-answer. " +
      "For each, write the question, then the answer on the next line prefixed with 'Answer: '. " +
      "Output plain text, no JSON.",
  };

  return [
    `You are drafting content for an InnoSpeak Global course.`,
    ctx.join('\n'),
    tutorPrompt ? `\nThe tutor asked: ${tutorPrompt}` : '',
    `\nTask:\n${modeInstructions[mode]}`,
    `\nOutput ONLY the draft content — no preamble, no "Here is...", no closing remarks.`,
  ].filter(Boolean).join('\n');
}

export default function CompassAssistButton({
  course,
  lessonTitle,
  lessonObjectives = [],
  onInsert,
  variant = 'default',
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('lesson_body');
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleDraft() {
    setLoading(true);
    setError('');
    setDraft('');
    try {
      const prompt = buildPrompt(mode, { course, lessonTitle, lessonObjectives, tutorPrompt });
      const reply = await askTutor({
        personaId: 'tutor',
        messages: [{ role: 'user', content: prompt }],
        context: null,
      });
      setDraft(reply);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[CompassAssist] draft failed:', err);
      setError(
        err?.message?.includes('Supabase') || err?.message?.includes('unavailable')
          ? 'Compass drafting is unavailable right now.'
          : 'Could not draft content. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleInsert() {
    if (!draft.trim()) return;
    onInsert?.(draft, mode);
    setOpen(false);
    setDraft('');
    setTutorPrompt('');
  }

  function handleCopy() {
    navigator.clipboard.writeText(draft).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleClose() {
    setOpen(false);
    setDraft('');
    setError('');
    setTutorPrompt('');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border font-body text-sm font-bold transition-all duration-200',
          variant === 'primary'
            ? 'border-gold-400 bg-gold-gradient text-navy-900 shadow-gold hover:shadow-premium-lg'
            : 'border-gold-200 bg-gold-50/60 text-gold-800 hover:bg-gold-100/60'
        )}
      >
        <Wand2 size={14} />
        Draft with Compass
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative my-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-premium-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-navy-100 bg-gradient-to-br from-navy-900 to-navy-800 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-500/20 text-gold-300">
                    <Sparkles size={15} />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-white">Draft with Compass</p>
                    <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-navy-300">
                      AI lesson drafting
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto p-5">
                {/* Context strip */}
                <div className="rounded-xl border border-navy-100 bg-cream/40 px-4 py-3">
                  <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                    Compass will use
                  </p>
                  <ul className="mt-1.5 space-y-0.5 font-body text-xs text-navy-700">
                    {course?.title && (
                      <li>
                        <span className="font-semibold">Course:</span> {course.title}
                        {course.code && <span className="font-mono text-gold-700"> · {course.code}</span>}
                      </li>
                    )}
                    {course?.pathway && <li><span className="font-semibold">Pathway:</span> {course.pathway}</li>}
                    {course?.level && <li><span className="font-semibold">Level:</span> {course.level}</li>}
                    {lessonTitle && <li><span className="font-semibold">Lesson:</span> {lessonTitle}</li>}
                    {lessonObjectives?.length > 0 && (
                      <li><span className="font-semibold">Objectives:</span> {lessonObjectives.length} provided</li>
                    )}
                  </ul>
                </div>

                {/* Mode picker */}
                <div>
                  <label className="font-body text-sm font-bold text-navy-900">What to draft</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {MODE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMode(opt.value)}
                        className={cn(
                          'rounded-xl border px-3 py-2.5 text-left transition-all',
                          mode === opt.value
                            ? 'border-gold-400 bg-gold-50 ring-1 ring-gold-300'
                            : 'border-navy-100 bg-white hover:border-gold-300'
                        )}
                      >
                        <p className={cn(
                          'font-body text-xs font-bold',
                          mode === opt.value ? 'text-gold-800' : 'text-navy-900'
                        )}>
                          {opt.label}
                        </p>
                        <p className="mt-0.5 font-body text-[10px] leading-4 text-navy-500">
                          {opt.hint}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional tutor prompt */}
                <div>
                  <label className="font-body text-sm font-bold text-navy-900">
                    Anything specific? <span className="font-normal text-navy-400">(optional)</span>
                  </label>
                  <textarea
                    value={tutorPrompt}
                    onChange={(e) => setTutorPrompt(e.target.value)}
                    rows={2}
                    placeholder="e.g. Focus on real-world applications in Kenya"
                    className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-3 py-2.5 font-body text-sm text-navy-900 placeholder:text-navy-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                  />
                </div>

                {/* Draft button */}
                {!draft && (
                  <button
                    type="button"
                    onClick={handleDraft}
                    disabled={loading}
                    className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Compass is drafting…
                      </>
                    ) : (
                      <>
                        <Wand2 size={15} />
                        Draft with Compass
                      </>
                    )}
                  </button>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
                    <p className="font-body text-sm text-rose-700">{error}</p>
                  </div>
                )}

                {/* Draft output */}
                {draft && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="font-body text-sm font-bold text-navy-900">
                        Draft — review before inserting
                      </label>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 font-body text-xs font-bold text-navy-500 hover:text-gold-700"
                      >
                        {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-navy-100 bg-cream/40 p-4">
                      <pre className="whitespace-pre-wrap font-body text-sm leading-6 text-navy-800">
                        {draft}
                      </pre>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleInsert}
                        className="btn-gold inline-flex items-center gap-2 text-sm"
                      >
                        <ArrowRight size={14} />
                        Insert into lesson
                      </button>
                      <button
                        type="button"
                        onClick={handleDraft}
                        disabled={loading}
                        className="btn-outline inline-flex items-center gap-2 text-sm disabled:opacity-60"
                      >
                        {loading ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                        Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}