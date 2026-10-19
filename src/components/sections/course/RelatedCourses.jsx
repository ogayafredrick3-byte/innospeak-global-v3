import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, BarChart3, Monitor, Sparkles } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';
import { getProgrammeByCode } from '../../../lib/data/programmeData';
import { getGrouping } from '../../../lib/data/registry';

const container = staggerContainer(0.1, 0.05);

function RelatedCourseCard({ course }) {
  const isFree = course.isFree === true;
  const grouping = getGrouping(course.groupingCode);

  return (
    <Link
      to={`/courses/${course.code}`}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-cream p-5 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-6"
    >
      {/* Code + free */}
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-navy-900 px-3 py-1 font-mono text-[11px] font-bold text-gold-400">
          {course.code}
        </span>
        {isFree && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            <Sparkles size={10} />
            Free
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mt-4 font-display text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-gold-700">
        {course.name}
      </h3>

      {/* Pathway */}
      {grouping && (
        <p className="mt-1 font-body text-xs font-semibold text-gold-600">
          {grouping.title}
        </p>
      )}

      {/* Description */}
      <p className="mt-2 line-clamp-2 flex-1 font-body text-sm leading-6 text-navy-600">
        {course.shortDescription}
      </p>

      {/* Meta */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-navy-100 pt-4 font-body text-[11px] text-navy-500">
        {course.duration && (
          <span className="inline-flex items-center gap-1">
            <Clock size={12} aria-hidden="true" />
            {course.duration}
          </span>
        )}
        {course.level && (
          <span className="inline-flex items-center gap-1">
            <BarChart3 size={12} aria-hidden="true" />
            {course.level}
          </span>
        )}
        {course.studyMode && (
          <span className="inline-flex items-center gap-1">
            <Monitor size={12} aria-hidden="true" />
            {course.studyMode}
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-bold text-navy-900 transition-all duration-300 group-hover:gap-2.5 group-hover:text-gold-700">
        View course
        <ArrowRight size={14} aria-hidden="true" />
      </div>
    </Link>
  );
}

export default function RelatedCourses({ course }) {
  const related = (course.relatedCourses || [])
    .map((code) => getProgrammeByCode(code))
    .filter(Boolean);

  if (related.length === 0) return null;

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
              eyebrow="Related Courses"
              title="Continue Your Learning Journey"
              subtitle="Explore these related courses to deepen your skills."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-7">
            {related.map((p) => (
              <motion.div key={p.code} variants={fadeUpItem} className="h-full">
                <RelatedCourseCard course={p} />
              </motion.div>
            ))}
          </div>

          {/* Browse all CTA */}
          <motion.div
            variants={fadeUpItem}
            className="mt-12 flex justify-center"
          >
            <Link
              to="/courses"
              className="btn-gold inline-flex items-center gap-2 px-7 py-3"
            >
              Browse the Full Catalogue
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}