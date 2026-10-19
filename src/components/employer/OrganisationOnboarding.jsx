import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Building2, Loader2 } from 'lucide-react';
import { createOrganisation } from '../../lib/supabase/organisations';

export default function OrganisationOnboarding() {
  const [form, setForm] = useState({
    name: '',
    industry: '',
    website: '',
    description: '',
    location: '',
    contact_email: '',
    contact_phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createOrganisation(form);
      window.location.reload();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Onboarding] create failed:', err);
      setError(
        err?.message?.includes('Supabase')
          ? 'Organisation setup is unavailable because Supabase has not been configured yet.'
          : 'Could not create your organisation. Please try again or contact support.'
      );
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="container-premium py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-700">
              <Building2 size={26} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="mt-5 font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
              Employer Portal
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
              Set up your organisation
            </h1>
            <p className="mx-auto mt-3 max-w-lg font-body text-sm leading-6 text-navy-500">
              Tell us about your organisation. You&apos;ll use it to post
              opportunities and connect with emerging talent on InnoSpeak Global.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-premium sm:p-8"
          >
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
                <p className="font-body text-sm text-rose-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="org-name" className="font-body text-sm font-bold text-navy-900">
                Organisation name *
              </label>
              <input
                id="org-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="org-industry" className="font-body text-sm font-bold text-navy-900">
                  Industry
                </label>
                <input
                  id="org-industry"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  placeholder="e.g. Technology, Education"
                  className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                />
              </div>
              <div>
                <label htmlFor="org-location" className="font-body text-sm font-bold text-navy-900">
                  Location
                </label>
                <input
                  id="org-location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Nairobi, Kenya"
                  className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="org-website" className="font-body text-sm font-bold text-navy-900">
                Website
              </label>
              <input
                id="org-website"
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://"
                className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
              />
            </div>

            <div>
              <label htmlFor="org-description" className="font-body text-sm font-bold text-navy-900">
                About your organisation
              </label>
              <textarea
                id="org-description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A short description learners will see…"
                className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="org-email" className="font-body text-sm font-bold text-navy-900">
                  Contact email
                </label>
                <input
                  id="org-email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                />
              </div>
              <div>
                <label htmlFor="org-phone" className="font-body text-sm font-bold text-navy-900">
                  Contact phone
                </label>
                <input
                  id="org-phone"
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="btn-gold inline-flex w-full items-center justify-center gap-2 px-6 py-3 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Creating organisation…
                </>
              ) : (
                <>
                  Create Organisation
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>

            <p className="text-center font-body text-xs text-navy-400">
              You can update these details at any time from your organisation profile.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}