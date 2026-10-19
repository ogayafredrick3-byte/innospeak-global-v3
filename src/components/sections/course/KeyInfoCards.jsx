import { motion } from 'framer-motion';
import {
  Clock, BarChart3, Monitor, Globe, Award, CreditCard, Calendar, Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';
import { INTAKES } from '../../../lib/data/programmeData';

const container = staggerContainer(0.06, 0.05);

export default function KeyInfoCards({ course }) {
  const isFree = course.isFree === true;

  const items = [
    { icon: Clock, label: 'Duration', value: course.duration },
    { icon: BarChart3, label: 'Course Level', value: course.level },
    { icon: Monitor, label: 'Study Mode', value: course.studyMode },
    { icon: Globe, label: 'Language', value: course.languageOfInstruction || course.language },
    { icon: Award, label: 'Certification', value: course.certification },
    {
      icon: isFree ? Sparkles : CreditCard,
      label: isFree ? 'Tuition' : 'Course Fee',
      value: isFree ? 'Free to complete' : course.fees,
      highlight: true,
    },
    { icon: Calendar, label: 'Intakes', value: INTAKES.join(' · ') },
  ].filter((item) => item.value);

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
              eyebrow="Key Information"
              title="Course Details at a Glance"
              subtitle="Everything you need to know before you apply."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {items.map(({ icon: Icon, label, value, highlight }) => (
              <motion.div
                key={label}
                variants={fadeUpItem}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`group flex h-full flex-col rounded-2xl border bg-white p-5 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg sm:p-6 ${
                  highlight
                    ? 'border-gold-300/60 hover:border-gold-400'
                    : 'border-navy-100 hover:border-gold-300/60'
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300 sm:h-12 sm:w-12 ${
                    highlight
                      ? 'bg-gold-gradient text-navy-900'
                      : 'bg-navy-900 text-gold-400 group-hover:bg-gold-gradient group-hover:text-navy-900'
                  }`}
                >
                  <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <p className="mt-4 font-body text-[10px] font-bold uppercase tracking-wider text-navy-400 sm:text-xs">
                  {label}
                </p>
                <p
                  className={`mt-1.5 font-body text-sm font-bold leading-5 sm:text-base ${
                    highlight ? 'text-emerald-600' : 'text-navy-900'
                  }`}
                >
                  {value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inViewOnce}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              to={`/apply?courseCode=${course.code}`}
              className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
            >
              Apply for This Course
            </Link>
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-7 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700 sm:w-auto"
            >
              Ask a Question
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}