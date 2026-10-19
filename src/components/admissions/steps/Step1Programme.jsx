import { motion } from 'framer-motion';
import { GraduationCap, FlaskConical, School, Check, BookOpen, Cpu, Heart, DollarSign, Users } from 'lucide-react';
import { SelectField, TextField } from '../../ui';
import StepCard from '../StepCard';
import {
  COURSES,
  PATHWAYS,
  TRACKS,
  INTAKES,
  STUDY_MODES,
} from '../../../lib/data/programmeData';
import { GRADE_BUNDLES } from '../../../lib/data/gradeBundles';

const DIVISIONS = [
  {
    id: 'academy',
    label: 'InnoSpeak Global Academy',
    icon: GraduationCap,
    tagline: 'Structured Learning & Certification',
    description:
      'Academic, professional and structured learning. Regular courses plus the CBE Academy for Grades 3–12.',
    accent: 'from-gold-500/15 to-gold-400/5',
    border: 'border-gold-500/40',
    iconBg: 'bg-gold-gradient',
  },
  {
    id: 'labs',
    label: 'InnoSpeak Global Labs',
    icon: FlaskConical,
    tagline: 'Practical Innovation & Engineering',
    description:
      'Practical learning. Engineering, technology, innovation, projects and hands-on development.',
    accent: 'from-navy-500/15 to-navy-400/5',
    border: 'border-navy-400/40',
    iconBg: 'bg-navy-700',
  },
];

const CBE_PATHWAY_ID = 'kenya-curriculum-tvet';

const FOUNDATION_PROGRAM_TYPES = [
  { id: 'academy', label: 'Academy Course', description: 'Structured course from our catalogue', icon: BookOpen },
  { id: 'labs', label: 'Labs Track', description: 'Software, AI, Cloud, Security, Engineering', icon: Cpu },
  { id: 'cbe', label: 'CBE Grade (3–12)', description: 'Full-grade Kenya curriculum', icon: School },
];

const INCOME_BRACKETS = [
  'No household income',
  'Under KES 20,000 / month',
  'KES 20,000 – 50,000 / month',
  'KES 50,000 – 100,000 / month',
  'Over KES 100,000 / month',
  'Prefer not to say',
];

const HOUSEHOLD_SIZES = ['1', '2 – 4', '5 – 7', '8+'];

