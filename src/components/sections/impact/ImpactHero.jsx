import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, TrendingUp } from 'lucide-react';
import { Button } from '../../ui';
import ImpactHeroImage from './ImpactHeroImage.jsx';
import {
  IMPACT_HERO_BADGE,
  IMPACT_HERO_HEADLINE,
  IMPACT_HERO_DESCRIPTION,
} from './impactHeroData.js';

/**
 * ImpactHero — mirrors the About/Academy/Labs/Foundation hero pattern:
 * two-column layout, single framed photo with floating feature badges
 * and a stats strip, instead of the previous centered dark hero.
 */
export default function ImpactHero() {
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
              <TrendingUp size={16} className="text-gold-500" />
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-gold-700">
                {IMPACT_HERO_BADGE}
              </span>
            </motion.div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-navy-900 sm:text-5xl lg:text-[3.25rem]">
              {IMPACT_HERO_HEADLINE.map((line, i) => (
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
              className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-navy-600 lg:mx-0 sm:text-lg"
            >
              {IMPACT_HERO_DESCRIPTION}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row lg:justify-start justify-center"
            >
              <Button to="/academy" variant="gold" size="lg" className="group">
                Explore Programmes
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button to="/foundation" variant="outline" size="lg" className="group">
                <HeartHandshake size={18} className="mr-2" />
                Support Our Mission
              </Button>
            </motion.div>
          </div>

          <ImpactHeroImage />
        </div>
      </div>
    </section>
  );
}