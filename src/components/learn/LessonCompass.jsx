import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Lightbulb, Loader2, RefreshCw, Send, Sparkles, Target,
} from 'lucide-react';
import { askTutor } from '../../lib/tutor/tutorApi';
import { cn } from '../../utils/cn.js';

/**
 * LessonCompass — a lesson-aware mini AI, docked beside the lesson content.
 *
 * Different from the main /tutor workspace:
 *   - Scoped to the current lesson only (title, objectives, description).
 *   - Short conversation history (last 6 turns), never persists.
 *   - Prompts tuned to the four things learners ask about a lesson:
 *     explain simply, give an example, quiz me, real-world use.
 *
 * Non-streaming by design — short answers, feels instant, no layout shift.
 */

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: 'Explain this more simply', text: 'Explain this lesson to me in simpler language, as if I know nothing about the topic yet.' },
  { icon: Target,    label: 'Give me a real example',   text: 'Give me a concrete, real-world example that illustrates the main idea of this lesson.' },
  { icon: Sparkles,  label: 'Quiz me on this',          text: 'Ask me three short questions to test whether I understood this lesson. Wait for my answers.' },
  { icon: ArrowRight, label: 'Why does this matter?',   text: 'Why does this lesson matter in practice? Where would I actually use this?' },
];

const MAX_TURNS = 6;

function buildLessonContext(lesson, course, courseCode) {
  const parts = [];
  if (course?.title) parts.push(`Course: ${course.title}${courseCode ? ` (${courseCode})` : ''}`);
  if (lesson?.title) parts.push(`Lesson: ${lesson.title}`);
  if (lesson?.description) parts.push(`Lesson description: ${lesson.description}`);
  if (lesson?.learning_objectives?.length) {
    parts.push('Learning objectives:\n' + lesson.learning_objectives.map((o) => `- ${o}`).join('\n'));
  }
  if (lesson?.content) {
    const stripped = String(lesson.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    parts.push(`Lesson content (excerpt): ${stripped.slice(0, 1200)}`);
  }
  return parts.join('\n\n');
}

export default function LessonCompass({ lesson, course, courseCode, onClose }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  // Reset conversation when the lesson changes
  useEffect(() => {
    setMessages([]);
    setDraft('');
    setError('');
  }, [lesson?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = String(text || '').trim();
      if (!trimmed || sending) return;

      const userMessage = { role: 'user', content: trimmed };
      const next = [...messages, userMessage].slice(-MAX_TURNS * 2);
      setMessages(next);
      setDraft('');
      setError('');
      setSending(true);

      try {
        const lessonContext = buildLessonContext(lesson, course, courseCode);
        const reply = await askTutor({
          personaId: 'study',
          messages: next.map(({ role, content }) => ({ role, content })),
          context: { learner: lessonContext },
        });
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }].slice(-MAX_TURNS * 2));
      } catch (err) {
        setError(err?.message || 'Could not get a reply. Please try again.');
      } finally {
        setSending(false);
      }
    },
    [messages, sending, lesson, course, courseCode]
  );

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(draft);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-premium">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-navy-100 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700 ring-1 ring-gold-500/20">
            <Sparkles size={15} />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-navy-900">Ask about this lesson</p>
            <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-navy-400">
              Compass · lesson-scoped
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => { setMessages([]); setError(''); }}
            aria-label="Clear lesson conversation"
            title="Clear"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
          >
            <RefreshCw size={13} />
          </button>
        )}
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {isEmpty && (
          <>
            <p className="font-body text-xs leading-5 text-navy-500">
              Get help with <span className="font-semibold text-navy-800">{lesson?.title || 'this lesson'}</span>.
              Try one of these:
            </p>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map(({ icon: Icon, label, text }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => sendMessage(text)}
                  disabled={sending}
                  className="group flex w-full items-center gap-2.5 rounded-xl border border-navy-100 bg-cream/40 px-3 py-2.5 text-left transition-all hover:border-gold-300 hover:bg-gold-50/60 disabled:opacity-50"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
                    <Icon size={13} />
                  </span>
                  <span className="min-w-0 flex-1 font-body text-xs font-semibold text-navy-800">
                    {label}
                  </span>
                  <ArrowRight
                    size={11}
                    className="shrink-0 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600"
                  />
                </button>
              ))}
            </div>
          </>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[92%] rounded-2xl px-3.5 py-2.5 font-body text-xs leading-5',
                  isUser
                    ? 'rounded-br-md bg-navy-900 text-white'
                    : 'rounded-bl-md border border-navy-100 bg-cream text-navy-800'
                )}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </motion.div>
          );
        })}

        {sending && (
          <div className="flex items-center gap-2 px-1 font-body text-xs text-navy-400">
            <Loader2 size={13} className="animate-spin" />
            Thinking…
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-body text-xs text-rose-700">
            {error}
          </p>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-navy-100 bg-white/80 p-3 backdrop-blur"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask anything about this lesson…"
          disabled={sending}
          className="flex-1 rounded-xl border border-navy-100 bg-white px-3 py-2 font-body text-xs text-navy-900 placeholder:text-navy-300 transition-colors focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900 shadow-gold transition-opacity disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}