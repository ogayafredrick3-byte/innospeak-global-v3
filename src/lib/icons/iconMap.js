/**
 * iconMap — maps string icon names to lucide-react components.
 *
 * Only the icons used across the course details template are imported,
 * keeping the bundle small. To add a new icon, import it here and add
 * it to the map.
 */
import {
  MessageSquare,
  BookOpen,
  Briefcase,
  Globe,
  Brain,
  Lightbulb,
  PenLine,
  Users,
  Mic,
  Headphones,
  Clock,
  Target,
  Code,
  Cpu,
  Rocket,
  Mail,
  Monitor,
  Award,
  FileText,
  ClipboardCheck,
  ShieldCheck,
  Star,
} from 'lucide-react';

export const iconMap = {
  MessageSquare,
  BookOpen,
  Briefcase,
  Globe,
  Brain,
  Lightbulb,
  PenLine,
  Users,
  Mic,
  Headphones,
  Clock,
  Target,
  Code,
  Cpu,
  Rocket,
  Mail,
  Monitor,
  Award,
  FileText,
  ClipboardCheck,
  ShieldCheck,
  Star,
};

/**
 * Get an icon component by name. Falls back to BookOpen.
 */
export function getIcon(name) {
  return iconMap[name] || BookOpen;
}
