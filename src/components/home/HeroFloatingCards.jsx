import { motion } from 'framer-motion';
import { Laptop, Building2, Shuffle, Award } from 'lucide-react';
import { HERO_FLOATING_CARDS } from './heroData.js';

const ICONS = {
  laptop: Laptop,
  building: Building2,
  shuffle: Shuffle,
  award: Award,
};

/**
 * Floating feature cards — anchored to the RIGHT half of the hero only.
 * The hero text occupies the left column, so every card lives at
 * 8–32% from the right edge to avoid overlap.
 */
const POSITIONS = [
  { right: '8%', top: '22%' },
  { right: '30%', top: '38%' },
  { right: '8%', top: '54%' },
  { right: '30%', top: '70%' },
];

export default function HeroFloatingCards() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
      {HERO_FLOATING_CARDS.map((card, i) => {
        const Icon = ICONS[card.icon] ?? Laptop;
        const pos = POSITIONS[i % POSITIONS.length];

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.8 + i * 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ right: pos.right, top: pos.top }}
            whileHover={{ scale: 1.04, y: -3 }}
            className="pointer-events-auto absolute flex items-center gap-3 rounded-2xl border border-white/25 bg-white/95 px-4 py-3 shadow-glass backdrop-blur-md"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                card.color === 'gold'
                  ? 'bg-gold-gradient text-navy-900'
                  : 'bg-navy-900 text-gold-400'
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
            </div>
            <span className="font-body text-sm font-semibold text-navy-900">
              {card.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}