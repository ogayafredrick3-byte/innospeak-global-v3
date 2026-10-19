import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowLeft, CircleCheck as CheckCircle2, Circle as XCircle, CircleAlert as AlertCircle, Clock, FileText, ExternalLink, User, BookOpen, Briefcase, Globe, Calendar, Camera, Send } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  listTutorApplications, getTutorApplicationById,
  approveTutorApplication, rejectTutorApplication,
  requestTutorChanges, setTutorAppUnderReview,
  getTutorFileSignedUrl,
} from '../../lib/supabase/tutor.js';

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">{label}</p>
      <p className="mt-1 font-body text-sm text-navy-800">{value || '—'}</p>
    </div>
  );
}

function DetailSection({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-premium">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
          <Icon size={16} />
        </span>
        <h3 className="font-display text-base font-bold text-navy-900">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function DocLink({ label, path, icon: Icon }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    if (!path) return;
    setLoading(true);
    try {
      const signedUrl = await getTutorFileSignedUrl(path);
      setUrl(signedUrl);
      window.open(signedUrl, '_blank');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (!path) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-navy-100 bg-cream px-4 py-3">
        <Icon size={16} className="text-navy-300" />
        <span className="font-body text-sm text-navy-400">{label}: Not provided</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={loading}
      className="flex w-full items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 text-left transition-colors hover:bg-navy-50/60 disabled:opacity-60"
    >
      <Icon size={16} className="text-gold-600" />
      <span className="flex-1 truncate font-body text-sm font-medium text-navy-700">{label}</span>
      <ExternalLink size={14} className="text-navy-400" />
    </button>
  );
}

export default function TutorApplications() {
  const [list, setList] = useState({ loading: true, error: null, items: [] });
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState({ loading: false, error: null, data: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [notes, setNotes] = useState('');

  const loadList = useCallback(async () => {
    setList({ loading: true, error: null, items: [] });
    try {
      const items = await listTutorApplications();
      setList({ loading: false, error: null, items });
    } catch {
      setList({ loading: false, error: 'Could not load tutor applications.', items: [] });
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const loadDetail = useCallback(async (id) => {
    setSelectedId(id);
    setDetail({ loading: true, error: null, data: null });
    setNotes('');
    setActionError(null);
    try {
      const data = await getTutorApplicationById(id);
      setDetail({ loading: false, error: null, data });
      setNotes(data.reviewer_notes || '');
    } catch {
      setDetail({ loading: false, error: 'Could not load this application.', data: null });
    }
  }, []);

  async function handleAction(action) {
    if (!selectedId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (action === 'approve') {
        await approveTutorApplication(selectedId);
      } else if (action === 'reject') {
        if (!notes.trim()) {
          setActionError('Please provide feedback notes for the rejection.');
          setActionLoading(false);
          return;
        }
        await rejectTutorApplication(selectedId, notes);
      } else if (action === 'changes') {
        if (!notes.trim()) {
          setActionError('Please provide feedback notes for the change request.');
          setActionLoading(false);
          return;
        }
        await requestTutorChanges(selectedId, notes);
      } else if (action === 'review') {
        await setTutorAppUnderReview(selectedId);
      }
      await loadDetail(selectedId);
      await loadList();
    } catch {
      setActionError('Could not complete this action. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    {
      key: 'applicant',
      label: 'Applicant',
      render: (r) => (
        <button onClick={() => loadDetail(r.id)} className="text-left">
          <p className="font-body text-sm font-semibold text-navy-900 hover:text-gold-600">
            {r.full_name || r.profile?.full_name || '—'}
          </p>
          <p className="font-body text-xs text-navy-500">{r.email || r.profile?.email || '—'}</p>
        </button>
      ),
    },
    { key: 'subjects', label: 'Subjects', render: (r) => (r.subjects || []).join(', ') || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'submitted_at', label: 'Submitted', render: (r) => r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : 'Draft' },
    {
      key: 'action',
      label: '',
      render: (r) => (
        <button
          onClick={() => loadDetail(r.id)}
          className="font-body text-xs font-semibold text-gold-700 hover:text-gold-800"
        >
          Review →
        </button>
      ),
    },
  ];

  // Detail view
  if (selectedId) {
    const app = detail.data;
    const canAct = app && ['submitted', 'under_review', 'changes_requested', 'rejected'].includes(app.status);

    return (
      <>
        <Seo title="Tutor Application Review" description="Review tutor applications." path="/admin/tutor-applications" />

        <button
          onClick={() => { setSelectedId(null); setDetail({ loading: false, error: null, data: null }); }}
          className="inline-flex items-center gap-2 font-body text-sm font-semibold text-navy-600 hover:text-gold-600"
        >
          <ArrowLeft size={16} />
          Back to list
        </button>

        {detail.loading && (
          <div className="mt-6">
            <SectionCard><LoadingState /></SectionCard>
          </div>
        )}

        {detail.error && (
          <div className="mt-6">
            <SectionCard><ErrorState message={detail.error} /></SectionCard>
          </div>
        )}

        {app && !detail.loading && (
          <div className="mt-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
                <h1 className="mt-1 font-display text-2xl font-bold text-navy-900">{app.full_name || 'Applicant'}</h1>
                <p className="mt-1 font-body text-sm text-navy-500">{app.email}</p>
              </div>
              <StatusBadge status={app.status} className="text-sm" />
            </div>

            {/* Personal Info */}
            <DetailSection icon={User} title="Personal Information">
              <div className="grid gap-4 sm:grid-cols-3">
                <InfoRow label="Full Name" value={app.full_name} />
                <InfoRow label="Email" value={app.email} />
                <InfoRow label="Phone" value={app.phone} />
                <InfoRow label="Nationality" value={app.nationality} />
                <InfoRow label="Country" value={app.country} />
                <InfoRow label="City" value={app.city} />
              </div>
            </DetailSection>

            {/* Education */}
            <DetailSection icon={BookOpen} title="Education & Qualifications">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Highest Qualification" value={app.highest_qualification} />
                <InfoRow label="Institution" value={app.institution} />
                <InfoRow label="Field of Study" value={app.field_of_study} />
                <InfoRow label="Year Completed" value={app.year_completed} />
              </div>
            </DetailSection>

            {/* Teaching Experience */}
            <DetailSection icon={Briefcase} title="Teaching Experience">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Years of Experience" value={app.years_experience} />
                <InfoRow label="Current Occupation" value={app.current_occupation} />
              </div>
              <div className="mt-4">
                <InfoRow label="Experience Details" value={app.teaching_experience} />
              </div>
            </DetailSection>

            {/* Subjects & Languages */}
            <DetailSection icon={Globe} title="Subjects & Languages">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Subjects</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(app.subjects || []).map((s) => (
                      <span key={s} className="rounded-full bg-gold-500/10 px-3 py-1 font-body text-xs font-semibold text-gold-700 ring-1 ring-gold-500/20">{s}</span>
                    ))}
                    {(!app.subjects || app.subjects.length === 0) && <span className="font-body text-sm text-navy-400">—</span>}
                  </div>
                </div>
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Languages</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(app.languages || []).map((l) => (
                      <span key={l} className="rounded-full bg-navy-50 px-3 py-1 font-body text-xs font-semibold text-navy-700 ring-1 ring-navy-600/10">{l}</span>
                    ))}
                    {(!app.languages || app.languages.length === 0) && <span className="font-body text-sm text-navy-400">—</span>}
                  </div>
                </div>
              </div>
            </DetailSection>

            {/* Availability */}
            <DetailSection icon={Calendar} title="Availability">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Availability" value={app.availability} />
                <InfoRow label="Preferred Schedule" value={app.preferred_schedule} />
              </div>
            </DetailSection>

            {/* Bio */}
            <DetailSection icon={FileText} title="Teaching Bio">
              <p className="font-body text-sm leading-relaxed text-navy-700">{app.bio || '—'}</p>
            </DetailSection>

            {/* Documents */}
            <DetailSection icon={FileText} title="Documents">
              <div className="space-y-3">
                <DocLink label="Profile Photo" path={app.profile_photo_path} icon={Camera} />
                <DocLink label="CV / Resume" path={app.cv_path} icon={FileText} />
                {(app.documents || []).length > 0 && (
                  <div className="space-y-2">
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Supporting Documents</p>
                    {app.documents.map((doc, i) => (
                      <DocLink key={i} label={doc.name || `Document ${i + 1}`} path={doc.path} icon={FileText} />
                    ))}
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Review actions */}
            {canAct && (
              <SectionCard title="Review Actions" description="Approve, reject, or request changes for this application.">
                {actionError && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-body text-sm text-navy-800">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
                    <span>{actionError}</span>
                  </div>
                )}

                <div>
                  <label className="font-body text-sm font-bold tracking-wide text-navy-900">Reviewer Notes</label>
                  <p className="mt-0.5 font-body text-xs text-navy-400">Visible to the applicant when rejecting or requesting changes</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter feedback for the applicant..."
                    className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm transition-all duration-300 placeholder:text-navy-400 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {app.status === 'submitted' && (
                    <button
                      type="button"
                      onClick={() => handleAction('review')}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 font-body text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50 disabled:opacity-60"
                    >
                      <Clock size={15} />
                      Mark Under Review
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <CheckCircle2 size={15} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('changes')}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
                  >
                    <AlertCircle size={15} />
                    Request Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                </div>
              </SectionCard>
            )}

            {/* Already approved notice */}
            {app.status === 'approved' && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <div>
                  <p className="font-body text-sm font-bold text-navy-900">Application Approved</p>
                  <p className="mt-0.5 font-body text-sm text-navy-500">This applicant has been approved and granted tutor access.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  // List view
  return (
    <>
      <Seo title="Tutor Applications" description="Review and action tutor applications." path="/admin/tutor-applications" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Tutor Applications</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Review applications submitted through the Become a Tutor portal. Approving an application automatically
          grants the applicant tutor status and dashboard access.
        </p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {list.loading && <LoadingState />}
          {!list.loading && list.error && <ErrorState message={list.error} />}
          {!list.loading && !list.error && list.items.length === 0 && (
            <EmptyState icon={GraduationCap} title="No tutor applications yet" message="Applications submitted through the Become a Tutor page will appear here." />
          )}
          {!list.loading && !list.error && list.items.length > 0 && (
            <DataTable columns={columns} rows={list.items} />
          )}
        </SectionCard>
      </div>
    </>
  );
}
