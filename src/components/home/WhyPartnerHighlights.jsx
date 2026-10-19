import { motion } from 'framer-motion';
import { Lightbulb, Users, Laptop, Heart } from 'lucide-react';
import { WHY_PARTNER_HIGHLIGHTS } from './partnersData.js';

const ICONS = {
  lightbulb: Lightbulb,
  users: Users,
  laptop: Laptop,
  heart: Heart,
};

export default function WhyPartnerHighlights() {
  return (
    <div className="overflow-hidden rounded-2xl bg-navy-gradient shadow-premium-lg">
      <div className="grid gap-px bg-navy-700/40 sm:grid-cols-2 lg:grid-cols-4">
        {WHY_PARTNER_HIGHLIGHTS.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Lightbulb;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-3 bg-navy-900/80 px-6 py-8 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-gold-400">
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                {item.label}
              </h3>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
