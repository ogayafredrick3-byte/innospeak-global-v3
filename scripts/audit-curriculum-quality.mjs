import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COURSES } from '../src/lib/data/programmeData.js';
import CURRICULA from '../src/lib/data/courseCurricula.generated.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = path.join(root, 'docs/CURRICULUM_QUALITY_AUDIT.md');
const queuePath = path.join(root, 'docs/CURRICULUM_QUALITY_REVIEW_QUEUE.csv');
const wordCount = (value = '') => String(value).trim().split(/\s+/).filter(Boolean).length;
const safetyPattern = /electrical|electronics|power systems|wiring|installation|laboratory|\blab\b|medical|health|nursing|chemical|mechanical|welding|machinery|construction|automotive|solar|renewable energy|engineering|hvac|refrigeration|plumbing|civil works/i;
const safetyTerms = /safety|supervis|risk|protective|hazard|isolation|lockout|standard operating procedure|PPE|personal protective equipment/i;
const genericActivityPatterns = [
  /set up a workspace or sample dataset and record a baseline task/i,
  /annotate a worked example, code path, query or analysis/i,
  /build a small feature or analysis and keep a versioned work log/i,
  /write and run tests on normal, boundary and error cases/i,
  /complete a security, privacy, accessibility and maintainability checklist/i,
  /submit the artefact, run instructions, test results and reflection/i,
  /complete a short baseline scenario and define success criteria/i,
  /annotate an example and explain the method used/i,
  /produce a work sample relevant to the course/i,
  /use the rubric to revise the work and document changes/i,
  /complete a responsible-practice checklist/i,
  /submit the final artefact and explain decisions and limitations/i,
];

