import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { IMPACT_QUOTE } from './impactData.js';

export default function QuoteCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl bg-navy-gradient p-8 text-center shadow-premium-lg sm:p-12"
    >
      <Quote size={48} className="mx-auto text-gold-500/30" />
      <p className="mx-auto mt-6 max-w-3xl font-display text-xl font-medium italic leading-relaxed text-white sm:text-2xl">
        {IMPACT_QUOTE.text}
      </p>
      <div className="mt-8">
        <div className="font-display text-base font-bold text-gold-400">
          {IMPACT_QUOTE.author}
        </div>
        <div className="mt-1 font-body text-sm text-white/60">
          {IMPACT_QUOTE.role}
        </div>
      </div>
    </motion.div>
  );
}
