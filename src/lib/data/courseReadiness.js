/**
 * Owner-authorised curriculum content coverage for the InnoSpeak catalogue.
 * This indicates content availability only, not independent academic validation,
 * accreditation, instructor assignment, or active-intake readiness.
 */
import GENERATED_CURRICULA from './courseCurricula.generated.js';

export const STRUCTURED_CURRICULUM_CODES = new Set(Object.keys(GENERATED_CURRICULA));

export function getCurriculumStatus(courseOrCode) {
  const code = typeof courseOrCode === 'string' ? courseOrCode : courseOrCode?.code;
  return STRUCTURED_CURRICULUM_CODES.has(String(code || '').toUpperCase())
    ? { key: 'owner-authorized-content', label: 'Owner-authorised catalogue content', hasStructuredContent: true }
    : { key: 'missing', label: 'Curriculum unavailable', hasStructuredContent: false };
}
