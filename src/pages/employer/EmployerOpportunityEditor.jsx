import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Loader2, Save } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState } from '../../components/portal/PortalStates.jsx';
import {
  createMyOrganisationOpportunity,
  updateMyOrganisationOpportunity,
} from '../../lib/supabase/organisations';
import { supabase } from '../../lib/supabase/client';

const OPPORTUNITY_TYPES = ['internship', 'job', 'attachment', 'apprenticeship', 'project', 'freelance', 'challenge', 'volunteer', 'mentorship'];
const LEVELS = ['Entry', 'Intermediate', 'Advanced'];
const MODES = ['On-site', 'Hybrid', 'Remote'];
const METHODS = [
  { value: 'internal', label: 'In-platform only' },
  { value: 'external', label: 'External link only' },
  { value: 'both', label: 'Both' },
];

const EMPTY_FORM = {
  title: '',
  opportunity_type: 'internship',
  category: '',
  description: '',
  skillsText: '',
  level: '',
  mode: '',
  location: '',
  duration: '',
  compensation: '',
  start_date: '',
  closing_date: '',
  requirementsText: '',
  application_url: '',
  application_method: 'both',
  status: 'published',
};

function Field({ label, hint, children, required }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-body text-sm font-bold text-navy-900">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      {hint && <span className="font-body text-xs text-navy-400">{hint}</span>}
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15';

export default function EmployerOpportunityEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [form, setForm] = useState(EMPTY_FORM);
  const [state, setState] = useState({ loading: !isNew, saving: false, error: '' });

  useEffect(() => {
    if (isNew) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const { supabase: client } = await import('../../lib/supabase/client.js');
        if (!client) throw new Error('Supabase is not configured.');
        const { data, error } = await client
          .from('career_opportunities')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Opportunity not found.');
        if (cancelled) return;
        setForm({
          title: data.title || '',
          opportunity_type: data.opportunity_type || 'internship',
          category: data.category || '',
          description: data.description || '',
          skillsText: (data.skills || []).join(', '),
          level: data.level || '',
          mode: data.mode || '',
          location: data.location || '',
          duration: data.duration || '',
          compensation: data.compensation || '',
          start_date: data.start_date || '',
          closing_date: data.closing_date || '',
          requirementsText: (data.requirements || []).join('\n'),
          application_url: data.application_url || '',
          application_method: data.application_method || 'both',
          status: data.status || (data.published ? 'published' : 'draft'),
        });
        setState((s) => ({ ...s, loading: false }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[OpportunityEditor] load failed:', err);
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: 'Could not load this opportunity.' }));
      }
    })();

    return () => { cancelled = true; };
  }, [id, isNew]);

  async function handleSubmit(e) {
    e.preventDefault();
    setState((s) => ({ ...s, saving: true, error: '' }));

    const payload = {
      title: form.title,
      opportunity_type: form.opportunity_type,
      category: form.category || null,
      description: form.description,
      skills: form.skillsText.split(',').map((s) => s.trim()).filter(Boolean),
      level: form.level || null,
      mode: form.mode || null,
      location: form.location,
      duration: form.duration,
      compensation: form.compensation,
      start_date: form.start_date || null,
      closing_date: form.closing_date || null,
      requirements: form.requirementsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      application_url: form.application_url,
      application_method: form.application_method,
      status: form.status,
    };

    try {
      if (isNew) {
        await createMyOrganisationOpportunity(payload);
      } else {
        await updateMyOrganisationOpportunity(id, payload);
      }
      navigate('/employer/opportunities');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[OpportunityEditor] save failed:', err);
      setState((s) => ({
        ...s,
        saving: false,
        error:
          err?.message?.includes('Supabase')
            ? 'Saving is unavailable because Supabase has not been configured.'
            : 'Could not save this opportunity. Please try again.',
      }));
    }
  }

  if (state.loading) {
    return (
      <>
        <Seo title="Opportunity | Employer Portal" description="Edit opportunity." path="/employer/opportunities" />
        <SectionCard className="mt-6">
          <LoadingState />
        </SectionCard>
      </>
    );
  }

  return (
    <>
      <Seo
        title={isNew ? 'New Opportunity | Employer Portal' : 'Edit Opportunity | Employer Portal'}
        description="Post or edit an opportunity."
        path="/employer/opportunities"
      />

      <div>
        <Link
          to="/employer/opportunities"
          className="inline-flex items-center gap-2 font-body text-xs font-semibold text-navy-500 hover:text-navy-900"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          All Opportunities
        </Link>
        <p className="mt-3 font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
          Employer Portal
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          {isNew ? 'Post a new opportunity' : 'Edit opportunity'}
        </h1>
      </div>

      <SectionCard className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {state.error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
              <p className="font-body text-sm text-rose-700">{state.error}</p>
            </div>
          )}

          <Field label="Title" required>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="e.g. Electrical Engineering Internship"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Opportunity type" required>
              <select
                value={form.opportunity_type}
                onChange={(e) => setForm({ ...form, opportunity_type: e.target.value })}
                className={inputClass}
              >
                {OPPORTUNITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
                placeholder="e.g. Engineering"
              />
            </Field>
          </div>

          <Field label="Description" required>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              placeholder="What is this opportunity? Who is it for?"
            />
          </Field>

          <Field label="Skills" hint="Comma-separated">
            <input
              value={form.skillsText}
              onChange={(e) => setForm({ ...form, skillsText: e.target.value })}
              className={inputClass}
              placeholder="Python, CAD, Communication"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Level">
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className={inputClass}
              >
                <option value="">Any level</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Mode">
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className={inputClass}
              >
                <option value="">Not specified</option>
                {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputClass}
                placeholder="Nairobi"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duration">
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className={inputClass}
                placeholder="e.g. 3 months"
              />
            </Field>
            <Field label="Compensation">
              <input
                value={form.compensation}
                onChange={(e) => setForm({ ...form, compensation: e.target.value })}
                className={inputClass}
                placeholder="e.g. Paid, Unpaid, KES 20,000/month"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <input
                type="date"
                value={form.start_date || ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Closing date">
              <input
                type="date"
                value={form.closing_date || ''}
                onChange={(e) => setForm({ ...form, closing_date: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Requirements" hint="One per line">
            <textarea
              rows={4}
              value={form.requirementsText}
              onChange={(e) => setForm({ ...form, requirementsText: e.target.value })}
              className={inputClass}
              placeholder={'Minimum age 18\nBasic computer literacy\n…'}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Application method">
              <select
                value={form.application_method}
                onChange={(e) => setForm({ ...form, application_method: e.target.value })}
                className={inputClass}
              >
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </Field>
            <Field label="External application URL">
              <input
                type="url"
                value={form.application_url}
                onChange={(e) => setForm({ ...form, application_url: e.target.value })}
                className={inputClass}
                placeholder="https://"
              />
            </Field>
          </div>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputClass}
            >
              <option value="published">Published — visible to learners</option>
              <option value="draft">Draft — hidden from learners</option>
            </select>
          </Field>

          <div className="flex flex-wrap gap-3 border-t border-navy-100 pt-5">
            <button
              type="submit"
              disabled={state.saving || !form.title.trim()}
              className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-60"
            >
              {state.saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={15} aria-hidden="true" />
                  {isNew ? 'Publish Opportunity' : 'Save Changes'}
                </>
              )}
            </button>
            <Link
              to="/employer/opportunities"
              className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-5 py-2.5 font-body text-sm font-semibold text-navy-700 transition hover:border-gold-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </SectionCard>
    </>
  );
}