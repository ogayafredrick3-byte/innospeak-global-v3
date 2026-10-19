import { motion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import Button from '../../ui/Button.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.12, 0.1);

export default function FinalCTA() {
  return (
    <section aria-label="Start your learning journey" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="relative overflow-hidden rounded-3xl bg-navy-950 px-6 py-14 text-center shadow-premium-lg sm:rounded-[32px] sm:px-10 sm:py-16 md:px-16 md:py-20"
        >
          {/* Navy gradient base */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-950" />

          {/* Ambient gold glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl"
            aria-hidden="true"
          />

          {/* Geometric accents */}
          <div
            className="pointer-events-none absolute right-10 top-10 hidden h-24 w-24 rounded-full border border-white/10 sm:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-10 bottom-10 hidden h-16 w-16 rounded-full border border-white/10 sm:block"
            aria-hidden="true"
          />

          <motion.h2
            variants={fadeUpItem}
            className="relative mx-auto max-w-2xl font-display text-3xl font-bold leading-[1.15] text-white sm:text-4xl sm:leading-tight lg:text-5xl"
          >
            Start Your Learning Journey Today
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="relative mx-auto mt-5 max-w-xl font-body text-sm leading-[1.7] text-navy-200 sm:mt-6 sm:text-base sm:leading-relaxed md:text-lg"
          >
            Join thousands of future-ready learners developing communication, language and
            digital skills for success.
          </motion.p>

          <motion.div
            variants={fadeUpItem}
            className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"
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
              to="/contact"
              variant="outline"
              size="lg"
              className="w-full justify-center border-white/30 text-white hover:bg-white hover:text-navy-900 sm:w-auto"
            >
              <Compass size={18} className="mr-2" />
              Contact Admissions
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}