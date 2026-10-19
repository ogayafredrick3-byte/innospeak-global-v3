import { useEffect, useState } from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import TextField from '../../components/ui/TextField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listPrograms, createProgram, deleteProgram } from '../../lib/supabase/admin';

const emptyForm = { name: '', code: '', department: '', level: '' };

export default function Programs() {
  const [state, setState] = useState({ loading: true, error: null, programs: [] });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() {
    listPrograms()
      .then((programs) => setState({ loading: false, error: null, programs }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load programs.', programs: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      await createProgram(form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not create this program.' }));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteProgram(id);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not delete this program.' }));
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code', render: (r) => r.code || '—' },
    { key: 'department', label: 'Department', render: (r) => r.department || '—' },
    { key: 'level', label: 'Level', render: (r) => r.level || '—' },
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
      <Seo title="Programs" description="Manage academic programs." path="/admin/programs" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Programs</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Degree, diploma and certificate programs offered.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Add Program" className="lg:col-span-1">
          <form onSubmit={handleCreate} className="space-y-4">
            <TextField label="Name" name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <TextField label="Code" name="code" optional value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
            <TextField label="Department" name="department" optional value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
            <TextField label="Level" name="level" optional value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} placeholder="e.g. Diploma, Degree" />
            <button type="submit" disabled={saving} className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60">
              <Plus size={16} />
              {saving ? 'Adding…' : 'Add Program'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="All Programs" className="lg:col-span-2">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.programs.length === 0 && (
            <EmptyState icon={GraduationCap} title="No programs yet" message="Add your first program using the form on the left." />
          )}
          {!state.loading && !state.error && state.programs.length > 0 && <DataTable columns={columns} rows={state.programs} />}
        </SectionCard>
      </div>
    </>
  );
}
