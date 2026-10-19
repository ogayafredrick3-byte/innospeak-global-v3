import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, Users, GraduationCap, Award, BookOpen } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import HeroBackground from '../components/ui/HeroBackground.jsx';
import { getGradeBundle } from '../lib/data/gradeBundles.js';
import { getSchoolLevelById } from '../lib/data/cbeData.js';

export default function GradeDetail() {
  const { gradeCode } = useParams();
  const grade = getGradeBundle(gradeCode?.toUpperCase());

  if (!grade) return <Navigate to="/academy" replace />;

  const levelInfo = getSchoolLevelById(grade.level);

  return (
    <>
      <Seo
        title={`${grade.title} — InnoSpeak CBE Academy`}
        description={`Enroll in ${grade.title} — ${grade.subjects.length} subjects, ${grade.duration}, $${grade.feesUSD} full-grade fee.`}
        path={`/academy/cbe/${grade.code}`}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-28 pb-16 md:pt-32 md:pb-20">
        <HeroBackground />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold-500/15 blur-[120px]" />

        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Link
              to="/academy"
              className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold-400 hover:text-gold-300"
            >
              ← Back to CBE Academy
            </Link>

            <p className="mt-6 inline-flex rounded-full bg-gold-500/15 px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              {levelInfo?.name || 'CBE Level'} · {grade.code}
            </p>

            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {grade.title}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl font-body text-base leading-relaxed text-navy-200 md:text-lg">
              Full-grade enrollment — one payment covers every subject for this grade.
              {grade.elective && ' Plus one elective of your choice.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 font-body text-sm text-navy-200">
              <span className="inline-flex items-center gap-2">
                <Clock size={16} className="text-gold-400" />
                {grade.duration}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users size={16} className="text-gold-400" />
                {grade.subjects.length} subjects{grade.elective ? ' + 1 elective' : ''}
              </span>
              <span className="inline-flex items-center gap-2">
                <GraduationCap size={16} className="text-gold-400" />
                {grade.levelBand}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Subjects + Enroll ────────────────────────────── */}
      <section className="container-premium py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start">
          {/* Subjects list */}
          <div>
            <div className="mb-6">
              <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
                What you'll learn
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy-900">
                {grade.subjects.length} core subjects
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {grade.subjects.map((subject) => (
                <div
                  key={subject.code}
                  className="flex items-start gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-premium"
                >
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/10">
                    <Check size={14} className="text-gold-600" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm font-semibold text-navy-900">
                      {subject.name}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-navy-400">
                      {subject.code}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Elective */}
            {grade.elective && (
              <div className="mt-8">
                <div className="mb-4">
                  <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
                    Choose one elective
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-navy-900">
                    {Array.isArray(grade.elective) ? 'Available electives' : grade.elective}
                  </h3>
                </div>

                {Array.isArray(grade.elective) && (
                  <div className="flex flex-wrap gap-2">
                    {grade.elective.map((e) => (
                      <span
                        key={e}
                        className="rounded-full border border-navy-100 bg-white px-4 py-2 font-body text-sm font-medium text-navy-700"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Senior Secondary pathways */}
            {grade.pathwayOptions && (
              <div className="mt-8">
                <div className="mb-4">
                  <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
                    Senior Secondary pathways
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-navy-900">
                    Choose one pathway
                  </h3>
                </div>

                <div className="space-y-4">
                  {grade.pathwayOptions.map((pathway) => (
                    <div
                      key={pathway}
                      className="rounded-2xl border border-navy-100 bg-white p-5 shadow-premium"
                    >
                      <p className="font-display text-base font-bold text-navy-900">{pathway}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(grade.pathwayElectives?.[pathway] || []).map((e) => (
                          <span
                            key={e}
                            className="rounded-full bg-navy-50 px-3 py-1 font-body text-xs font-medium text-navy-700"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky enroll card */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            <div className="rounded-3xl border-2 border-gold-300/40 bg-white p-7 shadow-premium-lg">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-gold-700">
                Full-grade fee
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-navy-900">
                  ${grade.feesUSD}
                </span>
                <span className="font-body text-sm text-navy-500">USD</span>
              </div>
              <p className="mt-2 font-body text-sm text-navy-600">
                One-time payment. Covers all {grade.subjects.length} subjects
                {grade.elective ? ' plus your chosen elective' : ''}.
              </p>

              <ul className="mt-6 space-y-2.5">
                {[
                  'Full-grade access',
                  'Instructor-led lessons',
                  'Assignments & assessments',
                  'Progress tracking',
                  'InnoSpeak Grade Certificate',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 font-body text-sm text-navy-700">
                    <Check size={16} className="mt-0.5 flex-shrink-0 text-gold-600" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to={`/apply?grade=${grade.code}`}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 font-body text-sm font-bold text-navy-900 shadow-md transition-transform hover:scale-[1.02]"
              >
                Enroll Now
                <ArrowRight size={16} />
              </Link>

              <p className="mt-3 text-center font-body text-xs text-navy-400">
                Flexible payment plans available
              </p>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-navy-900 py-16">
        <div className="container-premium text-center">
          <Award className="mx-auto text-gold-400" size={32} />
          <h2 className="mt-4 font-display text-3xl font-bold text-white">
            Ready to begin {grade.title}?
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm text-navy-200">
            Explore other grades or start your enrollment today.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/academy"
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 font-body text-sm font-bold text-navy-900"
            >
              <BookOpen size={16} />
              Browse All Grades
            </Link>
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-body text-sm font-bold text-white hover:bg-white/10"
            >
              Apply Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}