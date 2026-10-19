import { motion } from 'framer-motion';
import useCountUp from '../../hooks/useCountUp.js';
import useInView from '../../hooks/useInView.js';
import { HERO_STATS } from './heroData.js';

function StatItem({ stat, index }) {
  const [ref, inView] = useInView();
  const animated = useCountUp(stat.value, 2000, inView);
  const display = stat.value === 0 ? '' : animated;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div className="font-display text-3xl font-bold text-gold-400 sm:text-4xl">
        {display}
        {stat.suffix}
      </div>
      <div className="mt-1 font-body text-xs text-white/70 sm:text-sm">
        {stat.label}
      </div>
    </motion.div>
  );
}

export default function HeroStats() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {HERO_STATS.map((stat, i) => (
        <StatItem key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}
