import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';
import { COURSES } from '../../lib/data/programmeData.js';
import { getGrouping } from '../../lib/data/registry.js';
import { getCourseGovernance } from '../../lib/data/catalogPolicy.js';

/**
 * NewCourses — the most recently added courses to the platform.
 * Sorted by createdAt descending. Only active courses shown.
 */

const MAX_SHOWN = 6;

export default function NewCourses() {
  const latest = COURSES
    .filter((c) => getCourseGovernance(c).status === 'Active')
    .filter((c) => c.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, MAX_SHOWN);

  if (latest.length === 0) return null;

  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Fresh on the Platform"
          title="New to InnoSpeak"
          subtitle="Recently added courses across every division — including AI, business, creative and education. Updated as the catalogue grows."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {latest.map((course, i) => {
            const grouping = getGrouping(course.groupingCode);
            const isFree = course.isFree === true;

            return (
              <motion.article
                key={course.code}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-premium-lg"
              >
                {/* Top: NEW badge + code */}
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700 ring-1 ring-gold-500/25">
                    <Sparkles size={11} />
                    New
                  </span>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-navy-400">
                    {course.code}
                  </span>
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
                <p className="mt-3 flex-1 line-clamp-2 font-body text-sm leading-6 text-navy-600">
                  {course.shortDescription}
                </p>

                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-[11px] text-navy-500">
                  {course.duration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} />
                      {course.duration}
                    </span>
                  )}
                  {course.level && (
                    <span className="inline-flex items-center gap-1">
                      <BookOpen size={12} />
                      {course.level}
                    </span>
                  )}
                  {isFree && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      Free
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-navy-100 pt-4">
                  <span
                    className={`font-body text-sm font-bold ${
                      isFree ? 'text-emerald-600' : 'text-navy-900'
                    }`}
                  >
                    {isFree ? 'Free' : course.fees || 'View fees'}
                  </span>
                  <Link
                    to={`/courses/${course.code}`}
                    className="inline-flex items-center gap-1 font-body text-sm font-bold text-navy-900 transition-all duration-300 group-hover:gap-2 group-hover:text-gold-700"
                  >
                    View course
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            to="/courses"
            className="btn-gold inline-flex items-center gap-2 px-7 py-3"
          >
            Browse the Full Catalogue
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}