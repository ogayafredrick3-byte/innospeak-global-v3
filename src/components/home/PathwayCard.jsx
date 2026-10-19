import { motion } from 'framer-motion';
import {
  Mic, Briefcase, Presentation, Code, BarChart3, Brain, Users, Rocket,
  Globe, Award, Laptop, Compass, Palette, Sparkles, BookOpen, Heart,
  GraduationCap, Cloud, Shield, Cog, Film, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ICONS = {
  mic: Mic,
  briefcase: Briefcase,
  presentation: Presentation,
  code: Code,
  'bar-chart': BarChart3,
  brain: Brain,
  users: Users,
  rocket: Rocket,
  globe: Globe,
  award: Award,
  laptop: Laptop,
  compass: Compass,
  palette: Palette,
  sparkles: Sparkles,
  'book-open': BookOpen,
  heart: Heart,
  graduation: GraduationCap,
  cloud: Cloud,
  shield: Shield,
  cog: Cog,
  film: Film,
};

export default function PathwayCard({ course, index = 0 }) {
  const Icon = ICONS[course.icon] ?? Mic;
  const href = course.href || `/courses/${course.code}`;
  const isFree = course.isFree === true;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
    >
      {/* Icon + code */}
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
          <Icon size={22} strokeWidth={1.8} />
        </div>
        <span className="font-display text-xs font-bold text-gold-600">
          {course.code}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-4 font-display text-base font-bold leading-snug text-navy-900">
        {course.title}
      </h3>

      {/* Pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {course.duration && (
          <span className="rounded-md bg-navy-50 px-2.5 py-1 font-body text-xs font-medium text-navy-700">
            {course.duration}
          </span>
        )}
        {course.level && (
          <span className="rounded-md bg-gold-50 px-2.5 py-1 font-body text-xs font-medium text-gold-700">
            {course.level}
          </span>
        )}
        {isFree && (
          <span className="rounded-md bg-emerald-100 px-2.5 py-1 font-body text-xs font-bold uppercase tracking-wide text-emerald-700">
            Free
          </span>
        )}
      </div>

      {/* Footer link */}
      <Link
        to={href}
        className="mt-auto inline-flex items-center gap-1.5 pt-5 font-body text-sm font-semibold text-navy-900 transition-colors group-hover:text-gold-600"
      >
        View Course
        <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </motion.article>
  );
}