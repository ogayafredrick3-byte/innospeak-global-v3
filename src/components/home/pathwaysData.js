/**
 * pathwaysData — homepage "In-Demand Skills" section.
 * Courses are derived live from COURSES in programmeData.js, filtered by
 * marketability tier, and picked round-robin across pathways for variety.
 */

import { COURSES } from '../../lib/data/programmeData.js';
import { getMarketability } from '../../lib/data/marketability.js';

// Group the 12 Academy pathways + 7 Labs tracks into 6 broad categories
// shown as filter badges at the top of the section.
export const PATHWAY_BADGES = [
  { id: 'communication', label: 'Communication', icon: 'message-circle' },
  { id: 'technical',     label: 'Digital & Technology', icon: 'cpu' },
  { id: 'leadership',    label: 'Business & Leadership', icon: 'crown' },
  { id: 'creative',      label: 'Creative & Media', icon: 'palette' },
  { id: 'life-skills',   label: 'Life Skills', icon: 'sparkles' },
  { id: 'education',     label: 'Education & Community', icon: 'book-open' },
];

// pathwayId → category bucket
const CATEGORY_OF_PATHWAY = {
  // Academy
  'english-communication': 'communication',
  'world-languages': 'communication',
  'international-qualifications': 'communication',
  'digital-skills-productivity': 'technical',
  'business-entrepreneurship': 'leadership',
  'freelancing-remote-work': 'leadership',
  'career-global': 'leadership',
  'creative-design-media': 'creative',
  'personal-life-skills': 'life-skills',
  'education-teaching-training': 'education',
  'health-hospitality-community': 'education',
  'kenya-curriculum-tvet': 'education',
  // Labs tracks
  'software-engineering': 'technical',
  'data-analytics': 'technical',
  'ai-intelligent-systems': 'technical',
  'cloud-infrastructure': 'technical',
  'cybersecurity': 'technical',
  'engineering-smart-systems': 'technical',
  'creative-technology': 'creative',
};

// pathwayId → icon key (resolved in PathwayCard.jsx)
const ICON_OF_PATHWAY = {
  'english-communication': 'mic',
  'world-languages': 'globe',
  'international-qualifications': 'award',
  'digital-skills-productivity': 'laptop',
  'business-entrepreneurship': 'briefcase',
  'freelancing-remote-work': 'rocket',
  'career-global': 'compass',
  'creative-design-media': 'palette',
  'personal-life-skills': 'sparkles',
  'education-teaching-training': 'book-open',
  'health-hospitality-community': 'heart',
  'kenya-curriculum-tvet': 'graduation',
  'software-engineering': 'code',
  'data-analytics': 'bar-chart',
  'ai-intelligent-systems': 'brain',
  'cloud-infrastructure': 'cloud',
  'cybersecurity': 'shield',
  'engineering-smart-systems': 'cog',
  'creative-technology': 'film',
};

/**
 * Pick high-marketability courses round-robin across pathways, so the
 * section always shows variety (never 8 Business courses in a row).
 */
export function getInDemandCourses(limit = 8) {
  const high = COURSES.filter((c) => getMarketability(c) === 'high');

  const byPathway = new Map();
  for (const c of high) {
    const key = c.pathwayId;
    if (!byPathway.has(key)) byPathway.set(key, []);
    byPathway.get(key).push(c);
  }

  // Put pathways with more courses first so they surface quickly
  const buckets = [...byPathway.values()].sort((a, b) => b.length - a.length);

  const picked = [];
  let i = 0;
  let guard = 0;
  while (picked.length < limit && buckets.some((b) => b.length) && guard < 200) {
    const bucket = buckets[i % buckets.length];
    if (bucket.length) picked.push(bucket.shift());
    i++;
    guard++;
  }

  // Present each pick in the shape PathwayCard expects
  return picked.map((c) => ({
    id: c.code,
    code: c.code,
    title: c.name,
    category: CATEGORY_OF_PATHWAY[c.pathwayId] || 'technical',
    duration: c.duration,
    level: c.level,
    isFree: c.isFree === true,
    icon: ICON_OF_PATHWAY[c.pathwayId] || 'mic',
    href: `/courses/${c.code}`,
  }));
}