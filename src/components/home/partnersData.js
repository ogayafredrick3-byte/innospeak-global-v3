import iceLogo from '../../assets/partners/ice.png';
import samaritanLogo from '../../assets/partners/samaritan.png';

/**
 * Partner groups shown on the homepage trust strip.
 * Groups with zero partners are hidden automatically.
 */
export const PARTNER_GROUPS = [
  {
    id: 'accredited',
    label: 'Accredited by',
    description: 'Recognised institutions that validate our programmes.',
  },
  {
    id: 'partnered',
    label: 'Partnered with',
    description: 'Organisations we collaborate with on programmes and impact.',
  },
  {
    id: 'hiring',
    label: 'Hiring our graduates',
    description: 'Employers who recruit InnoSpeak graduates.',
  },
];

/**
 * Real partners.
 * `group` must match a PARTNER_GROUPS id.
 */
export const PARTNERS = [
  {
    id: 'ice',
    name: 'Innovation Centre of Excellence',
    shortName: 'ICE',
    group: 'partnered',
    description:
      'International institution advancing innovation, technical excellence and industry partnerships.',
    location: 'International',
    logo: iceLogo,
    link: null,
  },
  {
    id: 'samaritan',
    name: 'Samaritan International Kenya',
    shortName: 'Samaritan',
    group: 'partnered',
    description:
      'Foundation supporting students through education, mentorship and community programmes.',
    location: 'Kenya',
    logo: samaritanLogo,
    link: null,
  },
];

// Existing partnership-opportunity cards — still used on /partnerships page.
export const PARTNERSHIP_CARDS = [
  { id: 'academic', title: 'Academic Partnerships', description: 'Collaborate on curriculum development, student exchange and research.', icon: 'graduation' },
  { id: 'corporate', title: 'Corporate Training', description: 'Upskill employees through customised communication, technical and leadership programmes.', icon: 'briefcase' },
  { id: 'international', title: 'International Collaboration', description: 'Connect with global institutions to create worldwide learning opportunities.', icon: 'globe' },
  { id: 'innovation', title: 'Innovation & Research', description: 'Work together on engineering, AI, entrepreneurship and innovation projects.', icon: 'lightbulb' },
  { id: 'community', title: 'Community Development', description: 'Partner with us on scholarships, youth empowerment and community outreach.', icon: 'handshake' },
  { id: 'certification', title: 'Professional Certification', description: 'Develop recognised certification pathways with industry and education partners.', icon: 'book' },
];

export const WHY_PARTNER_HIGHLIGHTS = [
  { id: 'programmes', label: 'Innovative Programmes', icon: 'lightbulb' },
  { id: 'trainers', label: 'Skilled Trainers', icon: 'users' },
  { id: 'delivery', label: 'Flexible Delivery', icon: 'laptop' },
  { id: 'impact', label: 'Shared Impact', icon: 'heart' },
];