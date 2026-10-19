import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, BookOpen, ArrowRight, Hammer, Wrench, GraduationCap, FileCheck } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';
import { TVET_LEVELS } from '../../../lib/data/gradeBundles.js';

const ICON_MAP = {
  ART: Hammer,
  CRF: Wrench,
  DIP: GraduationCap,
  HDP: FileCheck,
};

const container = staggerContainer(0.1, 0.08);

export default function TvetComingSoon() {
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-premium">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={inViewOnce}>
          <SectionHeading
            eyebrow="Launching Soon"
            title={
              <>
                TVET Pathways
                <span className="block text-gradient-gold">Artisan · Craft · Diploma · Higher Diploma</span>
              </>
            }
            subtitle="Structured technical and vocational pathways aligned with KNEC and CBET frameworks. Coming to InnoSpeak Academy in the next curriculum release."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TVET_LEVELS.map((level) => {
              const Icon = ICON_MAP[level.code] || Award;

              return (
                <motion.div
                  key={level.code}
                  variants={fadeUpItem}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-shadow duration-300 hover:shadow-premium-lg"
                >
                  <span className="absolute right-4 top-4 rounded-full bg-navy-900 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-400">
                    Coming Soon
                  </span>

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
                    <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  <h3 className="font-display text-xl font-bold text-navy-900">
                    {level.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs font-semibold tracking-wide text-gold-600">
                    TVET · {level.code}
                  </p>

                  <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-navy-600">
                    {level.description}
                  </p>

                  <dl className="mt-5 space-y-2.5 border-t border-navy-100 pt-4">
                    <div className="flex items-center gap-2 font-body text-xs text-navy-600">
                      <Award size={13} className="flex-shrink-0 text-navy-400" />
                      <dt className="sr-only">Entry requirement</dt>
                      <dd>
                        <span className="font-semibold text-navy-900">Entry:</span>{' '}
                        {level.entryRequirement}
                      </dd>
                    </div>
                    <div className="flex items-center gap-2 font-body text-xs text-navy-600">
                      <BookOpen size={13} className="flex-shrink-0 text-navy-400" />
                      <dt className="sr-only">Modules</dt>
                      <dd>
                        <span className="font-semibold text-navy-900">Modules:</span>{' '}
                        {level.modules}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    to="/contact?interest=tvet"
                    className="mt-5 inline-flex items-center gap-2 font-body text-sm font-bold text-navy-900 transition-colors hover:text-gold-700"
                  >
                    Notify me when live
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <p className="mt-10 text-center font-body text-xs text-navy-500">
            TVET levels launch with our next curriculum release. Registered learners are notified first.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
