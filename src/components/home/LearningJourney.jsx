import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';
import JourneyStage from './JourneyStage.jsx';
import { JOURNEY_STEPS } from './journeyData.js';

/**
 * LearningJourney — the 6-step learner journey strip.
 * Mobile: 2-column grid, no connectors.
 * Tablet: 3-column grid.
 * Desktop: 6-column single row with connecting arrows between steps.
 */
export default function LearningJourney() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      {/* Soft accent blurs */}
      <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-gold-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-navy-900/5 blur-3xl" />

      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow="Your Learning Journey"
          title="From Discovery to Leadership"
          subtitle="Six clear stages that take you from exploring our programmes to leading with confidence — one step at a time."
        />

        {/* ═══ Desktop: horizontal 6-step row with arrows ═══ */}
        <div className="mt-14 hidden lg:block">
          <div className="relative">
            {/* Connector line behind all steps */}
            <div className="pointer-events-none absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent" />

            <div className="grid grid-cols-6 gap-4">
              {JOURNEY_STEPS.map((step, i) => (
                <div key={step.id} className="relative">
                  <JourneyStage step={step} index={i} isLast={i === JOURNEY_STEPS.length - 1} />

                  {/* Arrow between steps (except last) */}
                  {i < JOURNEY_STEPS.length - 1 && (
                    <span className="pointer-events-none absolute -right-2 top-6 flex h-5 w-5 items-center justify-center text-gold-500">
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Tablet + mobile: responsive grid, no arrows ═══ */}
        <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:hidden">
          {JOURNEY_STEPS.map((step, i) => (
            <JourneyStage key={step.id} step={step} index={i} />
          ))}
        </div>

        {/* ═══ CTA ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/apply"
            className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
          >
            Start Your Journey
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/academy"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-7 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700 sm:w-auto"
          >
            Explore Programmes
          </Link>
        </motion.div>
      </div>
    </section>
  );
}