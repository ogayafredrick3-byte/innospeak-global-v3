import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, GraduationCap, FlaskConical, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import HeroSlider from './HeroSlider.jsx';
import HeroStats from './HeroStats.jsx';
import HeroFloatingCards from './HeroFloatingCards.jsx';
import { HERO_BADGE, HERO_HEADLINE, HERO_DESCRIPTION, PILLAR_CARDS } from './heroData.js';

const PILLAR_ICONS = {
  graduation: GraduationCap,
  flask: FlaskConical,
  heart: HeartHandshake,
};

const PILLAR_STYLES = {
  gold: {
    border: 'border-gold-500/30',
    bg: 'bg-gold-500/10',
    text: 'text-gold-300',
    iconBg: 'bg-gold-gradient text-navy-900',
  },
  navy: {
    border: 'border-navy-400/30',
    bg: 'bg-navy-500/10',
    text: 'text-navy-200',
    iconBg: 'bg-navy-700 text-gold-300',
  },
  emerald: {
    border: 'border-emerald-400/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-200',
    iconBg: 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white',
  },
};

/**
 * Hero — full-height homepage hero.
 * Layout: single flex column.
 *   • Middle: badge → heading → description → CTAs → stats
 *   • Bottom: three ecosystem pillars (fixed height, always visible)
 * Vertical rhythm scales at sm / lg breakpoints.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[100vh] flex-col overflow-hidden bg-navy-900">
      <HeroSlider />
      <HeroFloatingCards />

      {/* ═══ Main content — vertically centred ═══ */}
      <div className="relative z-10 flex flex-1 items-center pt-32 pb-10 sm:pt-36 lg:pt-40 lg:pb-12">
        <div className="container-premium w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles size={16} className="text-gold-400" />
              <span className="font-body text-[11px] font-semibold uppercase tracking-wider text-gold-300 sm:text-xs">
                {HERO_BADGE}
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] text-white sm:mt-7 sm:text-5xl sm:leading-[1.05] lg:mt-8 lg:text-6xl">
              {HERO_HEADLINE.map((line, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
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
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 max-w-xl font-body text-[15px] leading-[1.7] text-white/80 sm:mt-7 sm:text-base sm:leading-relaxed lg:mt-8 lg:text-lg"
            >
              {HERO_DESCRIPTION}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4"
            >
              <Button to="/apply" variant="gold" size="lg" className="group w-full justify-center sm:w-auto">
                Apply Now
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                to="/programs"
                variant="outline"
                size="lg"
                className="w-full justify-center border-white/30 text-white hover:bg-white hover:text-navy-900 sm:w-auto"
              >
                Explore Programs
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-12 border-t border-white/10 pt-8 sm:mt-14 lg:mt-16"
            >
              <HeroStats />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ═══ Pillars — bottom strip ═══ */}
      <div className="relative z-10 pb-6 sm:pb-8 lg:pb-12">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="grid gap-3 sm:grid-cols-3 sm:gap-4"
          >
            {PILLAR_CARDS.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.icon] || GraduationCap;
              const s = PILLAR_STYLES[pillar.color];
              return (
                <Link
                  key={pillar.id}
                  to={pillar.link}
                  className={`group rounded-2xl border ${s.border} ${s.bg} p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] sm:p-6`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.iconBg} shadow-md`}>
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className={`font-body text-[11px] font-bold uppercase tracking-wider ${s.text}`}>
                        {pillar.action}
                      </p>
                      <p className="font-display text-sm font-bold text-white">
                        {pillar.label}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 font-body text-sm leading-relaxed text-white/70">
                    {pillar.description}
                  </p>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}