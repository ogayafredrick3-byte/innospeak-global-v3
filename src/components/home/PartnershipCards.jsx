import { motion } from 'framer-motion';
import {
  GraduationCap, Briefcase, Globe, Lightbulb, Handshake, BookOpen,
} from 'lucide-react';
import { PARTNERSHIP_CARDS } from './partnersData.js';

const ICONS = {
  graduation: GraduationCap,
  briefcase: Briefcase,
  globe: Globe,
  lightbulb: Lightbulb,
  handshake: Handshake,
  book: BookOpen,
};

export default function PartnershipCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {PARTNERSHIP_CARDS.map((card, i) => {
        const Icon = ICONS[card.icon] ?? GraduationCap;
        return (
          <motion.article
            key={card.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            className="group rounded-2xl border border-navy-100 bg-white/80 p-6 shadow-premium backdrop-blur-md transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-7"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <h3 className="font-display text-lg font-bold text-navy-900">
                {card.title}
              </h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-navy-600">
              {card.description}
            </p>
          </motion.article>
        );
      })}
    </div>
  );
}
