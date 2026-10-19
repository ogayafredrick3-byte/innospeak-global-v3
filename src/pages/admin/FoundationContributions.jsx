import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DollarSign, Plus, Search, Trash2, X, Filter, Calendar,
} from 'lucide-react';
import {
  getSponsors,
  getContributions,
  createContribution,
  deleteContribution,
  getSponsorByEmail,
  upsertSponsor,
} from '../../lib/data/sponsorStore.js';
import { FOUNDATION_PROGRAMS } from '../../lib/data/foundationApplicationsData.js';

const FREQUENCIES = [
  { id: 'one_time', label: 'One-time' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'termly', label: 'Termly' },
  { id: 'annual', label: 'Annual' },
];

const METHODS = [
  { id: 'mpesa', label: 'M-Pesa' },
  { id: 'card', label: 'Card' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'bank', label: 'Bank Transfer' },
  { id: 'cash', label: 'Cash' },
  { id: 'pending', label: 'Pending' },
];

export default function FoundationContributions() {
  const [searchParams] = useSearchParams();
  const sponsorFilter = searchParams.get('sponsor') || 'all';

  const [contributions, setContributions] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    sponsorEmail: '',
    sponsorName: '',
    programId: 'education-access',
    amount: '',
    currency: 'USD',
    frequency: 'one_time',
    method: 'pending',
    reference: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    setContributions(getContributions());
    setSponsors(getSponsors());
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contributions
      .filter((c) => sponsorFilter === 'all' || c.sponsorId === sponsorFilter)
      .filter((c) => {
        if (!q) return true;
        return `${c.sponsorEmail} ${c.reference || ''} ${c.notes || ''}`.toLowerCase().includes(q);
      });
  }, [contributions, query, sponsorFilter]);

  const totals = useMemo(() => {
    const total = filtered.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const thisMonth = filtered.filter((c) => {
      const d = new Date(c.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyTotal = thisMonth.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    return { total, count: filtered.length, monthlyTotal };
  }, [filtered]);

  function handleSave(e) {
    e.preventDefault();
    if (!form.sponsorEmail.trim() || !/^\S+@\S+\.\S+$/.test(form.sponsorEmail)) {
      return setError('Please enter a valid sponsor email.');
    }
    if (!form.amount || Number(form.amount) <= 0) {
      return setError('Please enter a positive amount.');
    }
    setError('');

    // Ensure the sponsor exists in the store
        let sponsor = getSponsorByEmail(form.sponsorEmail);
    if (!sponsor) {
      // Auto-create a sponsor record
      sponsor = upsertSponsor({
        email: form.sponsorEmail,
        name: form.sponsorName || null,
      });
    }

    createContribution({
      sponsorId: sponsor.id,
      sponsorEmail: form.sponsorEmail.trim().toLowerCase(),
      programId: form.programId,
      amount: Number(form.amount),
      currency: form.currency,
      frequency: form.frequency,
      method: form.method,
      reference: form.reference.trim() || null,
      notes: form.notes.trim() || null,
    });

    setForm({
      sponsorEmail: '',
      sponsorName: '',
      programId: 'education-access',
      amount: '',
      currency: 'USD',
      frequency: 'one_time',
      method: 'pending',
      reference: '',
      notes: '',
    });
    setShowModal(false);
    refresh();
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this contribution?')) return;
    deleteContribution(id);
    refresh();
  }

  function getProgramLabel(id) {
    return FOUNDATION_PROGRAMS.find((p) => p.id === id)?.label || id;
  }

  const selectedSponsor = sponsorFilter !== 'all' ? sponsors.find((s) => s.id === sponsorFilter) : null;

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-emerald-700">
                Foundation
              </p>
              <h1 className="font-display text-2xl font-bold text-navy-900">Contributions</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-navy-600">
            {selectedSponsor
              ? `Contributions from ${selectedSponsor.name || selectedSponsor.email}.`
              : 'Every gift made to the Foundation. Auto-links sponsors by email.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
        >
          <Plus size={16} />
          Record Contribution
        </button>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Tile icon={DollarSign} label="Total" value={`$${totals.total.toLocaleString()}`} />
        <Tile icon={Calendar} label="This Month" value={`$${totals.monthlyTotal.toLocaleString()}`} />
        <Tile icon={DollarSign} label="Contributions" value={totals.count} />
      </div>

      <div className="relative mb-6">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email, reference or note…"
          className="w-full rounded-2xl border border-navy-100 bg-white py-3 pl-11 pr-4 font-body text-sm outline-none placeholder:text-navy-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center">
          <DollarSign size={32} className="mx-auto text-navy-300" />
          <h3 className="mt-4 font-display text-lg font-bold text-navy-900">No contributions</h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
            Record a contribution to start tracking Foundation funding.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b border-navy-100 bg-cream/40">
              <tr>
                <th className="px-5 py-3 text-left font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">Sponsor</th>
                <th className="hidden px-5 py-3 text-left font-body text-[11px] font-bold uppercase tracking-wider text-navy-500 sm:table-cell">Program</th>
                <th className="px-5 py-3 text-right font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">Amount</th>
                <th className="hidden px-5 py-3 text-left font-body text-[11px] font-bold uppercase tracking-wider text-navy-500 lg:table-cell">Date</th>
                <th className="w-16 px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-cream/30">
                  <td className="px-5 py-4">
                    <p className="font-body text-sm font-semibold text-navy-900">
                      {c.sponsorEmail || '—'}
                    </p>
                    {c.reference && (
                      <p className="mt-0.5 font-body text-[11px] text-navy-400">Ref {c.reference}</p>
                    )}
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {getProgramLabel(c.programId)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <p className="font-display text-base font-bold text-emerald-700">
                      {c.currency === 'USD' ? '$' : `${c.currency} `}
                      {Number(c.amount).toLocaleString()}
                    </p>
                    <p className="mt-0.5 font-body text-[10px] uppercase tracking-wider text-navy-400">
                      {FREQUENCIES.find((f) => f.id === c.frequency)?.label}
                    </p>
                  </td>
                  <td className="hidden px-5 py-4 lg:table-cell">
                    <p className="font-body text-xs text-navy-600">
                      {new Date(c.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="rounded-lg p-2 text-navy-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Record Contribution">
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Sponsor email *" id="sponsorEmail">
              <input
                id="sponsorEmail"
                type="email"
                value={form.sponsorEmail}
                onChange={(e) => setForm({ ...form, sponsorEmail: e.target.value })}
                placeholder="sponsor@example.com"
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
              <p className="mt-1 font-body text-xs text-navy-400">
                If the sponsor doesn't exist yet, a new record will be created automatically.
              </p>
            </Field>

            <Field label="Sponsor name (if new)" id="sponsorName">
              <input
                id="sponsorName"
                type="text"
                value={form.sponsorName}
                onChange={(e) => setForm({ ...form, sponsorName: e.target.value })}
                placeholder="Only needed if this is a new sponsor"
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Program *" id="programId">
                <select
                  id="programId"
                  value={form.programId}
                  onChange={(e) => setForm({ ...form, programId: e.target.value })}
                  className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500"
                >
                  {FOUNDATION_PROGRAMS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Amount *" id="amount">
                <div className="relative">
                  <input
                    id="amount"
                    type="number"
                    min="1"
                    step="any"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="100"
                    className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                  />
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-navy-100 bg-white px-2 py-1 font-body text-xs"
                  >
                    <option value="USD">USD</option>
                    <option value="KES">KES</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Frequency" id="frequency">
                <select
                  id="frequency"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Method" id="method">
                <select
                  id="method"
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500"
                >
                  {METHODS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Reference (M-Pesa code, transaction ID)" id="reference">
              <input
                id="reference"
                type="text"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="e.g. QJ12ABC34D"
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
            </Field>

            <Field label="Notes" id="notes">
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional info"
                className="w-full resize-y rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
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
                Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Tile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={18} />
      </div>
      <p className="mt-3 font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">{label}</p>
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