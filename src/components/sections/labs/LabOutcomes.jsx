import { motion } from 'framer-motion';
import { Cpu, Presentation, BadgeCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const OUTCOMES = [
  {
    icon: Cpu,
    title: 'A Working Prototype',
    description:
      'Something you actually built — code, hardware, or a functioning product, not just a plan.',
  },
  {
    icon: Presentation,
    title: 'A Mentor-Reviewed Pitch',
    description:
      'A tested, feedback-sharpened pitch or project brief, ready to present with confidence.',
  },
  {
    icon: BadgeCheck,
    title: 'A Public Showcase Credit',
    description:
      'Recognition at a demo day, plus a portfolio piece you can point to in interviews and applications.',
  },
];

const container = staggerContainer(0.1, 0.1);

function OutcomeCard({ icon: Icon, title, description }) {
  return (
    <motion.article
      variants={fadeUpItem}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-7"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900 sm:h-14 sm:w-14">
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
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

export default function LabOutcomes() {
  return (
    <section className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <div className="mb-12 sm:mb-14 lg:mb-16">
          <SectionHeading
            eyebrow="What You Walk Away With"
            title="Proof, Not Just a Certificate"
            subtitle="Every track ends with something real in hand — not a completion badge."
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7"
        >
          {OUTCOMES.map((outcome) => (
            <OutcomeCard key={outcome.title} {...outcome} />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/courses?division=labs"
            className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
          >
            Explore Lab Tracks
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/become-tutor"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-7 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700 sm:w-auto"
          >
            Become a Mentor
          </Link>
        </motion.div>
      </div>
    </section>
  );
}