import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Clock,
  BarChart3,
  MonitorPlay,
  Languages,
  Globe2,
  Award,
  Laptop,
  PenTool,
  Briefcase,
  Globe,
  Rocket,
  Presentation,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';
import { COURSES, PATHWAYS } from '../../../lib/data/programmeData.js';

const PATHWAY_ICONS = {
  'english-communication': Languages,
  'world-languages': Globe2,
  'international-qualifications': Award,
  'kenya-curriculum-tvet': BookOpen,
  'digital-skills-productivity': Laptop,
  'creative-design-media': PenTool,
  'business-entrepreneurship': Briefcase,
  'freelancing-remote-work': Globe,
  'career-global': Rocket,
  'education-teaching-training': Presentation,
  'health-hospitality-community': HeartPulse,
  'personal-life-skills': Sparkles,
};

const CBE_PLACEHOLDER_CODES = ['CBP101', 'CBJ101', 'CBS101'];

const container = staggerContainer(0.12, 0.1);

export default function ProgrammeCatalogue() {
  const academyCourses = useMemo(
    () => COURSES.filter((course) => course.division === 'academy'),
    []
  );

  const pathways = useMemo(
    () => PATHWAYS.filter((pathway) => pathway.division === 'academy'),
    []
  );

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-gold-500/5 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-navy-900/5 blur-3xl" />

      <div className="container-premium relative">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={inViewOnce}>
          <SectionHeading
            eyebrow="InnoSpeak Academy"
            title="Learn by Pathway"
            subtitle="Explore practical courses designed to build communication, professional, digital, business, creative and career-ready skills."
          />

          <div className="mt-12 space-y-8 sm:space-y-10 lg:space-y-12">
            {pathways.map((pathway) => {
              const courses = academyCourses.filter((course) => {
                if (course.pathwayId !== pathway.id) return false;
                if (pathway.id === 'kenya-curriculum-tvet') {
                  return CBE_PLACEHOLDER_CODES.indexOf(course.code) === -1;
                }
                return true;
              });

              if (!courses.length) return null;

              const isCbePathway = pathway.id === 'kenya-curriculum-tvet';
              const levels = [...new Set(courses.map((c) => c.level).filter(Boolean))].slice(0, 3);
              const PathwayIcon = PATHWAY_ICONS[pathway.id] || BookOpen;

              return (
                <motion.article
                  key={pathway.id}
                  id={pathway.id}
                  variants={fadeUpItem}
                  className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-premium transition-shadow duration-300 hover:shadow-premium-lg"
                >
                  <header className="relative overflow-hidden rounded-t-2xl bg-navy-gradient px-5 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900 sm:h-14 sm:w-14">
                          <PathwayIcon size={24} strokeWidth={1.8} aria-hidden="true" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:mb-3 sm:gap-2">
                            <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-gold-300 ring-1 ring-white/15">
                              {pathway.code}
                            </span>
                            <span className="rounded-full bg-white/10 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-white/85 ring-1 ring-white/15">
                              {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                            </span>
                            {levels.map((lvl) => (
                              <span
                                key={lvl}
                                className="hidden rounded-full bg-white/5 px-2.5 py-1 font-body text-[10px] font-medium text-white/70 ring-1 ring-white/10 sm:inline-flex"
                              >
                                {lvl}
                              </span>
                            ))}
                          </div>

                          <h3 className="font-display text-lg font-bold text-white sm:text-xl lg:text-2xl">
                            {pathway.title}
                          </h3>

                          <p className="mt-1.5 max-w-2xl font-body text-xs leading-5 text-navy-100 sm:mt-2 sm:text-sm sm:leading-6">
                            {pathway.shortDescription}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center lg:self-center">
                        <Link
                          to={`/courses?pathway=${pathway.id}`}
                          className="btn-gold inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm lg:w-auto"
                        >
                          Explore pathway
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </header>

                  {isCbePathway && (
                    <div className="border-b border-navy-100 bg-gold-50/60 px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900">
                            <GraduationCap size={20} strokeWidth={1.9} aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-sm font-bold text-navy-900 sm:text-base">
                              CBE / CBC Grades 3–12
                            </p>
                            <p className="mt-1 font-body text-xs leading-5 text-navy-600 sm:text-sm sm:leading-6">
                              Full-grade enrollment with all subjects, electives and one certificate per grade.
                              Managed through the dedicated CBE Academy.
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/academy#cbe-academy"
                          className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-navy-900 px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-navy-800 sm:text-sm"
                        >
                          Explore CBE Academy
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 p-5 sm:grid-cols-2 sm:gap-5 sm:p-6 lg:grid-cols-3 lg:gap-6 lg:p-8">
                    {courses.slice(0, 6).map((course) => (
                      <CourseTile key={course.code} course={course} />
                    ))}
                  </div>

                  {courses.length > 6 && (
                    <div className="border-t border-navy-100 bg-cream/60 px-5 py-4 text-center sm:px-8 sm:py-5 lg:px-10">
                      <Link
                        to={`/courses?pathway=${pathway.id}`}
                        className="inline-flex items-center gap-1 font-body text-sm font-bold text-navy-900 transition-colors hover:text-gold-700"
                      >
                        View all {courses.length} courses in this pathway
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:mt-14 sm:flex-row sm:gap-4 lg:mt-16">
            <Link
              to="/courses"
              className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
            >
              View All Courses
              <ArrowRight size={17} aria-hidden="true" />
            </Link>

            <Link
              to="/academy#cbe-academy"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-7 py-3 font-body text-sm font-bold text-navy-900 shadow-premium transition-all duration-300 hover:border-gold-400 hover:text-gold-700 hover:shadow-premium-lg sm:w-auto"
            >
              Explore CBE Academy
              <GraduationCap size={17} aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CourseTile({ course }) {
  const isFree = course.isFree === true;

  return (
    <Link
      to={`/courses/${course.code}`}
      className="group/course relative flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-4 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-premium-lg sm:p-5"
    >
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

      <h4 className="mt-3 font-display text-base font-bold leading-6 text-navy-900 transition-colors duration-200 group-hover/course:text-gold-700">
        {course.name}
      </h4>

      {course.shortDescription && (
        <p className="mt-2 line-clamp-2 font-body text-sm leading-6 text-navy-600">
          {course.shortDescription}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-body text-[11px] text-navy-500">
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
            <MonitorPlay size={12} aria-hidden="true" />
            {course.studyMode}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-navy-100 pt-4">
        <span
          className={`font-body text-sm font-bold ${
            isFree ? 'text-gold-600' : 'text-navy-900'
          }`}
        >
          {isFree ? 'Free' : course.fees || 'View fees'}
        </span>

        <span className="inline-flex items-center gap-1 font-body text-sm font-bold text-navy-900 transition-all duration-300 group-hover/course:translate-x-1 group-hover/course:text-gold-700">
          View course
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