export default function Step1Programme({ data, errors, update, mode = 'general' }) {
  const isFoundation = mode === 'foundation';
  const isAcademy = data.division === 'academy' || data.foundationProgramType === 'academy';
  const isLabs = data.division === 'labs' || data.foundationProgramType === 'labs';

  const regularPathways = isAcademy
    ? PATHWAYS.filter((p) => p.id !== CBE_PATHWAY_ID)
    : [];

  const labsTracks = isLabs ? TRACKS : [];

  const availableCourses = data.pathway
    ? COURSES.filter((c) => c.pathwayId === data.pathway)
    : [];

  const availableGrades = GRADE_BUNDLES;

  const academyRoute = isFoundation
    ? data.foundationProgramType === 'cbe'
      ? 'cbe'
      : data.courseCode
        ? 'regular'
        : null
    : isAcademy
      ? data.grade
        ? 'cbe'
        : data.courseCode
          ? 'regular'
          : null
      : null;

  function handleDivisionChange(divisionId) {
    update({
      division: divisionId,
      pathway: '',
      programme: '',
      courseCode: '',
      grade: '',
      duration: '',
      studyMode: '',
      fees: '',
    });
  }

  function handleFoundationTypeChange(type) {
    update({
      foundationProgramType: type,
      division: 'foundation',
      pathway: '',
      programme: '',
      courseCode: '',
      grade: '',
      duration: '',
      studyMode: '',
      fees: '',
    });
  }

  function handlePathwayChange(e) {
    update({
      pathway: e.target.value,
      programme: '',
      courseCode: '',
      grade: '',
      duration: '',
      studyMode: '',
      fees: '',
    });
  }

  function handleCourseChange(e) {
    const code = e.target.value;
    const course = COURSES.find((c) => c.code === code);
    if (!course) return;
    update({
      programme: course.name,
      courseCode: course.code,
      pathway: course.pathwayId,
      grade: '',
      duration: course.duration,
      studyMode: course.studyMode,
      fees: course.isFree
        ? 'Free'
        : course.fees || `KES ${(course.feesUSD || 0) * 130}`,
    });
  }

  function handleGradeChange(e) {
    const code = e.target.value;
    const grade = GRADE_BUNDLES.find((g) => g.code === code);
    if (!grade) return;
    update({
      grade: grade.code,
      programme: grade.title,
      courseCode: grade.code,
      pathway: CBE_PATHWAY_ID,
      duration: grade.duration,
      studyMode: 'Hybrid',
      fees: `$${grade.feesUSD}`,
    });
  }

  return (
    <StepCard
      stepNum={1}
      title={isFoundation ? 'Foundation Application' : 'Choose Your Pathway'}
      description={
        isFoundation
          ? 'Tell us what you would like to study and a little about your situation. We use this to match you to the right scholarship fund.'
          : 'Select your InnoSpeak Global division, then pick your route. Academy applicants choose between a regular program or the CBE Academy (Grades 3–12). Labs applicants pick a track.'
      }
    >
      {/* Foundation intro banner */}
      {isFoundation && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
            <Heart size={18} />
          </div>
          <div>
            <p className="font-body text-sm font-bold text-emerald-900">
              You are applying for Foundation-funded support.
            </p>
            <p className="mt-1 font-body text-xs leading-5 text-emerald-800">
              This is not a standard enrollment. We will review your application and, if approved,
              your tuition will be fully covered by the Foundation.
            </p>
          </div>
        </div>
      )}

      {/* Pre-filled banner (non-foundation) */}
      {!isFoundation && data.courseCode && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/5 px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">
            Pre-selected
          </span>
          <span className="font-mono text-sm font-bold text-navy-900">{data.courseCode}</span>
          <span className="text-sm text-navy-600">— {data.programme}</span>
        </div>
      )}

      {/* ═══ Division cards (general mode only) ═══ */}
      {!isFoundation && (
        <div>
          <p className="mb-4 font-body text-sm font-bold tracking-wide text-navy-900">
            Which division are you applying to?
            <span className="ml-1 text-gold-600">*</span>
          </p>
          {errors.division && (
            <p className="mb-3 font-body text-xs font-semibold text-red-500">{errors.division}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {DIVISIONS.map((div) => {
              const selected = data.division === div.id;
              const Icon = div.icon;
              return (
                <button
                  key={div.id}
                  type="button"
                  onClick={() => handleDivisionChange(div.id)}
                  className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                    selected
                      ? `${div.border} bg-gradient-to-br ${div.accent} shadow-lg`
                      : 'border-navy-100 bg-white hover:border-gold-300 hover:shadow-md'
                  }`}
                >
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-navy-900"
                    >
                      <Check size={16} strokeWidth={3} />
                    </motion.div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${div.iconBg} text-white shadow-md`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-navy-900">{div.label}</h3>
                      <p className="mt-0.5 font-body text-xs font-semibold uppercase tracking-wider text-gold-700">
                        {div.tagline}
                      </p>
                      <p className="mt-2 font-body text-sm leading-relaxed text-navy-600">
                        {div.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Foundation program type selector ═══ */}
      {isFoundation && (
        <div>
          <p className="mb-4 font-body text-sm font-bold tracking-wide text-navy-900">
            What would you like to study?
            <span className="ml-1 text-emerald-600">*</span>
          </p>
          {errors.foundationProgramType && (
            <p className="mb-3 font-body text-xs font-semibold text-red-500">{errors.foundationProgramType}</p>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            {FOUNDATION_PROGRAM_TYPES.map((type) => {
              const selected = data.foundationProgramType === type.id;
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleFoundationTypeChange(type.id)}
                  className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300 ${
                    selected
                      ? 'border-emerald-400 bg-emerald-50 shadow-md'
                      : 'border-navy-100 bg-white hover:border-emerald-300'
                  }`}
                >
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white"
                    >
                      <Check size={13} strokeWidth={3} />
                    </motion.div>
                  )}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-bold text-navy-900">
                    {type.label}
                  </h3>
                  <p className="mt-0.5 font-body text-[11px] leading-4 text-navy-500">
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Program picker (academy regular/labs/cbe) ═══ */}
      {((isFoundation && data.foundationProgramType) || (!isFoundation && data.division)) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="mt-6 h-px bg-gradient-to-r from-emerald-300/60 via-navy-100 to-transparent" />

          {/* Academy — regular or CBE */}
          {(isAcademy || (isFoundation && data.foundationProgramType === 'academy')) && (
            <div className="space-y-6 pt-6">
              {!isFoundation && (
                <p className="font-body text-sm text-navy-600">
                  Academy has two routes. Pick whichever matches you.
                </p>
              )}

              <section
                className={`rounded-2xl border-2 p-5 transition-all duration-300 ${
                  academyRoute === 'cbe'
                    ? 'border-navy-100 bg-navy-50/40 opacity-60'
                    : academyRoute === 'regular'
                      ? 'border-emerald-400/60 bg-white shadow-premium'
                      : 'border-navy-100 bg-white'
                }`}
              >
                <header className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-navy-900">Programs & Courses</h3>
                    <p className="mt-0.5 font-body text-xs text-navy-600">
                      {isFoundation ? 'Choose the course you want funded.' : 'For adult learners and professionals.'}
                    </p>
                  </div>
                </header>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <SelectField
                    label="Pathway"
                    name="pathway"
                    value={academyRoute === 'cbe' ? '' : data.pathway}
                    onChange={handlePathwayChange}
                    error={academyRoute === 'regular' ? errors.pathway : ''}
                    placeholder="Select a pathway..."
                    options={regularPathways.map((p) => ({ value: p.id, label: p.title }))}
                    className="sm:col-span-2"
                    disabled={academyRoute === 'cbe'}
                  />

                  <SelectField
                    label="Course"
                    name="programme"
                    value={academyRoute === 'cbe' ? '' : data.courseCode}
                    onChange={handleCourseChange}
                    error={academyRoute === 'regular' ? errors.programme : ''}
                    placeholder={data.pathway && academyRoute !== 'cbe' ? 'Select a course...' : 'Select a pathway first'}
                    options={availableCourses.map((c) => ({
                      value: c.code,
                      label: c.isFree ? `${c.code} — ${c.name} (Free)` : `${c.code} — ${c.name}`,
                    }))}
                    className="sm:col-span-2"
                    disabled={academyRoute === 'cbe' || !data.pathway}
                  />
                </div>
              </section>

              {/* CBE section — hidden in foundation mode (they picked a type) */}
              {!isFoundation && (
                <section
                  className={`rounded-2xl border-2 p-5 transition-all duration-300 ${
                    academyRoute === 'regular'
                      ? 'border-navy-100 bg-navy-50/40 opacity-60'
                      : academyRoute === 'cbe'
                        ? 'border-emerald-400/60 bg-white shadow-premium'
                        : 'border-navy-100 bg-white'
                  }`}
                >
                  <header className="mb-5 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                      <School size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-navy-900">
                        CBE Academy — Grades 3 to 12
                      </h3>
                      <p className="mt-0.5 font-body text-xs text-navy-600">
                        Kenya Competency Based Curriculum. One payment covers every subject for the selected grade.
                      </p>
                    </div>
                  </header>

                  <SelectField
                    label="Grade"
                    name="grade"
                    value={academyRoute === 'regular' ? '' : data.grade}
                    onChange={handleGradeChange}
                    error={academyRoute === 'cbe' ? errors.grade || errors.programme : ''}
                    placeholder="Select a grade (Grade 3 – Grade 12)..."
                    options={availableGrades.map((g) => ({
                      value: g.code,
                      label: `${g.title} — ${g.subjects.length} subjects — $${g.feesUSD}`,
                    }))}
                    disabled={academyRoute === 'regular'}
                  />
                </section>
              )}

              {/* CBE grade picker in foundation mode */}
              {isFoundation && data.foundationProgramType === 'cbe' && (
                <section className="rounded-2xl border-2 border-emerald-400/60 bg-white p-5 shadow-premium">
                  <header className="mb-5 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                      <School size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-navy-900">
                        CBE Academy — Grades 3 to 12
                      </h3>
                      <p className="mt-0.5 font-body text-xs text-navy-600">
                        Full-grade Kenya Competency Based Curriculum.
                      </p>
                    </div>
                  </header>

                  <SelectField
                    label="Grade"
                    name="grade"
                    value={data.grade}
                    onChange={handleGradeChange}
                    error={errors.grade || errors.programme}
                    placeholder="Select a grade (Grade 3 – Grade 12)..."
                    options={availableGrades.map((g) => ({
                      value: g.code,
                      label: `${g.title} — ${g.subjects.length} subjects — $${g.feesUSD}`,
                    }))}
                  />
                </section>
              )}

              {/* Intake + Study Mode — general mode only */}
              {!isFoundation && academyRoute && (
                <div className="grid grid-cols-1 gap-5 rounded-2xl border border-navy-100 bg-white p-5 sm:grid-cols-2">
                  <SelectField
                    label="Intake"
                    name="intake"
                    value={data.intake}
                    onChange={(e) => update({ intake: e.target.value })}
                    error={errors.intake}
                    required
                    placeholder="Select intake..."
                    options={INTAKES}
                  />
                  <SelectField
                    label="Study Mode"
                    name="studyMode"
                    value={data.studyMode}
                    onChange={(e) => update({ studyMode: e.target.value })}
                    error={errors.studyMode}
                    required
                    placeholder="Select study mode..."
                    options={STUDY_MODES}
                  />
                </div>
              )}
            </div>
          )}

          {/* Labs */}
          {(isLabs || (isFoundation && data.foundationProgramType === 'labs')) && (
            <div className="space-y-5 pt-6">
              <p className="flex items-center gap-2 font-body text-sm font-bold tracking-wide text-navy-900">
                <Cpu size={16} className={isFoundation ? 'text-emerald-600' : 'text-gold-600'} />
                Choose your Labs track
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <SelectField
                  label="Track"
                  name="pathway"
                  value={data.pathway}
                  onChange={handlePathwayChange}
                  error={errors.pathway}
                  required
                  placeholder="Select a track..."
                  options={labsTracks.map((t) => ({ value: t.id, label: t.title }))}
                  className="sm:col-span-2"
                />

                <SelectField
                  label="Course"
                  name="programme"
                  value={data.courseCode}
                  onChange={handleCourseChange}
                  error={errors.programme}
                  required
                  placeholder={data.pathway ? 'Select a course...' : 'Select a track first'}
                  options={availableCourses.map((c) => ({
                    value: c.code,
                    label: `${c.code} — ${c.name}`,
                  }))}
                  className="sm:col-span-2"
                />

                {!isFoundation && (
                  <>
                    <SelectField
                      label="Intake"
                      name="intake"
                      value={data.intake}
                      onChange={(e) => update({ intake: e.target.value })}
                      error={errors.intake}
                      required
                      placeholder="Select intake..."
                      options={INTAKES}
                    />
                    <SelectField
                      label="Study Mode"
                      name="studyMode"
                      value={data.studyMode}
                      onChange={(e) => update({ studyMode: e.target.value })}
                      error={errors.studyMode}
                      required
                      placeholder="Select study mode..."
                      options={STUDY_MODES}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ Foundation eligibility section ═══ */}
      {isFoundation && data.foundationProgramType && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
          className="overflow-hidden"
        >
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
            <header className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-emerald-900">
                  Your situation
                </h3>
                <p className="mt-0.5 font-body text-xs text-emerald-800">
                  This is confidential and used only for scholarship review.
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SelectField
                label="Monthly household income"
                name="incomeBracket"
                value={data.incomeBracket}
                onChange={(e) => update({ incomeBracket: e.target.value })}
                error={errors.incomeBracket}
                required
                placeholder="Select range..."
                options={INCOME_BRACKETS}
              />

              <SelectField
                label="Household size (people supported)"
                name="householdSize"
                value={data.householdSize}
                onChange={(e) => update({ householdSize: e.target.value })}
                error={errors.householdSize}
                required
                placeholder="Select size..."
                options={HOUSEHOLD_SIZES}
              />

              <div className="sm:col-span-2">
                <label
                  htmlFor="fundingReason"
                  className="mb-2 block font-body text-sm font-bold text-navy-900"
                >
                  Why do you need funding? <span className="text-emerald-600">*</span>
                </label>
                <textarea
                  id="fundingReason"
                  rows={5}
                  value={data.fundingReason}
                  onChange={(e) => update({ fundingReason: e.target.value })}
                  placeholder="Tell us briefly about your circumstances and what this program would mean for you."
                  className={`w-full resize-y rounded-xl border bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 ${
                    errors.fundingReason ? 'border-red-400' : 'border-navy-100'
                  }`}
                />
                {errors.fundingReason && (
                  <p className="mt-1 font-body text-xs font-semibold text-red-500">
                    {errors.fundingReason}
                  </p>
                )}
                <p className="mt-1 font-body text-xs text-navy-400">
                  {data.fundingReason?.length || 0} / 1000
                </p>
              </div>

              <div className="sm:col-span-2">
                <TextField
                  label="Have you received other support? (optional)"
                  name="previousSupport"
                  value={data.previousSupport}
                  onChange={(e) => update({ previousSupport: e.target.value })}
                  placeholder="e.g. Yes — previous sponsor, or No"
                  optional
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ Summary ═══ */}
      {(data.duration || data.fees) && (
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-cream px-5 py-4 sm:grid-cols-3">
          {data.duration && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-600">Duration</p>
              <p className="mt-1 text-sm font-bold text-navy-900">{data.duration}</p>
            </div>
          )}
          {data.fees && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-600">
                {isFoundation ? 'Tuition (to be funded)' : 'Fees'}
              </p>
              <p className="mt-1 text-sm font-bold text-navy-900">{data.fees}</p>
            </div>
          )}
          {data.courseCode && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-600">
                {data.grade ? 'Grade' : 'Course Code'}
              </p>
              <p className="mt-1 text-sm font-bold text-navy-900">{data.courseCode}</p>
            </div>
          )}
        </div>
      )}
    </StepCard>
  );
}