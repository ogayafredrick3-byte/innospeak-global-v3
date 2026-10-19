/**
 * cbeData — CBE grade bundles for the CBE Academy component.
 * Re-exports from gradeBundles.js so there is one source of truth.
 */

export {
  GRADE_BUNDLES,
  TVET_LEVELS,
  getGradeBundle,
  getGradesByLevel,
} from './gradeBundles.js';

import { GRADE_BUNDLES, TVET_LEVELS, getGradeBundle, getGradesByLevel } from './gradeBundles.js';

// ── Common aliases ───────────────────────────────────────────
export const CBE_GRADES = GRADE_BUNDLES;
export const CBE_LEVELS = ['primary', 'junior_secondary', 'senior_secondary'];
export const TVET = TVET_LEVELS;

// ── School levels (for CbeAcademy component) ─────────────────
export const SCHOOL_LEVELS = [
  {
    id: 'primary',
    code: 'primary',
    name: 'Primary School',
    title: 'Primary School',
    grades: 'Grade 3 – 6',
    gradeRange: 'Grade 3 – 6',
    ageRange: 'Ages 8 – 12',
    description: 'Upper Primary under Kenya\'s Competency Based Curriculum (CBC). 8 core learning areas per grade.',
    icon: 'book',
    color: 'navy',
    subjects: 8,
    feesUSD: { min: 65, max: 80 },
  },
  {
    id: 'junior_secondary',
    code: 'junior_secondary',
    name: 'Junior Secondary School',
    title: 'Junior Secondary School',
    grades: 'Grade 7 – 9',
    gradeRange: 'Grade 7 – 9',
    ageRange: 'Ages 12 – 15',
    description: 'Junior Secondary under CBC. 9 compulsory subjects plus 1 elective per grade.',
    icon: 'academic-cap',
    color: 'gold',
    subjects: 10,
    feesUSD: { min: 120, max: 130 },
  },
  {
    id: 'senior_secondary',
    code: 'senior_secondary',
    name: 'Senior Secondary School',
    title: 'Senior Secondary School',
    grades: 'Grade 10 – 12',
    gradeRange: 'Grade 10 – 12',
    ageRange: 'Ages 15 – 18',
    description: 'Senior Secondary under CBC. 4 core subjects plus 3 pathway subjects (Arts & Sports Science, Social Sciences, or STEM).',
    icon: 'briefcase',
    color: 'navy',
    subjects: 7,
    feesUSD: { min: 180, max: 200 },
  },
];

// ── CBE_INFO (summary block for Academy page) ────────────────
export const CBE_INFO = {
  title: 'CBE Academy',
  subtitle: 'Kenya Competency Based Curriculum',
  shortDescription:
    'Full-grade enrollment aligned with KICD. One enrollment, all subjects, one certificate per grade.',
  description:
    'InnoSpeak CBE Academy follows Kenya\'s Competency Based Curriculum (CBC) as designed by KICD. Learners enroll by grade — one payment covers every subject for that grade — and instructors load lessons directly into the LMS.',

  stats: {
    grades: 10,
    primaryGrades: 4,
    juniorSecondaryGrades: 3,
    seniorSecondaryGrades: 3,
    pathways: 3,
    levelBands: 4,
  },

  levelBands: [
    { id: 'foundation', name: 'Foundation', description: 'Can understand the basics' },
    { id: 'practitioner', name: 'Practitioner', description: 'Can apply the skill' },
    { id: 'professional', name: 'Professional', description: 'Can perform independently' },
    { id: 'advanced', name: 'Advanced', description: 'Can handle complex work' },
  ],

  enrollmentModel: {
    summary: 'One enrollment = one grade = all subjects',
    steps: [
      'Choose level (Primary, Junior Secondary, Senior Secondary)',
      'Choose grade (Grade 3 through Grade 12)',
      'Choose elective (where applicable)',
      'Enroll and pay once for the full grade',
      'Access all subjects in your dashboard',
    ],
  },

  pathways: ['Arts & Sports Science', 'Social Sciences', 'STEM'],
};

// ── Convenience getters ──────────────────────────────────────
export function getPrimaryGrades() {
  return getGradesByLevel('primary');
}

export function getJuniorSecondaryGrades() {
  return getGradesByLevel('junior_secondary');
}

export function getSeniorSecondaryGrades() {
  return getGradesByLevel('senior_secondary');
}

export function getGradeByCode(code) {
  return getGradeBundle(code);
}

export function getGradeSubjects(gradeCode) {
  const grade = getGradeBundle(gradeCode);
  return grade ? grade.subjects : [];
}

export function getGradeElectives(gradeCode) {
  const grade = getGradeBundle(gradeCode);
  return grade ? grade.elective || [] : [];
}

export function getSeniorSecondaryPathways() {
  return ['Arts & Sports Science', 'Social Sciences', 'STEM'];
}

export function getPathwayElectives(gradeCode, pathwayName) {
  const grade = getGradeBundle(gradeCode);
  if (!grade || !grade.pathwayElectives) return [];
  return grade.pathwayElectives[pathwayName] || [];
}

export function getSchoolLevels() {
  return SCHOOL_LEVELS;
}

export function getSchoolLevelById(id) {
  return SCHOOL_LEVELS.find((l) => l.id === id || l.code === id) || null;
}