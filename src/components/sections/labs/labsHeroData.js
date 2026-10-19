import learnerSlide from '../../../assets/labs/learner-building.jpg';
import organisationSlide from '../../../assets/labs/organisation-collaboration.jpg';
import teamProjectSlide from '../../../assets/labs/team-project.jpg';

export const LABS_HERO_SLIDES = [
  { image: learnerSlide, title: 'Learners Building Real Skills' },
  { image: organisationSlide, title: 'Organisations Collaborating on Real Problems' },
  { image: teamProjectSlide, title: 'Teams Developing Real Projects' },
];

export const LABS_HERO_BADGE = 'Innovate. Build. Launch.';

export const LABS_HERO_HEADLINE = [
  { text: 'Where learning becomes', highlight: false },
  { text: 'something you can build.', highlight: true },
];

export const LABS_HERO_DESCRIPTION =
  'Seven innovation pathways where learners collaborate on AI, software engineering, cloud, cybersecurity, data science, engineering and creative media projects with real-world impact.';

/** Reflects the real catalogue — see src/lib/data/programmeData.js */
export const LABS_HERO_IMAGE = teamProjectSlide;

export const LABS_HERO_IMAGE_STATS = [
  { value: '197+', label: 'Courses' },
  { value: '7', label: 'Pathways' },
  { value: '4', label: 'Ways In' },
];

export const LABS_FEATURE_CARDS = [
  { icon: 'brain', label: 'AI & Emerging Tech', color: 'navy', pos: '-left-4 top-[12%]' },
  { icon: 'cloud', label: 'Cloud & DevOps', color: 'gold', pos: '-right-4 top-[30%]' },
  { icon: 'shield', label: 'Cybersecurity', color: 'navy', pos: '-left-4 bottom-[28%]' },
  { icon: 'rocket', label: 'Startup Incubation', color: 'gold', pos: '-right-4 bottom-[14%]' },
];