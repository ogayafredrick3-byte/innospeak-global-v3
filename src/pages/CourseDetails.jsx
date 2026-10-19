import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import useDocumentTitle from '../lib/hooks/useDocumentTitle';
import Seo from '../components/ui/Seo.jsx';
import HeroBackground from '../components/ui/HeroBackground.jsx';
import { buildCourseData } from '../lib/data/courseDetails';
import {
  getProgrammeByCode,
  getCoursesByPathway,
  PATHWAYS,
  TRACKS,
} from '../lib/data/programmeData.js';

import CourseHero from '../components/sections/course/CourseHero';
import EnrollButton from '../components/portal/EnrollButton';
import CourseOverview from '../components/sections/course/CourseOverview';
import KeyInfoCards from '../components/sections/course/KeyInfoCards';
import LearningOutcomes from '../components/sections/course/LearningOutcomes';
import CourseModules from '../components/sections/course/CourseModules';
import EntryRequirements from '../components/sections/course/EntryRequirements';
import Assessment from '../components/sections/course/Assessment';
import Certification from '../components/sections/course/Certification';
import CareerOpportunities from '../components/sections/course/CareerOpportunities';
import RelatedCourses from '../components/sections/course/RelatedCourses';
import CourseFAQ from '../components/sections/course/CourseFAQ';
import StudentReviews from '../components/sections/course/StudentReviews';
import FinalCTA from '../components/sections/course/FinalCTA';

/* ──────────────────────────────────────────────────────────────
   Not-found state
   ────────────────────────────────────────────────────────────── */

function CourseNotFound({ code }) {
  return (
    <>
      <Seo
        title="Course Not Found — InnoSpeak Global"
        description="This course could not be found."
        path={`/courses/${code || ''}`}
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-32 pb-24">
        <HeroBackground />
        <div className="container-premium relative z-10 text-center">
          <Compass size={40} className="mx-auto text-gold-400" aria-hidden="true" />
          <h1 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">
            Course not found
          </h1>
          <p className="mx-auto mt-4 max-w-md font-body text-sm leading-6 text-navy-200 sm:text-base">
            {code
              ? `We couldn't find a course with the code "${code}".`
              : 'This course may have been renamed or is no longer available.'}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/courses"
              className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
            >
              Browse All Courses
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              to="/programs"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300 sm:w-auto"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              View Programs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   Parent program context + sibling courses
   ────────────────────────────────────────────────────────────── */

function ProgramContext({ grouping, courseCode }) {
  const siblings = useMemo(() => {
    if (!grouping) return [];
    return getCoursesByPathway(grouping.id)
      .filter((c) => c.code !== courseCode)
      .slice(0, 4);
  }, [grouping, courseCode]);

  if (!grouping) return null;

  const isLabs = grouping.division === 'labs';

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        {/* Part-of card */}
        <div className="mx-auto mb-12 max-w-3xl rounded-2xl border border-navy-100 bg-cream p-6 text-center sm:p-8">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-gold-700">
            Part of
          </p>
          <h2 className="mt-3 font-display text-xl font-bold text-navy-900 sm:text-2xl">
            {grouping.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm leading-6 text-navy-500">
            {grouping.shortDescription}
          </p>
          <Link
            to={`/programs/${grouping.slug}`}
            className="btn-gold mt-5 inline-flex items-center gap-2 px-6 py-3"
          >
            Explore {isLabs ? 'Track' : 'Pathway'}
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {/* Sibling courses */}
        {siblings.length > 0 && (
          <>
            <div className="mb-8 text-center">
              <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
                More in this {isLabs ? 'track' : 'pathway'}
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
                Other courses you can take
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {siblings.map((c) => (
                <Link
                  key={c.code}
                  to={`/courses/${c.code}`}
                  className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
                >
                  <span className="font-mono text-[11px] font-semibold text-navy-400">
                    {c.code}
                  </span>
                  <h4 className="mt-3 font-display text-sm font-bold leading-snug text-navy-900 transition-colors group-hover:text-gold-700">
                    {c.name}
                  </h4>
                  <p className="mt-2 flex-1 line-clamp-3 font-body text-xs leading-5 text-navy-500">
                    {c.shortDescription}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 font-body text-xs font-semibold text-gold-700 transition-all duration-300 group-hover:gap-2">
                    View
                    <ArrowRight size={12} aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
   ────────────────────────────────────────────────────────────── */

export default function CourseDetails() {
  const { courseCode } = useParams();
  const upperCode = courseCode?.toUpperCase();
  const course = buildCourseData(upperCode);
  const rawCourse = getProgrammeByCode(upperCode);

  useDocumentTitle(
    course
      ? `${course.name} (${course.code}) — InnoSpeak Global`
      : 'Course Not Found — InnoSpeak Global'
  );

  // Resolve parent program (Academy pathway or Labs track) once.
  const grouping = useMemo(() => {
    if (!rawCourse) return null;
    return (
      PATHWAYS.find((p) => p.id === rawCourse.pathwayId) ||
      TRACKS.find((t) => t.id === rawCourse.pathwayId) ||
      null
    );
  }, [rawCourse]);

  if (!course) return <CourseNotFound code={courseCode} />;

  return (
    <>
      <Seo
        title={`${course.name} (${course.code}) — InnoSpeak Global`}
        description={course.shortDescription}
        path={`/courses/${course.code}`}
      />

      <CourseHero course={course} grouping={grouping} />

      {/* Self-paced enrolment entry point. Free courses enroll directly; paid courses use verified checkout. */}
      <section id="course-enrolment" className="bg-cream py-10 scroll-mt-24">
        <div className="container-premium">
          <EnrollButton course={course} />
        </div>
      </section>

      <CourseOverview course={course} />
      <KeyInfoCards course={course} />
      <LearningOutcomes course={course} />
      <CourseModules course={course} />
      <EntryRequirements course={course} />
      <Assessment course={course} />
      <Certification course={course} />
      <CareerOpportunities course={course} />
      <RelatedCourses course={course} />
      <ProgramContext grouping={grouping} courseCode={course.code} />
      <CourseFAQ course={course} />
      <StudentReviews course={course} />
      <FinalCTA course={course} />
    </>
  );
}