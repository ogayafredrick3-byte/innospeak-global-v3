import { motion } from 'framer-motion';
import { Users2, ArrowRight, Building2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.12, 0.1);

export default function SubmitChallenge() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-950" />

      {/* Animated gold glows */}
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl"
        aria-hidden="true"
      />
      <motion.div
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl"
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

      <div className="container-premium relative">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <motion.div
            variants={fadeUpItem}
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-gradient text-navy-900 shadow-gold sm:h-16 sm:w-16"
          >
            <Building2 size={24} strokeWidth={1.8} aria-hidden="true" />
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gold-600 shadow-md">
              <Sparkles size={12} />
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUpItem}
            className="mt-6 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
          >
            Have a Problem Worth Solving?
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="mt-5 max-w-xl font-body text-sm leading-[1.7] text-navy-200 sm:mt-6 sm:text-base sm:leading-relaxed md:text-lg"
          >
            Labs works on real challenges submitted by organizations and communities. If you have
            a problem that could use a motivated team, mentor-guided
            support and fresh thinking, we'd like to hear from you.
          </motion.p>

          <motion.div
            variants={fadeUpItem}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
          >
            <Link
              to="/contact?interest=lab-challenge"
              className="btn-gold group inline-flex w-full items-center justify-center gap-2 px-7 py-3.5 sm:w-auto"
            >
              Submit a Challenge
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              to="/courses?division=labs"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300 sm:w-auto"
            >
              <Users2 size={18} />
              Join a Track Instead
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}