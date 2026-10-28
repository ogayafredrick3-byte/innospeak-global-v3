import { motion } from 'framer-motion';
import { GraduationCap, FlaskConical, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.12, 0.1);

export default function AboutLabs() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
        >
          <div className="mb-12 sm:mb-14 lg:mb-16">
            <SectionHeading
              eyebrow="More Than a Course"
              title="Where Skills Meet Real Problems"
              subtitle="Labs builds on what you learn. Choose from seven innovation pathways and work toward building something real."
            />
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:gap-7">
            {/* Academy card */}
            <motion.article
              variants={fadeUpItem}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-cream p-6 shadow-premium transition-all duration-300 hover:border-navy-200 hover:shadow-premium-lg sm:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400 sm:h-14 sm:w-14">
                  <GraduationCap size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span className="rounded-full bg-navy-100 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-navy-600">
                  Structured
                </span>
              </div>

              <h3 className="mt-5 font-display text-lg font-bold text-navy-900 sm:text-xl">
                Academy
              </h3>

              <p className="mt-3 flex-1 font-body text-sm leading-6 text-navy-600 sm:text-base sm:leading-7">
                Structured programmes, modules and certification help you build skills
                in communication, engineering, technology and business from the ground up.
              </p>

              <div className="mt-6 border-t border-navy-200/60 pt-5">
                <Link
                  to="/academy"
                  className="inline-flex items-center gap-1.5 font-body text-sm font-bold text-navy-900 transition-all duration-300 group-hover:gap-2.5"
                >
                  Explore Academy
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.article>

            {/* Labs card */}
            <motion.article
              variants={fadeUpItem}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-gold-400/40 bg-navy-900 p-6 shadow-premium-lg transition-all duration-300 hover:border-gold-400/70 sm:p-8"
            >
              {/* Subtle gold glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold-500/10 blur-2xl" aria-hidden="true" />

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-gradient text-navy-900 shadow-gold sm:h-14 sm:w-14">
                  <FlaskConical size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-300 ring-1 ring-gold-500/30">
                  <Sparkles size={10} />
                  Hands-on
                </span>
              </div>

              <h3 className="relative mt-5 font-display text-lg font-bold text-white sm:text-xl">
                Labs
              </h3>

              <p className="relative mt-3 flex-1 font-body text-sm leading-6 text-navy-200 sm:text-base sm:leading-7">
                No lessons, no quizzes. You join a team or bring your own idea, work against a
                real challenge with a mentor and a deadline, and walk away with something you
                actually built.
              </p>

              <div className="relative mt-6 border-t border-white/10 pt-5">
                <Link
                  to="/labs#labs-catalogue"
                  className="inline-flex items-center gap-1.5 font-body text-sm font-bold text-gold-300 transition-all duration-300 group-hover:gap-2.5"
                >
                  Explore Labs
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.article>
          </div>

          {/* Bridge line */}
          <motion.div
            variants={fadeUpItem}
            className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-navy-100 bg-cream/60 px-6 py-4 text-center sm:flex-row sm:gap-4 sm:text-left"
          >
            <span className="font-body text-xs leading-6 text-navy-600 sm:text-sm">
              Most learners move from Academy into Labs once they are ready to apply what they have learned.
            </span>
            <Link
              to="/programs"
              className="inline-flex shrink-0 items-center gap-1.5 font-body text-xs font-bold text-navy-900 transition-all duration-300 hover:gap-2.5"
            >
              See how programs connect
              <ArrowRight size={12} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}