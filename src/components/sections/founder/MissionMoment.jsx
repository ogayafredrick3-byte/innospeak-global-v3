import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.12, 0.1);

export default function MissionMoment() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-premium">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUpItem} className="flex justify-center">
            <Quote size={36} className="text-gold-300" aria-hidden="true" />
          </motion.div>

          <motion.p
            variants={fadeUpItem}
            className="mt-6 font-display text-2xl font-bold italic leading-snug text-navy-900 md:text-3xl"
          >
            "To ignite courageous innovation by transforming overlooked ideas into practical
            solutions that empower individuals, strengthen communities, and shape a better future."
          </motion.p>

          <motion.p variants={fadeUpItem} className="mt-4 font-body text-sm font-semibold uppercase tracking-wider text-gold-600">
            Fred's Mission
          </motion.p>

          <motion.p variants={fadeUpItem} className="mt-10 font-body text-base leading-8 text-navy-600 md:text-lg">
            His vision extends beyond building an institution. He is committed to cultivating a
            global community of visionary thinkers, skilled professionals, confident communicators,
            and purpose-driven entrepreneurs who will lead with excellence and create lasting impact
            across industries and communities.
          </motion.p>

          <motion.p variants={fadeUpItem} className="mt-6 font-body text-base leading-8 text-navy-600 md:text-lg">
            For Fred Omondi, success is not measured by personal achievements alone, but by the lives
            transformed, the opportunities created, and the legacy built through education,
            innovation, and service.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}