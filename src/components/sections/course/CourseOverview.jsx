import { motion } from 'framer-motion';
import { Users, Target, CheckCircle2, Quote } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.1, 0.1);

function OverviewCard({ icon: Icon, title, children }) {
  return (
    <motion.article
      variants={fadeUpItem}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-7"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900 sm:h-14 sm:w-14">
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h3 className="mt-5 font-display text-base font-bold text-navy-900 sm:text-lg">
        {title}
      </h3>
      {children}
    </motion.article>
  );
}

export default function CourseOverview({ course }) {
  const { overview } = course;
  const objectives = overview.objectives || [];
  const outcomes = overview.outcomes || [];

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
              eyebrow="Course Overview"
              title="About This Course"
              subtitle="What this course covers, who it is designed for, and what you will walk away with."
            />
          </div>

          {/* Description block */}
          <motion.div
            variants={fadeUpItem}
            className="mx-auto max-w-4xl rounded-2xl border border-navy-100 bg-cream/50 p-6 sm:p-8"
          >
            <Quote size={20} className="text-gold-600" aria-hidden="true" />
            <p className="mt-4 font-body text-base leading-[1.75] text-navy-700 sm:text-lg">
              {overview.description}
            </p>
          </motion.div>

          {/* Three cards */}
          <div className="mt-10 grid gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-7">
            <OverviewCard icon={Users} title="Who This Is For">
              <p className="mt-3 font-body text-sm leading-6 text-navy-600">
                {overview.targetAudience}
              </p>
            </OverviewCard>

            <OverviewCard icon={Target} title="Course Objectives">
              {objectives.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {objectives.map((obj, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 font-body text-sm leading-6 text-navy-600"
                    >
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 flex-shrink-0 text-gold-600"
                        aria-hidden="true"
                      />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 font-body text-sm italic text-navy-500">
                  Objectives will be published soon.
                </p>
              )}
            </OverviewCard>

            <OverviewCard icon={CheckCircle2} title="Expected Outcomes">
              {outcomes.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {outcomes.map((outcome, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 font-body text-sm leading-6 text-navy-600"
                    >
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 flex-shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 font-body text-sm italic text-navy-500">
                  Outcomes will be published soon.
                </p>
              )}
            </OverviewCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}