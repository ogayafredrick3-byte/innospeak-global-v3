import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { getIcon } from '../../../lib/icons/iconMap';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.08, 0.05);

export default function LearningOutcomes({ course }) {
  const outcomes = course.learningOutcomes || [];

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
              eyebrow={course.hasStructuredCurriculum ? 'Learning Outcomes' : 'Proposed Outcomes'}
              title={course.hasStructuredCurriculum ? 'What You Will Achieve' : 'Draft Capability Outcomes'}
              subtitle={
                outcomes.length > 0
                  ? (course.hasStructuredCurriculum ? 'The following outcomes are recorded in the current course-detail content and must be confirmed by the academic owner before delivery.' : 'These are provisional outcomes generated to structure the course page. A subject reviewer must validate them before delivery.')
                  : 'Outcomes for this course are being finalised.'
              }
            />
          </div>

          {outcomes.length === 0 ? (
            <motion.div
              variants={fadeUpItem}
              className="mx-auto max-w-3xl rounded-2xl border border-dashed border-navy-200 bg-cream/40 px-6 py-16 text-center shadow-premium sm:px-10 sm:py-20"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
                <Target size={24} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-navy-900 sm:text-xl">
                Outcomes coming soon
              </h3>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-navy-500">
                Detailed learning outcomes will be published here shortly. In the
                meantime, review the course overview and entry requirements above.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
              {outcomes.map(({ icon, text }, i) => {
                const Icon = getIcon(icon) || Target;
                return (
                  <motion.article
                    key={i}
                    variants={fadeUpItem}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex h-full items-start gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-7"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900 sm:h-12 sm:w-12">
                      <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <p className="pt-1 font-body text-sm font-medium leading-6 text-navy-900">
                      {text}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}