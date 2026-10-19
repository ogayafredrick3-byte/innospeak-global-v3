import { motion } from 'framer-motion';
import { MapPin, BookOpen } from 'lucide-react';

const ACCENTS = {
  gold: {
    ring: 'ring-gold-500/30',
    badge: 'bg-gold-gradient text-navy-900',
    dot: 'bg-gold-500',
  },
  navy: {
    ring: 'ring-navy-300/40',
    badge: 'bg-navy-900 text-gold-400',
    dot: 'bg-navy-700',
  },
  emerald: {
    ring: 'ring-emerald-400/40',
    badge: 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white',
    dot: 'bg-emerald-600',
  },
};

function initialsOf(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function LearnerProfileCard({ learner, index = 0 }) {
  const accent = ACCENTS[learner.accent] || ACCENTS.navy;
  const initials = initialsOf(learner.name);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-premium-lg"
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-2 ${accent.ring} ${accent.badge} font-display text-lg font-bold tracking-wide`}
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-navy-900">
            {learner.name}
          </h3>
          <p className="mt-0.5 inline-flex items-center gap-1 font-body text-xs text-navy-500">
            <MapPin size={11} />
            {learner.country}
          </p>
        </div>
      </div>

      {/* Story */}
      <p className="mt-4 flex-1 font-body text-sm leading-6 text-navy-600">
        {learner.story}
      </p>

      {/* Program chips */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
        {learner.programs.map((p) => (
          <span
            key={p}
            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 font-body text-[11px] font-semibold text-navy-700 ring-1 ring-navy-100"
          >
            <BookOpen size={10} className="text-gold-600" />
            {p}
          </span>
        ))}
      </div>
    </motion.article>
  );
}