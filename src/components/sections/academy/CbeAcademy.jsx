import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GraduationCap, School, ArrowRight, Check } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { inViewOnce } from '../../../lib/motion/presets.js';
import { CBE_INFO, SCHOOL_LEVELS } from '../../../lib/data/cbeData.js';
import { getGradesByLevel } from '../../../lib/data/gradeBundles.js';

const ICON_MAP = {
  primary: School,
  junior_secondary: BookOpen,
  senior_secondary: GraduationCap,
};

const LEVEL_LABELS = {
  primary: 'Primary',
  junior_secondary: 'Junior Secondary',
  senior_secondary: 'Senior Secondary',
};

export default function CbeAcademy() {
  const [activeLevel, setActiveLevel] = useState('primary');

  const activeGrades = useMemo(
    () => getGradesByLevel(activeLevel),
    [activeLevel]
  );

  return (
    <section id="cbe-academy" className="bg-navy-950 py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Kenya CBC Pathway"
          title={
            <>
              CBE / CBC Academy
              <span className="block text-gradient-gold">Grades 3–12 Learning Support</span>
            </>
          }
          subtitle={CBE_INFO.description}
          light
        />

        {/* ── Level cards ─────────────────────────────────────── */}
        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {SCHOOL_LEVELS.map((level, i) => {
            const Icon = ICON_MAP[level.id] || School;
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={inViewOnce}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-700 bg-navy-900 p-8 shadow-premium transition-all duration-300 hover:border-gold-400/60 hover:shadow-premium-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-gradient text-navy-900 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={26} strokeWidth={1.8} />
                </div>
                <p className="mt-5 font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                  {level.grades}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-white">{level.title}</h3>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-navy-200">
                  {level.description}
                </p>
                <p className="mt-4 font-body text-xs text-navy-300">
                  <span className="text-gold-400">{level.subjects} subjects</span> · ${level.feesUSD.min}–${level.feesUSD.max} per grade
                </p>
                <button
                  type="button"
                  onClick={() => setActiveLevel(level.id)}
                  className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-gold-400 transition-colors hover:text-gold-300"
                >
                  View {LEVEL_LABELS[level.id]} Grades
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* ── Grade picker ────────────────────────────────────── */}
        <div className="mt-16">
          <div className="mb-8 flex items-center justify-center">
            <div className="inline-flex rounded-full border border-navy-700 bg-navy-900/50 p-1">
              {['primary', 'junior_secondary', 'senior_secondary'].map((levelId) => (
                <button
                  key={levelId}
                  type="button"
                  onClick={() => setActiveLevel(levelId)}
                  className={`rounded-full px-5 py-2 font-body text-sm font-semibold transition-all ${
                    activeLevel === levelId
                      ? 'bg-gold-gradient text-navy-900'
                      : 'text-navy-200 hover:text-white'
                  }`}
                >
                  {LEVEL_LABELS[levelId]}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeLevel}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {activeGrades.map((grade) => (
                <div
                  key={grade.code}
                  className="flex flex-col rounded-2xl border border-navy-700 bg-navy-900 p-6 transition-all hover:border-gold-400/60"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-gold-500/10 px-3 py-1 font-mono text-xs font-semibold text-gold-400">
                      {grade.code}
                    </span>
                    <span className="font-display text-lg font-bold text-white">
                      ${grade.feesUSD}
                    </span>
                  </div>

                  <h4 className="font-display text-lg font-bold text-white">{grade.title}</h4>

                  <p className="mt-2 font-body text-xs text-navy-300">
                    {grade.subjects.length} subjects
                    {grade.elective ? ' + 1 elective' : ''}
                  </p>

                  <ul className="mt-4 flex-1 space-y-1.5">
                    {grade.subjects.slice(0, 5).map((s) => (
                      <li key={s.code} className="flex items-start gap-2 font-body text-xs text-navy-200">
                        <Check size={12} className="mt-1 flex-shrink-0 text-gold-400" />
                        <span>{s.name}</span>
                      </li>
                    ))}
                    {grade.subjects.length > 5 && (
                      <li className="pl-5 font-body text-xs text-gold-400">
                        +{grade.subjects.length - 5} more
                      </li>
                    )}
                  </ul>

                  <div className="mt-4 border-t border-navy-700 pt-4">
                    <Link
                      to={`/academy/cbe/${grade.code}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-4 py-2 font-body text-sm font-semibold text-navy-900 transition-transform hover:scale-105"
                    >
                      Enroll
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          <p className="mt-8 text-center font-body text-xs text-navy-400">
            One enrollment covers all subjects in the grade. Instructors load lessons into the LMS.
          </p>
        </div>
      </div>
    </section>
  );
}