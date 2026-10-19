import { motion } from 'framer-motion';
import SectionHeading from '../../ui/SectionHeading.jsx';
import StatCard from '../../home/StatCard.jsx';
import { IMPACT_STATS } from '../../home/impactData.js';
import { staggerContainer, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.08, 0.05);

export default function ImpactStats() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-premium">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={inViewOnce}>
          <SectionHeading
            eyebrow="By The Numbers"
            title="Growth You Can See"
            subtitle="A snapshot of where InnoSpeak Global stands today."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {IMPACT_STATS.map((stat, i) => (
              <StatCard key={stat.id} stat={stat} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}