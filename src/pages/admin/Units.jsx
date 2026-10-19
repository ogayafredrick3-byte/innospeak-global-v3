import { useEffect, useState } from 'react';
import { BookMarked, Plus, Trash2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import TextField from '../../components/ui/TextField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listUnits, createUnit, deleteUnit, listPrograms, listSemesters } from '../../lib/supabase/admin';

const emptyForm = { code: '', title: '', credit_hours: '3', program_id: '', semester_id: '', lecturer_name: '' };

export default function Units() {
  const [state, setState] = useState({ loading: true, error: null, units: [] });
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() {
    listUnits()
      .then((units) => setState({ loading: false, error: null, units }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load units.', units: [] }));
  }

  useEffect(() => {
    load();
    listPrograms().then(setPrograms).catch(() => setPrograms([]));
    listSemesters().then(setSemesters).catch(() => setSemesters([]));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.code || !form.title) return;
    setSaving(true);
    try {
      await createUnit({
        code: form.code,
        title: form.title,
        credit_hours: Number(form.credit_hours || 3),
        program_id: form.program_id || null,
        semester_id: form.semester_id || null,
        lecturer_name: form.lecturer_name || null,
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not create this unit.' }));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteUnit(id);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not delete this unit.' }));
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'title', label: 'Title' },
    { key: 'program', label: 'Program', render: (r) => r.programs?.name || '—' },
    { key: 'semester', label: 'Semester', render: (r) => (r.semesters ? `${r.semesters.name} (${r.semesters.academic_year})` : '—') },
    { key: 'lecturer_name', label: 'Lecturer', render: (r) => r.lecturer_name || '—' },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button
          type="button"
          onClick={() => handleDelete(r.id)}
          className="inline-flex items-center gap-1 font-body text-xs font-semibold text-rose-600 hover:text-rose-700"
        >
          <Trash2 size={13} />
          Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Seo title="Units" description="Manage registrable units/courses." path="/admin/units" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Units</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Registrable units within a program and semester.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Add Unit" className="lg:col-span-1">
          <form onSubmit={handleCreate} className="space-y-4">
            <TextField label="Code" name="code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} required />
            <TextField label="Title" name="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            <TextField label="Credit Hours" name="credit_hours" value={form.credit_hours} onChange={(e) => setForm((p) => ({ ...p, credit_hours: e.target.value }))} />
            <SelectField
              label="Program"
              name="program_id"
              optional
              value={form.program_id}
              onChange={(e) => setForm((p) => ({ ...p, program_id: e.target.value }))}
              options={programs.map((p) => ({ value: p.id, label: p.name }))}
            />
            <SelectField
              label="Semester"
              name="semester_id"
              optional
              value={form.semester_id}
              onChange={(e) => setForm((p) => ({ ...p, semester_id: e.target.value }))}
              options={semesters.map((s) => ({ value: s.id, label: `${s.name} (${s.academic_year})` }))}
            />
            <TextField label="Lecturer" name="lecturer_name" optional value={form.lecturer_name} onChange={(e) => setForm((p) => ({ ...p, lecturer_name: e.target.value }))} />
            <button type="submit" disabled={saving} className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60">
              <Plus size={16} />
              {saving ? 'Adding…' : 'Add Unit'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="All Units" className="lg:col-span-2">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.units.length === 0 && (
            <EmptyState icon={BookMarked} title="No units yet" message="Add your first unit using the form on the left." />
          )}
          {!state.loading && !state.error && state.units.length > 0 && <DataTable columns={columns} rows={state.units} />}
        </SectionCard>
      </div>
    </>
  );
}
