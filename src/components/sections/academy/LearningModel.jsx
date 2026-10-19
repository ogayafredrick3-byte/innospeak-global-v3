import { motion } from 'framer-motion';
import {
  Route,
  BookOpen,
  Layers,
  ClipboardCheck,
  FolderCheck,
  Award,
  Globe2,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

/**
 * LearningModel — the InnoSpeak Learning Journey.
 * 7 steps shown as 4 + 3 on desktop, 2-column on tablet, single on mobile.
 */

const STEPS = [
  { icon: Route, title: 'Choose Pathway', description: 'Select the pathway aligned to your goals.' },
  { icon: BookOpen, title: 'Choose Programme', description: 'Enrol in a programme that builds real skills.' },
  { icon: Layers, title: 'Study Modules', description: 'Progress through structured, practical modules.' },
  { icon: ClipboardCheck, title: 'Continuous Assessment', description: 'Get regular feedback to sharpen your skills.' },
  { icon: FolderCheck, title: 'Capstone Project', description: 'Apply your learning to a real-world project.' },
  { icon: Award, title: 'Professional Certification', description: 'Earn recognised credentials for your work.' },
  { icon: Globe2, title: 'Global Opportunities', description: 'Unlock study, work and leadership pathways worldwide.' },
];

const container = staggerContainer(0.1, 0.08);

function StepCard({ step, index }) {
  const Icon = step.icon;
  return (
    <motion.li
      variants={fadeUpItem}
      className="group relative flex flex-col items-center text-center"
    >
      {/* Icon medallion */}
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 shadow-premium transition-transform duration-300 group-hover:scale-105">
        <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
        {/* Step number badge */}
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

export default function LearningModel() {
  return (
    <section aria-label="The InnoSpeak learning model" className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <div className="mb-12 sm:mb-14 lg:mb-16">
          <SectionHeading
            eyebrow="Learning Model"
            title="The InnoSpeak Learning Journey"
            subtitle="A clear, guided path from your first choice to global opportunity — designed to keep you moving forward with confidence."
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="space-y-10 sm:space-y-12 lg:space-y-14"
        >
          {/* Row 1 — Steps 1–4 */}
          <div className="relative">
            {/* Connector line behind row 1 */}
            <div
              className="pointer-events-none absolute left-[8%] right-[8%] top-8 hidden h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent lg:block"
              aria-hidden="true"
            />
            <ol className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-6">
              {STEPS.slice(0, 4).map((step, i) => (
                <StepCard key={step.title} step={step} index={i} />
              ))}
            </ol>
          </div>

          {/* Row 2 — Steps 5–7 */}
          <div className="relative">
            {/* Connector line behind row 2 */}
            <div
              className="pointer-events-none absolute left-[25%] right-[25%] top-8 hidden h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent lg:block"
              aria-hidden="true"
            />
            <ol className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-6">
              {STEPS.slice(4).map((step, i) => (
                <StepCard key={step.title} step={step} index={4 + i} />
              ))}
            </ol>
          </div>
        </motion.div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/apply"
            className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
          >
            Start Your Journey
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