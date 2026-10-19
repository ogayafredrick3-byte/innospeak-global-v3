
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.05, 0.04);

export default function CareerOpportunities({ course }) {
  const careers = course.careers || [];

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
              eyebrow="Career Opportunities"
              title="Where This Can Take You"
              subtitle={
                careers.length > 0
                  ? 'Graduates of this course pursue careers in a range of fields:'
                  : 'Career pathways for this course are being finalised.'
              }
            />
          </div>

          {careers.length === 0 ? (
            <motion.div
              variants={fadeUpItem}
              className="mx-auto max-w-3xl rounded-2xl border border-dashed border-navy-200 bg-white px-6 py-16 text-center shadow-premium sm:px-10 sm:py-20"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
                <Briefcase size={24} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-navy-900 sm:text-xl">
                Career pathways coming soon
              </h3>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-navy-500">
                Career opportunities linked to this course will be published here
                shortly.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {careers.map((career, i) => (
                <motion.div
                  key={i}
                  variants={fadeUpItem}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-5"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900 sm:h-10 sm:w-10">
                    <Briefcase size={16} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <span className="font-body text-xs font-semibold leading-5 text-navy-900 sm:text-sm">
                    {career}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Career Hub CTA */}
          <motion.div
            variants={fadeUpItem}
            className="mt-12 flex justify-center"
          >
            <Link
              to="/career-hub"
              className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-6 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700"
            >
              Explore the Career Hub
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}