import {
  LayoutDashboard, Video, BookOpen, CirclePlus as PlusCircle, Users, FileText, ClipboardCheck, GraduationCap, CalendarDays, MessageSquare, Bell, Settings, User,
} from 'lucide-react';

export const teachNav = [
  { key: 'dashboard', label: 'Overview', path: '/teach', icon: LayoutDashboard, end: true },
  { key: 'profile', label: 'My Profile', path: '/teach/profile', icon: User },
  { key: 'my-courses', label: 'My Courses', path: '/teach/courses', icon: BookOpen },
  { key: 'create-course', label: 'Create Course', path: '/teach/create-course', icon: PlusCircle },
  { key: 'students', label: 'Students', path: '/teach/students', icon: Users },
  { key: 'materials', label: 'Learning Materials', path: '/teach/materials', icon: FileText },
  { key: 'assignments', label: 'Assignments', path: '/teach/assignments', icon: ClipboardCheck },
  { key: 'assessments', label: 'Assessments', path: '/teach/assessments', icon: GraduationCap },
  { key: 'sessions', label: 'Schedule', path: '/teach/sessions', icon: CalendarDays },
  { key: 'messages', label: 'Messages', path: '/teach/messages', icon: MessageSquare },
  { key: 'notifications', label: 'Notifications', path: '/teach/notifications', icon: Bell },
  { key: 'settings', label: 'Settings', path: '/teach/settings', icon: Settings },
];

export const teachCourseTabs = [
  { key: 'builder', label: 'Builder' },
  { key: 'students', label: 'Students' },
  { key: 'grading', label: 'Grading' },
  { key: 'settings', label: 'Settings' },
];
