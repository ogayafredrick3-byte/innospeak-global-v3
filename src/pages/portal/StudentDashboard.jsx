import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Wallet, BookOpenCheck, Bell, TriangleAlert, ShieldCheck, Heart } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import StatCard from '../../components/portal/StatCard.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { useAuth } from '../../context/AuthContext';
import {
  getMyRegistrations,
  getAcademicRecords,
  computeGpa,
  getFeeTransactions,
  computeFeeBalance,
  getAnnouncements,
  getMyMessages,
  getCurrentSemester,
} from '../../lib/supabase/studentPortal';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getMyRegistrations(),
      getAcademicRecords(),
      getFeeTransactions(),
      getAnnouncements(),
      getMyMessages(),
      getCurrentSemester(),
    ])
      .then(([registrations, records, transactions, announcements, messages, semester]) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          data: { registrations, records, transactions, announcements, messages, semester },
        });
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, error: err.message || 'Could not load your dashboard.', data: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeRegistrations = (state.data?.registrations || []).filter((r) => r.status === 'registered');
  const gpa = computeGpa(state.data?.records);
  const feeBalance = computeFeeBalance(state.data?.transactions);
  const unreadMessages = (state.data?.messages || []).filter((m) => !m.is_read).length;

  const alerts = [];
  if (feeBalance > 0) {
    alerts.push({ id: 'fee', text: `You have an outstanding fee balance of KES ${feeBalance.toLocaleString()}.` });
  }
  (state.data?.announcements || []).slice(0, 3).forEach((a) => alerts.push({ id: a.id, text: a.title }));

  return (
    <>
      <Seo title="My Dashboard" description="Your InnoSpeak Global student dashboard." path="/portal" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          {profile?.program_id ? 'Here is where things stand this semester.' : 'A quick look at your academic and financial status.'}
        </p>
      </div>

      {profile?.role === 'admin' && (
        <Link
          to="/admin"
          className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-gold-300/60 bg-gold-50 px-5 py-4 shadow-premium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-premium-lg"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-700 ring-1 ring-gold-500/30">
              <ShieldCheck size={18} />
            </span>
            <span>
              <span className="block font-body text-sm font-semibold text-navy-900">Staff Panel</span>
              <span className="block font-body text-xs text-navy-500">
                Manage students, programs, requests, and more
              </span>
            </span>
          </span>
          <span className="font-body text-sm font-semibold text-gold-700">Open &rarr;</span>
        </Link>
      )}

      {/* Foundation quick link */}
      <Link
        to="/portal/foundation"
        className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-premium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-premium-lg"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md">
            <Heart size={18} />
          </span>
          <span>
            <span className="block font-body text-sm font-semibold text-navy-900">
              Foundation Support
            </span>
            <span className="block font-body text-xs text-navy-500">
              Apply for and track your Foundation applications
            </span>
          </span>
        </span>
        <span className="font-body text-sm font-semibold text-emerald-700">
          Open &rarr;
        </span>
      </Link>

      {/* A. Student identity summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Student ID" value={profile?.student_number || '—'} />
        <StatCard label="Program" value={profile?.department || 'Not yet assigned'} />
        <StatCard label="Level / Year" value={profile?.level_year || '—'} />
        <StatCard label="Status" value={profile?.student_status || 'active'} />
      </div>

      {state.loading && <div className="mt-8"><LoadingState /></div>}
      {!state.loading && state.error && <div className="mt-8"><ErrorState message={state.error} /></div>}

      {!state.loading && !state.error && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={BookOpenCheck} label="Registered Units" value={activeRegistrations.length} hint="This semester" />
            <StatCard icon={GraduationCap} label="GPA" value={gpa ?? '—'} hint="Cumulative" />
            <StatCard
              icon={Wallet}
              label="Fee Balance"
              value={`KES ${feeBalance.toLocaleString()}`}
              hint={feeBalance > 0 ? 'Balance due' : 'Cleared'}
            />
            <StatCard icon={Bell} label="Unread Messages" value={unreadMessages} />
          </div>

          <div className="mt-6">
            <SectionCard title="Important Alerts" description="Announcements and items needing your attention.">
              {alerts.length === 0 ? (
                <EmptyState icon={Bell} title="You're all caught up" message="No new alerts right now." />
              ) : (
                <ul className="space-y-3">
                  {alerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="flex items-start gap-3 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 font-body text-sm text-navy-800"
                    >
                      <TriangleAlert size={16} className="mt-0.5 shrink-0 text-gold-700" />
                      <span>{alert.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </>
  );
}