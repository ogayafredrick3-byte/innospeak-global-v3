import { useMemo, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FileText, Sparkles } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import {
  getSponsorSession,
  getSponsorByEmail,
  getContributionsBySponsor,
} from '../../lib/data/sponsorStore.js';
import { getProgressReportsByProgram } from '../../lib/data/progressReportStore.js';
import { FOUNDATION_PROGRAMS } from '../../lib/data/foundationApplicationsData.js';

function getProgramLabel(id) {
  return FOUNDATION_PROGRAMS.find((p) => p.id === id)?.label || id;
}

export default function SponsorImpact() {
  const [tick, setTick] = useState(0);
  useEffect(() => setTick((t) => t + 1), []);

  const session = getSponsorSession();
  const sponsor = session ? getSponsorByEmail(session.email) : null;

  const contributions = useMemo(
    () => (sponsor ? getContributionsBySponsor(sponsor.id) : []),
    [sponsor, tick]
  );

  const fundedPrograms = useMemo(
    () => [...new Set(contributions.map((c) => c.programId))],
    [contributions]
  );

  const reports = useMemo(() => {
    const all = fundedPrograms.flatMap((pid) =>
      getProgressReportsByProgram(pid)
        .filter((r) => r.visibleToSponsor)
        .map((r) => ({ ...r, programId: pid }))
    );
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [fundedPrograms, tick]);

  if (!session) return <Navigate to="/sponsor/signin" replace />;

  return (
    <>
      <Seo
        title="Impact & Reports"
        description="Anonymized progress reports from the Foundation team."
        path="/sponsor/impact"
      />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Sponsor Portal
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          Impact & Reports
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-navy-500">
          Verified progress updates written by our Foundation team. Learner identities
          are protected, and only initials are shown.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center">
          <Sparkles size={32} className="mx-auto text-emerald-500" />
          <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
            No reports yet
          </h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-navy-500">
            Progress reports from the Foundation team will appear here as the
            programs you support run their course.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {reports.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 font-display text-sm font-bold text-emerald-700">
                    {r.studentInitials}
                  </div>
                  <div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {getProgramLabel(r.programId)}
                    </span>
                    <h2 className="mt-2 font-display text-lg font-bold text-navy-900">
                      {r.title}
                    </h2>
                    <p className="mt-1 font-body text-[11px] text-navy-400">
                      {new Date(r.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      · By {r.authorName}
                    </p>
                  </div>
                </div>
                <FileText size={18} className="shrink-0 text-navy-300" />
              </div>

              <div className="mt-4 whitespace-pre-line font-body text-sm leading-7 text-navy-700">
                {r.body}
              </div>

              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
                <p className="font-body text-[11px] font-semibold text-emerald-800">
                  Learner identity protected · Initials shown: {r.studentInitials}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}