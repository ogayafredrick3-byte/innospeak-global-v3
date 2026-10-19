import { motion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import Button from '../ui/Button.jsx';
import ClosingParticles from './ClosingParticles.jsx';
import { CLOSING_CONTENT, CLOSING_BADGES } from './closingData.js';

/**
 * ClosingCTA — premium full-width closing section with navy-to-deep-blue
 * gradient, soft gold glow, animated particles, floating elements,
 * three highlight badges, primary + secondary buttons, and a
 * reassurance statement.
 */
export default function ClosingCTA() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 sm:py-32">
      {/* Navy-to-deep-blue gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-950" />

      {/* Soft fade from the white FAQ section above, instead of a hard color cut */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/30 to-transparent sm:h-32" />

      {/* Soft gold radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-[120px]" />

      {/* Animated particles */}
      <ClosingParticles />

      {/* Decorative floating shapes */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-[10%] top-[20%] h-24 w-24 rounded-2xl border border-gold-500/10 bg-gold-500/5 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, 25, 0], rotate: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="pointer-events-none absolute right-[12%] bottom-[25%] h-20 w-20 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="pointer-events-none absolute right-[18%] top-[18%] h-3 w-3 rounded-full bg-gold-400/30"
      />

      <div className="container-premium relative z-10 text-center">
        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wider text-gold-300 backdrop-blur-sm"
        >
          Ready to Build Your Future?
        </motion.span>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-4xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
        >
          {CLOSING_CONTENT.headline}
        </motion.h2>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl font-body text-base leading-relaxed text-navy-200 sm:text-lg"
        >
          {CLOSING_CONTENT.supportingText}
        </motion.p>

        {/* Highlight badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          {CLOSING_BADGES.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: 0.35 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 backdrop-blur-md transition-colors duration-300 hover:border-gold-400/40 hover:bg-gold-500/10"
            >
              <span className="text-lg">{badge.emoji}</span>
              <span className="font-body text-sm font-semibold text-white sm:text-base">
                {badge.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            to={CLOSING_CONTENT.primaryButton.to}
            variant="gold"
            size="lg"
            className="group"
          >
            {CLOSING_CONTENT.primaryButton.label}
            <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            to={CLOSING_CONTENT.secondaryButton.to}
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white hover:text-navy-900"
          >
            <Compass size={18} className="mr-2" />
            {CLOSING_CONTENT.secondaryButton.label}
          </Button>
        </motion.div>

        {/* Reassurance statement */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mx-auto mt-12 max-w-xl border-t border-white/10 pt-8 font-body text-sm italic leading-relaxed text-navy-300 sm:text-base"
        >
          {CLOSING_CONTENT.reassurance}
        </motion.p>
      </div>
    </section>
  );
}
