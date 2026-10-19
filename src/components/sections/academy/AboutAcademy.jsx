import { motion } from 'framer-motion';
import { Clock, BookOpenCheck, Award, Globe2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import {
  staggerContainer,
  fadeUpItem,
  inViewOnce,
} from '../../../lib/motion/presets';

/**
 * AboutAcademy — introduces the Academy with 4 feature cards
 * and a CTA row that routes into the catalogue.
 */

const FEATURES = [
  {
    icon: Clock,
    title: 'Flexible Learning',
    description:
      'Study online, on campus or through hybrid programmes designed to fit around your lifestyle and career ambitions.',
  },
  {
    icon: BookOpenCheck,
    title: 'Industry-Relevant Curriculum',
    description:
      'Practical learning pathways aligned with international standards and real-world employer expectations.',
  },
  {
    icon: Award,
    title: 'Professional Certification',
    description:
      'Earn recognised qualifications and certifications that strengthen your academic and professional profile.',
  },
  {
    icon: Globe2,
    title: 'Global Career Preparation',
    description:
      'Develop future-ready skills, confidence and international exposure for opportunities across the world.',
  },
];

const container = staggerContainer(0.1, 0.15);

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.article
      variants={fadeUpItem}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-7"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900 sm:h-14 sm:w-14">
        <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <h3 className="mt-5 font-display text-base font-bold text-navy-900 sm:text-lg">
        {title}
      </h3>
      <p className="mt-2 flex-1 font-body text-sm leading-6 text-navy-600">
        {description}
      </p>
    </motion.article>
  );
}

export default function AboutAcademy() {
  return (
    <section aria-label="About the Academy" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <div className="mb-12 sm:mb-14 lg:mb-16">
          <SectionHeading
            eyebrow="About The Academy"
            title="Flexible Learning for Every Ambition"
            subtitle="InnoSpeak Global Academy empowers students, professionals, graduates and lifelong learners through flexible, internationally relevant education that builds confidence, practical expertise and global career readiness."
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-7"
        >
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </motion.div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/courses"
            className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
          >
            Browse the Catalogue
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/apply"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-7 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700 sm:w-auto"
          >
            Apply Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}