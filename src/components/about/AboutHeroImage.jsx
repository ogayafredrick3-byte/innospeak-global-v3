import { motion } from 'framer-motion';
import { GraduationCap, Lightbulb, Cpu, Crown } from 'lucide-react';
import { ABOUT_HERO_IMAGE, ABOUT_HERO_STATS } from './aboutHeroData.js';

const ICONS = {
  graduation: GraduationCap,
  lightbulb: Lightbulb,
  cpu: Cpu,
  crown: Crown,
};

const FLOATING_CARDS = [
  { icon: 'graduation', label: 'Education', color: 'navy', pos: '-left-4 top-[12%]' },
  { icon: 'lightbulb', label: 'Innovation', color: 'gold', pos: '-right-4 top-[30%]' },
  { icon: 'cpu', label: 'Technology', color: 'navy', pos: '-left-4 bottom-[28%]' },
  { icon: 'crown', label: 'Leadership', color: 'gold', pos: '-right-4 bottom-[14%]' },
];

export default function AboutHeroImage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-lg lg:max-w-none"
    >
      <div className="relative overflow-hidden rounded-3xl border border-navy-100 shadow-premium-lg">
        <img
          src={ABOUT_HERO_IMAGE}
          alt="Students collaborating at InnoSpeak Global"
          className="aspect-[4/5] w-full object-cover sm:aspect-[4/3] lg:aspect-[5/6]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-4 left-4 right-4 flex items-center justify-around rounded-2xl border border-white/20 bg-white/15 px-4 py-3 shadow-glass backdrop-blur-md"
        >
          {ABOUT_HERO_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-lg font-bold text-white sm:text-xl">
                {stat.value}
              </div>
              <div className="font-body text-[10px] text-white/80 sm:text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {FLOATING_CARDS.map((card, i) => {
        const Icon = ICONS[card.icon] ?? GraduationCap;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className={`absolute ${card.pos} hidden items-center gap-2.5 rounded-xl border border-white/20 bg-white/90 px-3.5 py-2.5 shadow-glass backdrop-blur-md sm:flex`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                card.color === 'gold'
                  ? 'bg-gold-gradient text-navy-900'
                  : 'bg-navy-900 text-gold-400'
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
            </div>
            <span className="font-body text-xs font-semibold text-navy-900">
              {card.label}
            </span>
          </motion.div>
        );
      })}

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full border-2 border-dashed border-gold-400/40"
      />
    </motion.div>
  );
}
