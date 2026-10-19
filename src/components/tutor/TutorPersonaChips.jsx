import { BookOpen, Code, PenLine, Compass, GraduationCap } from 'lucide-react';
import { getPersonasForRole, PERSONA_ACCENTS } from '../../lib/tutor/tutorPersonas';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';

const MODE_ICONS = { BookOpen, Code, PenLine, Compass, GraduationCap };

export default function TutorPersonaChips({ activeId, onChange, className = '', size = 'md' }) {
  const { profile } = useAuth();
  const modes = getPersonasForRole(profile?.role);

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {modes.map((persona) => {
        const Icon = MODE_ICONS[persona.icon];
        const accent = PERSONA_ACCENTS[persona.accent] || PERSONA_ACCENTS.gold;
        const active = persona.id === activeId;
        return (
          <button
            key={persona.id}
            type="button"
            onClick={() => onChange(persona.id)}
            title={persona.description}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border font-body font-semibold transition-all duration-200',
              size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
              active
                ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                : 'border-navy-100 bg-white text-navy-600 hover:border-gold-300 hover:text-gold-700'
            )}
          >
            {Icon && (
              <Icon
                size={size === 'sm' ? 11 : 13}
                className={active ? 'text-gold-300' : cn(accent.text, 'opacity-80')}
              />
            )}
            {persona.label}
          </button>
        );
      })}
    </div>
  );
}