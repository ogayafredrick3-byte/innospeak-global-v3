import { COURSES, PATHWAYS, TRACKS } from '../../lib/data/programmeData.js';

/** Counts derived from the current source catalogue; these describe listings, not completed learning or impact. */

export const IMPACT_STATS = [
  {
    id: 'divisions',
    value: 4,
    suffix: '',
    label: 'Connected Engines',
    description: 'Academy · Labs · Career Hub · Foundation',
  },
  {
    id: 'courses',
    value: COURSES.length,
    suffix: '',
    label: 'Catalogue Entries',
    description: 'Listed course records; not all are necessarily open for enrolment.',
  },
  {
    id: 'pathways',
    value: PATHWAYS.length + TRACKS.length,
    suffix: '',
    label: 'Pathways & Tracks',
    description: `${PATHWAYS.length} Academy pathways and ${TRACKS.length} Labs tracks in the current source catalogue.`,
  },
];

export const IMPACT_HIGHLIGHTS = [
  { id: 'growth', title: 'Structured Growth', description: 'Use clear learning pathways to build skills progressively and identify next steps.', icon: 'trending-up' },
  { id: 'career', title: 'Career Development', description: 'Connect your skills, projects and portfolio evidence to relevant opportunities.', icon: 'briefcase' },
  { id: 'global', title: 'Transferable Skills', description: 'Build communication, digital and technical capabilities that can be applied across contexts.', icon: 'globe' },
  { id: 'community', title: 'Community Impact', description: 'Explore ways to apply technical learning to clearly defined community challenges.', icon: 'heart' },
];

export const IMPACT_QUOTE = {
  text: 'Education is the most powerful weapon which you can use to change the world. At InnoSpeak Global, we see this truth every single day.',
  author: 'InnoSpeak Global Team',
  role: 'Building the next generation of global communicators',
};