import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Code,
  Compass as CompassIcon,
  FolderKanban,
  Hash,
  PenLine,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPersonaById, PERSONA_ACCENTS } from '../../lib/tutor/tutorPersonas';
import { cn } from '../../utils/cn.js';

const MODE_ICONS = { BookOpen, Code, PenLine, Compass: CompassIcon };

const MODE_FOCUS = {
  study: [
    'Explain concepts step by step',
    'Quiz you on topics you\u2019re studying',
    'Summarise lessons and modules',
    'Plan realistic study schedules',
  ],
  build: [
    'Debug code and explain errors',
    'Review functions and spot edge cases',
    'Suggest idiomatic fixes',
    'Unblock your Lab projects',
  ],
  write: [
    'Draft CVs and cover letters',
    'Refine portfolio descriptions',
    'Polish essays and applications',
    'Tighten professional emails',
  ],
  career: [
    'Map out career paths',
    'Prepare you for interviews',
    'Find roles that match your skills',
    'Translate learning into applications',
  ],
};

export default function TutorContextRail({
  personaId,
  memory,
  learnerContext,
  learnerLoading,
  onRefreshContext,
}) {
  const { user, profile } = useAuth();
  const persona = getPersonaById(personaId);
  const Icon = MODE_ICONS[persona.icon] || Sparkles;
  const accent = PERSONA_ACCENTS[persona.accent] || PERSONA_ACCENTS.gold;
  const focus = MODE_FOCUS[persona.id] || [];

  const admission = profile?.admission_number || profile?.student_number || null;

  const enrolled = learnerContext?.enrolled || [];
  const certificates = learnerContext?.certificates || [];
  const portfolio = learnerContext?.portfolio || [];
  const goals = learnerContext?.goals || [];

  const hasContext =
    enrolled.length > 0 || certificates.length > 0 || portfolio.length > 0 || goals.length > 0;

  return (
    <div className="space-y-4">
      {/* Mode card */}
      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-premium">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl ring-1',
            accent.bg,
            accent.text,
            accent.ring
          )}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <h3 className="mt-4 font-display text-base font-bold text-navy-900">
          {persona.label} mode
        </h3>
        <p className="mt-1.5 font-body text-xs leading-5 text-navy-500">
          {persona.description}
        </p>

        {focus.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-navy-100 pt-4">
            {focus.map((item) => (
              <li key={item} className="flex items-start gap-2 font-body text-xs text-navy-600">
                <span className={cn('mt-1.5 h-1 w-1 shrink-0 rounded-full', accent.dot)} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Learner profile card */}
      {user && (
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-premium">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                Your profile
              </p>
              <p className="mt-1.5 truncate font-display text-sm font-bold text-navy-900">
                {memory?.name || profile?.full_name || 'Student'}
              </p>
              {admission && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-navy-700">
                  <Hash size={9} />
                  {admission}
                </p>
              )}
            </div>
            {onRefreshContext && (
              <button
                type="button"
                onClick={onRefreshContext}
                disabled={learnerLoading}
                aria-label="Refresh learner context"
                title="Refresh my data"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700 disabled:opacity-40"
              >
                <RefreshCw size={13} className={learnerLoading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>

          {/* Live stats */}
          {learnerContext && (
            <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-navy-100 pt-4">
              <div className="rounded-lg bg-cream/60 px-2.5 py-2">
                <dt className="font-body text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                  Enrolled
                </dt>
                <dd className="mt-0.5 font-display text-base font-bold leading-none text-navy-900">
                  {enrolled.length}
                </dd>
              </div>
              <div className="rounded-lg bg-cream/60 px-2.5 py-2">
                <dt className="font-body text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                  Certificates
                </dt>
                <dd className="mt-0.5 font-display text-base font-bold leading-none text-navy-900">
                  {certificates.length}
                </dd>
              </div>
              <div className="rounded-lg bg-cream/60 px-2.5 py-2">
                <dt className="font-body text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                  Projects
                </dt>
                <dd className="mt-0.5 font-display text-base font-bold leading-none text-navy-900">
                  {portfolio.length}
                </dd>
              </div>
              <div className="rounded-lg bg-cream/60 px-2.5 py-2">
                <dt className="font-body text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                  Goals
                </dt>
                <dd className="mt-0.5 font-display text-base font-bold leading-none text-navy-900">
                  {goals.length}
                </dd>
              </div>
            </dl>
          )}

          <Link
            to="/portal"
            className="mt-4 inline-flex items-center gap-1.5 font-body text-xs font-bold text-gold-700 hover:text-gold-800"
          >
            Open Student Portal
            <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {/* Grounding indicator */}
      {user && (
        <div
          className={cn(
            'flex items-start gap-2.5 rounded-2xl border p-3.5',
            hasContext
              ? 'border-emerald-100 bg-emerald-50/60'
              : 'border-navy-100 bg-white'
          )}
        >
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              hasContext ? 'bg-emerald-500/15 text-emerald-700' : 'bg-navy-50 text-navy-500'
            )}
          >
            {hasContext ? <Award size={15} /> : <Sparkles size={15} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-body text-[11px] font-bold text-navy-900">
              {hasContext ? 'Grounded in your profile' : 'Not yet grounded'}
            </p>
            <p className="mt-0.5 font-body text-[10px] leading-4 text-navy-500">
              {hasContext
                ? 'The AI knows your courses, projects, and goals.'
                : 'Enrol in a course or add a project — then the AI can help with specifics.'}
            </p>
          </div>
        </div>
      )}

      {/* Enrolled courses mini-list */}
      {enrolled.length > 0 && (
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-premium">
          <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
            Enrolled courses
          </p>
          <ul className="mt-3 space-y-2">
            {enrolled.slice(0, 4).map((e, i) => (
              <li
                key={`${e.code || 'c'}-${i}`}
                className="flex items-center gap-2 rounded-xl border border-navy-100 bg-cream/50 px-3 py-2"
              >
                {e.code && (
                  <span className="font-mono text-[10px] font-bold text-gold-700">
                    {e.code}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate font-body text-[11px] font-semibold text-navy-800">
                  {e.title}
                </span>
                {e.progress > 0 && (
                  <span className="shrink-0 font-body text-[10px] font-bold text-navy-500">
                    {e.progress}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Portfolio mini-list */}
      {portfolio.length > 0 && (
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-premium">
          <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
            Recent projects
          </p>
          <ul className="mt-3 space-y-2">
            {portfolio.slice(0, 3).map((p, i) => (
              <li
                key={`${p.title}-${i}`}
                className="flex items-start gap-2.5 rounded-xl border border-navy-100 bg-cream/50 px-3 py-2"
              >
                <FolderKanban size={12} className="mt-0.5 shrink-0 text-navy-400" />
                <span className="min-w-0 flex-1 truncate font-body text-[11px] font-semibold text-navy-800">
                  {p.title}
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/learn/portfolio"
            className="mt-3 inline-flex items-center gap-1.5 font-body text-[11px] font-bold text-gold-700 hover:text-gold-800"
          >
            Open portfolio
            <ArrowRight size={10} />
          </Link>
        </div>
      )}

      {/* Goals mini-list */}
      {goals.length > 0 && (
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-premium">
          <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
            Active goals
          </p>
          <ul className="mt-3 space-y-2">
            {goals.slice(0, 3).map((g, i) => (
              <li
                key={`${g.title}-${i}`}
                className="flex items-start gap-2.5 rounded-xl border border-navy-100 bg-cream/50 px-3 py-2"
              >
                <Target size={12} className="mt-0.5 shrink-0 text-gold-600" />
                <span className="min-w-0 flex-1 truncate font-body text-[11px] font-semibold text-navy-800">
                  {g.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Career Hub cross-link in career mode */}
      {persona.id === 'career' && (
        <Link
          to="/career-hub/opportunities"
          className="flex items-center gap-3 rounded-2xl border border-gold-200 bg-gold-50/60 p-4 transition-all hover:-translate-y-0.5 hover:shadow-premium"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900">
            <Award size={18} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="font-body text-xs font-bold text-navy-900">Browse opportunities</p>
            <p className="mt-0.5 font-body text-[10px] text-navy-600">
              Jobs, internships, and projects
            </p>
          </div>
          <ArrowRight size={14} className="shrink-0 text-gold-700" />
        </Link>
      )}
    </div>
  );
}