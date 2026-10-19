import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../ui';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.12, 0.1);

export default function ImpactCTA() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-950" />
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" aria-hidden="true" />

      <div className="container-premium relative">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <motion.span
            variants={fadeUpItem}
            className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-gold-300 backdrop-blur-sm"
          >
            <Sparkles size={14} aria-hidden="true" />
            Be Part of the Story
          </motion.span>

          <motion.h2 variants={fadeUpItem} className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
            Your Journey Could Be the Next Success Story
          </motion.h2>

          <motion.div variants={fadeUpItem} className="mt-8">
            <Button to="/apply" variant="gold" size="lg" className="group">
              Apply Now
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}