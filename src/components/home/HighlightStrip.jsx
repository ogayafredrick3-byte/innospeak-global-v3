import { motion } from 'framer-motion';
import useCountUp from '../../hooks/useCountUp.js';
import useInView from '../../hooks/useInView.js';
import { WHY_CHOOSE_HIGHLIGHTS } from './whyChooseData.js';

function HighlightItem({ item, index }) {
  const [ref, inView] = useInView();
  const animated = useCountUp(item.value, 2000, inView);
  const display = item.value === 0 ? '' : animated;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="font-display text-3xl font-bold text-gold-400 sm:text-4xl">
        {display}
        {item.suffix}
      </div>
      <div className="mt-1 font-body text-xs text-white/70 sm:text-sm">
        {item.label}
      </div>
    </motion.div>
  );
}

export default function HighlightStrip() {
  return (
    <div className="overflow-hidden rounded-2xl bg-navy-gradient shadow-premium-lg">
      <div className="grid grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-4 sm:px-8 sm:py-10">
        {WHY_CHOOSE_HIGHLIGHTS.map((item, i) => (
          <HighlightItem key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
