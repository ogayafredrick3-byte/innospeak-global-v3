import { useEffect, useState } from 'react';
import { User, Mail, Phone, Globe, BookOpen } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState } from '../../components/portal/PortalStates.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getMyTutorApplication } from '../../lib/supabase/tutor.js';

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border-b border-navy-50 py-3 last:border-0">
      <Icon size={16} className="mt-0.5 shrink-0 text-navy-400" />
      <div className="flex-1">
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">{label}</p>
        <p className="mt-0.5 font-body text-sm text-navy-800">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function TeachProfile() {
  const { profile, user } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, app: null });

  useEffect(() => {
    getMyTutorApplication()
      .then((app) => setState({ loading: false, error: null, app }))
      .catch(() => setState({ loading: false, error: 'Could not load your profile.', app: null }));
  }, []);

  const app = state.app;

  return (
    <>
      <Seo title="My Profile" description="Your tutor profile." path="/teach/profile" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">My Profile</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Your tutor profile information as submitted in your application.</p>
      </div>

      <div className="mt-6">
        {state.loading && <SectionCard><LoadingState /></SectionCard>}
        {state.error && <SectionCard><ErrorState message={state.error} /></SectionCard>}
        {app && !state.loading && (
          <div className="space-y-6">
            <SectionCard title="Personal Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileRow icon={User} label="Full Name" value={app.full_name || profile?.full_name} />
                <ProfileRow icon={Mail} label="Email" value={app.email || user?.email} />
                <ProfileRow icon={Phone} label="Phone" value={app.phone} />
                <ProfileRow icon={Globe} label="Nationality" value={app.nationality} />
                <ProfileRow icon={User} label="Country" value={app.country} />
                <ProfileRow icon={User} label="City" value={app.city} />
              </div>
            </SectionCard>

            <SectionCard title="Education & Qualifications">
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileRow icon={BookOpen} label="Highest Qualification" value={app.highest_qualification} />
                <ProfileRow icon={BookOpen} label="Institution" value={app.institution} />
                <ProfileRow icon={BookOpen} label="Field of Study" value={app.field_of_study} />
                <ProfileRow icon={BookOpen} label="Year Completed" value={app.year_completed} />
              </div>
            </SectionCard>

            <SectionCard title="Teaching Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileRow icon={BookOpen} label="Years of Experience" value={app.years_experience} />
                <ProfileRow icon={User} label="Current Occupation" value={app.current_occupation} />
                <ProfileRow icon={Globe} label="Availability" value={app.availability} />
                <ProfileRow icon={BookOpen} label="Preferred Schedule" value={app.preferred_schedule} />
              </div>
              <div className="mt-4">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Subjects</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(app.subjects || []).map((s) => (
                    <span key={s} className="rounded-full bg-gold-500/10 px-3 py-1 font-body text-xs font-semibold text-gold-700 ring-1 ring-gold-500/20">{s}</span>
                  ))}
                  {(!app.subjects || app.subjects.length === 0) && <span className="font-body text-sm text-navy-400">—</span>}
                </div>
              </div>
              <div className="mt-4">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Languages</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(app.languages || []).map((l) => (
                    <span key={l} className="rounded-full bg-navy-50 px-3 py-1 font-body text-xs font-semibold text-navy-700 ring-1 ring-navy-600/10">{l}</span>
                  ))}
                  {(!app.languages || app.languages.length === 0) && <span className="font-body text-sm text-navy-400">—</span>}
                </div>
              </div>
              <div className="mt-4">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Teaching Bio</p>
                <p className="mt-1 font-body text-sm leading-relaxed text-navy-700">{app.bio || '—'}</p>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </>
  );
}
