import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Banknote, Plus, Search, Trash2, X, ExternalLink, Receipt,
} from 'lucide-react';
import {
  getDisbursements,
  createDisbursement,
  deleteDisbursement,
  DISBURSEMENT_CATEGORIES,
  getCategoryLabel,
} from '../../lib/data/disbursementStore.js';
import { getApplications } from '../../lib/data/foundationAppStore.js';

export default function FoundationDisbursements() {
  const [disbursements, setDisbursements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    applicationId: '',
    studentEmail: '',
    studentName: '',
    category: 'tuition',
    amount: '',
    currency: 'USD',
    reference: '',
    receiptUrl: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    setDisbursements(getDisbursements());
    setApplications(getApplications());
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return disbursements.filter((d) => {
      if (!q) return true;
      return `${d.studentEmail} ${d.studentName} ${d.reference || ''} ${d.notes || ''}`.toLowerCase().includes(q);
    });
  }, [disbursements, query]);

  const totals = useMemo(() => {
    const total = filtered.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const byCategory = filtered.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + Number(d.amount || 0);
      return acc;
    }, {});
    return { total, count: filtered.length, byCategory };
  }, [filtered]);

  function handleSave(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return setError('Enter a positive amount.');
    if (!form.applicationId && !form.studentEmail) {
      return setError('Link to an application or enter a student email.');
    }
    setError('');

    createDisbursement({
      applicationId: form.applicationId || null,
      studentEmail: form.studentEmail.trim() || null,
      studentName: form.studentName.trim() || null,
      category: form.category,
      amount: Number(form.amount),
      currency: form.currency,
      reference: form.reference.trim() || null,
      receiptUrl: form.receiptUrl.trim() || null,
      notes: form.notes.trim() || null,
      recordedBy: 'admin',
    });

    setForm({
      applicationId: '',
      studentEmail: '',
      studentName: '',
      category: 'tuition',
      amount: '',
      currency: 'USD',
      reference: '',
      receiptUrl: '',
      notes: '',
    });
    setShowModal(false);
    refresh();
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this disbursement record?')) return;
    deleteDisbursement(id);
    refresh();
  }

  function handleSelectApplication(appId) {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;
    setForm((prev) => ({
      ...prev,
      applicationId: app.id,
      studentEmail: app.userEmail || '',
      studentName: app.userName || '',
    }));
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
              <Banknote size={20} />
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-emerald-700">
                Foundation
              </p>
              <h1 className="font-display text-2xl font-bold text-navy-900">Disbursements</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-navy-600">
            Record every payout. Learners see these in their portal. Sponsors see the total against their program.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
        >
          <Plus size={16} />
          Record Disbursement
        </button>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Tile icon={Banknote} label="Total Disbursed" value={`$${totals.total.toLocaleString()}`} />
        <Tile icon={Receipt} label="Records" value={totals.count} />
        <Tile
          icon={Banknote}
          label="Top Category"
          value={
            Object.keys(totals.byCategory).length > 0
              ? getCategoryLabel(
                  Object.entries(totals.byCategory).sort((a, b) => b[1] - a[1])[0][0]
                )
              : '—'
          }
        />
      </div>

      {/* Category summary */}
      {Object.keys(totals.byCategory).length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(totals.byCategory).map(([cat, amt]) => (
            <span
              key={cat}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-body text-xs font-semibold text-emerald-800"
            >
              {getCategoryLabel(cat)}: ${amt.toLocaleString()}
            </span>
          ))}
        </div>
      )}

      <div className="relative mb-6">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by student, reference or notes…"
          className="w-full rounded-2xl border border-navy-100 bg-white py-3 pl-11 pr-4 font-body text-sm outline-none placeholder:text-navy-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center">
          <Banknote size={32} className="mx-auto text-navy-300" />
          <h3 className="mt-4 font-display text-lg font-bold text-navy-900">No disbursements</h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
            Record a payout to start tracking support delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    {getCategoryLabel(d.category)}
                  </span>
                  {d.reference && (
                    <span className="font-mono text-[11px] text-navy-400">
                      Ref {d.reference}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-body text-sm font-bold text-navy-900">
                  {d.studentName || d.studentEmail || 'Unnamed recipient'}
                </p>
                {d.studentEmail && d.studentName && (
                  <p className="mt-0.5 font-body text-xs text-navy-500">
                    {d.studentEmail}
                  </p>
                )}
                {d.notes && (
                  <p className="mt-1 line-clamp-1 font-body text-xs italic text-navy-500">
                    {d.notes}
                  </p>
                )}
                <p className="mt-1 font-body text-[11px] text-navy-400">
                  {new Date(d.recordedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-bold text-emerald-700">
                  {d.currency === 'USD' ? '$' : `${d.currency} `}
                  {Number(d.amount).toLocaleString()}
                </span>
                {d.receiptUrl && (
                  <a
                    href={d.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-navy-100 p-2 text-navy-600 hover:border-emerald-400 hover:text-emerald-700"
                    aria-label="View receipt"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(d.id)}
                  className="rounded-lg p-2 text-navy-500 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Record Disbursement">
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Link to application" id="applicationId">
              <select
                id="applicationId"
                value={form.applicationId}
                onChange={(e) => handleSelectApplication(e.target.value)}
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500"
              >
                <option value="">— None (manual) —</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.reference} — {a.userName || a.userEmail}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Student name" id="studentName">
                <input
                  id="studentName"
                  type="text"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                />
              </Field>
              <Field label="Student email" id="studentEmail">
                <input
                  id="studentEmail"
                  type="email"
                  value={form.studentEmail}
                  onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" id="category">
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500"
                >
                  {DISBURSEMENT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
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
              <Field label="Reference" id="reference">
                <input
                  id="reference"
                  type="text"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="M-Pesa code, receipt no."
                  className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                />
              </Field>
              <Field label="Receipt URL" id="receiptUrl">
                <input
                  id="receiptUrl"
                  type="url"
                  value={form.receiptUrl}
                  onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                />
              </Field>
            </div>

            <Field label="Notes" id="notes">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional detail"
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