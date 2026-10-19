import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Code,
  BarChart3,
  Brain,
  Cloud,
  ShieldCheck,
  Cog,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';
import { COURSES } from '../../../lib/data/programmeData.js';
import { TRACKS } from '../../../lib/data/registry.js';

const TRACK_ICONS = {
  'software-engineering': Code,
  'data-analytics': BarChart3,
  'ai-intelligent-systems': Brain,
  'cloud-infrastructure': Cloud,
  cybersecurity: ShieldCheck,
  'engineering-smart-systems': Cog,
  'creative-technology': Sparkles,
};

const container = staggerContainer(0.12, 0.1);

function CourseTile({ course }) {
  const isFree = course.isFree === true;

  return (
    <Link
      to={`/courses/${course.code}`}
      className="group/course relative flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-premium-lg"
    >
      {/* Top: code + featured */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-navy-400">
          {course.code}
        </span>
        {course.featured && (
          <span className="shrink-0 rounded-full bg-gold-500/10 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-gold-700 ring-1 ring-gold-500/20">
            Featured
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="mt-3 font-display text-base font-bold leading-6 text-navy-900 transition-colors group-hover/course:text-gold-700">
        {course.name}
      </h4>

      {/* Description */}
      {course.shortDescription && (
        <p className="mt-2 line-clamp-2 font-body text-sm leading-6 text-navy-600">
          {course.shortDescription}
        </p>
      )}

      {/* Meta chips */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-body text-[11px] text-navy-500">
        {course.duration && (
          <span className="inline-flex items-center gap-1">
            <span className="text-navy-300">◷</span>
            {course.duration}
          </span>
        )}
        {course.level && (
          <span className="inline-flex items-center gap-1">
            <span className="text-navy-300">◈</span>
            {course.level}
          </span>
        )}
        {course.studyMode && (
          <span className="inline-flex items-center gap-1">
            <span className="text-navy-300">◉</span>
            {course.studyMode}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-navy-100 pt-4">
        <span
          className={`font-body text-sm font-bold ${
            isFree ? 'text-emerald-600' : 'text-navy-900'
          }`}
        >
          {isFree ? 'Free' : course.fees || 'View fees'}
        </span>

        <span className="inline-flex items-center gap-1 font-body text-sm font-bold text-navy-900 transition-all duration-300 group-hover/course:translate-x-1 group-hover/course:text-gold-600">
          View course
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export default function LabsCourseCatalogue() {
  const labCourses = useMemo(
    () => COURSES.filter((course) => course.division === 'labs'),
    []
  );

  return (
    <section id="labs-catalogue" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
        >
          <div className="mb-12 sm:mb-14 lg:mb-16">
            <SectionHeading
              eyebrow="InnoSpeak Labs"
              title="Build Job-Ready Skills"
              subtitle="Hands-on learning across software engineering, AI, data, cloud, cybersecurity, engineering and creative technology."
            />
          </div>

          <div className="space-y-10 sm:space-y-12 lg:space-y-14">
            {TRACKS.map((track) => {
              const courses = labCourses.filter(
                (course) => course.pathwayId === track.id
              );

              if (!courses.length) return null;

              const TrackIcon = TRACK_ICONS[track.id] || Sparkles;

              return (
                <motion.div
                  key={track.id}
                  variants={fadeUpItem}
                  className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-premium transition-shadow duration-300 hover:shadow-premium-lg"
                >
                  {/* Track header */}
                  <div className="relative overflow-hidden bg-navy-gradient px-6 py-7 sm:px-10 sm:py-8">
                    <div className="pointer-events-none absolute -right-12 -top-24 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      {/* Left: icon + text */}
                      <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-gradient text-navy-900 shadow-gold sm:h-14 sm:w-14">
                          <TrackIcon size={24} strokeWidth={1.8} aria-hidden="true" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-gold-300 ring-1 ring-white/15">
                              {track.code}
                            </span>
                            <span className="rounded-full bg-white/10 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-white/85 ring-1 ring-white/15">
                              {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                            </span>
                          </div>

                          <h3 className="font-display text-lg font-bold text-white sm:text-xl lg:text-2xl">
                            {track.title}
                          </h3>

                          <p className="mt-2 max-w-2xl font-body text-xs leading-5 text-navy-100 sm:text-sm sm:leading-6">
                            {track.shortDescription}
                          </p>
                        </div>
                      </div>

                      {/* Right: CTA */}
                      <Link
                        to={`/courses?track=${track.id}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-body text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400/40 hover:bg-gold-500/10 hover:text-gold-300"
                      >
                        Explore track
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>

                  {/* Courses grid */}
                  <div className="grid gap-4 p-5 sm:grid-cols-2 sm:gap-5 sm:p-6 lg:grid-cols-3 lg:gap-6 lg:p-8">
                    {courses.slice(0, 6).map((course) => (
                      <CourseTile key={course.code} course={course} />
                    ))}
                  </div>

                  {/* View all */}
                  {courses.length > 6 && (
                    <div className="border-t border-navy-100 bg-cream/50 px-6 py-4 text-center">
                      <Link
                        to={`/courses?track=${track.id}`}
                        className="inline-flex items-center gap-1.5 font-body text-sm font-bold text-navy-900 transition-colors hover:text-gold-600"
                      >
                        View all {courses.length} courses in this track
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}