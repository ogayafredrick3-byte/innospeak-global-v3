import { motion } from 'framer-motion';
import {
  Award, Lightbulb, Shield, Users, Compass, Handshake, Infinity as InfinityIcon,
} from 'lucide-react';
import { MVV_VALUES } from './missionVisionValuesData.js';

const ICONS = {
  award: Award,
  lightbulb: Lightbulb,
  shield: Shield,
  users: Users,
  compass: Compass,
  handshake: Handshake,
  infinity: InfinityIcon,
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/**
 * CoreValuesGrid — interactive glassmorphism cards with gold accents
 * and hover animations for each core value.
 */
export default function CoreValuesGrid() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {MVV_VALUES.map((value, i) => {
        const Icon = ICONS[value.icon] ?? Award;
        return (
          <motion.article
            key={value.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 shadow-glass backdrop-blur-md transition-shadow duration-300 hover:shadow-premium-lg"
          >
            {/* Gold accent bar — animates in on hover */}
            <div className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-gold-gradient transition-transform duration-300 group-hover:scale-y-100" />

            {/* Gold glow on hover */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold-400/0 blur-2xl transition-all duration-500 group-hover:bg-gold-400/20" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-all duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
                <Icon size={24} strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-navy-900">
                  {value.name}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-navy-600">
                  {value.description}
                </p>
              </div>
            </div>

            {/* Bottom gold index line */}
            <div className="relative mt-5 flex items-center gap-1.5">
              <span className="h-1 w-8 rounded-full bg-gold-gradient" />
              <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-gold-600">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
