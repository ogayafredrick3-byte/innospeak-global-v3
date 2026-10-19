import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FOUNDATION_HERO } from './foundationData.js';
import HeroBackground from '../../ui/HeroBackground.jsx';

export default function FoundationHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-navy-900 pt-32 pb-20 sm:pt-36 sm:pb-24">
      <HeroBackground />
      {/* Just two slow orbs — intentional, not busy */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
        aria-hidden="true"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-premium relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 backdrop-blur-sm"
          >
            <Heart size={14} className="text-emerald-300" />
            <span className="font-body text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              {FOUNDATION_HERO.eyebrow}
            </span>
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-7 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl sm:leading-[1.08] lg:text-6xl"
          >
            {FOUNDATION_HERO.title}
            <span className="mt-2 block text-emerald-300">
              {FOUNDATION_HERO.highlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl font-body text-base leading-[1.7] text-emerald-50/90 sm:text-lg"
          >
            {FOUNDATION_HERO.description}
          </motion.p>

          {/* Three CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <Link
              to={FOUNDATION_HERO.secondaryCta.to}
              className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3.5 sm:w-auto"
            >
              {FOUNDATION_HERO.secondaryCta.label}
              <ArrowRight size={16} />
            </Link>
            <a
              href={FOUNDATION_HERO.primaryCta.to}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-emerald-400 hover:bg-white/10 hover:text-emerald-200 sm:w-auto"
            >
              {FOUNDATION_HERO.primaryCta.label}
            </a>
            <a
              href={FOUNDATION_HERO.tertiaryCta.to}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-emerald-400 hover:bg-white/10 hover:text-emerald-200 sm:w-auto"
            >
              {FOUNDATION_HERO.tertiaryCta.label}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}