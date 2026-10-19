import { motion } from 'framer-motion';
import { ClipboardCheck } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { getIcon } from '../../../lib/icons/iconMap';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.1, 0.05);

export default function Assessment({ course }) {
  const methods = course.assessment || [];

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
              eyebrow={course.hasStructuredCurriculum ? 'Assessment' : 'Proposed Assessment'}
              title={course.hasStructuredCurriculum ? 'How You Will Be Assessed' : 'Draft Assessment Approach'}
              subtitle={
                methods.length > 0
                  ? (course.hasStructuredCurriculum ? 'Assessment methods and weighting are published for self-paced study. Follow the instructions in each activity and retain evidence of your work; live assessment arrangements will be announced separately.' : 'This is a proposed assessment structure. Pass criteria, rubrics and delivery arrangements require academic approval before enrolment opens.')
                  : 'Assessment methods for this course are being finalised.'
              }
            />
          </div>

          {methods.length === 0 ? (
            <motion.div
              variants={fadeUpItem}
              className="mx-auto max-w-3xl rounded-2xl border border-dashed border-navy-200 bg-cream/40 px-6 py-16 text-center shadow-premium sm:px-10 sm:py-20"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
                <ClipboardCheck size={24} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-navy-900 sm:text-xl">
                Assessment details coming soon
              </h3>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-navy-500">
                The assessment structure for this course will be published here
                shortly.
              </p>
            </motion.div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-7 ${
                methods.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
              }`}
            >
              {methods.map(({ icon, label, description }, i) => {
                const Icon = getIcon(icon) || ClipboardCheck;
                return (
                  <motion.article
                    key={i}
                    variants={fadeUpItem}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex h-full flex-col items-center rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-7"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900 sm:h-14 sm:w-14">
                      <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                    </div>

                    <h3 className="mt-5 font-display text-sm font-bold text-navy-900 sm:text-base">
                      {label}
                    </h3>
                    <p className="mt-2 font-body text-xs leading-5 text-navy-600 sm:text-sm sm:leading-6">
                      {description}
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