import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState } from '../../components/portal/PortalStates.jsx';
import { getLmsOverview } from '../../lib/supabase/lms';

export default function AdminLmsOverview() {
  const [state, setState] = useState({ loading: true, error: null, overview: null });

  useEffect(() => {
    getLmsOverview()
      .then((overview) => setState({ loading: false, error: null, overview }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load E-Learning analytics.', overview: null }));
  }, []);

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  const { overview } = state;

  return (
    <>
      <Seo title="E-Learning Overview" description="System-wide learning analytics." path="/admin/lms" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">E-Learning Overview</h1>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SectionCard>
          <p className="font-body text-xs font-semibold uppercase text-navy-500">Courses</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy-900">{overview.total_courses}</p>
          <p className="mt-1 font-body text-xs text-navy-500">{overview.published_courses} published · {overview.draft_courses} draft</p>
        </SectionCard>
        <SectionCard>
          <p className="font-body text-xs font-semibold uppercase text-navy-500">Students</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy-900">{overview.students}</p>
        </SectionCard>
        <SectionCard>
          <p className="font-body text-xs font-semibold uppercase text-navy-500">Instructors</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy-900">{overview.instructors}</p>
        </SectionCard>
        <SectionCard>
          <p className="font-body text-xs font-semibold uppercase text-navy-500">Active Learners (14d)</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy-900">{overview.active_learners_last_14_days}</p>
        </SectionCard>
      </div>

      <SectionCard title="Overall Completion Rate" className="mt-6">
        <div className="flex items-center gap-4">
          <p className="font-display text-4xl font-bold text-gold-700">{overview.overall_completion_rate_percent}%</p>
          <div className="h-3 flex-1 rounded-full bg-navy-100">
            <div className="h-3 rounded-full bg-gold-500" style={{ width: `${overview.overall_completion_rate_percent}%` }} />
          </div>
        </div>
      </SectionCard>
    </>
  );
}
