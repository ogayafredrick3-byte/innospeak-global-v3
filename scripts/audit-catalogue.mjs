/**
 * Catalogue audit — verifies every planned course/pathway exists.
 * Run: node scripts/audit-catalogue.mjs
 */

import { COURSES, PATHWAYS } from '../src/lib/data/programmeData.js';
import { TRACKS } from '../src/lib/data/registry.js';
import { GRADE_BUNDLES, TVET_LEVELS } from '../src/lib/data/gradeBundles.js';

const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', C = '\x1b[36m', B = '\x1b[1m', X = '\x1b[0m';
const ok = (s) => `  ${G}✓${X} ${s}`;
const no = (s) => `  ${R}✗${X} ${s}`;
const wa = (s) => `  ${Y}!${X} ${s}`;
const hr = () => console.log('─'.repeat(60));
const head = (s) => console.log(`\n${B}${C}${s}${X}`);

console.log(`\n${B}InnoSpeak Catalogue Audit${X}\n${'═'.repeat(60)}`);

// ── EXPECTED LISTS ───────────────────────────────────────────
const EXPECTED_PATHWAYS = [
  'english-communication','world-languages','international-qualifications',
  'kenya-curriculum-tvet','digital-skills-productivity','creative-design-media',
  'business-entrepreneurship','freelancing-remote-work','career-global',
  'education-teaching-training','health-hospitality-community','personal-life-skills',
];

const EXPECTED_TRACKS = [
  'software-engineering','data-analytics','ai-intelligent-systems',
  'cloud-infrastructure','cybersecurity','engineering-smart-systems','creative-technology',
];

const EXPECTED_NEW_ACADEMY = [
  { code: 'AIL101', name: 'AI Literacy for Work', pathway: 'digital-skills-productivity' },
  { code: 'PDS108', name: 'Analytical Thinking for Professionals', pathway: 'personal-life-skills' },
  { code: 'PDS109', name: 'Resilience & Adaptability', pathway: 'personal-life-skills' },
  { code: 'BUS110', name: 'AI for Business Owners', pathway: 'business-entrepreneurship' },
  { code: 'ECM101', name: 'Ecommerce Management', pathway: 'freelancing-remote-work' },
  { code: 'AIV101', name: 'AI Video Generation & Editing', pathway: 'creative-design-media' },
  { code: 'AII101', name: 'AI Image Generation & Editing', pathway: 'creative-design-media' },
  { code: 'CRD108', name: 'AI Interview Preparation', pathway: 'career-global' },
  { code: 'EDT111', name: 'Philosophy of Education', pathway: 'education-teaching-training' },
  { code: 'EDT112', name: 'Educational Psychology', pathway: 'education-teaching-training' },
  { code: 'EDT113', name: 'Sociology of Education', pathway: 'education-teaching-training' },
  { code: 'EDT114', name: 'Training Methodologies', pathway: 'education-teaching-training' },
  { code: 'EDT115', name: 'Workshop Planning & Management', pathway: 'education-teaching-training' },
  { code: 'HSP108', name: 'Front Office Operations', pathway: 'health-hospitality-community' },
  { code: 'HSP109', name: 'Tour Guide Operations', pathway: 'health-hospitality-community' },
];

const EXPECTED_GRADES = ['PRI-G03','PRI-G04','PRI-G05','PRI-G06','JSS-G07','JSS-G08','JSS-G09','SSS-G10','SSS-G11','SSS-G12'];
const EXPECTED_TVET = ['ART','CRF','DIP','HDP'];
const EXPECTED_FREE = ['ICT101','DLP101','DLP105','AIL101','CVW101','ITP101','LKD101','ENG101','ENG111','EDT108'];

const codeSet = new Set(COURSES.map(c => c.code));
const pathwaySet = new Set(PATHWAYS.map(p => p.id));
const trackSet = new Set(TRACKS.map(t => t.id));

// ── PATHWAYS ─────────────────────────────────────────────────
head('1. Academy Pathways (12 expected)');
const missingPathways = EXPECTED_PATHWAYS.filter(id => !pathwaySet.has(id));
const extraPathways = PATHWAYS.filter(p => !EXPECTED_PATHWAYS.includes(p.id));
console.log(`  Total in registry: ${PATHWAYS.length}`);
if (missingPathways.length === 0) console.log(ok('All 12 expected pathways present'));
else missingPathways.forEach(p => console.log(no(`Missing: ${p}`)));
if (extraPathways.length > 0) extraPathways.forEach(p => console.log(wa(`Unexpected: ${p.id}`)));

// ── TRACKS ───────────────────────────────────────────────────
head('2. Labs Tracks (7 expected)');
const missingTracks = EXPECTED_TRACKS.filter(id => !trackSet.has(id));
console.log(`  Total in registry: ${TRACKS.length}`);
if (missingTracks.length === 0) console.log(ok('All 7 expected tracks present'));
else missingTracks.forEach(t => console.log(no(`Missing: ${t}`)));

// ── NEW ACADEMY COURSES ──────────────────────────────────────
head('3. New Academy Courses (15 expected)');
let newAcademyFound = 0;
const newAcademyIssues = [];
EXPECTED_NEW_ACADEMY.forEach(c => {
  const match = COURSES.find(x => x.code === c.code);
  if (!match) {
    console.log(no(`${c.code} — ${c.name} (MISSING)`));
    newAcademyIssues.push(c.code);
  } else {
    newAcademyFound++;
    const pathwayOk = match.pathwayId === c.pathway;
    const tag = pathwayOk ? `${G}✓${X}` : `${Y}!${X}`;
    console.log(`  ${tag} ${c.code} — ${match.name}`);
    if (!pathwayOk) console.log(`      ${Y}pathwayId is "${match.pathwayId}", expected "${c.pathway}"${X}`);
  }
});
console.log(`\n  ${newAcademyFound}/${EXPECTED_NEW_ACADEMY.length} present`);

// ── CBE GRADE BUNDLES ────────────────────────────────────────
head('4. CBE Grade Bundles (10 expected)');
const gradeSet = new Set(GRADE_BUNDLES.map(g => g.code));
const missingGrades = EXPECTED_GRADES.filter(c => !gradeSet.has(c));
console.log(`  Total in gradeBundles: ${GRADE_BUNDLES.length}`);
if (missingGrades.length === 0) console.log(ok('All 10 grades present'));
else missingGrades.forEach(g => console.log(no(`Missing: ${g}`)));
GRADE_BUNDLES.forEach(g => {
  console.log(`      ${g.code} — ${g.title} — ${g.subjects.length} subjects — $${g.feesUSD}`);
});

// ── TVET LEVELS ──────────────────────────────────────────────
head('5. TVET Levels (4 expected, coming_soon)');
const tvetSet = new Set(TVET_LEVELS.map(t => t.code));
const missingTvet = EXPECTED_TVET.filter(c => !tvetSet.has(c));
if (missingTvet.length === 0) console.log(ok('All 4 TVET levels present'));
else missingTvet.forEach(t => console.log(no(`Missing: ${t}`)));
TVET_LEVELS.forEach(t => console.log(`      ${t.code} — ${t.title} — ${t.status}`));

// ── FREE COURSES ─────────────────────────────────────────────
head('6. Free Courses (10 Academy expected)');
let freeFound = 0;
EXPECTED_FREE.forEach(code => {
  const match = COURSES.find(x => x.code === code);
  if (match) {
    freeFound++;
    const isFree = match.isFree === true;
    console.log(`  ${isFree ? `${G}✓${X}` : `${Y}!${X}`} ${code} — ${match.name}${isFree ? '' : `  (isFree flag is ${match.isFree})`}`);
  } else {
    console.log(no(`${code} — MISSING`));
  }
});
console.log(`\n  ${freeFound}/${EXPECTED_FREE.length} present`);

// ── DIVISION BREAKDOWN ───────────────────────────────────────
head('7. Division Breakdown');
const academy = COURSES.filter(c => (c.division || c.pillar) === 'academy');
const labs = COURSES.filter(c => (c.division || c.pillar) === 'labs');
const neither = COURSES.filter(c => !c.division && !c.pillar);
console.log(`  Academy:  ${academy.length}`);
console.log(`  Labs:     ${labs.length}`);
console.log(`  Unknown:  ${neither.length}${neither.length ? ' — ' + neither.map(c => c.code).join(', ') : ''}`);
console.log(`  TOTAL:    ${COURSES.length}`);

// ── COURSES PER PATHWAY ──────────────────────────────────────
head('8. Academy Courses per Pathway');
EXPECTED_PATHWAYS.forEach(id => {
  const count = academy.filter(c => c.pathwayId === id).length;
  const pw = PATHWAYS.find(p => p.id === id);
  console.log(`  ${String(count).padStart(3)}  ${pw?.title || id}  (${id})`);
});

// ── DUPLICATE DETECTION ──────────────────────────────────────
head('9. Duplicate Codes');
const counts = {};
COURSES.forEach(c => { counts[c.code] = (counts[c.code] || 0) + 1; });
const dupes = Object.entries(counts).filter(([, n]) => n > 1);
if (dupes.length === 0) console.log(ok('No duplicate course codes'));
else dupes.forEach(([code, n]) => console.log(no(`${code} appears ${n} times`)));

// ── ORPHAN COURSES ───────────────────────────────────────────
head('10. Orphan Courses (pathwayId not in registry)');
const orphans = COURSES.filter(c => !pathwaySet.has(c.pathwayId) && !trackSet.has(c.pathwayId));
if (orphans.length === 0) console.log(ok('Every course has a valid pathway or track'));
else orphans.forEach(c => console.log(no(`${c.code} — pathwayId="${c.pathwayId}"`)));

// ── SUMMARY ──────────────────────────────────────────────────
head('Summary');
const allOk =
  missingPathways.length === 0 &&
  missingTracks.length === 0 &&
  newAcademyIssues.length === 0 &&
  missingGrades.length === 0 &&
  missingTvet.length === 0 &&
  dupes.length === 0 &&
  orphans.length === 0;

if (allOk) console.log(`  ${G}${B}CATALOGUE IS COMPLETE${X}`);
else {
  console.log(`  ${Y}Issues to fix:${X}`);
  if (missingPathways.length) console.log(`    - ${missingPathways.length} missing pathways`);
  if (missingTracks.length) console.log(`    - ${missingTracks.length} missing tracks`);
  if (newAcademyIssues.length) console.log(`    - ${newAcademyIssues.length} missing new Academy courses`);
  if (missingGrades.length) console.log(`    - ${missingGrades.length} missing grades`);
  if (missingTvet.length) console.log(`    - ${missingTvet.length} missing TVET levels`);
  if (dupes.length) console.log(`    - ${dupes.length} duplicate codes`);
  if (orphans.length) console.log(`    - ${orphans.length} orphan courses`);
}
console.log('');
