import { COURSES, PATHWAYS, TRACKS } from '../../lib/data/programmeData.js';

export const WHY_CHOOSE_FEATURES = [
  { id: 'guided-learning', title: 'Guided Learning', description: 'Use structured learning resources, clear course information and support pathways to plan your next step.', icon: 'users' },
  { id: 'flexible-learning', title: 'Flexible Learning', description: 'Choose between Online, Physical or Hybrid class formats to fit your schedule and location.', icon: 'laptop' },
  { id: 'clear-credentials', title: 'Clear Credentials', description: 'Course pages should state completion requirements, the credential issuer and verification options where available.', icon: 'award' },
  { id: 'relevant-learning', title: 'Relevant Learning', description: 'Explore communication, technical, digital and professional learning pathways with course-specific outcomes.', icon: 'globe' },
  { id: 'practical-approach', title: 'Practical Approach', description: 'Hands-on projects, real-world case studies and interactive learning methodologies.', icon: 'tool' },
  { id: 'clear-progress', title: 'Visible Progress', description: 'Course and learner workflows are designed to make next steps, requirements and progress easier to understand.', icon: 'user-check' },
  { id: 'career-development', title: 'Career Development', description: 'Build toward career readiness through skills, project evidence and career-development resources. Specific opportunities depend on availability.', icon: 'briefcase' },
  { id: 'community', title: 'Vibrant Community', description: 'Join a growing network of learners, alumni and industry partners across the globe.', icon: 'heart' },
];

// Real numbers — kept here for any component that still uses HighlightStrip.
// The primary Impact section lives in impactData.js.
export const WHY_CHOOSE_HIGHLIGHTS = [
  { id: 'courses', value: COURSES.length, suffix: '', label: 'Catalogue Entries' },
  { id: 'programs', value: PATHWAYS.length + TRACKS.length, suffix: '', label: 'Pathways & Tracks' },
  { id: 'divisions', value: 3, suffix: '', label: 'Connected Divisions' },
];