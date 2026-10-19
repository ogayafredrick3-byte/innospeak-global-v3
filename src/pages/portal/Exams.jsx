import { useEffect, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getExamTimetable, getExamResults } from '../../lib/supabase/studentPortal';

function formatTime(t) {
  if (!t) return '—';
  return t.slice(0, 5);
}

export default function Exams() {
  const [state, setState] = useState({ loading: true, error: null, timetable: [], results: [] });

  useEffect(() => {
    Promise.all([getExamTimetable(), getExamResults()])
      .then(([timetable, results]) => setState({ loading: false, error: null, timetable, results }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load your exam information.', timetable: [], results: [] }));
  }, []);

  const timetableColumns = [
    { key: 'unit', label: 'Unit', render: (r) => (r.units ? `${r.units.code} — ${r.units.title}` : '—') },
    { key: 'date', label: 'Date', render: (r) => (r.exam_date ? new Date(r.exam_date).toLocaleDateString() : '—') },
    { key: 'time', label: 'Time', render: (r) => `${formatTime(r.start_time)} – ${formatTime(r.end_time)}` },
    { key: 'venue', label: 'Venue', render: (r) => r.venue || '—' },
    { key: 'type', label: 'Type', render: (r) => r.exam_type },
  ];

  const resultsColumns = [
    { key: 'unit', label: 'Unit', render: (r) => (r.exams?.units ? `${r.exams.units.code} — ${r.exams.units.title}` : '—') },
    { key: 'type', label: 'Exam Type', render: (r) => r.exams?.exam_type || '—' },
    { key: 'score', label: 'Score', render: (r) => r.score ?? '—' },
    { key: 'grade', label: 'Grade', render: (r) => r.grade || '—' },
    { key: 'status', label: 'Clearance', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <Seo title="Exams" description="Your exam timetable, eligibility and results." path="/portal/exams" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Exams</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Exam timetable, venues and results.</p>
      </div>

      <div className="mt-6 space-y-6">
        <SectionCard title="Exam Timetable" description="Upcoming and past examination sessions.">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.timetable.length === 0 && (
            <EmptyState icon={FileSpreadsheet} title="No exams scheduled" message="Your exam timetable will appear here once published." />
          )}
          {!state.loading && !state.error && state.timetable.length > 0 && (
            <DataTable columns={timetableColumns} rows={state.timetable} />
          )}
        </SectionCard>

        <SectionCard title="Examination Results" description="Results and clearance status per exam.">
          {!state.loading && !state.error && state.results.length === 0 && (
            <EmptyState icon={FileSpreadsheet} title="No results yet" message="Results will appear here once released and cleared." />
          )}
          {!state.loading && !state.error && state.results.length > 0 && (
            <DataTable columns={resultsColumns} rows={state.results} />
          )}
        </SectionCard>
      </div>
    </>
  );
}
