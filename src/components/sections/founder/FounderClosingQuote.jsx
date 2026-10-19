import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Button } from '../../ui';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.12, 0.1);

export default function FounderClosingQuote() {
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
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.div variants={fadeUpItem}>
            <Quote size={40} className="text-gold-500/60" aria-hidden="true" />
          </motion.div>

          <motion.h2
            variants={fadeUpItem}
            className="mt-6 font-display text-3xl font-bold italic leading-snug text-white sm:text-4xl"
          >
            "The future belongs to those who choose to learn continuously, lead courageously, and
            transform ideas into impact."
          </motion.h2>

          <motion.p variants={fadeUpItem} className="mt-6 font-body text-base font-semibold text-gold-400">
            Fred Omondi
          </motion.p>
          <motion.p variants={fadeUpItem} className="mt-1 font-body text-sm text-navy-300">
            Founder &amp; Chief Executive Officer, InnoSpeak Global
          </motion.p>

          <motion.div variants={fadeUpItem} className="mt-10">
            <Button to="/academy" variant="gold" size="lg">
              Explore InnoSpeak Global Academy
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}