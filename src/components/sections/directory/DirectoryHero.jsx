import { motion } from 'framer-motion';
import HeroBackground from '../../ui/HeroBackground.jsx';

/**
 * DirectoryHero — animated emerald hero for ContentDirectory pages.
 * Same visual language as Foundation, Contact and Apply heroes.
 */

const FLOATING_DOTS = [
  { left: '12%', top: '18%', size: 6, delay: 0, duration: 8 },
  { left: '85%', top: '22%', size: 4, delay: 1.2, duration: 10 },
  { left: '22%', top: '72%', size: 5, delay: 0.6, duration: 9 },
  { left: '78%', top: '68%', size: 7, delay: 1.8, duration: 11 },
  { left: '45%', top: '14%', size: 3, delay: 0.9, duration: 7 },
  { left: '62%', top: '82%', size: 4, delay: 2.1, duration: 9.5 },
];

export default function DirectoryHero({ config, type }) {
  const Icon = config.icon;
  const useProfessionalBackground = ['careers', 'community', 'partnerships'].includes(type);
  const isEventsPage = type === 'events';

  return (
    <section className={`relative overflow-hidden ${isEventsPage ? 'bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950' : 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-navy-900'} pt-32 pb-20 text-white md:pt-40 md:pb-24`}>
      <HeroBackground variant={useProfessionalBackground || isEventsPage ? 'professional' : 'foundation'} />
      <motion.div
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gold-500/20 blur-[140px]"
        aria-hidden="true"
      />
      <motion.div
        animate={{ x: [0, -100, 60, 0], y: [0, 50, -40, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-400/25 blur-[120px]"
        aria-hidden="true"
      />
      <motion.div
        animate={{ x: [0, 60, -80, 0], y: [0, -30, 60, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-20 bottom-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-[110px]"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
        aria-hidden="true"
      />

      {FLOATING_DOTS.map((dot, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full bg-emerald-300/50"
          style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      ))}

      <div className="container-premium relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 font-body text-[11px] font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
            <Icon size={13} aria-hidden="true" />
            {config.eyebrow}
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] text-white sm:text-5xl md:text-6xl">
            {config.title}
          </h1>

          <p className="mt-5 max-w-2xl font-body text-base leading-[1.7] text-emerald-50/90 sm:text-lg">
            {config.description}
          </p>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/5 to-transparent" />
    </section>
  );
}
