import { motion } from 'framer-motion';
import {
  Users, Laptop, Award, Globe, Wrench, UserCheck, Briefcase, Heart,
} from 'lucide-react';

const ICONS = {
  users: Users,
  laptop: Laptop,
  award: Award,
  globe: Globe,
  tool: Wrench,
  'user-check': UserCheck,
  briefcase: Briefcase,
  heart: Heart,
};

export default function WhyChooseCard({ feature, index }) {
  const Icon = ICONS[feature.icon] ?? Users;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group flex gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:shadow-premium-lg"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div>
        <h3 className="font-display text-base font-bold text-navy-900">
          {feature.title}
        </h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-navy-600">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}
