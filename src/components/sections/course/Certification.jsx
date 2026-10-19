import { motion } from 'framer-motion';
import { Award, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { getIcon } from '../../../lib/icons/iconMap';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.1, 0.05);

export default function Certification({ course }) {
  const items = course.certificationItems || [];
  const divisionLabel =
    course.division === 'labs'
      ? 'InnoSpeak Global Labs'
      : course.division === 'foundation'
        ? 'InnoSpeak Global Foundation'
        : 'InnoSpeak Global Academy';

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
              eyebrow="Certification"
              title="What You Will Receive"
              subtitle="On successful completion of this course, you receive a complete credential package — issued and verifiable through InnoSpeak Global."
            />
          </div>

          {items.length === 0 ? (
            <motion.div
              variants={fadeUpItem}
              className="mx-auto max-w-3xl rounded-2xl border border-dashed border-navy-200 bg-white px-6 py-16 text-center shadow-premium sm:px-10 sm:py-20"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
                <Award size={24} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-navy-900 sm:text-xl">
                Certification details coming soon
              </h3>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-navy-500">
                Certification details for this course will be published here shortly.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Issuer banner */}
              <motion.div
                variants={fadeUpItem}
                className="mx-auto mb-10 flex max-w-3xl items-center gap-4 rounded-2xl border border-gold-200 bg-gold-50/60 px-5 py-4 sm:px-6 sm:py-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900 shadow-gold">
                  <Award size={20} strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-body text-[11px] font-bold uppercase tracking-wider text-gold-700">
                    Issued by
                  </p>
                  <p className="mt-0.5 font-display text-base font-bold text-navy-900">
                    {divisionLabel}
                  </p>
                </div>
              </motion.div>

              {/* Items grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
                {items.map(({ icon, label, description }, i) => {
                  const Icon = getIcon(icon) || Award;
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
                      <div className="min-w-0">
                        <h3 className="font-display text-sm font-bold text-navy-900 sm:text-base">
                          {label}
                        </h3>
                        <p className="mt-1.5 font-body text-xs leading-5 text-navy-600 sm:text-sm sm:leading-6">
                          {description}
                        </p>
                      </div>
                    </motion.article>
                  );
                })}
              </div>

              {/* Verification CTA */}
              <motion.div
                variants={fadeUpItem}
                className="mt-12 flex justify-center"
              >
                <Link
                  to="/verify-certificate"
                  className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-6 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700"
                >
                  <ShieldCheck size={16} />
                  Verify an InnoSpeak Certificate
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}