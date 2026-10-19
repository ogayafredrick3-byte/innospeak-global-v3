import { motion } from 'framer-motion';
import {
  UserCheck,
  Clock,
  FolderCheck,
  LifeBuoy,
  Globe2,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

/**
 * WhyStudyWithUs — 6 feature cards with decorative numbered medallions.
 */

const REASONS = [
  {
    icon: UserCheck,
    title: 'Experienced Trainers',
    description: 'Learn from experienced educators, practitioners and industry leaders.',
  },
  {
    icon: Clock,
    title: 'Flexible Learning',
    description: 'Online, physical and hybrid modes that fit your schedule and goals.',
  },
  {
    icon: FolderCheck,
    title: 'Practical Projects',
    description: 'Apply your learning through hands-on, real-world projects and tasks.',
  },
  {
    icon: LifeBuoy,
    title: 'Career Support',
    description: 'Mentorship, guidance and opportunities that extend beyond the classroom.',
  },
  {
    icon: Globe2,
    title: 'International Standards',
    description: 'Curricula benchmarked to international standards of excellence.',
  },
  {
    icon: Wallet,
    title: 'Affordable Fees',
    description: 'Premium education at accessible fees, with flexible payment options.',
  },
];

const container = staggerContainer(0.1, 0.1);

function ReasonCard({ icon: Icon, title, description, index }) {
  return (
    <motion.article
      variants={fadeUpItem}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-7"
    >
      {/* Decorative number */}
      <span
        className="pointer-events-none absolute right-5 top-4 font-display text-5xl font-bold leading-none text-navy-100 sm:text-6xl"
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900 sm:h-14 sm:w-14">
        <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <h3 className="relative mt-5 font-display text-base font-bold text-navy-900 sm:text-lg">
        {title}
      </h3>
      <p className="relative mt-2 font-body text-sm leading-6 text-navy-600">
        {description}
      </p>
    </motion.article>
  );
}

export default function WhyStudyWithUs() {
  return (
    <section aria-label="Why study with us" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <div className="mb-12 sm:mb-14 lg:mb-16">
          <SectionHeading
            eyebrow="Why Study With Us"
            title="An Academy Built Around Your Growth"
            subtitle="We combine expert instruction, flexible learning and genuine career support to give you an education that truly moves you forward."
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7"
        >
          {REASONS.map((reason, i) => (
            <ReasonCard key={reason.title} index={i} {...reason} />
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
            to="/apply"
            className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
          >
            Apply Now
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/about"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-7 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700 sm:w-auto"
          >
            Learn More About Us
          </Link>
        </motion.div>
      </div>
    </section>
  );
}