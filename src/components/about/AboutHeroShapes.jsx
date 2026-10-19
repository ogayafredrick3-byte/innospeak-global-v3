import { motion } from 'framer-motion';
import useMediaQuery from '../../hooks/useMediaQuery.js';

export default function AboutHeroShapes() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-navy-200/30 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gold-300/20 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute left-[8%] top-[40%] h-10 w-10 rounded-lg border border-navy-200/40 bg-navy-100/30"
      />
      <motion.div
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute right-[15%] top-[20%] h-3 w-3 rounded-card border-gold-400/40"
      />
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[15%] left-[20%] h-12 w-12 rounded-full border-2 border-dashed border-navy-200/30"
      />
    </div>
  );
}
