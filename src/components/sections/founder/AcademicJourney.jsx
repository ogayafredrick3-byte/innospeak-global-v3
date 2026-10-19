import { motion } from 'framer-motion';
import { Zap, GraduationCap } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const STAGES = [
  {
    icon: Zap,
    institution: 'Kiambu Institute of Science and Technology (KIST)',
    credential: 'Diploma in Electrical and Electronics Engineering (Power Option)',
    description:
      'Developed a passion for practical engineering, problem-solving, and designing solutions that address real-world challenges — alongside an entrepreneurial mindset for turning ideas into meaningful impact.',
  },
  {
    icon: GraduationCap,
    institution: 'Kenya School of Technical and Vocational Education and Training',
    credential: 'Diploma in Technical Trainer Education (DTTE), Electrical and Electronics Engineering',
    description:
      'Strengthened the ability to combine technical excellence with modern teaching methodologies, leadership, and learner-centered education.',
  },
];

const container = staggerContainer(0.15, 0.1);

export default function AcademicJourney() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-premium">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={inViewOnce}>
          <SectionHeading
            eyebrow="Academic Foundation"
            title="The Journey That Shaped a Vision"
            subtitle="A foundation built on engineering rigor, then deepened by a calling toward education."
          />

          <div className="relative mt-14">
            <div
              className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-gold-300 via-navy-200 to-gold-300 md:block"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
              {STAGES.map((stage, i) => (
                <motion.div key={stage.institution} variants={fadeUpItem} className="relative text-center md:text-left">
                  <div className="flex flex-col items-center md:items-start">
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 shadow-premium">
                      <stage.icon size={26} strokeWidth={1.8} aria-hidden="true" />
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-gradient font-display text-xs font-bold text-navy-900">
                        {i + 1}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-base font-bold text-navy-900">{stage.institution}</h3>
                    <p className="mt-2 font-body text-sm font-semibold text-gold-600">{stage.credential}</p>
                    <p className="mt-3 max-w-sm font-body text-sm leading-relaxed text-navy-600">
                      {stage.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}