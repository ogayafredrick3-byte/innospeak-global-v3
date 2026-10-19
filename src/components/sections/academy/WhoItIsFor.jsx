import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Globe2, Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: 'Students & Graduates',
    description:
      'Build the communication, digital and professional skills that complement your academic qualifications.',
  },
  {
    icon: Briefcase,
    title: 'Working Professionals',
    description:
      'Upskill, reskill and earn credentials that accelerate your career progression and earning potential.',
  },
  {
    icon: Globe2,
    title: 'Global Learners',
    description:
      'Access internationally relevant education from anywhere with flexible online, physical and hybrid study modes.',
  },
  {
    icon: Rocket,
    title: 'Entrepreneurs & Freelancers',
    description:
      'Develop the practical communication, digital and business skills needed to launch and grow your venture.',
  },
];

const container = staggerContainer(0.1, 0.1);

function AudienceCard({ icon: Icon, title, description }) {
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

export default function WhoItIsFor() {
  return (
    <section aria-label="Who the Academy is for" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <div className="mb-12 sm:mb-14 lg:mb-16">
          <SectionHeading
            eyebrow="Who It Is For"
            title="Built for Every Ambition"
            subtitle="Whether you are starting out, levelling up, or pivoting entirely, the Academy meets you where you are and takes you where you want to go."
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-7"
        >
          {AUDIENCES.map((audience) => (
            <AudienceCard key={audience.title} {...audience} />
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
            to="/programs"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-7 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700 sm:w-auto"
          >
            Explore Programs
          </Link>
        </motion.div>
      </div>
    </section>
  );
}