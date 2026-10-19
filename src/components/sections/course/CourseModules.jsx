import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, BookOpen, Layers } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce, easeOutExpo } from '../../../lib/motion/presets';

const container = staggerContainer(0.1, 0.05);

export default function CourseModules({ course }) {
  const [openIndex, setOpenIndex] = useState(0);
  const modules = course.modules || [];
  const totalHours = modules.reduce((sum, m) => sum + (m.hours || 0), 0);

  return (
    <section className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
        >
          <div className="mb-12 sm:mb-14 lg:mb-16">
            <SectionHeading
              eyebrow={course.hasStructuredCurriculum ? 'Course Modules' : 'Proposed Curriculum'}
              title={course.hasStructuredCurriculum ? 'What You Will Learn' : 'Draft Learning Sequence'}
              subtitle={
                modules.length > 0
                  ? (course.hasStructuredCurriculum ? 'Follow the published module sequence at your own pace. Each module includes learning activities and evidence of learning; any live sessions are announced separately.' : 'This draft gives the course a page structure. The course owner must review the module sequence, hours, resources and assessments before delivery.')
                  : 'The curriculum for this course is being finalised.'
              }
            />
          </div>

          {/* ── Empty state ── */}
          {modules.length === 0 ? (
            <motion.div
              variants={fadeUpItem}
              className="mx-auto max-w-3xl rounded-2xl border border-dashed border-navy-200 bg-white px-6 py-16 text-center shadow-premium sm:px-10 sm:py-20"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
                <Layers size={24} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-navy-900 sm:text-xl">
                Curriculum coming soon
              </h3>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-navy-500">
                The module breakdown for this course will be published here shortly. In the
                meantime, you can review the learning outcomes and entry requirements above,
                or contact us for a detailed syllabus.
              </p>
            </motion.div>
          ) : (
            <>
              {/* ── Modules accordion ── */}
              <motion.div
                variants={fadeUpItem}
                className="mx-auto max-w-3xl divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-premium"
              >
                {modules.map((module, i) => {
                  const isOpen = openIndex === i;
                  return (
                    <div key={i}>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-inset sm:px-6 sm:py-5"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-navy-900 font-mono text-xs font-bold text-gold-400 sm:h-9 sm:w-9 sm:text-sm">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="font-body text-sm font-semibold text-navy-900 sm:text-base">
                            {module.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="hidden items-center gap-1.5 font-body text-xs font-medium text-navy-500 sm:flex">
                            <Clock size={14} aria-hidden="true" />
                            {module.hours}h
                          </span>
                          <span
                            className={`text-gold-600 transition-transform duration-300 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          >
                            <ChevronDown size={20} />
                          </span>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: easeOutExpo }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pl-14 sm:px-6 sm:pl-[4.5rem]">
                              <p className="font-body text-sm leading-6 text-navy-600">
                                {module.description}
                              </p>
                              {Array.isArray(module.learningOutcomes) && module.learningOutcomes.length > 0 && (
                                <div className="mt-4 rounded-xl border border-navy-100 bg-cream/60 p-4">
                                  <p className="font-body text-xs font-bold uppercase tracking-wide text-navy-700">Proposed module outcome</p>
                                  <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm leading-6 text-navy-600">
                                    {module.learningOutcomes.map((outcome, outcomeIndex) => (
                                      <li key={`${i}-outcome-${outcomeIndex}`}>{outcome}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gold-500/10 px-3 py-1.5 font-body text-xs font-medium text-gold-700">
                                <BookOpen size={14} aria-hidden="true" />
                                Estimated learning time: {module.hours} hours
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>

              {/* Total hours */}
              <motion.p
                variants={fadeUpItem}
                className="mt-6 text-center font-body text-sm font-medium text-navy-600"
              >
                Total estimated learning time:{' '}
                <span className="font-bold text-navy-900">{totalHours} hours</span>
              </motion.p>
              {!course.hasStructuredCurriculum && (
                <p className="mx-auto mt-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center font-body text-xs leading-5 text-amber-900" role="note">This is a planning draft. Review the course-specific content and any applicable safety requirements before using it for instructor-led or regulated delivery.</p>
              )}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}