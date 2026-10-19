import { motion } from 'framer-motion';
import { Download, Info, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../ui';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.12, 0.1);

export default function FinalCTA({ course }) {
  const enrolTo = `/courses/${course.code}#course-enrolment`;
  const hasBrochure = course.brochureUrl && course.brochureUrl !== '#';

  const divisionLabel =
    course.division === 'labs'
      ? 'InnoSpeak Global Labs'
      : course.division === 'foundation'
        ? 'InnoSpeak Global Foundation'
        : 'InnoSpeak Global Academy';

  return (
    <section className="relative overflow-hidden bg-navy-950 py-16 sm:py-20 lg:py-24">
      {/* Navy gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-950" />

      {/* Animated gold glows */}
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl"
        aria-hidden="true"
      />
      <motion.div
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,160,23,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
        aria-hidden="true"
      />

      <div className="container-premium relative">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.span
            variants={fadeUpItem}
            className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 font-body text-[11px] font-bold uppercase tracking-wider text-gold-300 backdrop-blur-sm sm:text-xs"
          >
            <Sparkles size={13} aria-hidden="true" />
            Start Your Journey
          </motion.span>

          {/* Headline */}
          <motion.h2
            variants={fadeUpItem}
            className="mt-6 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
          >
            Ready to Begin Your Learning Journey?
          </motion.h2>

          {/* Description — division-aware */}
          <motion.p
            variants={fadeUpItem}
            className="mt-5 max-w-2xl font-body text-sm leading-[1.7] text-navy-200 sm:mt-6 sm:text-base sm:leading-relaxed lg:text-lg"
          >
            Build practical skills, create evidence of your work and explore meaningful next-step
            opportunities through {divisionLabel}.
          </motion.p>

          {/* Primary CTAs */}
          <motion.div
            variants={fadeUpItem}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
          >
            <Button
              to={enrolTo}
              variant="gold"
              size="lg"
              className="group w-full justify-center sm:w-auto"
            >
              Enroll in This Course
              <ArrowRight
                size={16}
                className="ml-2 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>
            <Button
              to="/contact"
              variant="outline"
              size="lg"
              withArrow={false}
              className="w-full justify-center border-white/30 text-white hover:bg-white hover:text-navy-900 sm:w-auto"
            >
              <Info size={16} className="mr-2" aria-hidden="true" />
              Request Information
            </Button>
          </motion.div>

          {/* Secondary CTA */}
          {hasBrochure && (
            <motion.div variants={fadeUpItem} className="mt-6">
              <a
                href={course.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-body text-xs font-semibold text-navy-300 underline underline-offset-4 transition-colors hover:text-gold-300 sm:text-sm"
              >
                <Download size={14} aria-hidden="true" />
                Download the course brochure
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}