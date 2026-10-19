/**
 * courseMigration — remaps existing course pathwayId values to V3 registry IDs,
 * applies renames, and filters archived courses.
 *
 * Governance: course codes are permanent. This file changes `pathwayId`,
 * adds `division` + `groupingCode`, and applies display renames — it never
 * changes codes.
 */

export const PATHWAY_ID_MIGRATION = {
  // Academy
  'global-language': 'english-communication',
  'languages': 'world-languages',
  'international-qualifications': 'international-qualifications',
  'national-tvet': 'kenya-curriculum-tvet',
  'digital-literacy-productivity': 'digital-skills-productivity',
  'creative-design': 'creative-design-media',
  'business': 'business-entrepreneurship',
  'freelancing': 'freelancing-remote-work',
  'career': 'career-global',
  'education-teaching-excellence': 'education-teaching-training',
  'health-hospitality-community': 'health-hospitality-community',
  'personal-development-life-skills': 'personal-life-skills',
  // Labs — orphan school-* ids → new track ids
  'school-software-engineering': 'software-engineering',
  'school-ai': 'ai-intelligent-systems',
  'school-data-science': 'data-analytics',
  'school-cloud-devops': 'cloud-infrastructure',
  'school-cybersecurity': 'cybersecurity',
  'school-engineering-innovation': 'engineering-smart-systems',
  'school-creative-ai-immersive': 'creative-technology',
};

// Courses that are free to complete (certificate still costs ~$5).
const FREE_COURSE_CODES = new Set([
  // Academy
  'ICT101','DLP101','DLP105','AIL101','CVW101','ITP101','LKD101','ENG101','ENG111','EDT108',
  // Labs
  'COD101','WEB101','DTL101','AIF101','CYB101',
]);

// Display renames — the code stays the same, only the name/description/level changes.
const COURSE_RENAMES = {
  ICT201: {
    name: 'Advanced Research & Source Evaluation',
    shortDescription:
      'Advanced skills for evaluating sources, academic research, citation and avoiding misinformation.',
    level: 'Intermediate',
  },
  BUS102: {
    name: 'Lean Startup Methodology',
    shortDescription:
      'A focused deep-dive into the build-measure-learn loop, MVPs, customer development and validated learning.',
  },
  EDT101: {
    name: 'Teaching Methodologies (Schools & Classrooms)',
    shortDescription:
      'Contemporary pedagogy for schools: active learning, differentiation, inquiry-based and flipped classroom models.',
  },
  EDT114: {
    name: 'Training Methodologies (Adult & Technical)',
    shortDescription:
      'Training design and delivery for adult and technical learners, covering needs analysis, session design and evaluation.',
  },
};

// Courses archived from public display (data preserved, hidden from listings).
export const COURSES_TO_ARCHIVE = [
  { code: 'KCS101', reason: 'KCSE category removed per V3 restructure' },
  { code: 'CBP101', reason: 'Replaced by grade bundles PRI-G03 – PRI-G06' },
  { code: 'CBJ101', reason: 'Replaced by grade bundles JSS-G07 – JSS-G09' },
  { code: 'CBS101', reason: 'Replaced by grade bundles SSS-G10 – SSS-G12' },
  { code: 'CVI101', reason: 'Content covered by CVW101, CRD102, ITP101, CRD108' },
  { code: 'TRN101', reason: 'AI transcription disruption risk — deferred' },
  { code: 'ART101', reason: 'Replaced by TVET_LEVELS framework (coming soon)' },
  { code: 'CRA101', reason: 'Replaced by TVET_LEVELS framework (coming soon)' },
  { code: 'DIP101', reason: 'Replaced by TVET_LEVELS framework (coming soon)' },
];

const ACADEMY_PATHWAY_IDS = new Set([
  'english-communication','world-languages','international-qualifications',
  'kenya-curriculum-tvet','digital-skills-productivity','creative-design-media',
  'business-entrepreneurship','freelancing-remote-work','career-global',
  'education-teaching-training','health-hospitality-community','personal-life-skills',
]);

const LABS_TRACK_IDS = new Set([
  'software-engineering','data-analytics','ai-intelligent-systems',
  'cloud-infrastructure','cybersecurity','engineering-smart-systems','creative-technology',
]);

const GROUPING_CODE_BY_ID = {
  'english-communication': 'ACP-ENG',
  'world-languages': 'ACP-WLD',
  'international-qualifications': 'ACP-IQU',
  'kenya-curriculum-tvet': 'ACP-KCV',
  'digital-skills-productivity': 'ACP-DSP',
  'creative-design-media': 'ACP-CDM',
  'business-entrepreneurship': 'ACP-BUS',
  'freelancing-remote-work': 'ACP-FRW',
  'career-global': 'ACP-CGO',
  'education-teaching-training': 'ACP-ETT',
  'health-hospitality-community': 'ACP-HHC',
  'personal-life-skills': 'ACP-PLS',
  'software-engineering': 'LT-SWE',
  'data-analytics': 'LT-DAT',
  'ai-intelligent-systems': 'LT-AIS',
  'cloud-infrastructure': 'LT-CLD',
  'cybersecurity': 'LT-CYB',
  'engineering-smart-systems': 'LT-ENG',
  'creative-technology': 'LT-CRT',
};

export function migrateCourse(course) {
  if (!course || !course.pathwayId) return course;

  const newPathwayId = PATHWAY_ID_MIGRATION[course.pathwayId] || course.pathwayId;
  const isAcademy = ACADEMY_PATHWAY_IDS.has(newPathwayId);
  const isLabs = LABS_TRACK_IDS.has(newPathwayId);
  const isFree = FREE_COURSE_CODES.has(course.code);
  const rename = COURSE_RENAMES[course.code];

  return {
    ...course,
    ...(rename || {}),
    pathwayId: newPathwayId,
    division: course.division || (isLabs ? 'labs' : isAcademy ? 'academy' : course.pillar || 'academy'),
    grouping: course.grouping || (isLabs ? 'track' : 'pathway'),
    groupingCode: course.groupingCode || GROUPING_CODE_BY_ID[newPathwayId] || null,
    version: course.version || '1.0',
    lastReviewed: course.lastReviewed || null,
    ...(isFree && {
      isFree: true,
      fees: 'Free',
      feesUSD: 0,
      certificatePriceUSD: course.certificatePriceUSD || 5,
    }),
  };
}

export function migrateCourses(courses) {
  return courses.map(migrateCourse);
}

export function isArchived(course) {
  return COURSES_TO_ARCHIVE.some((a) => a.code === course.code);
}

export function filterArchived(courses) {
  return courses.filter((c) => !isArchived(c));
}