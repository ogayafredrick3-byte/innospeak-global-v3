/**
 * marketability — computes marketability tier for a course.
 * 'high' = strong employer demand + credential ecosystem (2026 signals)
 * 'medium' = solid demand but niche
 * 'standard' = foundational or lifestyle course
 */

const HIGH_MARKETABILITY_CODES = new Set([
  // AI & Data — top global demand clusters
  'AIF101','AI101','AIP101','AIA101','GEN101','ML101','AIL101',
  'DSC101','DTL101','EXL101','PBI101','PYD101','DEG101',
  // Cloud, DevOps, Infrastructure
  'CLD101','AWS101','AWS102','AZR101','DVO101','DKR101','NET101','LNX101',
  // Cybersecurity (Kenya: 45K unfilled roles)
  'CYB101','CYB201','CYB301','CYB302','CYB303','CYB304','CYB305','CYB306','CYB307',
  // Software Engineering
  'COD101','WEB101','JSC101','REA101','FSW101','GIT101','AID101','PY101','JAV101','MOB101',
  // Business / Career
  'BUS110','BAN101','PMG101','ENT101','FIN101','ECM101',
  'CVW101','ITP101','LKD101','CVI101','CRD108',
  // Creative AI (+329% AI video demand)
  'AIV101','AII101',
  // HR / Growth
  'HRM101','BUS108',
  // Engineering & Renewable (Kenya green energy)
  'SOL101','REN101','PLC101','ROB101','CAD101','ELI101',
  // Hospitality (ILO-validated Kenya priority)
  'HSP101','HSP102','HSP108','HSP109',
  // Education — high demand
  'EDT108','EDT114',
]);

const MEDIUM_MARKETABILITY_CODES = new Set([
  // Personal Development
  'PDS101','PDS102','PDS108','PDS109',
  'PDS103','PDS104','PDS105','PDS106','PDS107',
  // Education (broader)
  'EDT101','EDT107','EDT102','EDT103','EDT110',
  // Communication
  'ENG105','ENG106','ENG107','ENG108','ENG110','ENG113',
  // Creative
  'PHO101','PRE101','GRD101','ILL101','AFX101','BRD101','CCN101',
  'MOG101','MOT101','FIG101','UIX101','UID101','UXD101',
  // Career
  'SAP101','SCH101','IJR101','EMP101','WET101','CRD105','CRD106','CRD107',
  // Freelance
  'UPW101','FIV101','VAS101','FRL101','FRL102','FRL103','FRL105','FRL106','FRL107',
  // Health
  'HSP103','HSP104','HSP105','HSP106','HSP107','CUS101',
]);

/** Get marketability tier for a course. */
export function getMarketability(course) {
  if (!course) return 'standard';
  if (course.marketability) return course.marketability;
  if (HIGH_MARKETABILITY_CODES.has(course.code)) return 'high';
  if (MEDIUM_MARKETABILITY_CODES.has(course.code)) return 'medium';
  return 'standard';
}

/** True if the course is high-marketability. */
export function isMarketable(course) {
  return getMarketability(course) === 'high';
}

/** Sort courses by marketability (high → medium → standard). */
export function sortByMarketability(courses = []) {
  const order = { high: 0, medium: 1, standard: 2 };
  return [...courses].sort((a, b) => {
    const diff = order[getMarketability(a)] - order[getMarketability(b)];
    if (diff !== 0) return diff;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

/** Filter to only high-marketability courses. */
export function getHighMarketabilityCourses(courses = []) {
  return courses.filter(isMarketable);
}

/** Group courses by marketability tier. */
export function groupByMarketability(courses = []) {
  return courses.reduce(
    (acc, c) => {
      acc[getMarketability(c)].push(c);
      return acc;
    },
    { high: [], medium: [], standard: [] }
  );
}