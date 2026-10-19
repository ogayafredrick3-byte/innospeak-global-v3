import { useEffect, useState } from 'react';
import { BookOpenCheck, FileText } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatCard from '../../components/portal/StatCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getAcademicRecords, computeGpa, submitServiceRequest } from '../../lib/supabase/studentPortal';

export default function Records() {
  const [state, setState] = useState({ loading: true, error: null, records: [] });
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    getAcademicRecords()
      .then((records) => setState({ loading: false, error: null, records }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load your academic records.', records: [] }));
  }, []);

  async function handleRequestTranscript() {
    setRequesting(true);
    try {
      await submitServiceRequest('transcript', { reason: 'Requested from Academic Records page' });
      setRequested(true);
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not submit your transcript request.' }));
    } finally {
      setRequesting(false);
    }
  }

  const gpa = computeGpa(state.records);
  const columns = [
    { key: 'code', label: 'Unit Code', render: (r) => r.units?.code || '—' },
    { key: 'title', label: 'Unit Title', render: (r) => r.units?.title || '—' },
    { key: 'semester', label: 'Semester', render: (r) => (r.semesters ? `${r.semesters.name} (${r.semesters.academic_year})` : '—') },
    { key: 'score', label: 'Score', render: (r) => r.score ?? '—' },
    { key: 'grade', label: 'Grade', render: (r) => r.grade || '—' },
  ];

  return (
    <>
      <Seo title="Academic Records" description="View your grades, GPA and academic standing." path="/portal/records" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Academic Records</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Your semester results, GPA and academic standing.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={BookOpenCheck} label="Cumulative GPA" value={gpa ?? '—'} />
        <StatCard label="Units Recorded" value={state.records.length} />
        <StatCard label="Academic Standing" value={gpa === null ? '—' : gpa >= 2.0 ? 'Good Standing' : 'On Probation'} />
      </div>

      <div className="mt-6">
        <SectionCard
          title="Semester Results"
          description="All recorded grades across your semesters."
          action={
            <button
              type="button"
              onClick={handleRequestTranscript}
              disabled={requesting || requested}
              className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-2 font-body text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50 disabled:opacity-60"
            >
              <FileText size={15} />
              {requested ? 'Transcript Requested' : requesting ? 'Submitting…' : 'Request Transcript'}
            </button>
          }
        >
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.records.length === 0 && (
            <EmptyState icon={BookOpenCheck} title="No results yet" message="Your results will appear here once released." />
          )}
          {!state.loading && !state.error && state.records.length > 0 && <DataTable columns={columns} rows={state.records} />}
        </SectionCard>
      </div>
    </>
  );
}
