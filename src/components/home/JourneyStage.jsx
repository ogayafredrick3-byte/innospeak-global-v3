import { motion } from 'framer-motion';
import {
  Compass, FileText, BookOpen, Wrench, Award, Rocket,
} from 'lucide-react';

const ICONS = {
  compass: Compass,
  'file-text': FileText,
  'book-open': BookOpen,
  tool: Wrench,
  award: Award,
  rocket: Rocket,
};

/**
 * JourneyStage — one numbered step in the learner journey.
 * Icon sits in a navy square with a gold number badge.
 * Connector line drawn by the parent between steps (desktop only).
 */
export default function JourneyStage({ step, index, isLast = false }) {
  const Icon = ICONS[step.icon] ?? Compass;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center text-center"
    >
      {/* Icon + number */}
      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 shadow-premium transition-transform duration-300 hover:scale-105 sm:h-16 sm:w-16">
          <Icon size={24} strokeWidth={1.8} />
        </div>
        <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold-gradient font-display text-[11px] font-bold text-navy-900 shadow-gold">
          {step.number}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-4 font-display text-base font-bold text-navy-900 sm:mt-5 sm:text-lg">
        {step.title}
      </h3>

      {/* Description */}
      <p className="mt-2 max-w-[15rem] font-body text-xs leading-5 text-navy-600 sm:text-sm sm:leading-6">
        {step.description}
      </p>
    </motion.div>
  );
}