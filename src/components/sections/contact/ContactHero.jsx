import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { staggerContainer, fadeUpItem } from '../../../lib/motion/presets';
import HeroBackground from '../../ui/HeroBackground.jsx';

const container = staggerContainer(0.12, 0.1);

const FLOATING_DOTS = [
  { left: '12%', top: '18%', size: 6, delay: 0, duration: 8 },
  { left: '85%', top: '22%', size: 4, delay: 1.2, duration: 10 },
  { left: '22%', top: '72%', size: 5, delay: 0.6, duration: 9 },
  { left: '78%', top: '68%', size: 7, delay: 1.8, duration: 11 },
  { left: '45%', top: '12%', size: 3, delay: 0.9, duration: 7 },
  { left: '62%', top: '85%', size: 4, delay: 2.1, duration: 9.5 },
  { left: '8%', top: '45%', size: 5, delay: 1.5, duration: 10.5 },
  { left: '92%', top: '50%', size: 3, delay: 0.3, duration: 8.5 },
];

export default function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-navy-900 pb-24 pt-32 md:pt-40">
      <HeroBackground variant="professional" />
      {/* Animated gradient orbs */}
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

      {/* Subtle grid pattern */}
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

      <div className="container-premium relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span
            variants={fadeUpItem}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-emerald-200 backdrop-blur-sm"
          >
            <MessageCircle size={14} aria-hidden="true" />
            Get In Touch
          </motion.span>

          <motion.h1
            variants={fadeUpItem}
            className="mt-6 font-display text-4xl font-bold leading-[1.08] text-white sm:text-5xl md:text-6xl"
          >
            Let's Start a Conversation
          </motion.h1>

          <motion.p
            variants={fadeUpItem}
            className="mx-auto mt-8 max-w-2xl font-body text-base leading-[1.7] text-emerald-50/90 sm:text-lg"
          >
            Questions about admissions, partnerships or programmes? Our team is ready to help you
            find the right next step.
          </motion.p>

          <motion.div
            variants={fadeUpItem}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-body text-xs font-semibold text-emerald-100">
              We reply within 24 hours · Mon–Sun
            </span>
            <Sparkles size={12} className="text-emerald-300" />
          </motion.div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/5 to-transparent" />
    </section>
  );
}