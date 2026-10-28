import { useMemo, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Heart } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import {
  getSponsorSession,
  getSponsorByEmail,
  getContributionsBySponsor,
} from '../../lib/data/sponsorStore.js';
import { FOUNDATION_PROGRAMS } from '../../lib/data/foundationApplicationsData.js';
import { FOUNDATION_INITIATIVES } from '../../components/sections/foundation/foundationData.js';

export default function SponsorPrograms() {
  const [tick, setTick] = useState(0);
  useEffect(() => setTick((t) => t + 1), []);

  const session = getSponsorSession();
  const sponsor = session ? getSponsorByEmail(session.email) : null;

  const contributions = useMemo(
    () => (sponsor ? getContributionsBySponsor(sponsor.id) : []),
    [sponsor, tick]
  );

  if (!session) return <Navigate to="/sponsor/signin" replace />;

  // Group contributions by program
  const byProgram = useMemo(() => {
    const map = new Map();
    contributions.forEach((c) => {
      if (!map.has(c.programId)) {
        map.set(c.programId, { total: 0, count: 0, last: null });
      }
      const entry = map.get(c.programId);
      entry.total += Number(c.amount || 0);
      entry.count += 1;
      if (!entry.last || new Date(c.createdAt) > new Date(entry.last)) {
        entry.last = c.createdAt;
      }
    });
    return map;
  }, [contributions]);

  return (
    <>
      <Seo
        title="Programs I Support"
        description="Programs you support through InnoSpeak Global Foundation."
        path="/sponsor/programs"
      />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Sponsor Portal
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          Programs I Support
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-navy-500">
          Each Foundation programme targets a different barrier, including education access,
          digital inequality, girls in STEM, and community-led impact.
        </p>
      </div>

      {byProgram.size === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center">
          <BookOpen size={32} className="mx-auto text-navy-300" />
          <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
            You haven't supported any program yet
          </h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
            Once you make your first contribution, the program will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {FOUNDATION_PROGRAMS.map((program) => {
            const entry = byProgram.get(program.id);
            if (!entry) return null;

            const initiatives = FOUNDATION_INITIATIVES.filter(
              (i) => i.category === program.label
            );

            return (
              <div
                key={program.id}
                className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-premium"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md">
                    <Heart size={20} />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Active Supporter
                  </span>
                </div>

                <h3 className="mt-5 font-display text-lg font-bold text-navy-900">
                  {program.label}
                </h3>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-navy-100 pt-4">
                  <div>
                    <dt className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                      Total Given
                    </dt>
                    <dd className="mt-1 font-display text-xl font-bold text-emerald-700">
                      ${entry.total.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                      Contributions
                    </dt>
                    <dd className="mt-1 font-display text-xl font-bold text-navy-900">
                      {entry.count}
                    </dd>
                  </div>
                </dl>

                {entry.last && (
                  <p className="mt-3 font-body text-xs text-navy-500">
                    Last gift on{' '}
                    {new Date(entry.last).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}

                {initiatives.length > 0 && (
                  <div className="mt-5 border-t border-navy-100 pt-5">
                    <p className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                      Active Initiatives
                    </p>
                    <ul className="mt-2 space-y-2">
                      {initiatives.map((i) => {
                        const pct =
                          i.goal > 0 ? Math.min((i.raised / i.goal) * 100, 100) : 0;
                        return (
                          <li key={i.id}>
                            <p className="font-body text-sm font-semibold text-navy-900">
                              {i.title}
                            </p>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="mt-1 font-body text-[11px] text-navy-400">
                              ${i.raised.toLocaleString()} of ${i.goal.toLocaleString()} ·{' '}
                              {i.beneficiaries} beneficiaries
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <a
                  href="/foundation#ways-to-give"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                >
                  Support This Program
                  <ArrowRight size={14} />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}