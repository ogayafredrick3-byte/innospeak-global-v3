import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import TextField from '../../components/ui/TextField.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { ErrorState } from '../../components/portal/PortalStates.jsx';
import { useAuth } from '../../context/AuthContext';
import { updateStudentProfile } from '../../lib/supabase/studentPortal';

const FIELD_GROUPS = [
  {
    title: 'Personal Information',
    description: 'Your basic identity details on file with the institution.',
    fields: [
      { name: 'full_name', label: 'Full Name' },
      { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
      { name: 'gender', label: 'Gender' },
      { name: 'national_id', label: 'National ID / Passport No.' },
    ],
  },
  {
    title: 'Contact Information',
    description: 'How the institution reaches you.',
    fields: [
      { name: 'phone', label: 'Phone Number' },
      { name: 'address', label: 'Address' },
    ],
  },
  {
    title: 'Emergency Contact',
    description: 'Who we should contact in case of an emergency.',
    fields: [
      { name: 'emergency_contact_name', label: 'Contact Name' },
      { name: 'emergency_contact_phone', label: 'Contact Phone' },
      { name: 'emergency_contact_relationship', label: 'Relationship' },
    ],
  },
  {
    title: 'Next of Kin',
    description: 'Your registered next of kin.',
    fields: [
      { name: 'next_of_kin_name', label: 'Full Name' },
      { name: 'next_of_kin_phone', label: 'Phone Number' },
      { name: 'next_of_kin_relationship', label: 'Relationship' },
    ],
  },
];

export default function Profile() {
  const { profile } = useAuth();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  function handleChange(name) {
    return (e) => {
      setSaved(false);
      setForm((prev) => ({ ...prev, [name]: e.target.value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updates = {};
      FIELD_GROUPS.flatMap((g) => g.fields).forEach(({ name }) => {
        updates[name] = form[name] ?? null;
      });
      await updateStudentProfile(updates);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Seo title="My Profile" description="Manage your student profile." path="/portal/profile" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Profile</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Keep your personal, contact and emergency details up to date.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {FIELD_GROUPS.map((group) => (
          <SectionCard key={group.title} title={group.title} description={group.description}>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.fields.map((field) => (
                <TextField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type || 'text'}
                  value={form[field.name] || ''}
                  onChange={handleChange(field.name)}
                />
              ))}
            </div>
          </SectionCard>
        ))}

        {error && <ErrorState message={error} />}
        {saved && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-body text-sm text-emerald-800">
            Your profile has been updated.
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-gold inline-flex items-center gap-2 disabled:opacity-60">
          <Save size={16} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </>
  );
}
