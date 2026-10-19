import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Heart } from 'lucide-react';
import HeroBackground from '../ui/HeroBackground.jsx';

const FLOATING_DOTS = [
  { left: '15%', top: '20%', size: 5, delay: 0, duration: 8 },
  { left: '82%', top: '25%', size: 4, delay: 1.2, duration: 10 },
  { left: '25%', top: '70%', size: 6, delay: 0.6, duration: 9 },
  { left: '75%', top: '65%', size: 3, delay: 1.8, duration: 11 },
  { left: '50%', top: '15%', size: 4, delay: 0.9, duration: 7 },
];

export default function AdmissionsHero({ currentStep = 1, totalSteps = 7, variant = 'default', children }) {
  const isFoundation = variant === 'foundation';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-navy-900 text-white">
      <HeroBackground variant="professional" />
      {/* Animated orbs */}
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-gold-500/15 blur-[120px]"
        aria-hidden="true"
      />
      <motion.div
        animate={{ x: [0, -50, 40, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-emerald-400/25 blur-[100px]"
        aria-hidden="true"
      />
      <motion.div
        animate={{ x: [0, 40, -60, 0], y: [0, 20, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-0 top-1/2 h-64 w-64 rounded-full bg-emerald-500/20 blur-[100px]"
        aria-hidden="true"
      />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
        aria-hidden="true"
      />

      {/* Floating dots */}
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

      <div className="container-premium relative z-10 py-12 sm:py-14">
        <Link
          to={isFoundation ? '/foundation' : '/'}
          className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-white/70 transition-colors hover:text-emerald-300"
        >
          <ArrowLeft size={14} />
          {isFoundation ? 'Back to Foundation' : 'Back to Home'}
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 font-body text-[11px] font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
            {isFoundation ? <Heart size={12} /> : <Sparkles size={12} />}
            {isFoundation ? 'Foundation Scholarship Application' : 'Admissions'}
          </span>
          <span className="font-body text-xs text-white/60">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          {isFoundation ? (
            <>
              Apply for funded support.{' '}
              <span className="text-emerald-300">Education without the cost barrier.</span>
            </>
          ) : (
            <>
              Begin your InnoSpeak Global journey.{' '}
              <span className="text-emerald-300">A few steps to get started.</span>
            </>
          )}
        </h1>

        <p className="mt-4 max-w-2xl font-body text-sm leading-6 text-emerald-50/80 sm:text-base">
          {isFoundation
            ? 'Tell us what you want to study and a little about your situation. If approved, your tuition is fully covered by the Foundation.'
            : 'Complete the form below and our admissions team will guide you through the process.'}
        </p>

        {children && <div className="mt-8">{children}</div>}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/5 to-transparent" />
    </section>
  );
}