import { COURSES, PATHWAYS, TRACKS } from '../../../lib/data/programmeData.js';
import student4 from '../../../assets/academy/student-4.jpg';

export const IMPACT_HERO_BADGE = 'Our Impact & Success';

export const IMPACT_HERO_HEADLINE = [
  { text: 'Measurable Impact,', highlight: false },
  { text: 'Real Results.', highlight: true },
];

export const IMPACT_HERO_DESCRIPTION =
  'Our numbers tell a story of growth, transformation and a growing global community of confident learners.';

export const IMPACT_HERO_IMAGE = student4;

/** Pulled from the same IMPACT_STATS used in the stats section below — no invented figures. */
export const IMPACT_HERO_IMAGE_STATS = [
  { value: String(COURSES.length), label: 'Catalogue Entries' },
  { value: String(PATHWAYS.length + TRACKS.length), label: 'Pathways & Tracks' },
  { value: '3', label: 'Connected Divisions' },
];

/** Mirrors IMPACT_HIGHLIGHTS, shown lower on this same page. */
export const IMPACT_FEATURE_CARDS = [
  { icon: 'trending-up', label: 'Personal Growth', color: 'navy', pos: '-left-4 top-[12%]' },
  { icon: 'briefcase', label: 'Career Advancement', color: 'gold', pos: '-right-4 top-[30%]' },
  { icon: 'globe', label: 'Global Network', color: 'navy', pos: '-left-4 bottom-[28%]' },
  { icon: 'heart', label: 'Community Impact', color: 'gold', pos: '-right-4 bottom-[14%]' },
];