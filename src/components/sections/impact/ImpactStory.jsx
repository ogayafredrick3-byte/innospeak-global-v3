import { motion } from 'framer-motion';
import SectionHeading from '../../ui/SectionHeading.jsx';
import QuoteCard from '../../home/QuoteCard.jsx';
import { inViewOnce } from '../../../lib/motion/presets';

export default function ImpactStory() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-premium">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={inViewOnce} transition={{ duration: 0.5 }}>
          <SectionHeading eyebrow="Our Belief" title="Why This Work Matters" />

          <div className="mx-auto mt-12 max-w-4xl">
            <QuoteCard />
          </div>
        </motion.div>
      </div>
    </section>
  );
}