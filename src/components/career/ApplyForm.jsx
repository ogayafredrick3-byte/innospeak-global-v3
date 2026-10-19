import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getMyApplicationForOpportunity,
  submitApplication,
} from '../../lib/supabase/career';

/**
 * ApplyForm — inline application form for opportunities with
 * application_method = 'internal' | 'both'.
 *
 * States:
 *   - not signed in   → prompt to sign in
 *   - already applied → summary card with link to My Applications
 *   - ready           → form
 *   - submitting      → disabled button
 *   - success         → success panel
 */
export default function ApplyForm({ opportunity, onApplied }) {
  const { user } = useAuth();
  const [state, setState] = useState({
    checking: true,
    existing: null,
    submitting: false,
    success: false,
    error: '',
  });
  const [form, setForm] = useState({
    message: '',
    phone: '',
    portfolio_url: '',
    resume_url: '',
  });

  // Check for an existing application when the user is signed in
  useEffect(() => {
    if (!user) {
      setState((s) => ({ ...s, checking: false, existing: null }));
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, checking: true }));
    getMyApplicationForOpportunity(opportunity.id)
      .then((existing) => {
        if (!cancelled) setState((s) => ({ ...s, checking: false, existing: existing || null }));
      })
      .catch(() => {
        // Silent — treat as "no existing application"
        if (!cancelled) setState((s) => ({ ...s, checking: false, existing: null }));
      });
    return () => { cancelled = true; };
  }, [user, opportunity.id]);

  // ── Not signed in ─────────────────────────────────────────
  if (!user) {
    return (
      <div className="rounded-2xl border border-navy-100 bg-cream p-5">
        <p className="font-body text-sm font-bold text-navy-900">
          Sign in to apply
        </p>
        <p className="mt-1 font-body text-xs text-navy-500">
          You need an InnoSpeak Global account to apply through the platform.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/login" className="btn-gold inline-flex items-center gap-2 text-sm">
            Sign In
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link to="/signup" className="btn-outline inline-flex items-center gap-2 text-sm">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // ── Checking ──────────────────────────────────────────────
  if (state.checking) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-navy-100 bg-white p-5">
        <Loader2 size={16} className="animate-spin text-gold-600" aria-hidden="true" />
        <p className="font-body text-sm text-navy-500">Checking your application status…</p>
      </div>
    );
  }

  // ── Already applied ───────────────────────────────────────
  if (state.existing) {
    const isWithdrawn = state.existing.status === 'withdrawn';
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-600" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm font-bold text-navy-900">
              {isWithdrawn ? 'You withdrew this application' : 'Application submitted'}
            </p>
            <p className="mt-1 font-body text-xs text-navy-500">
              Submitted on {new Date(state.existing.created_at).toLocaleDateString()}
              {!isWithdrawn && ' · Status updates will appear in My Applications'}
            </p>
            <Link
              to="/learn/applications"
              className="mt-3 inline-flex items-center gap-1.5 font-body text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View My Applications
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success (just submitted) ──────────────────────────────
  if (state.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-600" aria-hidden="true" />
          <div>
            <p className="font-body text-sm font-bold text-navy-900">
              Application submitted
            </p>
            <p className="mt-1 font-body text-xs text-navy-500">
              The career team will review your application. Track it in My Applications.
            </p>
            <Link
              to="/learn/applications"
              className="mt-3 inline-flex items-center gap-1.5 font-body text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View My Applications
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Form ──────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setState((s) => ({ ...s, submitting: true, error: '' }));
    try {
      await submitApplication(opportunity.id, form);
      setState((s) => ({ ...s, submitting: false, success: true }));
      onApplied?.();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ApplyForm] submit failed:', err);
      setState((s) => ({
        ...s,
        submitting: false,
        error:
          err?.message?.includes('duplicate')
            ? 'You have already applied to this opportunity.'
            : 'Could not submit your application right now. Please try again.',
      }));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2"
          >
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-rose-600" aria-hidden="true" />
            <p className="font-body text-sm text-rose-700">{state.error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label htmlFor="apply-message" className="font-body text-sm font-bold text-navy-900">
          Why are you a good fit?
        </label>
        <textarea
          id="apply-message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
          required
          placeholder="Briefly describe your relevant skills, experience or interest…"
          className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 shadow-sm outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="apply-phone" className="font-body text-sm font-bold text-navy-900">
            Phone <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id="apply-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+254 …"
            className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 shadow-sm outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
          />
        </div>
        <div>
          <label htmlFor="apply-portfolio" className="font-body text-sm font-bold text-navy-900">
            Portfolio URL <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id="apply-portfolio"
            type="url"
            value={form.portfolio_url}
            onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
            placeholder="https://"
            className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 shadow-sm outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
          />
        </div>
      </div>

      <div>
        <label htmlFor="apply-resume" className="font-body text-sm font-bold text-navy-900">
          Resume URL <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <input
          id="apply-resume"
          type="url"
          value={form.resume_url}
          onChange={(e) => setForm({ ...form, resume_url: e.target.value })}
          placeholder="https://"
          className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 shadow-sm outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
        />
      </div>

      <p className="font-body text-xs text-navy-400">
        By applying, you agree to share your InnoSpeak career profile with the
        organisation reviewing this opportunity.
      </p>

      <button
        type="submit"
        disabled={state.submitting}
        className="btn-gold inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-sm disabled:opacity-60"
      >
        {state.submitting ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            Submitting…
          </>
        ) : (
          <>
            <Send size={15} aria-hidden="true" />
            Submit Application
          </>
        )}
      </button>
    </form>
  );
}