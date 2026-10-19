import {
  LayoutDashboard,
  UserRound,
  ClipboardList,
  BookOpenCheck,
  Wallet,
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
  FolderOpen,
  Bell,
  SendHorizonal,
  LifeBuoy,
  GraduationCap,
  TrendingUp,
  Heart,
} from 'lucide-react';

/**
 * portalNav — single source of truth for the Student Portal's sidebar
 * navigation. Each entry maps a section letter (A–M) from the product
 * spec to a route, icon and label.
 */
export const portalNav = [
  { key: 'dashboard', label: 'Dashboard', path: '/portal', icon: LayoutDashboard, end: true },
  { key: 'profile', label: 'Profile', path: '/portal/profile', icon: UserRound },
  { key: 'registration', label: 'Academic Registration', path: '/portal/registration', icon: ClipboardList },
  { key: 'records', label: 'Academic Records', path: '/portal/records', icon: BookOpenCheck },
  { key: 'foundation', label: 'Foundation', path: '/portal/foundation', icon: Heart },
  { key: 'progress', label: 'My Progress', path: '/portal/progress', icon: TrendingUp },
  { key: 'finance', label: 'Fees & Finance', path: '/portal/finance', icon: Wallet },
  { key: 'timetable', label: 'Timetable', path: '/portal/timetable', icon: CalendarDays },
  { key: 'attendance', label: 'Attendance', path: '/portal/attendance', icon: CheckCircle2 },
  { key: 'exams', label: 'Exams', path: '/portal/exams', icon: FileSpreadsheet },
  { key: 'documents', label: 'Documents', path: '/portal/documents', icon: FolderOpen },
  { key: 'communication', label: 'Communication', path: '/portal/communication', icon: Bell },
  { key: 'requests', label: 'Services / Requests', path: '/portal/requests', icon: SendHorizonal },
  { key: 'support', label: 'Support', path: '/portal/support', icon: LifeBuoy },
  { key: 'graduation', label: 'Graduation', path: '/portal/graduation', icon: GraduationCap },
];