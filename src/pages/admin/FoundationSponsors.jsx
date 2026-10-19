import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Plus, Search, Mail, Building2, Trash2, DollarSign, X, ExternalLink,
} from 'lucide-react';
import { getSponsors, upsertSponsor, deleteSponsor, getContributionsBySponsor } from '../../lib/data/sponsorStore.js';

const TIERS = [
  { id: 'individual', label: 'Individual' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'institutional', label: 'Institutional' },
];

export default function FoundationSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', organization: '', tier: 'individual' });
  const [error, setError] = useState('');

  const refresh = useCallback(() => setSponsors(getSponsors()), []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sponsors.filter((s) => {
      if (!q) return true;
      return `${s.name} ${s.email} ${s.organization || ''}`.toLowerCase().includes(q);
    });
  }, [sponsors, query]);

  const totals = useMemo(() => {
    return sponsors.reduce(
      (acc, s) => {
        const contribs = getContributionsBySponsor(s.id);
        acc.count += 1;
        acc.total += contribs.reduce((sum, c) => sum + Number(c.amount || 0), 0);
        return acc;
      },
      { count: 0, total: 0 }
    );
  }, [sponsors]);

  function handleSave(e) {
    e.preventDefault();
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      return setError('Please enter a valid email.');
    }
    setError('');
    upsertSponsor(form);
    setForm({ email: '', name: '', organization: '', tier: 'individual' });
    setShowModal(false);
    refresh();
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this sponsor? Contributions will remain but be orphaned.')) return;
    deleteSponsor(id);
    refresh();
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
              <Heart size={20} />
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-emerald-700">
                Foundation
              </p>
              <h1 className="font-display text-2xl font-bold text-navy-900">Sponsors</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-navy-600">
            Manage sponsors. Contributions are recorded separately and can be linked to any sponsor here.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
        >
          <Plus size={16} />
          Add Sponsor
        </button>
      </header>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Tile label="Total Sponsors" value={totals.count} />
        <Tile label="Lifetime Contributions" value={`$${totals.total.toLocaleString()}`} />
        <Tile label="Average Gift" value={totals.count ? `$${Math.round(totals.total / totals.count).toLocaleString()}` : '$0'} />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or organisation…"
          className="w-full rounded-2xl border border-navy-100 bg-white py-3 pl-11 pr-4 font-body text-sm outline-none transition placeholder:text-navy-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center">
          <Heart size={32} className="mx-auto text-navy-300" />
          <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
            {sponsors.length === 0 ? 'No sponsors yet' : 'No matches'}
          </h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
            {sponsors.length === 0
              ? 'Add a sponsor to start tracking their contributions.'
              : 'Try a different search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const contribs = getContributionsBySponsor(s.id);
            const total = contribs.reduce((sum, c) => sum + Number(c.amount || 0), 0);
            return (
              <div
                key={s.id}
                className="flex flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-body text-sm font-bold text-emerald-700">
                  {(s.name || s.email).slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-body text-sm font-bold text-navy-900">
                      {s.name || '(unnamed)'}
                    </p>
                    <span className="rounded-full bg-navy-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-navy-600">
                      {TIERS.find((t) => t.id === s.tier)?.label || s.tier}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-navy-500">
                    <Mail size={11} />
                    {s.email}
                  </p>
                  {s.organization && (
                    <p className="mt-0.5 flex items-center gap-1.5 font-body text-xs text-navy-500">
                      <Building2 size={11} />
                      {s.organization}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                    Total Given
                  </p>
                  <p className="mt-0.5 font-display text-lg font-bold text-emerald-700">
                    ${total.toLocaleString()}
                  </p>
                  <p className="mt-0.5 font-body text-[11px] text-navy-400">
                    {contribs.length} contribution{contribs.length === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    to={`/admin/foundation/contributions?sponsor=${s.id}`}
                    className="rounded-lg border border-navy-100 px-3 py-2 font-body text-xs font-semibold text-navy-700 transition hover:border-emerald-400 hover:text-emerald-700"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    aria-label="Delete"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 text-navy-500 transition hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Add Sponsor">
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Email *" id="email">
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="sponsor@example.com"
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
            </Field>
            <Field label="Name" id="name">
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
            </Field>
            <Field label="Organisation" id="org">
              <input
                id="org"
                type="text"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                placeholder="If applicable"
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
            </Field>
            <Field label="Tier" id="tier">
              <select
                id="tier"
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500"
              >
                {TIERS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </Field>
            {error && <p className="font-body text-xs font-semibold text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-navy-100 pt-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-navy-200 bg-white px-4 py-2.5 font-body text-sm font-bold text-navy-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-2.5 font-body text-sm font-bold text-white"
              >
                Save Sponsor
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Tile({ label, value }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <p className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-navy-900">{value}</p>
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-body text-sm font-bold text-navy-900">{label}</label>
      {children}
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium-lg sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-navy-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 text-navy-700 hover:bg-navy-100"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}