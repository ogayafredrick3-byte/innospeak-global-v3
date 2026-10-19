import { motion } from 'framer-motion';
import {
  MessageCircle, Cpu, Crown, Palette, Sparkles, BookOpen, ArrowRight,
} from 'lucide-react';
import SectionHeading from '../ui/SectionHeading.jsx';
import PathwayCard from './PathwayCard.jsx';
import Button from '../ui/Button.jsx';
import { PATHWAY_BADGES, getInDemandCourses } from './pathwaysData.js';

const BADGE_ICONS = {
  'message-circle': MessageCircle,
  cpu: Cpu,
  crown: Crown,
  palette: Palette,
  sparkles: Sparkles,
  'book-open': BookOpen,
};

export default function Pathways() {
  const courses = getInDemandCourses(8);

  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="In-Demand Skills"
          title="Skills Employers Are Hiring For Right Now"
          subtitle="Courses pulled from our live catalogue and matched to current employer demand in Kenya and worldwide — communication, digital, business, creative, life skills and education."
        />

        {/* Category badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {PATHWAY_BADGES.map((badge) => {
            const Icon = BADGE_ICONS[badge.icon] ?? MessageCircle;
            return (
              <div
                key={badge.id}
                className="inline-flex items-center gap-2 rounded-full border border-navy-100 bg-white px-4 py-2 shadow-sm"
              >
                <Icon size={16} className="text-gold-500" />
                <span className="font-body text-sm font-semibold text-navy-700">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Course grid — real marketable courses */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course, i) => (
            <PathwayCard key={course.code} course={course} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <Button to="/courses" variant="gold" size="lg" className="group">
            Browse the Full Catalogue
            <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}