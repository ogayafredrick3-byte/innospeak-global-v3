import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import TextField from '../../components/ui/TextField.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateOwnPassword } from '../../lib/supabase/auth';

export default function TeachSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handlePassword(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateOwnPassword(form.password);
      setSuccess('Password updated successfully.');
      setForm({ password: '', confirm: '' });
    } catch {
      setError('Could not update password. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Seo title="Settings" description="Manage your tutor account settings." path="/teach/settings" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Settings</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Manage your account and preferences.</p>
      </div>

      <div className="mt-6 max-w-2xl space-y-6">
        <SectionCard title="Account">
          <div className="space-y-3">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Email</p>
              <p className="mt-1 font-body text-sm text-navy-800">{user?.email || '—'}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Change Password">
          {error && <p className="mb-4 font-body text-sm font-semibold text-red-500">{error}</p>}
          {success && <p className="mb-4 font-body text-sm font-semibold text-emerald-600">{success}</p>}
          <form onSubmit={handlePassword} className="space-y-4">
            <TextField label="New Password" name="password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
            <TextField label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} required />
            <button type="submit" disabled={saving} className="btn-gold inline-flex items-center justify-center gap-2 disabled:opacity-60">
              <SettingsIcon size={16} />
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </SectionCard>
      </div>
    </>
  );
}
