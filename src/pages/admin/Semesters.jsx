import { useEffect, useState } from 'react';
import { CalendarRange, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import TextField from '../../components/ui/TextField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listSemesters, createSemester, setCurrentSemester, deleteSemester } from '../../lib/supabase/admin';

const emptyForm = { name: '', academic_year: '', start_date: '', end_date: '' };

export default function Semesters() {
  const [state, setState] = useState({ loading: true, error: null, semesters: [] });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() {
    listSemesters()
      .then((semesters) => setState({ loading: false, error: null, semesters }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load semesters.', semesters: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name || !form.academic_year) return;
    setSaving(true);
    try {
      await createSemester(form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not create this semester.' }));
    } finally {
      setSaving(false);
    }
  }

  async function handleSetCurrent(id) {
    try {
      await setCurrentSemester(id);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not set the current semester.' }));
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSemester(id);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not delete this semester.' }));
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'academic_year', label: 'Academic Year' },
    { key: 'start_date', label: 'Start', render: (r) => (r.start_date ? new Date(r.start_date).toLocaleDateString() : '—') },
    { key: 'end_date', label: 'End', render: (r) => (r.end_date ? new Date(r.end_date).toLocaleDateString() : '—') },
    { key: 'is_current', label: 'Current', render: (r) => (r.is_current ? 'Yes' : '—') },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex items-center gap-3">
          {!r.is_current && (
            <button
              type="button"
              onClick={() => handleSetCurrent(r.id)}
              className="inline-flex items-center gap-1 font-body text-xs font-semibold text-gold-700 hover:text-gold-800"
            >
              <CheckCircle2 size={13} />
              Set Current
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDelete(r.id)}
            className="inline-flex items-center gap-1 font-body text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Seo title="Semesters" description="Manage academic semesters." path="/admin/semesters" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Semesters</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Academic terms — mark one as current for student dashboards.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Add Semester" className="lg:col-span-1">
          <form onSubmit={handleCreate} className="space-y-4">
            <TextField label="Name" name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Semester 1" required />
            <TextField
              label="Academic Year"
              name="academic_year"
              value={form.academic_year}
              onChange={(e) => setForm((p) => ({ ...p, academic_year: e.target.value }))}
              placeholder="e.g. 2026/2027"
              required
            />
            <TextField label="Start Date" name="start_date" type="date" optional value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
            <TextField label="End Date" name="end_date" type="date" optional value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
            <button type="submit" disabled={saving} className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60">
              <Plus size={16} />
              {saving ? 'Adding…' : 'Add Semester'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="All Semesters" className="lg:col-span-2">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.semesters.length === 0 && (
            <EmptyState icon={CalendarRange} title="No semesters yet" message="Add your first semester using the form on the left." />
          )}
          {!state.loading && !state.error && state.semesters.length > 0 && <DataTable columns={columns} rows={state.semesters} />}
        </SectionCard>
      </div>
    </>
  );
}
