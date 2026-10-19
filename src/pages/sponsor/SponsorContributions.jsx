import { useMemo, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { History, ArrowUpRight } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import {
  getSponsorSession,
  getSponsorByEmail,
  getContributionsBySponsor,
} from '../../lib/data/sponsorStore.js';
import { FOUNDATION_PROGRAMS } from '../../lib/data/foundationApplicationsData.js';

function getProgramLabel(id) {
  return FOUNDATION_PROGRAMS.find((p) => p.id === id)?.label || id;
}

export default function SponsorContributions() {
  const [tick, setTick] = useState(0);
  useEffect(() => setTick((t) => t + 1), []);

  const session = getSponsorSession();
  const sponsor = session ? getSponsorByEmail(session.email) : null;

  const contributions = useMemo(
    () => (sponsor ? getContributionsBySponsor(sponsor.id) : []),
    [sponsor, tick]
  );

  const totals = useMemo(() => {
    const total = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const byCurrency = contributions.reduce((acc, c) => {
      acc[c.currency] = (acc[c.currency] || 0) + Number(c.amount || 0);
      return acc;
    }, {});
    return { total, byCurrency };
  }, [contributions]);

  if (!session) return <Navigate to="/sponsor/signin" replace />;

  return (
    <>
      <Seo
        title="My Contributions"
        description="Your giving history to InnoSpeak Global Foundation."
        path="/sponsor/contributions"
      />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Sponsor Portal
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          My Contributions
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-navy-500">
          A complete record of every contribution you have made through the Foundation.
        </p>
      </div>

      {/* Totals */}
      {contributions.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <p className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">
              Lifetime Giving
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
              ${totals.total.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <p className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">
              Contributions
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-navy-900">
              {contributions.length}
            </p>
          </div>
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <p className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">
              First Gift
            </p>
            <p className="mt-1 font-display text-base font-bold text-navy-900">
              {new Date(contributions[contributions.length - 1].createdAt).toLocaleDateString(
                'en-GB',
                { day: 'numeric', month: 'short', year: 'numeric' }
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <p className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">
              Last Gift
            </p>
            <p className="mt-1 font-display text-base font-bold text-navy-900">
              {new Date(contributions[0].createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="mt-8 rounded-2xl border border-navy-100 bg-white shadow-sm">
        {contributions.length === 0 ? (
          <div className="py-20 text-center">
            <History size={32} className="mx-auto text-navy-300" />
            <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
              No contributions yet
            </h3>
            <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
              Once a contribution is recorded, it will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-navy-100">
            {contributions.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {getProgramLabel(c.programId)}
                    </span>
                    <span className="rounded-full bg-navy-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-navy-600">
                      {c.frequency === 'monthly'
                        ? 'Monthly'
                        : c.frequency === 'termly'
                          ? 'Termly'
                          : 'One-time'}
                    </span>
                  </div>
                  <p className="mt-2 font-body text-xs text-navy-500">
                    {new Date(c.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {c.reference && ` · Ref ${c.reference}`}
                  </p>
                  {c.notes && (
                    <p className="mt-1 font-body text-xs italic text-navy-500">
                      "{c.notes}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-emerald-700">
                    +{c.currency === 'USD' ? '$' : `${c.currency} `}
                    {Number(c.amount).toLocaleString()}
                  </span>
                  <ArrowUpRight size={14} className="text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}