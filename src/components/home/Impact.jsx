import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading.jsx';
import HighlightCards from './HighlightCards.jsx';
import QuoteCard from './QuoteCard.jsx';
import Button from '../ui/Button.jsx';
import useCountUp from '../../hooks/useCountUp.js';
import useInView from '../../hooks/useInView.js';
import { IMPACT_STATS } from './impactData.js';

/**
 * Impact — real numbers, honest framing.
 * Stats count up on scroll. No fabricated figures.
 */

function StatTile({ stat, index }) {
  const [ref, inView] = useInView();
  const animated = useCountUp(stat.value, 1600, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center rounded-2xl border border-navy-100 bg-white px-6 py-8 text-center shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-premium-lg sm:px-8 sm:py-10"
    >
      {/* Gold accent line at top */}
      <span className="absolute left-1/2 top-0 h-1 w-12 -translate-x-1/2 rounded-b-full bg-gold-gradient" />

      {/* Value */}
      <div className="font-display text-4xl font-bold leading-none text-navy-900 sm:text-5xl">
        {inView ? animated : 0}
        <span className="text-gold-500">{stat.suffix}</span>
      </div>

      {/* Label */}
      <div className="mt-4 font-body text-[11px] font-bold uppercase tracking-wider text-navy-700 sm:text-xs">
        {stat.label}
      </div>

      {/* Description */}
      {stat.description && (
        <div className="mt-1.5 font-body text-xs leading-5 text-navy-500">
          {stat.description}
        </div>
      )}
    </motion.div>
  );
}

export default function Impact() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
  eyebrow="Platform Snapshot"
  title="A Clear View of the InnoSpeak Ecosystem"
  subtitle="These figures describe the current source catalogue and connected programme areas. Learner outcomes and Foundation impact will be published separately when verified records are available."
/>

        {/* Stats grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {IMPACT_STATS.map((stat, i) => (
            <StatTile key={stat.id} stat={stat} index={i} />
          ))}
        </div>

        {/* Full-impact link */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-navy-100 bg-cream px-5 py-2.5">
            <TrendingUp size={15} className="text-gold-600" />
            <span className="font-body text-xs font-semibold text-navy-700 sm:text-sm">
              Catalogue and programme structure
            </span>
          </div>
        </motion.div>

        {/* Highlights */}
        <div className="mt-16">
          <HighlightCards />
        </div>

        {/* Quote */}
        <div className="mt-12">
          <QuoteCard />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <Button to="/impact" variant="outline" size="lg" className="group">
            See Our Full Impact
            <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}