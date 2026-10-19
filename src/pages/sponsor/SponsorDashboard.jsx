import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Heart, BookOpen, DollarSign, TrendingUp, ArrowRight, FileText, Sparkles,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import {
  getSponsorSession,
  getSponsorByEmail,
  getContributionsBySponsor,
  getSponsorshipBySponsor,
} from '../../lib/data/sponsorStore.js';
import {
  getProgressReportsByProgram,
} from '../../lib/data/progressReportStore.js';
import { FOUNDATION_PROGRAMS } from '../../lib/data/foundationApplicationsData.js';

function getProgramLabel(id) {
  return FOUNDATION_PROGRAMS.find((p) => p.id === id)?.label || id;
}

function StatTile({ icon: Icon, label, value, hint, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    gold: 'bg-gold-100 text-gold-800',
    navy: 'bg-navy-50 text-navy-700',
  };
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-navy-900">{value}</p>
      {hint && <p className="mt-0.5 font-body text-xs text-navy-400">{hint}</p>}
    </div>
  );
}

export default function SponsorDashboard() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick((t) => t + 1);
  }, []);

  const session = getSponsorSession();
  const sponsor = session ? getSponsorByEmail(session.email) : null;

  const contributions = useMemo(
    () => (sponsor ? getContributionsBySponsor(sponsor.id) : []),
    [sponsor, tick]
  );

  const sponsorships = useMemo(
    () => (sponsor ? getSponsorshipBySponsor(sponsor.id) : []),
    [sponsor, tick]
  );

  const totalGiven = useMemo(
    () => contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0),
    [contributions]
  );

  // Programs this sponsor funds
  const fundedPrograms = useMemo(() => {
    const ids = new Set(contributions.map((c) => c.programId));
    return [...ids];
  }, [contributions]);

  // Recent reports for those programs
  const recentReports = useMemo(() => {
    const all = fundedPrograms.flatMap((pid) =>
      getProgressReportsByProgram(pid).filter((r) => r.visibleToSponsor)
    );
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  }, [fundedPrograms, tick]);

  if (!session) return <Navigate to="/sponsor/signin" replace />;

  return (
    <>
      <Seo
        title="Sponsor Overview"
        description="Your InnoSpeak Global Foundation sponsor dashboard."
        path="/sponsor"
      />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Sponsor Portal
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          Welcome back{sponsor?.name ? `, ${sponsor.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-navy-500">
          Here is your giving history and the impact you are making through InnoSpeak Global Foundation.
        </p>
      </div>

      {contributions.length === 0 && sponsorships.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <Heart size={24} className="text-emerald-700" />
          </div>
          <h2 className="mt-5 font-display text-xl font-bold text-navy-900">
            No contributions yet
          </h2>
          <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-navy-600">
            You are signed in, but we have not yet recorded a contribution to your email.
            Once the Foundation team confirms a gift, it will appear here.
          </p>
          <Link
            to="/foundation#ways-to-give"
            className="btn-gold mt-6 inline-flex items-center gap-2 px-6 py-3"
          >
            Explore ways to support
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={DollarSign}
              label="Total Given"
              value={`$${totalGiven.toLocaleString()}`}
              hint="Across all programs"
            />
            <StatTile
              icon={BookOpen}
              label="Programs Supported"
              value={fundedPrograms.length}
              hint="Education, Digital, STEM, Community"
              tone="gold"
            />
            <StatTile
              icon={Heart}
              label="Active Sponsorships"
              value={sponsorships.filter((s) => s.status === 'active').length}
              hint="Learners or projects"
              tone="emerald"
            />
            <StatTile
              icon={TrendingUp}
              label="Progress Reports"
              value={recentReports.length}
              hint="Recent updates"
              tone="navy"
            />
          </div>

          {/* Two-column: programs + recent reports */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Programs */}
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-navy-900">
                  Programs You Support
                </h2>
                <Link
                  to="/sponsor/programs"
                  className="inline-flex items-center gap-1 font-body text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  View all
                  <ArrowRight size={12} />
                </Link>
              </div>

              {fundedPrograms.length === 0 ? (
                <p className="mt-4 font-body text-sm text-navy-500">
                  No programs funded yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {fundedPrograms.slice(0, 4).map((pid) => {
                    const programContribs = contributions.filter((c) => c.programId === pid);
                    const programTotal = programContribs.reduce(
                      (sum, c) => sum + Number(c.amount || 0),
                      0
                    );
                    return (
                      <li
                        key={pid}
                        className="flex items-center justify-between rounded-xl border border-navy-100 bg-cream/40 px-4 py-3"
                      >
                        <div>
                          <p className="font-body text-sm font-bold text-navy-900">
                            {getProgramLabel(pid)}
                          </p>
                          <p className="mt-0.5 font-body text-xs text-navy-500">
                            {programContribs.length} contribution
                            {programContribs.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        <span className="font-display text-base font-bold text-emerald-700">
                          ${programTotal.toLocaleString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Recent reports */}
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-navy-900">
                  Recent Impact
                </h2>
                <Link
                  to="/sponsor/impact"
                  className="inline-flex items-center gap-1 font-body text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  View all
                  <ArrowRight size={12} />
                </Link>
              </div>

              {recentReports.length === 0 ? (
                <div className="mt-4 rounded-xl bg-cream/40 p-5 text-center">
                  <Sparkles size={18} className="mx-auto text-emerald-600" />
                  <p className="mt-2 font-body text-xs leading-5 text-navy-500">
                    Progress reports from the Foundation team will appear here as programs run.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {recentReports.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-navy-100 bg-cream/40 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-body text-[11px] font-bold text-emerald-700">
                          {r.studentInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-body text-sm font-bold text-navy-900">
                            {r.title}
                          </p>
                          <p className="mt-1 line-clamp-2 font-body text-xs leading-5 text-navy-600">
                            {r.body}
                          </p>
                          <p className="mt-1 font-body text-[11px] text-navy-400">
                            {new Date(r.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Contribution history preview */}
          <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-navy-900">
                Recent Contributions
              </h2>
              <Link
                to="/sponsor/contributions"
                className="inline-flex items-center gap-1 font-body text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                View all
                <ArrowRight size={12} />
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-navy-100">
              {contributions.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-bold text-navy-900">
                      {getProgramLabel(c.programId)}
                    </p>
                    <p className="mt-0.5 font-body text-xs text-navy-500">
                      {new Date(c.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · {c.frequency === 'monthly' ? 'Monthly' : c.frequency === 'termly' ? 'Termly' : 'One-time'}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-base font-bold text-emerald-700">
                    +${Number(c.amount).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}