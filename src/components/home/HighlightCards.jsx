import { motion } from 'framer-motion';
import { TrendingUp, Briefcase, Globe, Heart } from 'lucide-react';
import { IMPACT_HIGHLIGHTS } from './impactData.js';

const ICONS = {
  'trending-up': TrendingUp,
  briefcase: Briefcase,
  globe: Globe,
  heart: Heart,
};

export default function HighlightCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {IMPACT_HIGHLIGHTS.map((item, i) => {
        const Icon = ICONS[item.icon] ?? TrendingUp;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.1 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-shadow hover:shadow-premium-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-gradient text-navy-900">
              <Icon size={22} strokeWidth={1.8} />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-navy-900">
              {item.title}
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-navy-600">
              {item.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
