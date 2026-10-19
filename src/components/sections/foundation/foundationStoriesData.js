/**
 * foundationStoriesData — Foundation impact stories.
 * Categories: sponsor, learner, activity, review.
 *
 * NOTE: Only real learners and real partners are listed here. No fabricated
 * progress details, locations, or achievements. Admin adds new stories via
 * the moderation panel on the Foundation page.
 */

export const STORY_CATEGORIES = [
  { id: 'all', label: 'All Stories' },
  { id: 'sponsor', label: 'Sponsors' },
  { id: 'learner', label: 'Learners' },
  { id: 'activity', label: 'Activities' },
  { id: 'review', label: 'Reviews' },
];

export const STORY_CATEGORY_LABELS = {
  sponsor: 'Sponsor Story',
  learner: 'Learner Story',
  activity: 'Activity Report',
  review: 'Review',
};

/**
 * FOUNDATION_STORIES — real learners and partners only.
 * No dates, venues, or progress claims unless confirmed.
 */
export const FOUNDATION_STORIES = [
  {
    id: 'story-samaritan-partner',
    category: 'sponsor',
    featured: true,
    title: 'Samaritan International Kenya',
    excerpt:
      'A foundation partner supporting students with education and mentorship alongside InnoSpeak Global Foundation.',
    body: `Samaritan International Kenya works with us to support students through education and mentorship.

This partnership is part of our wider effort to connect learners with the support they need to stay in school and complete their studies.

Foundation staff manage all beneficiary selection and allocation. Progress updates will be shared here as programs run.`,
    author: { name: 'Samaritan International Kenya', role: 'Foundation Partner', avatar: 'SI' },
    location: 'Kenya',
    date: null,
    readMinutes: 2,
    image: null,
    gallery: [],
    video: null,
  },
  {
    id: 'story-ice-partner',
    category: 'sponsor',
    featured: false,
    title: 'Innovation Centre of Excellence',
    excerpt:
      'International partner advancing innovation, technical excellence and industry collaboration.',
    body: `The Innovation Centre of Excellence (ICE) is an international institution working on innovation and technical skills development.

Through this partnership, InnoSpeak Global Foundation connects with global expertise in technical and vocational education — opening doors to joint programs and shared opportunities for learners.`,
    author: { name: 'Innovation Centre of Excellence', role: 'Foundation Partner', avatar: 'ICE' },
    location: 'International',
    date: null,
    readMinutes: 2,
    image: null,
    gallery: [],
    video: null,
  },
  {
    id: 'story-learners-community',
    category: 'learner',
    featured: true,
    title: 'Our learners',
    excerpt:
      'Real learners from Kenya and Somalia building language, qualification and technical skills through InnoSpeak programs.',
    body: `InnoSpeak Global Foundation supports learners across our Academy and Labs programs.

Learners currently studying with us include:
- **Sacdiyo Halima** — IGCSE, English and Swahili
- **Sharif** (from Somalia) — English and Swahili
- **Maria Mohamed** — English and Swahili
- **Nura Abdulahi** — Adult Languages
- **Mariam** — Adult Languages (continuing)
- **Samira** — CBE Grade 7

Individual learner stories will be shared here as consent is given and progress is confirmed.`,
    author: { name: 'Foundation Team', role: 'Learner Community', avatar: 'FT' },
    location: 'Kenya · Somalia',
    date: null,
    readMinutes: 3,
    image: null,
    gallery: [],
    video: null,
  },
];

export const STORIES_INTRO = {
  eyebrow: 'Stories from the Field',
  title: 'Real Partners, Real Learners',
  subtitle:
    'Verified updates from the Foundation community. New stories are added as programs progress — nothing is published without consent.',
};
