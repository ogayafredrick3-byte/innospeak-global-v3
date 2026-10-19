import { motion } from 'framer-motion';
import { Target, Eye } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading.jsx';
import CoreValuesGrid from './CoreValuesGrid.jsx';
import {
  MVV_HEADING,
  MVV_MISSION,
  MVV_VISION,
} from './missionVisionValuesData.js';

const MV_ICONS = {
  target: Target,
  eye: Eye,
};

/**
 * MissionVisionValues — premium section with Mission & Vision cards
 * followed by an interactive glassmorphism grid of seven core values.
 */
export default function MissionVisionValues() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      {/* Subtle background decorations */}
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-navy-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-gold-100/30 blur-3xl" />

      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow={MVV_HEADING.eyebrow}
          title={MVV_HEADING.title}
          subtitle={MVV_HEADING.subtitle}
        />

        {/* Mission & Vision cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {[
            { data: MVV_MISSION, accent: 'gold' },
            { data: MVV_VISION, accent: 'navy' },
          ].map(({ data, accent }, i) => {
            const Icon = MV_ICONS[data.icon] ?? Target;
            return (
              <motion.div
                key={data.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 shadow-glass backdrop-blur-md transition-shadow duration-300 hover:shadow-premium-lg sm:p-10"
              >
                {/* Accent glow */}
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl transition-all duration-500 ${
                    accent === 'gold'
                      ? 'bg-gold-400/15 group-hover:bg-gold-400/25'
                      : 'bg-navy-400/15 group-hover:bg-navy-400/25'
                  }`}
                />

                <div className="relative flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                      accent === 'gold'
                        ? 'bg-gold-gradient text-navy-900'
                        : 'bg-navy-900 text-gold-400'
                    }`}
                  >
                    <Icon size={28} strokeWidth={1.6} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-navy-900">
                    {data.label}
                  </h3>
                </div>

                <p className="relative mt-6 font-body text-base leading-relaxed text-navy-600 sm:text-lg">
                  {data.text}
                </p>

                {/* Bottom accent bar */}
                <div
                  className={`relative mt-6 h-1 w-20 rounded-full transition-all duration-300 group-hover:w-32 ${
                    accent === 'gold' ? 'bg-gold-gradient' : 'bg-navy-gradient'
                  }`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Core Values heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 text-center"
        >
          <span className="eyebrow">Our Core Values</span>
          <h3 className="mt-4 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            The Principles We Live By
          </h3>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gold-gradient" />
        </motion.div>

        {/* Core values interactive grid */}
        <CoreValuesGrid />
      </div>
    </section>
  );
}
