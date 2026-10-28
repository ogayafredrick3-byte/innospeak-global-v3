import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Clock, Award, MessageCircle, Laptop, Rocket, Globe, GraduationCap } from 'lucide-react';
import { COURSES } from '../../lib/data/programmeData.js';
import { getGrouping } from '../../lib/data/registry.js';

/**
 * FreeCoursesTeaser — highlights our free-to-complete courses.
 * Reads live from COURSES (filters isFree: true), so adding a new free
 * course to the catalogue makes it appear here automatically.
 */

const MAX_SHOWN = 6;

// Pathway → short icon key (see mapping below)
const PATHWAY_ICON = {
  'english-communication': MessageCircle,
  'digital-skills-productivity': Laptop,
  'career-global': Rocket,
  'freelancing-remote-work': Globe,
  'education-teaching-training': GraduationCap,
  'kenya-curriculum-tvet': BookOpen,
};

export default function FreeCoursesTeaser() {
  const freeCourses = COURSES.filter((c) => c.isFree === true).slice(0, MAX_SHOWN);
  const totalFree = COURSES.filter((c) => c.isFree === true).length;

  if (freeCourses.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 text-white sm:py-24">
      {/* Soft fade from the section above */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/5 to-transparent" />

      {/* Gold accent blur */}
      <div className="pointer-events-none absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />

      <div className="container-premium relative z-10">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2">
            <Sparkles size={14} className="text-gold-400" />
            <span className="font-body text-[11px] font-bold uppercase tracking-wider text-gold-300">
              Try Before You Commit
            </span>
          </span>

          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:mt-6 sm:text-4xl lg:text-5xl">
            Start Free.{' '}
            <span className="text-gradient-gold">Upgrade Anytime.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-6 text-navy-100 sm:mt-5 sm:text-base sm:leading-7">
            {totalFree} of our courses are free to complete, with no payment required.
            Build real skills, earn your InnoSpeak certificate, and upgrade to advanced
            programmes whenever you're ready.
          </p>
        </div>

        {/* Free courses grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {freeCourses.map((course, i) => {
            const grouping = getGrouping(course.groupingCode);
            const Icon = PATHWAY_ICON[course.pathwayId] || BookOpen;

            return (
              <motion.article
                key={course.code}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:bg-white/10"
              >
                {/* Top row: icon + FREE badge */}
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-gold-300">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                    Free
                  </span>
                </div>

                {/* Code */}
                <span className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-gold-400">
                  {course.code}
                </span>

                {/* Title */}
                <h3 className="mt-1 font-display text-base font-bold leading-snug text-white transition-colors group-hover:text-gold-300">
                  {course.name}
                </h3>

                {/* Pathway */}
                {grouping && (
                  <p className="mt-1 font-body text-xs text-navy-200">
                    {grouping.title}
                  </p>
                )}

                {/* Description */}
                <p className="mt-3 flex-1 line-clamp-2 font-body text-sm leading-6 text-white/70">
                  {course.shortDescription}
                </p>

                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-[11px] text-white/60">
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
                </div>

                {/* Footer: certificate + view */}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="inline-flex items-center gap-1 font-body text-xs font-semibold text-gold-400">
                    <Award size={12} />
                    Certificate
                  </span>
                  <Link
                    to={`/courses/${course.code}`}
                    className="inline-flex items-center gap-1 font-body text-sm font-bold text-white transition-all duration-300 group-hover:gap-2 group-hover:text-gold-300"
                  >
                    Start free
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/courses?filter=free"
            className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
          >
            Browse All Free Courses
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/apply"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white transition-all duration-300 hover:border-gold-400 hover:text-gold-300 sm:w-auto"
          >
            Apply for a Program
          </Link>
        </motion.div>

        {/* Small footnote */}
        <p className="mt-8 text-center font-body text-xs text-white/50">
          Free courses include full lesson access. Certificates are issued on completion.
        </p>
      </div>

      {/* Soft fade into the section below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/5 to-transparent" />
    </section>
  );
}