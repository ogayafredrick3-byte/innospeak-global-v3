import { useEffect, useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, Loader2, Save } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState } from '../../components/portal/PortalStates.jsx';
import { getMyOrganisation, updateOrganisation } from '../../lib/supabase/organisations';

const inputClass =
  'w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15';

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-body text-sm font-bold text-navy-900">{label}</span>
      {children}
    </label>
  );
}

export default function OrganisationProfile() {
  const [state, setState] = useState({ loading: true, saving: false, error: '', success: false, org: null });
  const [form, setForm] = useState({
    name: '',
    industry: '',
    website: '',
    description: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
  });

  useEffect(() => {
    let cancelled = false;
    getMyOrganisation()
      .then((org) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, org }));
        if (org) {
          setForm({
            name: org.name || '',
            industry: org.industry || '',
            website: org.website || '',
            description: org.description || '',
            location: org.location || '',
            contact_email: org.contact_email || '',
            contact_phone: org.contact_phone || '',
            logo_url: org.logo_url || '',
          });
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[OrganisationProfile] load failed:', err);
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: 'Could not load your organisation.' }));
      });
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!state.org?.id) return;
    setState((s) => ({ ...s, saving: true, error: '', success: false }));
    try {
      await updateOrganisation(state.org.id, form);
      setState((s) => ({ ...s, saving: false, success: true }));
      setTimeout(() => setState((s) => ({ ...s, success: false })), 2500);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[OrganisationProfile] save failed:', err);
      setState((s) => ({ ...s, saving: false, error: 'Could not save changes. Please try again.' }));
    }
  }

  return (
    <>
      <Seo
        title="Organisation Profile | Employer Portal"
        description="Manage your organisation's public profile."
        path="/employer/profile"
      />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
          Employer Portal
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          Organisation Profile
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
          How your organisation appears on opportunities and to learners.
        </p>
      </div>

      {state.loading && (
        <SectionCard className="mt-6"><LoadingState /></SectionCard>
      )}

      {!state.loading && !state.org && (
        <SectionCard className="mt-6">
          <div className="flex items-start gap-3">
            <Building2 size={20} className="mt-0.5 text-navy-400" aria-hidden="true" />
            <p className="font-body text-sm text-navy-500">
              No organisation is linked to your account yet.
            </p>
          </div>
        </SectionCard>
      )}

      {!state.loading && state.org && (
        <SectionCard className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {state.error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
                <p className="font-body text-sm text-rose-700">{state.error}</p>
              </div>
            )}
            {state.success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <CheckCircle2 size={15} className="text-emerald-600" aria-hidden="true" />
                <p className="font-body text-sm text-emerald-800">Changes saved.</p>
              </div>
            )}

            <Field label="Organisation name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Industry">
                <input
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Location">
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Website">
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className={inputClass}
                placeholder="https://"
              />
            </Field>

            <Field label="Logo URL">
              <input
                type="url"
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                className={inputClass}
                placeholder="https://"
              />
            </Field>

            <Field label="About your organisation">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact email">
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Contact phone">
                <input
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="border-t border-navy-100 pt-5">
              <button
                type="submit"
                disabled={state.saving}
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </SectionCard>
      )}
    </>
  );
}