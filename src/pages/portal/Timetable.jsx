import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getTimetable } from '../../lib/supabase/studentPortal';

function formatTime(t) {
  if (!t) return '—';
  return t.slice(0, 5);
}

export default function Timetable() {
  const [state, setState] = useState({ loading: true, error: null, entries: [] });

  useEffect(() => {
    getTimetable()
      .then((entries) => setState({ loading: false, error: null, entries }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load your timetable.', entries: [] }));
  }, []);

  const columns = [
    { key: 'day', label: 'Day', render: (r) => r.day_of_week },
    { key: 'time', label: 'Time', render: (r) => `${formatTime(r.start_time)} – ${formatTime(r.end_time)}` },
    { key: 'unit', label: 'Unit', render: (r) => (r.units ? `${r.units.code} — ${r.units.title}` : '—') },
    { key: 'type', label: 'Session', render: (r) => r.session_type },
    { key: 'lecturer', label: 'Lecturer', render: (r) => r.lecturer_name || '—' },
    { key: 'venue', label: 'Venue', render: (r) => r.venue || '—' },
  ];

  return (
    <>
      <Seo title="Timetable" description="Your institutional class and exam timetable." path="/portal/timetable" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Timetable</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Your classes, practicals and venues for the current semester.
        </p>
      </div>

      <div className="mt-6">
        <SectionCard title="Weekly Schedule">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.entries.length === 0 && (
            <EmptyState icon={CalendarDays} title="No timetable published yet" message="Check back once your department publishes the schedule." />
          )}
          {!state.loading && !state.error && state.entries.length > 0 && <DataTable columns={columns} rows={state.entries} />}
        </SectionCard>
      </div>
    </>
  );
}
