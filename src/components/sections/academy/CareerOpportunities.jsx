import { motion } from 'framer-motion';
import {
  GraduationCap,
  Languages,
  BookMarked,
  Mic,
  Headset,
  Laptop,
  FileText,
  PenTool,
  Megaphone,
  Code2,
  Store,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

/**
 * CareerOpportunities — compact career tag cards.
 * 11 career pathways shown in a responsive grid.
 */

const CAREERS = [
  { icon: GraduationCap, title: 'Teacher' },
  { icon: Languages, title: 'Interpreter' },
  { icon: BookMarked, title: 'Translator' },
  { icon: Mic, title: 'Public Speaker' },
  { icon: Headset, title: 'Customer Support' },
  { icon: Laptop, title: 'Virtual Assistant' },
  { icon: FileText, title: 'Admin Professional' },
  { icon: PenTool, title: 'Freelancer' },
  { icon: Megaphone, title: 'Content Creator' },
  { icon: Code2, title: 'Technical Writer' },
  { icon: Store, title: 'Digital Entrepreneur' },
];

const container = staggerContainer(0.06, 0.1);

function CareerCard({ icon: Icon, title }) {
  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-6 text-center shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:gap-4 sm:px-6 sm:py-8"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900 sm:h-14 sm:w-14">
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <span className="font-body text-xs font-semibold text-navy-900 sm:text-sm">
        {title}
      </span>
    </motion.div>
  );
}

export default function CareerOpportunities() {
  return (
    <section aria-label="Career opportunities" className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <div className="mb-12 sm:mb-14 lg:mb-16">
          <SectionHeading
            eyebrow="Career Opportunities"
            title="Where Will Your Learning Take You?"
            subtitle="The skills you build at InnoSpeak Global Academy open doors across education, language, technology, media and entrepreneurship."
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-6"
        >
          {CAREERS.map((career) => (
            <CareerCard key={career.title} {...career} />
          ))}
        </motion.div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 flex justify-center"
        >
          <Link
            to="/career-hub"
            className="btn-gold inline-flex items-center gap-2 px-7 py-3"
          >
            Explore the Career Hub
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}