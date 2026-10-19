import {
  LayoutDashboard,
  BriefcaseBusiness,
  Inbox,
  Building2,
} from 'lucide-react';

export const employerNav = [
  { key: 'overview',      label: 'Overview',             path: '/employer',               icon: LayoutDashboard, end: true },
  { key: 'opportunities', label: 'Our Opportunities',    path: '/employer/opportunities', icon: BriefcaseBusiness },
  { key: 'applications',  label: 'Applications',         path: '/employer/applications',  icon: Inbox },
  { key: 'profile',       label: 'Organisation Profile', path: '/employer/profile',       icon: Building2 },
];