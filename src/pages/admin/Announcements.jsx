import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import TextField from '../../components/ui/TextField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listAnnouncementsAdmin, createAnnouncement, deleteAnnouncement } from '../../lib/supabase/admin';

const emptyForm = { title: '', body: '', audience: 'all', department: '' };

export default function Announcements() {
  const [state, setState] = useState({ loading: true, error: null, announcements: [] });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() {
    listAnnouncementsAdmin()
      .then((announcements) => setState({ loading: false, error: null, announcements }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load announcements.', announcements: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title || !form.body) return;
    setSaving(true);
    try {
      await createAnnouncement({
        title: form.title,
        body: form.body,
        audience: form.audience,
        department: form.audience === 'department' ? form.department : null,
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not post this announcement.' }));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteAnnouncement(id);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not delete this announcement.' }));
    }
  }

  return (
    <>
      <Seo title="Announcements" description="Post institutional announcements to students." path="/admin/announcements" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Announcements</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Notices that appear in every student's Communication tab.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Post Announcement" className="lg:col-span-1">
          <form onSubmit={handleCreate} className="space-y-4">
            <TextField label="Title" name="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            <TextField label="Body" name="body" value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} required />
            <SelectField
              label="Audience"
              name="audience"
              value={form.audience}
              onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
              options={[
                { value: 'all', label: 'All Students' },
                { value: 'department', label: 'Specific Department' },
              ]}
            />
            {form.audience === 'department' && (
              <TextField label="Department" name="department" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
            )}
            <button type="submit" disabled={saving} className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60">
              <Plus size={16} />
              {saving ? 'Posting…' : 'Post Announcement'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="All Announcements" className="lg:col-span-2">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.announcements.length === 0 && (
            <EmptyState icon={Megaphone} title="No announcements yet" message="Post your first announcement using the form on the left." />
          )}
          {!state.loading && !state.error && state.announcements.length > 0 && (
            <ul className="space-y-3">
              {state.announcements.map((a) => (
                <li key={a.id} className="rounded-xl border border-navy-100 bg-cream px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-body text-sm font-semibold text-navy-900">{a.title}</p>
                      <p className="mt-1 font-body text-sm text-navy-600">{a.body}</p>
                      <p className="mt-2 font-body text-xs text-navy-400">
                        {a.audience === 'all' ? 'All Students' : `Department: ${a.department}`} &middot;{' '}
                        {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className="inline-flex shrink-0 items-center gap-1 font-body text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
