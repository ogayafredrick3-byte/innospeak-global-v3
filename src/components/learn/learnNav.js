import {
  LayoutDashboard,
  UserCircle2,
  ClipboardList,
  Compass,
  CalendarDays,
  Video,
  BriefcaseBusiness,
  Target,
  FolderKanban,
  UserRound,
  Award,
} from 'lucide-react';

export const learnNav = [
  { key: 'dashboard',    label: 'My Learning',       path: '/learn',              icon: LayoutDashboard, end: true },
  { key: 'career',       label: 'My Career',         path: '/learn/career',       icon: UserCircle2 },
  { key: 'applications', label: 'My Applications',   path: '/learn/applications', icon: ClipboardList },  // ← ADDED
  { key: 'catalog',      label: 'Browse Courses',    path: '/learn/catalog',      icon: Compass },
  { key: 'sessions',     label: 'Live Sessions',     path: '/learn/sessions',     icon: Video },
  { key: 'calendar',     label: 'Learning Calendar', path: '/learn/calendar',     icon: CalendarDays },
  { key: 'portfolio',    label: 'My Portfolio',      path: '/learn/portfolio',    icon: BriefcaseBusiness },
  { key: 'goals',        label: 'Learning Goals',    path: '/learn/goals',        icon: Target },
  { key: 'projects',     label: 'Projects & Labs',   path: '/learn/projects',     icon: FolderKanban },
  { key: 'mentorship',   label: 'Mentorship',        path: '/learn/mentorship',   icon: UserRound },
  { key: 'certificates', label: 'Certificates',      path: '/learn/certificates', icon: Award },
];