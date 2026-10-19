import { useEffect, useState } from 'react';
import { CheckCircle2, TriangleAlert } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getAttendance, summarizeAttendanceByUnit } from '../../lib/supabase/studentPortal';

const WARNING_THRESHOLD = 75;

export default function Attendance() {
  const [state, setState] = useState({ loading: true, error: null, records: [] });

  useEffect(() => {
    getAttendance()
      .then((records) => setState({ loading: false, error: null, records }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load your attendance.', records: [] }));
  }, []);

  const summary = summarizeAttendanceByUnit(state.records);
  const summaryColumns = [
    { key: 'code', label: 'Unit', render: (r) => `${r.code || '—'} — ${r.title || ''}` },
    { key: 'attended', label: 'Attended' },
    { key: 'missed', label: 'Missed' },
    {
      key: 'percentage',
      label: 'Attendance %',
      render: (r) => (
        <span className={r.percentage < WARNING_THRESHOLD ? 'font-semibold text-rose-600' : 'font-semibold text-emerald-700'}>
          {r.percentage}%
        </span>
      ),
    },
  ];

  const warnings = summary.filter((s) => s.percentage < WARNING_THRESHOLD);

  return (
    <>
      <Seo title="Attendance" description="Track your class attendance record." path="/portal/attendance" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Attendance</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Your recorded class attendance by unit.</p>
      </div>

      {warnings.length > 0 && (
        <div className="mt-6 space-y-2">
          {warnings.map((w) => (
            <div
              key={w.code}
              className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-body text-sm text-navy-800"
            >
              <TriangleAlert size={16} className="mt-0.5 shrink-0 text-rose-600" />
              <span>
                Your attendance for <strong>{w.code}</strong> is {w.percentage}%, below the required {WARNING_THRESHOLD}% threshold.
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <SectionCard title="Attendance Summary" description="Classes attended vs. missed, by unit.">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && summary.length === 0 && (
            <EmptyState icon={CheckCircle2} title="No attendance recorded yet" message="Your attendance will appear here once classes begin." />
          )}
          {!state.loading && !state.error && summary.length > 0 && <DataTable columns={summaryColumns} rows={summary} keyField="code" />}
        </SectionCard>
      </div>
    </>
  );
}
