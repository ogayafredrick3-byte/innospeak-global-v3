import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HERO_SLIDES } from './heroData.js';

export default function HeroSlider({ showIndicators = true, autoRotate = true }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoRotate) return undefined;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoRotate]);

  return (
    <div className="absolute inset-0 z-0">
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={HERO_SLIDES[current].image}
            alt={HERO_SLIDES[current].title}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-navy-900/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 via-transparent to-navy-900/60" />

      {showIndicators && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-gold-500' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
