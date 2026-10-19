import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import FounderHeroImage from './FounderHeroImage.jsx';
import {
  FOUNDER_HERO_BADGE,
  FOUNDER_HERO_HEADLINE,
  FOUNDER_HERO_QUOTE,
} from './founderHeroData.js';

/**
 * FounderHero — mirrors the About/Academy/Labs/Foundation/Impact hero
 * pattern: two-column layout, single framed photo with floating feature
 * badges and a stats strip. Uses a single static portrait (not a slider)
 * since there's only one real photo of Fred.
 */
export default function FounderHero() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-50/40 via-white to-gold-50/30" />

      <div className="container-premium relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-2"
            >
              <Sparkles size={16} className="text-gold-500" />
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-gold-700">
                {FOUNDER_HERO_BADGE}
              </span>
            </motion.div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-navy-900 sm:text-5xl lg:text-[3.25rem]">
              {FOUNDER_HERO_HEADLINE.map((line, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.15 }}
                  className={line.highlight ? 'block text-gradient-gold' : 'block'}
                >
                  {line.text}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mx-auto mt-6 max-w-xl font-body text-base italic leading-relaxed text-navy-600 lg:mx-0 sm:text-lg"
            >
              {FOUNDER_HERO_QUOTE}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-8"
            >
              <p className="font-display text-2xl font-bold text-navy-900">Fred Omondi</p>
              <p className="mt-1 font-body text-sm text-navy-600">
                Founder &amp; Chief Executive Officer, InnoSpeak Global
              </p>
            </motion.div>
          </div>

          <FounderHeroImage />
        </div>
      </div>
    </section>
  );
}