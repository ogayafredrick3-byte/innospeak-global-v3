import { motion } from 'framer-motion';
import { BookOpen, Users, Laptop, Smile, Globe, Rocket } from 'lucide-react';
import useCountUp from '../../hooks/useCountUp.js';
import useInView from '../../hooks/useInView.js';

const ICONS = {
  'book-open': BookOpen,
  users: Users,
  laptop: Laptop,
  smile: Smile,
  globe: Globe,
  rocket: Rocket,
};

export default function StatCard({ stat, index }) {
  const [ref, inView] = useInView();
  const Icon = ICONS[stat.icon] ?? BookOpen;
  const animated = useCountUp(stat.value, 2000, inView);
  const display = stat.textValue || (stat.value === 0 ? '' : `${animated}${stat.suffix}`);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -4 }}
      className="flex flex-col items-center rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-premium transition-shadow hover:shadow-premium-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div className="mt-4 font-display text-3xl font-bold text-navy-900">
        {display}
      </div>
      <div className="mt-1 font-body text-sm text-navy-600">
        {stat.label}
      </div>
    </motion.div>
  );
}
