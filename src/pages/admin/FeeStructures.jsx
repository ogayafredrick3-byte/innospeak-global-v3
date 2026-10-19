import { useEffect, useState } from 'react';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import TextField from '../../components/ui/TextField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listFeeStructures, createFeeStructure, deleteFeeStructure, listPrograms, listSemesters } from '../../lib/supabase/admin';

const emptyForm = { program_id: '', semester_id: '', item: '', amount: '' };

export default function FeeStructures() {
  const [state, setState] = useState({ loading: true, error: null, structures: [] });
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() {
    listFeeStructures()
      .then((structures) => setState({ loading: false, error: null, structures }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load fee structures.', structures: [] }));
  }

  useEffect(() => {
    load();
    listPrograms().then(setPrograms).catch(() => setPrograms([]));
    listSemesters().then(setSemesters).catch(() => setSemesters([]));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.item || !form.amount) return;
    setSaving(true);
    try {
      await createFeeStructure({
        program_id: form.program_id || null,
        semester_id: form.semester_id || null,
        item: form.item,
        amount: Number(form.amount),
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not add this fee item.' }));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteFeeStructure(id);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not delete this fee item.' }));
    }
  }

  const columns = [
    { key: 'item', label: 'Item' },
    { key: 'program', label: 'Program', render: (r) => r.programs?.name || 'All Programs' },
    { key: 'semester', label: 'Semester', render: (r) => (r.semesters ? `${r.semesters.name} (${r.semesters.academic_year})` : 'All Semesters') },
    { key: 'amount', label: 'Amount (KES)', render: (r) => Number(r.amount || 0).toLocaleString() },
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
      <Seo title="Fee Structures" description="Set tuition and fee items per program and semester." path="/admin/fees" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Fee Structures</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Define fee items (tuition, registration, library, etc.) shown on the student Finance page.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Add Fee Item" className="lg:col-span-1">
          <form onSubmit={handleCreate} className="space-y-4">
            <TextField label="Item" name="item" value={form.item} onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))} placeholder="e.g. Tuition" required />
            <TextField label="Amount (KES)" name="amount" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />
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
            <button type="submit" disabled={saving} className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60">
              <Plus size={16} />
              {saving ? 'Adding…' : 'Add Fee Item'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="All Fee Items" className="lg:col-span-2">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.structures.length === 0 && (
            <EmptyState icon={Wallet} title="No fee items yet" message="Add your first fee item using the form on the left." />
          )}
          {!state.loading && !state.error && state.structures.length > 0 && <DataTable columns={columns} rows={state.structures} />}
        </SectionCard>
      </div>
    </>
  );
}
