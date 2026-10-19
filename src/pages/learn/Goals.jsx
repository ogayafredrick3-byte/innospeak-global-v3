import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2, CircleDot, Plus, Target, Trash2, Calendar, RefreshCw,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import TextField from '../../components/ui/TextField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  createGoal, deleteGoal, listMyGoals, updateGoal,
} from '../../lib/supabase/platform.js';

function GoalCard({ goal, onToggle, onDelete, busy }) {
  const isDone = goal.status === 'completed';
  const targetDate = goal.target_date ? new Date(goal.target_date) : null;
  const isOverdue = targetDate && !isDone && targetDate < new Date();

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        isDone
          ? 'border-emerald-100 bg-emerald-50/40'
          : 'border-navy-100 bg-white hover:border-gold-300/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${isDone ? 'text-emerald-600' : 'text-gold-600'}`}>
          {isDone ? <CheckCircle2 size={19} /> : <CircleDot size={19} />}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className={`font-display text-base font-bold leading-snug ${
              isDone ? 'text-navy-500 line-through' : 'text-navy-900'
            }`}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p className="mt-1 font-body text-sm leading-6 text-navy-500">
              {goal.description}
            </p>
          )}
          {targetDate && (
            <p
              className={`mt-2 inline-flex items-center gap-1.5 font-body text-xs font-semibold ${
                isOverdue ? 'text-rose-600' : 'text-navy-500'
              }`}
            >
              <Calendar size={12} />
              Target: {targetDate.toLocaleDateString()}
              {isOverdue && <span> · Overdue</span>}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onToggle}
            disabled={busy}
            className={`rounded-lg px-2.5 py-1.5 font-body text-[11px] font-bold transition-colors disabled:opacity-50 ${
              isDone
                ? 'text-navy-600 hover:bg-navy-50'
                : 'text-gold-700 hover:bg-gold-50'
            }`}
          >
            {isDone ? 'Reopen' : 'Complete'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            aria-label="Delete goal"
            className="rounded-lg p-2 text-navy-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', target_date: '' });
  const [adding, setAdding] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setGoals(await listMyGoals());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const active = goals.filter((g) => g.status !== 'completed').length;
    const done = goals.filter((g) => g.status === 'completed').length;
    return { total: goals.length, active, done };
  }, [goals]);

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status !== 'completed'),
    [goals]
  );
  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === 'completed'),
    [goals]
  );

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setAdding(true);
    try {
      await createGoal(form);
      setForm({ title: '', description: '', target_date: '' });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(goal) {
    setBusyId(goal.id);
    try {
      await updateGoal(goal.id, {
        status: goal.status === 'completed' ? 'active' : 'completed',
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(goal) {
    if (!window.confirm(`Delete "${goal.title}"? This cannot be undone.`)) return;
    setBusyId(goal.id);
    try {
      await deleteGoal(goal.id);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Seo
        title="Learning Goals"
        description="Plan and track your learning goals."
        path="/learn/goals"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Learning plan
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            My Learning Goals
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            Turn your programme and career goals into clear, measurable milestones.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
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
                <p className="font-display text-xl font-bold text-gold-700">{stats.active}</p>
                <p className="mt-0.5 font-body text-xs text-navy-500">Active</p>
              </div>
              <div className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-center shadow-sm">
                <p className="font-display text-xl font-bold text-emerald-600">{stats.done}</p>
                <p className="mt-0.5 font-body text-xs text-navy-500">Completed</p>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            {/* Active goals list */}
            <div className="space-y-5">
              <SectionCard
                title="Active goals"
                description="Milestones you're currently working toward."
              >
                {activeGoals.length === 0 ? (
                  <EmptyState
                    icon={Target}
                    title="No active goals"
                    message="Add a goal to focus your learning and make your profile more useful to employers."
                  />
                ) : (
                  <div className="space-y-3">
                    {activeGoals.map((g) => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        busy={busyId === g.id}
                        onToggle={() => handleToggle(g)}
                        onDelete={() => handleDelete(g)}
                      />
                    ))}
                  </div>
                )}
              </SectionCard>

              {completedGoals.length > 0 && (
                <SectionCard
                  title="Completed"
                  description="Goals you've achieved."
                >
                  <div className="space-y-3">
                    {completedGoals.map((g) => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        busy={busyId === g.id}
                        onToggle={() => handleToggle(g)}
                        onDelete={() => handleDelete(g)}
                      />
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Add goal form */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionCard
                title="Add a goal"
                description="Keep it specific and measurable."
              >
                <form onSubmit={handleAdd} className="space-y-4">
                  <TextField
                    label="Goal"
                    name="goal"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Complete Electrical Machines"
                    required
                  />
                  <TextField
                    label="Description"
                    name="goal-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What will success look like?"
                    optional
                  />
                  <TextField
                    label="Target date"
                    name="target-date"
                    type="date"
                    value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                    optional
                  />
                  <button
                    type="submit"
                    disabled={adding}
                    className="btn-gold inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Plus size={15} />
                    {adding ? 'Adding…' : 'Add goal'}
                  </button>
                </form>
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </>
  );
}