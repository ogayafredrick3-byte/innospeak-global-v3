import { motion } from 'framer-motion';
import { Leaf, Lightbulb, Rocket, Sparkles, ShieldCheck } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const VALUES = [
  { icon: Leaf, title: 'Sustainability', description: 'Creating solutions that positively impact future generations.' },
  { icon: Lightbulb, title: 'Creativity', description: 'Encouraging original thinking and bold ideas.' },
  { icon: Rocket, title: 'Entrepreneurship', description: 'Empowering people to create opportunities and drive economic growth.' },
  { icon: Sparkles, title: 'Innovation', description: 'Transforming overlooked ideas into practical, impactful solutions.' },
  { icon: ShieldCheck, title: 'Integrity', description: 'Leading with honesty, accountability, and excellence.' },
];

const container = staggerContainer(0.1, 0.1);

export default function CoreValues() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-premium">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={inViewOnce}>
          <SectionHeading
            eyebrow="Core Values"
            title="The Principles That Guide Every Decision"
            subtitle="These values shape every initiative, partnership, and learning experience at InnoSpeak Global."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUpItem}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-shadow duration-300 hover:shadow-premium-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-base font-bold text-navy-900">{title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-navy-600">{description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}