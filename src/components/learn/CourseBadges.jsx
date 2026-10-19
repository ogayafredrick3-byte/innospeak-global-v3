import { Link } from 'react-router-dom';
import { BookOpen, Clock, FlaskConical, GraduationCap } from 'lucide-react';
import { DIVISION_TOKENS } from '../../lib/data/lmsCourse';
import { cn } from '../../utils/cn.js';

const LEVEL_TONES = {
  Beginner:     'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Intermediate: 'bg-gold-50 text-gold-700 ring-gold-100',
  Advanced:     'bg-rose-50 text-rose-700 ring-rose-100',
};

/**
 * CourseBadges — division + pathway + level + duration, as inline chips.
 * Used on LMS cards (Catalog) and on the LearningPlayer header.
 *
 * When `linked` (hasCatalogueMatch), the pathway chip links to /courses/:code.
 * When unlinked, chips fall back to whatever LMS-native data is available.
 */
export default function CourseBadges({
  course,
  size = 'md',
  showDuration = true,
  showPathway = true,
  className = '',
}) {
  if (!course) return null;

  const division = DIVISION_TOKENS[course.division] || DIVISION_TOKENS.academy;
  const levelClass = course.level ? LEVEL_TONES[course.level] : null;
  const chipBase = cn(
    'inline-flex items-center gap-1.5 rounded-full font-body font-semibold ring-1',
    size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
  );

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {/* Division */}
      <span className={cn(chipBase, division.chip, 'uppercase tracking-wider')}>
        {course.division === 'labs' ? (
          <FlaskConical size={size === 'sm' ? 9 : 10} aria-hidden="true" />
        ) : course.division === 'foundation' ? (
          <GraduationCap size={size === 'sm' ? 9 : 10} aria-hidden="true" />
        ) : (
          <GraduationCap size={size === 'sm' ? 9 : 10} aria-hidden="true" />
        )}
        {division.label}
      </span>

      {/* Course code (only when linked) */}
      {course.code && course.hasCatalogueMatch && (
        <span
          className={cn(
            chipBase,
            'bg-navy-900 text-gold-300 ring-navy-800 font-mono tracking-wider'
          )}
        >
          {course.code}
        </span>
      )}

      {/* Pathway — links to the public catalogue when we have a match */}
      {showPathway && course.pathway && (
        course.hasCatalogueMatch && course.code ? (
          <Link
            to={`/courses/${course.code}`}
            className={cn(
              chipBase,
              'bg-cream text-navy-700 ring-navy-100 transition-colors hover:border-gold-300 hover:text-gold-700'
            )}
          >
            <BookOpen size={size === 'sm' ? 9 : 10} aria-hidden="true" />
            {course.pathway}
          </Link>
        ) : (
          <span className={cn(chipBase, 'bg-cream text-navy-700 ring-navy-100')}>
            <BookOpen size={size === 'sm' ? 9 : 10} aria-hidden="true" />
            {course.pathway}
          </span>
        )
      )}

      {/* Level */}
      {course.level && levelClass && (
        <span className={cn(chipBase, levelClass)}>{course.level}</span>
      )}

      {/* Duration */}
      {showDuration && course.duration && (
        <span className={cn(chipBase, 'bg-navy-50 text-navy-600 ring-navy-100')}>
          <Clock size={size === 'sm' ? 9 : 10} aria-hidden="true" />
          {course.duration}
        </span>
      )}
    </div>
  );
}