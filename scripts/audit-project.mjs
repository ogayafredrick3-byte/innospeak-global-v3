import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COURSES } from '../src/lib/data/programmeData.js';
import { COURSE_DETAILS, buildCourseData } from '../src/lib/data/courseDetails.js';
import { STRUCTURED_CURRICULUM_CODES, getCurriculumStatus } from '../src/lib/data/courseReadiness.js';
import { validateV3Fields } from '../src/lib/data/catalogPolicy.js';
import GENERATED_CURRICULA from '../src/lib/data/courseCurricula.generated.js';
import { OWNER_AUTHORIZED_COURSE_CODES } from '../src/lib/data/coursePublicationCodes.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'src');
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.css', '.json', '.svg']);
const sourceFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(jsx?|tsx?|mjs|css|json|svg)$/.test(entry.name)) sourceFiles.push(full);
  }
}

function resolveRelativeImport(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = path.extname(base)
    ? [base]
    : [base, ...[...sourceExtensions].map((ext) => `${base}${ext}`), ...[...sourceExtensions].map((ext) => path.join(base, `index${ext}`))];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

walk(sourceRoot);
const missingImports = [];
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const importPattern = /(?:from\s*|import\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g;
  for (const match of source.matchAll(importPattern)) {
    if (!resolveRelativeImport(file, match[2])) {
      missingImports.push({ file: path.relative(root, file), importPath: match[2] });
    }
  }
}

const codes = new Map();
const missingFields = [];
const repeatedTitles = new Map();
for (const course of COURSES) {
  if (!course.code || !course.name || !course.pathwayId) {
    missingFields.push(course.code || course.name || '(unnamed course)');
  }
  codes.set(course.code, (codes.get(course.code) || 0) + 1);
  const titleKey = `${course.division || course.pillar || 'unknown'}::${String(course.name || '').trim().toLowerCase()}`;
  repeatedTitles.set(titleKey, (repeatedTitles.get(titleKey) || 0) + 1);
}
const duplicateCodes = [...codes.entries()].filter(([, count]) => count > 1).map(([code]) => code);
const repeatedTitleGroups = [...repeatedTitles.entries()].filter(([, count]) => count > 1).map(([title, count]) => ({ title, count }));
const structuredCurriculum = COURSES.filter((course) => getCurriculumStatus(course).hasStructuredContent);
const rawCatalogueGateMismatches = COURSES.filter((course) => getCurriculumStatus(course).hasStructuredContent && (course.ownerAuthorizedForPublication !== true || course.enrollmentOpen !== true || course.selfPacedAvailable !== true));
const ownerCodeSetMismatches = COURSES.filter((course) => getCurriculumStatus(course).hasStructuredContent !== OWNER_AUTHORIZED_COURSE_CODES.has(course.code));
const publicationAuthorizationMismatches = COURSES.filter((course) => {
  const detail = buildCourseData(course.code);
  return !detail || detail.ownerAuthorizedForPublication !== getCurriculumStatus(course).hasStructuredContent;
});
const courseContentMismatches = COURSES.filter((course) => {
  const detail = buildCourseData(course.code);
  return !detail || !Array.isArray(detail.modules) || detail.modules.length === 0 || !Array.isArray(detail.assessment) || detail.assessment.length === 0;
});
const invalidAssessmentTotals = COURSES.filter((course) => {
  const detail = buildCourseData(course.code);
  const weights = (detail?.assessment || []).map((item) => Number(item.weighting));
  return weights.length > 0 && weights.every(Number.isFinite) && weights.reduce((sum, value) => sum + value, 0) !== 100;
});
const enrollmentReadinessMismatches = COURSES.filter((course) => {
  const detail = buildCourseData(course.code);
  return getCurriculumStatus(course).hasStructuredContent && detail?.enrollmentOpen !== true;
});
const enrollmentMigrationPath = path.join(root, 'supabase/migrations/20261019100000_owner_authorized_catalogue_rollout.sql');
const enrollmentMigration = fs.existsSync(enrollmentMigrationPath) ? fs.readFileSync(enrollmentMigrationPath, 'utf8') : '';
const coursesMissingEnrollmentSeed = COURSES.filter((course) => !enrollmentMigration.includes("'" + course.code.replaceAll("'", "''") + "'"));
const readinessMismatches = [...STRUCTURED_CURRICULUM_CODES].filter((code) => {
  const detail = COURSE_DETAILS[code] || buildCourseData(code);
  return !detail || !Array.isArray(detail.modules) || detail.modules.length === 0 || !Array.isArray(detail.assessment) || detail.assessment.length === 0;
});
const v3Validation = validateV3Fields(COURSES);
const curriculaCodes = Object.keys(GENERATED_CURRICULA);
const missingGeneratedCurricula = COURSES.filter((course) => !GENERATED_CURRICULA[course.code]);
const curriculumModuleCount = Object.values(GENERATED_CURRICULA).reduce((sum, curriculum) => sum + (curriculum.courseStructure || []).length, 0);
const coursesWithoutSixModules = Object.entries(GENERATED_CURRICULA).filter(([, curriculum]) => (curriculum.courseStructure || []).length !== 6).map(([code]) => code);
const moduleOutcomeKeys = Object.values(GENERATED_CURRICULA).flatMap((curriculum) => (curriculum.courseStructure || []).map((module) => JSON.stringify(module.learningOutcomes || [])));
const uniqueModuleOutcomeSets = new Set(moduleOutcomeKeys).size;
const genericModuleOutcomeSets = Object.values(GENERATED_CURRICULA).flatMap((curriculum) => curriculum.courseStructure || []).filter((module) =>
  (module.learningOutcomes || []).some((outcome) => /Work addresses the stated task and intended audience|Method or decisions are explained and evidence is traceable|Relevant quality, safety, ethics and accessibility checks are documented/i.test(outcome))
).length;
const contentHardeningMigration = path.join(root, 'supabase/migrations/20261019130000_lms_learning_content_hardening.sql');
const contentHardeningPresent = fs.existsSync(contentHardeningMigration);
const paymentSecurityMigration = path.join(root, 'supabase/migrations/20261019140000_payment_and_enrollment_security.sql');
const paymentSecuritySql = fs.existsSync(paymentSecurityMigration) ? fs.readFileSync(paymentSecurityMigration, 'utf8') : '';
const paymentSecurityPresent = fs.existsSync(paymentSecurityMigration);
const progressSecurityMigration = path.join(root, 'supabase/migrations/20261019150000_lms_progress_rpc_security.sql');
const progressSecurityPresent = fs.existsSync(progressSecurityMigration);
const storageSecurityMigration = path.join(root, 'supabase/migrations/20261019160000_storage_access_hardening.sql');
const storageSecurityPresent = fs.existsSync(storageSecurityMigration);
const flowSecurityMigration = path.join(root, 'supabase/migrations/20261019180000_lms_flow_hardening.sql');
const flowSecuritySql = fs.existsSync(flowSecurityMigration) ? fs.readFileSync(flowSecurityMigration, 'utf8') : '';
const flowSecurityPresent = fs.existsSync(flowSecurityMigration)
  && /CREATE OR REPLACE FUNCTION public\.enroll_in_free_course/i.test(flowSecuritySql)
  && /CREATE OR REPLACE FUNCTION public\.start_lesson_progress_secure/i.test(flowSecuritySql)
  && /CREATE OR REPLACE FUNCTION public\.complete_lesson_progress_secure/i.test(flowSecuritySql)
  && /REVOKE INSERT, UPDATE, DELETE ON TABLE public\.lesson_progress FROM anon, authenticated/i.test(flowSecuritySql)
  && /REVOKE INSERT ON TABLE public\.lms_enrollments FROM anon, authenticated/i.test(flowSecuritySql)
  && /CREATE POLICY lms_admin_update_enrollments/i.test(flowSecuritySql);
const legacyResetPath = path.join(root, 'supabase/migrations/20260829080000_reset_lms_tables_before_rebuild.sql');
const legacyResetSql = fs.existsSync(legacyResetPath) ? fs.readFileSync(legacyResetPath, 'utf8') : '';
const legacyResetSafe = !/DROP\s+TABLE|TRUNCATE|DELETE\s+FROM/i.test(legacyResetSql);
const coursesMissingPriceSeed = COURSES.filter((course) => !paymentSecuritySql.includes("('" + course.code + "'"));

console.log('\nInnoSpeak Global project audit');
console.log('==============================');
console.log(`Source files scanned: ${sourceFiles.length}`);
console.log(`Catalogue entries: ${COURSES.length}`);
console.log(`Unique course codes: ${codes.size - duplicateCodes.length}`);
console.log(`Missing relative imports: ${missingImports.length}`);
console.log(`Duplicate course codes: ${duplicateCodes.length}`);
console.log(`Entries missing code/name/pathway: ${missingFields.length}`);
console.log(`Repeated title groups to review: ${repeatedTitleGroups.length}`);
console.log(`Courses with structured curriculum detail: ${structuredCurriculum.length}`);
console.log(`Generated course curricula: ${curriculaCodes.length}`);
console.log(`Courses missing generated curriculum: ${missingGeneratedCurricula.length}`);
console.log(`Curriculum modules: ${curriculumModuleCount}`);
console.log(`Courses without exactly six modules: ${coursesWithoutSixModules.length}`);
console.log(`Unique module outcome sets: ${uniqueModuleOutcomeSets}/${curriculumModuleCount}`);
console.log(`Modules retaining the old generic outcome template: ${genericModuleOutcomeSets}`);
console.log(`LMS content hardening migration present: ${contentHardeningPresent ? 'yes' : 'no'}`);
console.log(`Payment/enrolment security migration present: ${paymentSecurityPresent ? 'yes' : 'no'}`);
console.log(`Courses missing canonical price seed: ${coursesMissingPriceSeed.length}`);
console.log(`Progress RPC security migration present: ${progressSecurityPresent ? 'yes' : 'no'}`);
console.log(`Storage access hardening migration present: ${storageSecurityPresent ? 'yes' : 'no'}`);
console.log(`LMS flow/enrolment/progress hardening present: ${flowSecurityPresent ? 'yes' : 'no'}`);
console.log(`Legacy LMS reset migration is non-destructive: ${legacyResetSafe ? 'yes' : 'no'}`);
console.log(`Courses with generated draft outlines: ${COURSES.length - structuredCurriculum.length}`);
console.log(`Catalogue grouping fields complete: ${v3Validation.complete ? 'yes' : 'no'}`);
console.log(`Structured-curriculum registry mismatches: ${readinessMismatches.length}`);
console.log(`Owner-publication authorization mismatches: ${publicationAuthorizationMismatches.length}`);
console.log(`Raw catalogue self-paced gate mismatches: ${rawCatalogueGateMismatches.length}`);
console.log(`Owner-authorized code-list mismatches: ${ownerCodeSetMismatches.length}`);
console.log(`Owner-authorised courses not open for self-paced enrolment: ${enrollmentReadinessMismatches.length}`);
console.log(`Courses missing from LMS rollout migration: ${coursesMissingEnrollmentSeed.length}`);
console.log(`Courses with modules and assessment content: ${COURSES.length - courseContentMismatches.length}/${COURSES.length}`);
console.log(`Assessment weighting totals not equal to 100: ${invalidAssessmentTotals.length}`);

if (missingImports.length) {
  console.error('\nMissing imports:');
  for (const item of missingImports) console.error(`- ${item.file} -> ${item.importPath}`);
}
if (duplicateCodes.length) console.error(`\nDuplicate codes: ${duplicateCodes.join(', ')}`);
if (missingFields.length) console.error(`\nMissing required fields: ${missingFields.join(', ')}`);
if (repeatedTitleGroups.length) {
  console.log('\nRepeated title groups (review for intentional levels/specialisations):');
  for (const item of repeatedTitleGroups) console.log(`- ${item.title} (${item.count})`);
}
if (readinessMismatches.length) console.error(`\nStructured-curriculum registry entries missing detail: ${readinessMismatches.join(', ')}`);
if (publicationAuthorizationMismatches.length) console.error(`\nOwner-publication authorization mismatches: ${publicationAuthorizationMismatches.map((c) => c.code).join(', ')}`);
if (enrollmentReadinessMismatches.length) console.error(`\nCourses not open for self-paced enrolment: ${enrollmentReadinessMismatches.map((c) => c.code).join(', ')}`);
if (coursesMissingEnrollmentSeed.length) console.error(`\nCourses missing from LMS rollout migration: ${coursesMissingEnrollmentSeed.map((c) => c.code).join(', ')}`);
if (courseContentMismatches.length) console.error(`\nCourses missing modules or assessment content: ${courseContentMismatches.map((c) => c.code).join(', ')}`);
if (invalidAssessmentTotals.length) console.error(`\nAssessment totals not equal to 100: ${invalidAssessmentTotals.map((c) => c.code).join(', ')}`);
if (!v3Validation.complete) console.error('\nOne or more course records have incomplete division/grouping fields.');

if (missingImports.length || duplicateCodes.length || missingFields.length || readinessMismatches.length || rawCatalogueGateMismatches.length || ownerCodeSetMismatches.length || publicationAuthorizationMismatches.length || enrollmentReadinessMismatches.length || coursesMissingEnrollmentSeed.length || courseContentMismatches.length || invalidAssessmentTotals.length || !v3Validation.complete || missingGeneratedCurricula.length || coursesWithoutSixModules.length || genericModuleOutcomeSets || !contentHardeningPresent || !paymentSecurityPresent || coursesMissingPriceSeed.length || !progressSecurityPresent || !storageSecurityPresent || !flowSecurityPresent || !legacyResetSafe) process.exitCode = 1;
