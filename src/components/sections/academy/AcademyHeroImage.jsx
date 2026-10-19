import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Globe, Cpu, Award } from 'lucide-react';
import {
  ACADEMY_HERO_SLIDES,
  ACADEMY_HERO_IMAGE_STATS,
  ACADEMY_FEATURE_CARDS,
} from './academyHeroData.js';

const ICONS = {
  graduation: GraduationCap,
  globe: Globe,
  cpu: Cpu,
  award: Award,
};

/**
 * AcademyHeroImage — sliding hero image with floating feature badges
 * and a stats strip. Aspect ratio tuned so the image never dominates
 * the vertical space on desktop.
 */
export default function AcademyHeroImage() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ACADEMY_HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none"
    >
      {/* Framed image */}
      <div className="relative overflow-hidden rounded-3xl border border-navy-100 shadow-premium-lg">
        {/* Aspect ratio scales: taller on mobile for a hero feel, wider on desktop */}
        <div className="relative aspect-[4/5] w-full sm:aspect-[4/3] lg:aspect-[5/5]">
          <AnimatePresence mode="sync">
            <motion.img
              key={current}
              src={ACADEMY_HERO_SLIDES[current].image}
              alt={ACADEMY_HERO_SLIDES[current].title}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/45 via-transparent to-transparent" />

        {/* Slide indicators */}
        <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-1.5">
          {ACADEMY_HERO_SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-5 bg-gold-400' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-4 left-4 right-4 flex items-center justify-around rounded-2xl border border-white/20 bg-white/15 px-4 py-3 shadow-glass backdrop-blur-md"
        >
          {ACADEMY_HERO_IMAGE_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-base font-bold text-white sm:text-lg lg:text-xl">
                {stat.value}
              </div>
              <div className="font-body text-[10px] text-white/80 sm:text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating feature cards — desktop + tablet only */}
      {ACADEMY_FEATURE_CARDS.map((card, i) => {
        const Icon = ICONS[card.icon] ?? GraduationCap;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className={`absolute ${card.pos} hidden items-center gap-2.5 rounded-xl border border-white/40 bg-white/95 px-3.5 py-2.5 shadow-glass backdrop-blur-md md:flex`}
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

      {/* Decorative rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute -right-5 -top-5 h-14 w-14 rounded-full border-2 border-dashed border-gold-400/40 sm:h-16 sm:w-16"
      />
    </motion.div>
  );
}