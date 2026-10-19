import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award, BriefcaseBusiness, FolderKanban, Plus, Trash2, ExternalLink,
  RefreshCw, ArrowRight, Sparkles,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import TextField from '../../components/ui/TextField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  createPortfolioItem, deletePortfolioItem, listMyPortfolio, listMyCertificates,
} from '../../lib/supabase/learning.js';

function ProjectCard({ item, onDelete, busy }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all hover:border-gold-300/60 hover:shadow-premium">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
            <FolderKanban size={17} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold leading-snug text-navy-900">
              {item.title}
            </h3>
            {item.description && (
              <p className="mt-1.5 font-body text-sm leading-6 text-navy-500">
                {item.description}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label={`Delete ${item.title}`}
          className="rounded-lg p-2 text-navy-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {item.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.skills.map((s) => (
            <span
              key={s}
              className="rounded-full bg-gold-500/10 px-2.5 py-1 font-body text-[11px] font-semibold text-gold-700 ring-1 ring-gold-500/20"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 font-body text-xs font-bold text-gold-700 transition-colors hover:text-gold-800"
        >
          Open project
          <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}

function CertificateMiniRow({ cert }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-navy-50/60 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
        <Award size={15} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-sm font-semibold text-navy-900">
          {cert.course_title || cert.courses?.title || 'Completed course'}
        </p>
        <p className="font-mono text-[11px] text-navy-400">{cert.certificate_number}</p>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    items: [],
    certificates: [],
  });
  const [form, setForm] = useState({ title: '', description: '', url: '', skills: '' });
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  async function load() {
    try {
      const [items, certificates] = await Promise.all([
        listMyPortfolio(),
        listMyCertificates(),
      ]);
      setState({ loading: false, error: null, items, certificates });
    } catch (err) {
      setState({ loading: false, error: err.message, items: [], certificates: [] });
    }
  }

  useEffect(() => { load(); }, [reloadKey]);

  const allSkills = useMemo(() => {
    const set = new Set();
    state.items.forEach((i) => (i.skills || []).forEach((s) => set.add(s)));
    return [...set].sort();
  }, [state.items]);

  async function add(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await createPortfolioItem({
        title: form.title.trim(),
        description: form.description.trim(),
        url: form.url.trim() || null,
        skills: form.skills.split(',').map((x) => x.trim()).filter(Boolean),
      });
      setForm({ title: '', description: '', url: '', skills: '' });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setState((p) => ({ ...p, error: err.message }));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this project from your portfolio?')) return;
    setBusyId(id);
    try {
      await deletePortfolioItem(id);
      setState((p) => ({ ...p, items: p.items.filter((x) => x.id !== id) }));
    } catch (err) {
      setState((p) => ({ ...p, error: err.message }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Seo
        title="My Portfolio"
        description="Your learning achievements and practical work."
        path="/learn/portfolio"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Career-ready learning
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            My Portfolio
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            Turn completed learning into evidence of what you can actually do.
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

      {state.error && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-body text-sm text-rose-700">
          {state.error}
        </div>
      )}

      {state.loading && (
        <SectionCard className="mt-6">
          <LoadingState />
        </SectionCard>
      )}

      {!state.loading && (
        <>
          {/* Stats */}
          {(state.items.length > 0 || state.certificates.length > 0) && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-center shadow-sm">
                <p className="font-display text-xl font-bold text-navy-900">
                  {state.items.length}
                </p>
                <p className="mt-0.5 font-body text-xs text-navy-500">Projects</p>
              </div>
              <div className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-center shadow-sm">
                <p className="font-display text-xl font-bold text-gold-700">
                  {allSkills.length}
                </p>
                <p className="mt-0.5 font-body text-xs text-navy-500">Skills</p>
              </div>
              <div className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-center shadow-sm">
                <p className="font-display text-xl font-bold text-emerald-600">
                  {state.certificates.length}
                </p>
                <p className="mt-0.5 font-body text-xs text-navy-500">Certificates</p>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            {/* Projects list */}
            <SectionCard
              title="Portfolio projects"
              description="Add practical work, lab projects, and other evidence of your skills."
            >
              {state.items.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  title="No portfolio items yet"
                  message="Add your first project below to start building evidence of what you can do."
                />
              ) : (
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <ProjectCard
                      key={item.id}
                      item={item}
                      busy={busyId === item.id}
                      onDelete={() => remove(item.id)}
                    />
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Sidebar: add form + certificates + cross-link */}
            <div className="space-y-5">
              <SectionCard
                title="Add project"
                description="Document what you built, what it does, and what skills it demonstrates."
              >
                <form onSubmit={add} className="space-y-3">
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Project title"
                    className="w-full rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 font-body text-sm text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                  />
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What did you build? What problem does it solve?"
                    rows="3"
                    className="w-full rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 font-body text-sm text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                  />
                  <input
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="Skills, comma separated"
                    className="w-full rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 font-body text-sm text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                  />
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="Project URL (optional)"
                    className="w-full rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 font-body text-sm text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-60"
                  >
                    <Plus size={15} />
                    {saving ? 'Saving…' : 'Add to portfolio'}
                  </button>
                </form>
              </SectionCard>

              <SectionCard
                title="Certificates"
                action={
                  state.certificates.length > 0 && (
                    <Link
                      to="/learn/certificates"
                      className="font-body text-xs font-bold text-gold-700 hover:text-gold-800"
                    >
                      View all →
                    </Link>
                  )
                }
              >
                {state.certificates.length === 0 ? (
                  <p className="font-body text-sm text-navy-500">
                    Certificates issued for completed courses will appear here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {state.certificates.slice(0, 4).map((c) => (
                      <CertificateMiniRow key={c.id} cert={c} />
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* Cross-link to Career Profile */}
              <Link
                to="/learn/career"
                className="group flex items-center gap-3 rounded-2xl border border-gold-200 bg-gold-50/60 p-4 transition-all hover:-translate-y-0.5 hover:shadow-premium"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900">
                  <Sparkles size={18} strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm font-bold text-navy-900">
                    See your Career Profile
                  </p>
                  <p className="mt-0.5 font-body text-xs text-navy-600">
                    How your projects feed into what employers see.
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-gold-700 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}