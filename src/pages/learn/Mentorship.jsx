import { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck, Plus, RefreshCw, UserRound, MessageSquare,
  CheckCircle2, Clock,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import TextField from '../../components/ui/TextField.jsx';
import { LoadingState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  createMentorshipRequest, listMentorshipRequests,
} from '../../lib/supabase/platform.js';

const STATUS_TONES = {
  pending:   'bg-amber-50 text-amber-700 ring-amber-100',
  active:    'bg-emerald-50 text-emerald-700 ring-emerald-100',
  matched:   'bg-emerald-50 text-emerald-700 ring-emerald-100',
  completed: 'bg-navy-50 text-navy-600 ring-navy-100',
  declined:  'bg-rose-50 text-rose-700 ring-rose-100',
};

function StatusChip({ status }) {
  const tone = STATUS_TONES[status] || STATUS_TONES.pending;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ring-1 ${tone}`}
    >
      {status}
    </span>
  );
}

function RequestCard({ request }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
            <UserRound size={17} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold leading-snug text-navy-900">
              {request.goal}
            </h3>
            {request.preferred_schedule && (
              <p className="mt-1 inline-flex items-center gap-1.5 font-body text-xs font-semibold text-navy-500">
                <Clock size={11} />
                {request.preferred_schedule}
              </p>
            )}
          </div>
        </div>
        <StatusChip status={request.status} />
      </div>

      {request.message && (
        <div className="mt-4 rounded-xl bg-cream/60 p-3">
          <p className="font-body text-xs leading-6 text-navy-700">
            {request.message}
          </p>
        </div>
      )}

      <p className="mt-3 inline-flex items-center gap-1.5 font-body text-xs text-navy-400">
        <CalendarCheck size={11} />
        Requested {new Date(request.created_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })}
      </p>
    </div>
  );
}

export default function Mentorship() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ goal: '', preferred_schedule: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    listMentorshipRequests()
      .then((data) => {
        setItems(data);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((i) => ['active', 'matched'].includes(i.status)).length,
    pending: items.filter((i) => i.status === 'pending').length,
  }), [items]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createMentorshipRequest(form);
      setForm({ goal: '', preferred_schedule: '', message: '' });
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Seo
        title="Mentorship"
        description="Request learning and career mentorship."
        path="/learn/mentorship"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Student support
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            Mentorship
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            Request guidance on learning, projects, career preparation, or
            professional development. We match you with an experienced mentor.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="btn-outline inline-flex shrink-0 items-center gap-2 text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-body text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && (
        <SectionCard className="mt-6">
          <LoadingState />
        </SectionCard>
      )}

      {!loading && (
        <>
          {/* Stats */}
          {stats.total > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-center shadow-sm">
                <p className="font-display text-xl font-bold text-navy-900">{stats.total}</p>
                <p className="mt-0.5 font-body text-xs text-navy-500">Total</p>
              </div>
              <div className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-center shadow-sm">
                <p className="font-display text-xl font-bold text-emerald-600">{stats.active}</p>
                <p className="mt-0.5 font-body text-xs text-navy-500">Active</p>
              </div>
              <div className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-center shadow-sm">
                <p className="font-display text-xl font-bold text-gold-700">{stats.pending}</p>
                <p className="mt-0.5 font-body text-xs text-navy-500">Pending</p>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            {/* Request form */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionCard
                title="Request a mentor"
                description="Be specific about what you want help with to help us find a suitable mentor."
              >
                <form onSubmit={submit} className="space-y-4">
                  <TextField
                    label="What do you want help with?"
                    name="mentor-goal"
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    placeholder="e.g. Preparing for an engineering interview"
                    required
                  />
                  <TextField
                    label="Preferred schedule"
                    name="mentor-schedule"
                    value={form.preferred_schedule}
                    onChange={(e) => setForm({ ...form, preferred_schedule: e.target.value })}
                    placeholder="e.g. Weekdays after 5pm"
                    optional
                  />
                  <div>
                    <label className="font-body text-sm font-bold tracking-wide text-navy-900">
                      Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      placeholder="Add context for the mentor, such as your background, what you've tried and where you're stuck."
                      className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 shadow-sm outline-none transition placeholder:text-navy-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-gold inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Plus size={15} />
                    {saving ? 'Sending…' : 'Send request'}
                  </button>

                  <div className="rounded-xl border border-navy-100 bg-cream/40 p-3">
                    <p className="font-body text-xs font-bold text-navy-900">
                      <MessageSquare size={11} className="mr-1 inline" />
                      Tips for a good request
                    </p>
                    <ul className="mt-2 space-y-1 font-body text-xs leading-5 text-navy-600">
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                        <span>Name the outcome — "pass an interview", "ship my first project".</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                        <span>Share what you've already tried so the mentor doesn't repeat it.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                        <span>Mention your availability if it matters.</span>
                      </li>
                    </ul>
                  </div>
                </form>
              </SectionCard>
            </div>

            {/* Requests list */}
            <SectionCard
              title="My requests"
              description="Track the mentorships you've requested."
            >
              {items.length === 0 ? (
                <EmptyState
                  icon={UserRound}
                  title="No mentorship activity yet"
                  message="Request a mentor to get guidance on learning, projects, or career preparation."
                />
              ) : (
                <div className="space-y-3">
                  {items.map((i) => (
                    <RequestCard key={i.id} request={i} />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </>
  );
}