import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  Compass,
  FolderKanban,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState } from '../../components/portal/PortalStates.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../lib/motion/presets';
import { buildCareerProfile } from '../../lib/data/careerProfile';
import { listCareerOpportunities } from '../../lib/supabase/platform.js';
import { normalizeOpportunities } from '../../lib/data/opportunities';
import { matchOpportunities } from '../../lib/data/matching';
import { RecommendedSection } from '../../components/career/RecommendedSection.jsx';

const container = staggerContainer(0.08, 0.05);

/* ──────────────────────────────────────────────────────────────
   Small building blocks
   ────────────────────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 shadow-sm">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-xl font-bold leading-none text-navy-900">
          {value}
        </p>
        <p className="mt-0.5 font-body text-xs text-navy-500">{label}</p>
      </div>
    </div>
  );
}

function EmptyBlock({ icon: Icon, title, message, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-200 bg-cream/40 px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-navy-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-navy-500">
        {message}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Sections
   ────────────────────────────────────────────────────────────── */

function SkillsSection({ skills }) {
  return (
    <SectionCard title="My Skills" description="Aggregated from your completed courses, certificates and portfolio projects.">
      {skills.length === 0 ? (
        <EmptyBlock
          icon={Sparkles}
          title="No skills demonstrated yet"
          message="Complete a course or add a project to your portfolio to start building evidence of what you can do."
          action={
            <Link to="/learn/catalog" className="btn-gold inline-flex items-center gap-2 text-sm">
              Browse Courses
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="grid gap-3 sm:grid-cols-2"
        >
          {skills.map((skill) => (
            <motion.li
              key={skill.name}
              variants={fadeUpItem}
              className="rounded-2xl border border-navy-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-sm font-bold text-navy-900">
                  {skill.name}
                </h3>
                <span className="flex-shrink-0 rounded-full bg-gold-500/10 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
                  {skill.sourceCount} {skill.sourceCount === 1 ? 'source' : 'sources'}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {skill.sources.slice(0, 3).map((s, i) => (
                  <li
                    key={`${s.type}-${s.id}-${i}`}
                    className="flex items-start gap-2 font-body text-xs text-navy-500"
                  >
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gold-500" />
                    <span className="truncate">
                      <span className="font-semibold text-navy-700">
                        {s.type === 'certificate' ? 'Certificate' : 'Project'}:
                      </span>{' '}
                      {s.label}
                    </span>
                  </li>
                ))}
                {skill.sources.length > 3 && (
                  <li className="font-body text-[11px] font-semibold text-navy-400">
                    + {skill.sources.length - 3} more
                  </li>
                )}
              </ul>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </SectionCard>
  );
}

function CredentialsSection({ certificates }) {
  return (
    <SectionCard
      title="My Credentials"
      description="Verified certificates issued for completed courses."
      action={
        certificates.length > 0 && (
          <Link
            to="/learn/certificates"
            className="font-body text-sm font-bold text-gold-700 hover:text-gold-800"
          >
            View all →
          </Link>
        )
      }
    >
      {certificates.length === 0 ? (
        <EmptyBlock
          icon={Award}
          title="No credentials yet"
          message="Complete an eligible course to earn a verifiable certificate."
        />
      ) : (
        <ul className="space-y-3">
          {certificates.slice(0, 4).map((c) => {
            const title = c.course_title || c.lms_courses?.title || 'Course Certificate';
            return (
              <li key={c.id}>
                <Link
                  to="/learn/certificates"
                  className="group flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 transition-all hover:border-gold-300/60 hover:shadow-premium"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
                    <Award size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-bold text-navy-900 group-hover:text-gold-700">
                      {title}
                    </p>
                    <p className="font-body text-xs text-navy-400">
                      {c.certificate_number}
                    </p>
                  </div>
                  <ArrowRight
                    size={15}
                    className="flex-shrink-0 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

function ProjectsSection({ portfolio }) {
  return (
    <SectionCard
      title="My Projects"
      description="Practical evidence from your Portfolio and Labs work."
      action={
        portfolio.length > 0 && (
          <Link
            to="/learn/portfolio"
            className="font-body text-sm font-bold text-gold-700 hover:text-gold-800"
          >
            Full portfolio →
          </Link>
        )
      }
    >
      {portfolio.length === 0 ? (
        <EmptyBlock
          icon={FolderKanban}
          title="No projects yet"
          message="Add practical work, lab projects or other evidence to strengthen your profile."
          action={
            <Link to="/learn/portfolio" className="btn-gold inline-flex items-center gap-2 text-sm">
              Add a Project
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {portfolio.slice(0, 4).map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-navy-100 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                  <FolderKanban size={16} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-bold text-navy-900">
                    {p.title}
                  </p>
                  {p.description && (
                    <p className="mt-1 line-clamp-2 font-body text-xs leading-5 text-navy-500">
                      {p.description}
                    </p>
                  )}
                  {p.skills?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-navy-50 px-2 py-0.5 font-body text-[10px] font-semibold text-navy-600"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function GoalsSection({ goals }) {
  return (
    <SectionCard
      title="Career Goals"
      description="What you're working toward."
      action={
        goals.length > 0 && (
          <Link
            to="/learn/goals"
            className="font-body text-sm font-bold text-gold-700 hover:text-gold-800"
          >
            Manage →
          </Link>
        )
      }
    >
      {goals.length === 0 ? (
        <EmptyBlock
          icon={Target}
          title="No active goals"
          message="Setting clear goals helps you stay focused and makes your profile more useful to employers."
          action={
            <Link to="/learn/goals" className="btn-gold inline-flex items-center gap-2 text-sm">
              Set a Goal
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {goals.slice(0, 4).map((g) => (
            <li
              key={g.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-body text-sm font-semibold text-navy-900">
                  {g.title}
                </p>
                {g.target_date && (
                  <p className="mt-0.5 font-body text-xs text-navy-400">
                    Target: {new Date(g.target_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className="flex-shrink-0 rounded-full bg-navy-50 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-navy-600">
                {g.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function MentorshipSection({ mentorships }) {
  return (
    <SectionCard
      title="Mentorship"
      description="Requests and active connections with mentors."
      action={
        mentorships.length > 0 && (
          <Link
            to="/learn/mentorship"
            className="font-body text-sm font-bold text-gold-700 hover:text-gold-800"
          >
            Open →
          </Link>
        )
      }
    >
      {mentorships.length === 0 ? (
        <EmptyBlock
          icon={UserRound}
          title="No mentorship activity"
          message="Request a mentor to get guidance on learning, projects or career preparation."
          action={
            <Link to="/learn/mentorship" className="btn-gold inline-flex items-center gap-2 text-sm">
              Request a Mentor
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {mentorships.slice(0, 3).map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                <UserRound size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm font-semibold text-navy-900">
                  {m.goal}
                </p>
                <p className="font-body text-xs text-navy-400">
                  Requested {new Date(m.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="flex-shrink-0 rounded-full bg-navy-50 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-navy-600">
                {m.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/* ──────────────────────────────────────────────────────────────
   Phase 2b placeholder — learner-controlled fields
   ────────────────────────────────────────────────────────────── */

function ProfilePreferencesSection() {
  return (
    <SectionCard title="Profile Preferences" description="Control how employers and partners see you.">
      <div className="rounded-2xl border border-dashed border-navy-200 bg-cream/40 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-600">
            <BriefcaseBusiness size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <p className="font-body text-sm font-bold text-navy-900">
              Coming soon
            </p>
            <p className="mt-1 font-body text-xs leading-5 text-navy-500">
              Professional summary, career interests, availability and
              visibility controls. Until then, your profile aggregates
              everything from your verified learning record.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
   ────────────────────────────────────────────────────────────── */

export default function CareerProfile() {
  const [state, setState] = useState({ loading: true, error: false, data: null });
  const [opportunities, setOpportunities] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  // Load aggregated career profile
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));

    buildCareerProfile()
      .then((data) => {
        if (!cancelled) setState({ loading: false, error: false, data });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[CareerProfile] build failed:', err);
        if (!cancelled) setState({ loading: false, error: true, data: null });
      });

    return () => { cancelled = true; };
  }, [reloadKey]);

  // Load live opportunities for matching. Never blocks the page.
  useEffect(() => {
    let cancelled = false;
    listCareerOpportunities()
      .then((rows) => {
        if (!cancelled) setOpportunities(normalizeOpportunities(rows));
      })
      .catch(() => {
        if (!cancelled) setOpportunities([]);
      });
    return () => { cancelled = true; };
  }, []);

  // Match opportunities to the aggregated profile
  const matched = useMemo(
    () => (state.data ? matchOpportunities(opportunities, state.data, { limit: 3 }) : []),
    [opportunities, state.data]
  );

  return (
    <>
      <Seo
        title="My Career Profile"
        description="Your professional identity — skills, credentials, projects, goals and mentorship."
        path="/learn/career"
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Career
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            My Career Profile
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            A professional identity that grows with you — aggregated from your
            learning, projects, credentials and goals across InnoSpeak Global.
          </p>
        </div>
        <Link
          to="/career-hub"
          className="btn-outline inline-flex flex-shrink-0 items-center gap-2 text-sm"
        >
          <Compass size={15} aria-hidden="true" />
          Back to Career Hub
        </Link>
      </div>

      {state.loading && (
        <SectionCard className="mt-6">
          <LoadingState />
        </SectionCard>
      )}

      {state.error && !state.loading && (
        <SectionCard className="mt-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-base font-bold text-navy-900">
                Unable to load your career profile right now
              </p>
              <p className="mt-1 font-body text-sm text-navy-500">
                Please try again shortly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="btn-outline inline-flex items-center gap-2 text-sm"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Retry
            </button>
          </div>
        </SectionCard>
      )}

      {!state.loading && !state.error && state.data && (
        <>
          {/* Summary stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={Award}
              label="Credentials"
              value={state.data.summary.credentials}
            />
            <StatCard
              icon={FolderKanban}
              label="Projects"
              value={state.data.summary.projects}
            />
            <StatCard
              icon={Target}
              label="Active Goals"
              value={state.data.summary.activeGoals}
            />
            <StatCard
              icon={UserRound}
              label="Mentorships"
              value={state.data.summary.openMentorships}
            />
          </div>

          {/* Main grid */}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <SkillsSection skills={state.data.skills} />
            <CredentialsSection certificates={state.data.certificates} />
            <ProjectsSection portfolio={state.data.portfolio} />
            <GoalsSection goals={state.data.goals} />
            <MentorshipSection mentorships={state.data.mentorships} />
            <ProfilePreferencesSection />
          </div>

          {/* Matched opportunities — only when there are positive matches */}
          {matched.length > 0 && (
            <div className="mt-12">
              <RecommendedSection
                matches={matched}
                title="Opportunities Matched to Your Profile"
                subtitle="These opportunities fit the skills, projects and goals already in your profile."
              />
            </div>
          )}

          {/* Cross-link to Career Hub */}
          <div className="mt-12 rounded-2xl border border-gold-200 bg-gold-50/50 p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900">
                  <TrendingUp size={20} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-body text-sm font-bold text-navy-900">
                    Ready to take the next step?
                  </p>
                  <p className="mt-0.5 font-body text-xs text-navy-600">
                    Explore opportunities, projects and connections matched to your profile.
                  </p>
                </div>
              </div>
              <Link
                to="/career-hub/opportunities"
                className="btn-gold inline-flex flex-shrink-0 items-center gap-2 text-sm"
              >
                Explore Opportunities
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}