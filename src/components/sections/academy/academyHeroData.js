import student1 from '../../../assets/academy/student-1.jpg';
import student2 from '../../../assets/academy/student-2.jpg';
import student3 from '../../../assets/academy/student-3.jpg';
import student4 from '../../../assets/academy/student-4.jpg';

export const ACADEMY_HERO_BADGE = 'Admissions Open';

export const ACADEMY_HERO_HEADLINE = [
  { text: 'Learn Today.', highlight: false },
  { text: 'Lead Tomorrow.', highlight: true },
];

export const ACADEMY_HERO_DESCRIPTION =
  'Transforming education into global opportunities through internationally recognised academic, professional and technical learning experiences.';

/** Reflects the real catalogue — see src/lib/data/programmeData.js */
export const ACADEMY_HERO_STATS = [
  { value: 12, suffix: '+', label: 'Learning Pathways' },
  { value: 180, suffix: '+', label: 'Courses' },
  { value: 13, suffix: '+', label: 'Languages' },
  { value: 100, suffix: '%', label: 'Career Focus' },
];

export const ACADEMY_HERO_IMAGE = student1;

export const ACADEMY_HERO_IMAGE_STATS = [
  { value: '180+', label: 'Courses' },
  { value: '12+', label: 'Pathways' },
  { value: '13+', label: 'Languages' },
];

export const ACADEMY_FEATURE_CARDS = [
  { icon: 'graduation', label: 'Certified Programmes', color: 'navy', pos: '-left-4 top-[12%]' },
  { icon: 'globe', label: 'Global Curriculum', color: 'gold', pos: '-right-4 top-[30%]' },
  { icon: 'cpu', label: 'Digital Skills', color: 'navy', pos: '-left-4 bottom-[28%]' },
  { icon: 'award', label: 'Career Ready', color: 'gold', pos: '-right-4 bottom-[14%]' },
];

export const ACADEMY_HERO_SLIDES = [
  { id: 'academic', image: student1, title: 'Academic Excellence' },
  { id: 'languages', image: student2, title: 'Language Mastery' },
  { id: 'technology', image: student3, title: 'Future-Ready Skills' },
  { id: 'careers', image: student4, title: 'Global Career Opportunities' },
];