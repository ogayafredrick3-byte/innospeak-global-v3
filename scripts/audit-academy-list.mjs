/**
 * Audit: dump every Academy course grouped by pathway.
 * Run: node scripts/audit-academy-list.mjs
 */

import { COURSES, PATHWAYS } from '../src/lib/data/programmeData.js';

const B = '\x1b[1m', C = '\x1b[36m', G = '\x1b[32m', Y = '\x1b[33m', X = '\x1b[0m';

const academy = COURSES.filter((c) => (c.division || c.pillar) === 'academy');

console.log(`\n${B}Academy courses: ${academy.length}${X}\n${'═'.repeat(72)}`);

let grandTotal = 0;

PATHWAYS.forEach((pathway) => {
  const courses = academy.filter((c) => c.pathwayId === pathway.id);
  grandTotal += courses.length;

  console.log(`\n${B}${C}${pathway.title}${X}  (${pathway.code} · ${pathway.id})`);
  console.log(`${'─'.repeat(72)}`);
  console.log(`  ${Y}${courses.length} courses${X}\n`);

  courses
    .sort((a, b) => a.code.localeCompare(b.code))
    .forEach((c) => {
      const free = c.isFree ? ` ${G}[FREE]${X}` : '';
      console.log(`  ${c.code.padEnd(10)} ${c.name}${free}`);
      console.log(`             ${c.level} · ${c.duration} · ${c.studyMode}`);
    });
});

// Orphans (should be 0)
const orphan = academy.filter((c) => !PATHWAYS.find((p) => p.id === c.pathwayId));
if (orphan.length) {
  console.log(`\n\x1b[31m${B}ORPHANS (pathwayId not in PATHWAYS):${X}`);
  orphan.forEach((c) => console.log(`  ${c.code} — ${c.name} — pathwayId="${c.pathwayId}"`));
}

// Summary
console.log(`\n${'═'.repeat(72)}`);
console.log(`${B}Summary${X}`);
console.log(`  Pathways:         ${PATHWAYS.length}`);
console.log(`  Academy courses:  ${grandTotal}`);
console.log(`  Free courses:     ${academy.filter((c) => c.isFree).length}`);
console.log('');
