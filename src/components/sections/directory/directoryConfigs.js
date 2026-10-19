import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Handshake,
  Lightbulb,
  Users,
} from 'lucide-react';

/**
 * directoryConfigs — content for each /:type page in the ContentDirectory.
 * Each key matches a route param: /careers, /news, /events, etc.
 */
export const directoryConfigs = {
  research: {
    title: 'Research & Practice',
    eyebrow: 'Knowledge Hub',
    description:
      'Explore applied learning ideas, technical practice and evidence-led work that can grow into projects, publications or learning resources.',
    icon: Lightbulb,
    items: [
      'Applied technology projects',
      'Teaching and learning practice',
      'Technical notes and case studies',
      'Innovation challenges',
    ],
    cta: 'Explore Labs',
    to: '/labs',
  },
  news: {
    title: 'News & Updates',
    eyebrow: 'InnoSpeak Updates',
    description:
      'A home for verified platform, programme, learner and community updates. Publish an item here when there is a real update to share.',
    icon: BookOpen,
    items: [
      'Programme announcements',
      'Learning platform updates',
      'Learner stories',
      'Institutional notices',
    ],
    cta: 'View Programs',
    to: '/programs',
  },
  events: {
    title: 'Events & Sessions',
    eyebrow: 'Learning Calendar',
    description:
      'Discover workshops, public talks, practical sessions and learning events. Enrolled learners can also find course sessions inside the E-Learning area.',
    icon: CalendarDays,
    items: [
      'Workshops',
      'Guest sessions',
      'Practical demonstrations',
      'Community events',
    ],
    cta: 'Open Learning',
    to: '/learn',
  },
  community: {
    title: 'Community',
    eyebrow: 'Learn Together',
    description:
      'Build a learning community around discussion, peer support, practical projects and shared opportunities.',
    icon: Users,
    items: [
      'Peer learning',
      'Project collaboration',
      'Discussion spaces',
      'Student initiatives',
    ],
    cta: 'Start Learning',
    to: '/academy',
  },
  partnerships: {
    title: 'Partnerships',
    eyebrow: 'Work With InnoSpeak',
    description:
      'Create practical education, skills and innovation partnerships with organisations, educators, employers and community programmes.',
    icon: Handshake,
    items: [
      'Training partnerships',
      'Technology and innovation',
      'Industry projects',
      'Community skills initiatives',
    ],
    cta: 'Contact Us',
    to: '/contact',
  },
  careers: {
    title: 'Careers & Opportunities',
    eyebrow: 'Career Development',
    description:
      'Connect learning with employability through skills development, portfolio evidence, mentorship and professional opportunities.',
    icon: BriefcaseBusiness,
    items: [
      'Career-ready learning',
      'Portfolio development',
      'Mentorship',
      'Internship and opportunity pathways',
    ],
    cta: 'Explore Courses',
    to: '/academy',
  },
};
