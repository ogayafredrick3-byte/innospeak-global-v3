import { motion } from 'framer-motion';
import { ArrowRight, History } from 'lucide-react';
import { PERSONA_ACCENTS } from '../../lib/tutor/tutorPersonas';
import { cn } from '../../utils/cn.js';

export default function TutorGreeting({
  greeting,
  name,
  isReturning,
  persona,
  onStarterClick,
  compact = false,
  recentTopics = [],
}) {
  const accent = PERSONA_ACCENTS[persona.accent] || PERSONA_ACCENTS.gold;

  const headline = name
    ? isReturning
      ? `${greeting}, ${name}.`
      : `${greeting}, ${name}. Welcome.`
    : `${greeting}.`;

  const showTopics = isReturning && recentTopics.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn('mx-auto max-w-xl', compact ? 'py-6 text-center' : 'py-10')}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider ring-1',
          accent.bg,
          accent.text,
          accent.ring
        )}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', accent.dot)} aria-hidden="true" />
        {persona.label} mode
      </span>

      <h2
        className={cn(
          'mt-4 font-display font-bold leading-tight text-navy-900',
          compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
        )}
      >
        {headline}
      </h2>

      <p
        className={cn(
          'mx-auto mt-2 max-w-md font-body leading-6 text-navy-500',
          compact ? 'text-xs' : 'text-sm'
        )}
      >
        {persona.greeting}
      </p>

      {/* "Where we left off" — recent topics */}
      {showTopics && !compact && (
        <div className="mx-auto mt-5 max-w-md rounded-xl border border-navy-100 bg-white p-3 text-left shadow-sm">
          <div className="flex items-center gap-1.5">
            <History size={11} className="text-navy-400" />
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
              Where we left off
            </p>
          </div>
          <ul className="mt-2 space-y-1.5">
            {recentTopics.slice(0, 3).map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-navy-300" />
                <button
                  type="button"
                  onClick={() => onStarterClick(`Continue where we left off: ${t.text}`)}
                  className="min-w-0 flex-1 truncate text-left font-body text-xs text-navy-600 transition-colors hover:text-gold-700"
                >
                  {t.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Starter prompts */}
      <div className={cn('mx-auto mt-6 flex max-w-md flex-col gap-2', compact && 'mt-4 gap-1.5')}>
        {persona.starterPrompts.map((prompt, i) => (
          <motion.button
            key={prompt}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
            onClick={() => onStarterClick(prompt)}
            className={cn(
              'group flex items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white text-left shadow-premium transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-premium-lg',
              compact ? 'px-3.5 py-2' : 'px-4 py-2.5'
            )}
          >
            <span
              className={cn(
                'font-body text-navy-700 group-hover:text-navy-900',
                compact ? 'text-xs' : 'text-sm'
              )}
            >
              {prompt}
            </span>
            <ArrowRight
              size={compact ? 12 : 14}
              className="shrink-0 text-navy-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gold-600"
              aria-hidden="true"
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}