import { motion } from 'framer-motion';
import SectionHeading from '../../ui/SectionHeading.jsx';
import HighlightCards from '../../home/HighlightCards.jsx';
import { inViewOnce } from '../../../lib/motion/presets';

export default function ImpactHighlights() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-premium">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={inViewOnce} transition={{ duration: 0.5 }}>
          <SectionHeading
            eyebrow="Where It Shows Up"
            title="Impact That Extends Beyond the Classroom"
            subtitle="What changes for learners, their careers and their communities."
          />

          <div className="mt-12">
            <HighlightCards />
          </div>
        </motion.div>
      </div>
    </section>
  );
}