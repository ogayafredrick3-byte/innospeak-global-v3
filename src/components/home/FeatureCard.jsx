import { motion } from 'framer-motion';
import { BadgeCheck, Globe, Users, Calendar } from 'lucide-react';
import { TRUSTED_FEATURES } from './trustedData.js';

const ICONS = {
  'badge-check': BadgeCheck,
  globe: Globe,
  users: Users,
  calendar: Calendar,
};

export default function FeatureCard() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {TRUSTED_FEATURES.map((feature, i) => {
        const Icon = ICONS[feature.icon] ?? BadgeCheck;
        return (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-premium"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
              <Icon size={20} strokeWidth={1.8} />
            </div>
            <span className="font-body text-sm font-semibold text-navy-900">
              {feature.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