function analyse(course) {
  const curriculum = CURRICULA[course.code];
  const flags = [];
  if (!curriculum) return { course, curriculum: null, flags: ['MISSING_CURRICULUM'], score: 0 };
  const descriptionWords = wordCount(curriculum.courseDescription);
  const modules = curriculum.courseStructure || [];
  const moduleDescriptionAverage = modules.length
    ? modules.reduce((sum, module) => sum + wordCount(module.description), 0) / modules.length
    : 0;
  const activityTexts = modules.flatMap((module) => module.learningActivities || []);
  const genericActivities = activityTexts.filter((activity) => genericActivityPatterns.some((pattern) => pattern.test(activity))).length;
  const allText = [curriculum.courseDescription, curriculum.targetAudience, ...(curriculum.prerequisites || []), ...modules.map((module) => module.description), ...activityTexts].join(' ');
  const safetySensitive = safetyPattern.test(`${course.name} ${course.category || ''} ${course.pathwayId || ''}`);
  const hasSafetyGuidance = safetyTerms.test(allText);
  const genericPrerequisites = (curriculum.prerequisites || []).filter((item) => /minimum age of 16|internet access for online learners|commitment to attend and participate/i.test(item)).length;
  const outcomeCount = (curriculum.learningOutcomes || []).length;
  const assessmentWeight = (curriculum.assessmentPlan || []).reduce((sum, item) => sum + Number(item.weighting || 0), 0);
  const capstoneWords = wordCount(curriculum.capstone?.brief || '');

  if (descriptionWords < 45) flags.push('COURSE_DESCRIPTION_TOO_BRIEF');
  if (modules.length !== 6) flags.push('MODULE_COUNT_NOT_SIX');
  if (moduleDescriptionAverage < 18) flags.push('MODULE_DESCRIPTIONS_NEED_DEPTH');
  if (genericActivities >= 2) flags.push('REPEATED_GENERIC_ACTIVITIES');
  if (genericPrerequisites >= 2) flags.push('GENERIC_PREREQUISITES');
  if (safetySensitive && !hasSafetyGuidance) flags.push('SAFETY_REVIEW_REQUIRED');
  if (outcomeCount < 4) flags.push('LEARNING_OUTCOMES_NEED_REVIEW');
  if (assessmentWeight !== 100) flags.push('ASSESSMENT_WEIGHTS_INVALID');
  if (capstoneWords < 25) flags.push('CAPSTONE_BRIEF_TOO_BRIEF');

  const score = flags.reduce((sum, flag) => sum + ({
    MISSING_CURRICULUM: 100,
    SAFETY_REVIEW_REQUIRED: 8,
    REPEATED_GENERIC_ACTIVITIES: 5,
    COURSE_DESCRIPTION_TOO_BRIEF: 3,
    MODULE_DESCRIPTIONS_NEED_DEPTH: 3,
    GENERIC_PREREQUISITES: 2,
    MODULE_COUNT_NOT_SIX: 10,
    LEARNING_OUTCOMES_NEED_REVIEW: 3,
    ASSESSMENT_WEIGHTS_INVALID: 10,
    CAPSTONE_BRIEF_TOO_BRIEF: 3,
  }[flag] || 1), 0);
  return { course, curriculum, flags, score, descriptionWords, moduleDescriptionAverage, genericActivities, genericPrerequisites, safetySensitive, hasSafetyGuidance, outcomeCount, assessmentWeight, capstoneWords };
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

const rows = COURSES.map(analyse).sort((a, b) => b.score - a.score || a.course.code.localeCompare(b.course.code));
const countFlag = (flag) => rows.filter((row) => row.flags.includes(flag)).length;
const missing = rows.filter((row) => !row.curriculum).length;
const flagged = rows.filter((row) => row.flags.length > 0).length;
const lines = [
  '# InnoSpeak Global — Curriculum Quality Audit',
  '',
  `Generated: ${new Date().toISOString().slice(0, 10)}`,
  '',
  '## Purpose and limits',
  '',
  'This is a structural quality-screening report for prioritising human review. It does not write or validate teaching content, verify factual accuracy, confirm current standards, or establish academic accreditation. A flag is a review prompt, not a verdict that a course is unusable.',
  '',
  '## Coverage',
  '',
  `- Catalogue courses scanned: **${rows.length}**`,
  `- Courses with a generated curriculum: **${rows.length - missing}/${rows.length}**`,
  `- Courses with at least one review flag: **${flagged}**`,
  `- Missing curricula: **${missing}**`,
  `- Courses with course descriptions under 45 words: **${countFlag('COURSE_DESCRIPTION_TOO_BRIEF')}**`,
  `- Courses with repeated generic activities: **${countFlag('REPEATED_GENERIC_ACTIVITIES')}**`,
  `- Courses with generic prerequisite items: **${countFlag('GENERIC_PREREQUISITES')}**`,
  `- Safety-sensitive courses requiring a safety-specific content check: **${countFlag('SAFETY_REVIEW_REQUIRED')}**`,
  `- Courses whose assessment weights do not total 100: **${countFlag('ASSESSMENT_WEIGHTS_INVALID')}**`,
  '',
  '## Review order',
  '',
  '1. **Safety-sensitive technical courses:** verify that learning activities distinguish simulation from physical work and include appropriate supervision, hazards, isolation, equipment and locally applicable procedures.',
  '2. **Repeated generic activities:** replace template activities with tasks that genuinely practise the course subject and produce observable evidence.',
  '3. **Course and module descriptions:** clarify scope, concepts, tools, worked examples, learner outputs and success criteria.',
  '4. **Prerequisites and assessment:** remove irrelevant defaults, state genuine entry skills, and align assessments with measurable course outcomes.',
  '5. **Subject-expert review:** verify facts, references, workload, accessibility, assessment rubrics and credential wording before making stronger academic claims.',
  '',
  '## Highest-priority review queue',
  '',
  '| Course | Pathway | Review flags | Description words | Generic activities |',
  '|---|---|---|---:|---:|',
  ...rows.filter((row) => row.flags.length).slice(0, 25).map((row) => `| ${row.course.code} — ${row.course.name.replaceAll('|', '\\|')} | ${row.course.pathwayId || 'Not assigned'} | ${row.flags.join(', ')} | ${row.descriptionWords ?? 0} | ${row.genericActivities ?? 0} |`),
  '',
  '## Full review queue',
  '',
  'See `CURRICULUM_QUALITY_REVIEW_QUEUE.csv` for one row per catalogue course, including the review flags and screening metrics.',
  '',
  '## Release recommendation',
  '',
  'Keep the current curriculum structures available as a draft/self-paced learning baseline, but do not treat structural completeness as proof of detailed instructional quality. Prioritise safety-sensitive content and repeated generic activities for course-by-course refinement. Supabase wiring and live backend security are outside the scope of this audit and remain deferred as requested.',
  '',
];
fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
const header = ['course_code','course_title','pathway_id','priority_score','review_flags','description_words','module_count','average_module_description_words','generic_activity_count','generic_prerequisite_count','safety_sensitive','safety_guidance_detected','learning_outcome_count','assessment_weight_total','capstone_brief_words'];
const csv = [header, ...rows.map((row) => [row.course.code, row.course.name, row.course.pathwayId || '', row.score, row.flags.join('; '), row.descriptionWords ?? 0, row.curriculum?.courseStructure?.length ?? 0, row.moduleDescriptionAverage?.toFixed(1) ?? '0', row.genericActivities ?? 0, row.genericPrerequisites ?? 0, row.safetySensitive ? 'yes' : 'no', row.hasSafetyGuidance ? 'yes' : 'no', row.outcomeCount ?? 0, row.assessmentWeight ?? 0, row.capstoneWords ?? 0])].map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
fs.writeFileSync(queuePath, csv, 'utf8');
console.log('Curriculum quality audit complete');
console.log(`Courses scanned: ${rows.length}`);
console.log(`Courses flagged for review: ${flagged}`);
console.log(`Descriptions under 45 words: ${countFlag('COURSE_DESCRIPTION_TOO_BRIEF')}`);
console.log(`Courses with repeated generic activities: ${countFlag('REPEATED_GENERIC_ACTIVITIES')}`);
console.log(`Safety-sensitive courses needing safety-specific review: ${countFlag('SAFETY_REVIEW_REQUIRED')}`);
console.log(`Report: ${path.relative(root, reportPath)}`);
console.log(`Review queue: ${path.relative(root, queuePath)}`);
