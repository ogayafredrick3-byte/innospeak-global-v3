import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '../../ui';
import AcademyHeroImage from './AcademyHeroImage.jsx';
import {
  ACADEMY_HERO_BADGE,
  ACADEMY_HERO_HEADLINE,
  ACADEMY_HERO_DESCRIPTION,
} from './academyHeroData.js';

/**
 * AcademyHero — two-column hero.
 * Balanced vertical rhythm across mobile / tablet / desktop:
 *   badge → heading → description → CTAs each step up in spacing.
 */
export default function AcademyHero() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-50/40 via-white to-gold-50/30" />

      <div className="container-premium relative z-10">
        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ═══ Left column — text + CTAs ═══ */}
          <div className="text-center lg:text-left">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-2"
            >
              <Sparkles size={16} className="text-gold-500" />
              <span className="font-body text-[11px] font-semibold uppercase tracking-wider text-gold-700 sm:text-xs">
                {ACADEMY_HERO_BADGE}
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="mt-6 font-display text-[2rem] font-bold leading-[1.1] text-navy-900 sm:mt-7 sm:text-5xl sm:leading-[1.08] lg:mt-8 lg:text-[3.25rem] lg:leading-[1.05]">
              {ACADEMY_HERO_HEADLINE.map((line, i) => (
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

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mx-auto mt-6 max-w-xl font-body text-[15px] leading-[1.7] text-navy-600 sm:mt-7 sm:text-base sm:leading-relaxed lg:mt-8 lg:mx-0 lg:text-lg"
            >
              {ACADEMY_HERO_DESCRIPTION}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4 lg:mt-12 lg:justify-start"
            >
              <Button
                to="/apply"
                variant="gold"
                size="lg"
                className="group w-full justify-center sm:w-auto"
              >
                Apply Now
                <ArrowRight
                  size={18}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </Button>

              <Button
                to="/courses"
                variant="outline"
                size="lg"
                className="group w-full justify-center sm:w-auto"
              >
                <BookOpen size={18} className="mr-2" />
                Explore Programmes
              </Button>
            </motion.div>
          </div>

          {/* ═══ Right column — image ═══ */}
          <AcademyHeroImage />
        </div>
      </div>
    </section>
  );
}