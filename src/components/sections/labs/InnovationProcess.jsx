import { motion } from 'framer-motion';
import { Compass, Users, Hammer, Trophy } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const STEPS = [
  {
    icon: Compass,
    title: 'Discover or Propose',
    description: 'Pick up a real sourced challenge, or bring your own idea to the table.',
  },
  {
    icon: Users,
    title: 'Team & Mentor Match',
    description: 'Get paired with collaborators and a mentor suited to your track.',
  },
  {
    icon: Hammer,
    title: 'Build & Iterate',
    description: 'Work through structured check-ins, feedback and revisions.',
  },
  {
    icon: Trophy,
    title: 'Showcase & Launch',
    description: 'Present your outcome at a demo day, pitch panel or public showcase.',
  },
];

const container = staggerContainer(0.1, 0.1);

function ProcessStep({ step, index }) {
  const Icon = step.icon;

  return (
    <motion.li
      variants={fadeUpItem}
      className="group relative flex flex-col items-center text-center"
    >
      {/* Medallion */}
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 shadow-premium transition-transform duration-300 group-hover:scale-105">
        <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-gradient font-display text-xs font-bold text-navy-900 shadow-gold">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-5 font-display text-sm font-bold text-navy-900 sm:text-base">
        {step.title}
      </h3>

      {/* Description */}
      <p className="mt-2 max-w-[15rem] font-body text-xs leading-5 text-navy-600 sm:text-sm sm:leading-6">
        {step.description}
      </p>
    </motion.li>
  );
}

export default function InnovationProcess() {
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
              eyebrow="How It Works"
              title="The Same Process, Every Track"
              subtitle="Whichever track you choose, the journey follows the same rhythm."
            />
          </div>

          <div className="relative">
            {/* Connector line on desktop */}
            <div
              className="pointer-events-none absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent md:block"
              aria-hidden="true"
            />

            <ol className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 md:grid-cols-4 md:gap-6">
              {STEPS.map((step, i) => (
                <ProcessStep key={step.title} step={step} index={i} />
              ))}
            </ol>
          </div>
        </motion.div>
      </div>
    </section>
  );
}