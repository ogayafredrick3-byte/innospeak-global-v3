import { LayoutDashboard, BookOpen, Heart, FileText, History, LogOut } from 'lucide-react';

/**
 * sponsorNav — sidebar navigation for the Sponsor Portal.
 */
export const sponsorNav = [
  {
    key: 'dashboard',
    label: 'Overview',
    path: '/sponsor',
    icon: LayoutDashboard,
    end: true,
  },
  {
    key: 'programs',
    label: 'Programs I Support',
    path: '/sponsor/programs',
    icon: BookOpen,
  },
  {
    key: 'contributions',
    label: 'My Contributions',
    path: '/sponsor/contributions',
    icon: History,
  },
  {
    key: 'impact',
    label: 'Impact & Reports',
    path: '/sponsor/impact',
    icon: FileText,
  },
];