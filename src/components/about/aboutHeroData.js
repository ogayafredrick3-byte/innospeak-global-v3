import { COURSES, PATHWAYS, TRACKS } from '../../lib/data/programmeData.js';

export const ABOUT_HERO_BADGE = 'About InnoSpeak Global';

export const ABOUT_HERO_HEADLINE = [
  { text: 'Empowering Minds.', highlight: false },
  { text: 'Transforming Futures.', highlight: true },
  { text: 'Building Global Opportunities.', highlight: false },
];

export const ABOUT_HERO_SUBTITLE =
  'InnoSpeak Global is a forward-thinking education, innovation and leadership platform dedicated to equipping learners with communication, technical, digital and entrepreneurial skills for success in a rapidly changing world.';

export const ABOUT_HERO_BUTTONS = [
  { label: 'Our Story', to: '/about', variant: 'gold' },
  { label: 'Explore Learning Pathways', to: '/academy', variant: 'outline' },
];

export const ABOUT_HERO_IMAGE =
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200';

export const ABOUT_HERO_STATS = [
  { value: String(COURSES.length), label: 'Catalogue Entries' },
  { value: String(PATHWAYS.length + TRACKS.length), label: 'Pathways & Tracks' },
  { value: '3', label: 'Connected Divisions' },
];
