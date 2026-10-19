import { motion } from 'framer-motion';
import { CheckCircle2, ClipboardList } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.1, 0.05);

export default function EntryRequirements({ course }) {
  const requirements = course.entryRequirements || [];

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
              eyebrow="Entry Requirements"
              title="Who Can Apply"
              subtitle={
                requirements.length > 0
                  ? 'Check that you meet the requirements below before applying.'
                  : 'Entry requirements for this course are being finalised.'
              }
            />
          </div>

          {requirements.length === 0 ? (
            <motion.div
              variants={fadeUpItem}
              className="mx-auto max-w-3xl rounded-2xl border border-dashed border-navy-200 bg-white px-6 py-16 text-center shadow-premium sm:px-10 sm:py-20"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
                <ClipboardList size={24} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-navy-900 sm:text-xl">
                Requirements coming soon
              </h3>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-navy-500">
                Entry requirements for this course will be published here shortly.
                Contact our admissions team for details.
              </p>
            </motion.div>
          ) : (
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              {requirements.map((req, i) => (
                <motion.div
                  key={i}
                  variants={fadeUpItem}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-3 rounded-2xl border border-navy-100 bg-white p-5 shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-6"
                >
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/15">
                    <CheckCircle2
                      size={14}
                      className="text-gold-700"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  </span>
                  <p className="font-body text-sm font-medium leading-6 text-navy-900">
                    {req}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}