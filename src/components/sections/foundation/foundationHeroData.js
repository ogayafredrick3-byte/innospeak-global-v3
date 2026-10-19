import foundationPhoto1 from '../../../assets/foundation/foundation-1.jpg';
import foundationPhoto2 from '../../../assets/foundation/foundation-2.jpg';
import foundationPhoto3 from '../../../assets/foundation/foundation-3.jpg';

export const FOUNDATION_HERO_SLIDES = [
  { id: 'session', image: foundationPhoto1, title: 'Mentorship in Action' },
  { id: 'community', image: foundationPhoto2, title: 'Community Outreach' },
  { id: 'team', image: foundationPhoto3, title: 'Building Relationships' },
];

export const FOUNDATION_HERO_IMAGE = foundationPhoto3;

/**
 * These are deliberately real/verifiable, not invented impact numbers —
 * see the honesty note in FocusAreas/WaysToGive: no fabricated donor or
 * beneficiary stats until real figures exist.
 */
export const FOUNDATION_HERO_IMAGE_STATS = [
  { value: '3', label: 'Focus Areas' },
  { value: '2', label: 'Giving Channels' },
  { value: '100%', label: 'Mission Driven' },
];

export const FOUNDATION_FEATURE_CARDS = [
  { icon: 'graduation', label: 'Scholarships', color: 'navy', pos: '-left-4 top-[12%]' },
  { icon: 'users', label: 'Youth Empowerment', color: 'gold', pos: '-right-4 top-[30%]' },
  { icon: 'hand-heart', label: 'Community Outreach', color: 'navy', pos: '-left-4 bottom-[28%]' },
  { icon: 'heart-handshake', label: 'Impact Driven', color: 'gold', pos: '-right-4 bottom-[14%]' },
];