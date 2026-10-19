import { motion } from 'framer-motion';
import { Rocket, Lightbulb, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const PILLARS = [
  {
    icon: Lightbulb,
    title: 'From Idea to Prototype',
    description:
      'Turn concepts into working prototypes through structured build cycles, mentor feedback and peer collaboration.',
  },
  {
    icon: Rocket,
    title: 'Startup Incubation',
    description:
      'Develop viable ventures with guidance on product, market fit, technical architecture and go-to-market strategy.',
  },
  {
    icon: Users,
    title: 'Team-Based Builds',
    description:
      'Work in cross-functional teams that mirror real engineering organisations — designers, developers, analysts and product thinkers.',
  },
  {
    icon: TrendingUp,
    title: 'Scalable Innovation',
    description:
      'Build projects designed to scale — from local community solutions to globally deployable products and services.',
  },
];

const container = staggerContainer(0.1, 0.1);

function PillarCard({ icon: Icon, title, description }) {
  return (
    <motion.article
      variants={fadeUpItem}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold-400/40 hover:bg-white/10 sm:p-7"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-gradient text-navy-900 shadow-md sm:h-14 sm:w-14">
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <h3 className="mt-5 font-display text-base font-bold text-white sm:text-lg">
        {title}
      </h3>
      <p className="mt-2 flex-1 font-body text-sm leading-6 text-white/70">
        {description}
      </p>
    </motion.article>
  );
}

export default function EntrepreneurshipInnovation() {
  return (
    <section
      aria-label="Entrepreneurship and innovation"
      className="relative overflow-hidden bg-navy-950 py-16 sm:py-20 lg:py-24"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-950" />
      <div
        className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gold-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-premium relative">
        <div className="mb-12 sm:mb-14 lg:mb-16">
          <SectionHeading
            eyebrow="Entrepreneurship & Innovation"
            title="Build Something Real"
            subtitle="Labs is where ideas become products. Whether you are launching a startup or building a portfolio, the innovation framework supports your journey from concept to showcase."
            light
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-7"
        >
          {PILLARS.map((pillar) => (
            <PillarCard key={pillar.title} {...pillar} />
          ))}
        </motion.div>

        {/* Showcase note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm sm:p-8"
        >
          <p className="font-display text-base font-medium italic leading-relaxed text-white/80 sm:text-lg">
            Project showcases and build galleries will appear here as learner teams
            complete their innovation cycles.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <Link
            to="/contact?interest=lab-challenge"
            className="btn-gold inline-flex items-center gap-2 px-7 py-3"
          >
            Submit a Challenge
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}