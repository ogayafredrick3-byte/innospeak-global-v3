import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Search, Award, X, AlertTriangle,
  RotateCcw, Ban, Calendar, Hash, User, BookOpen, ExternalLink,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  listAllCertificates, revokeCertificate, reactivateCertificate,
} from '../../lib/supabase/lms';

function RevokeModal({ cert, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');

  return (
    <AnimatePresence>
      {cert && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/60 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium-lg"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Ban size={20} />
              </span>
              <h2 className="font-display text-lg font-bold text-navy-900">Revoke Certificate</h2>
            </div>
            <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-2 text-navy-400 hover:bg-navy-50">
              <X size={20} />
            </button>

            <div className="mt-4 rounded-xl bg-navy-50 p-4">
              <p className="font-body text-sm font-semibold text-navy-900">{cert.student_name}</p>
              <p className="font-body text-xs text-navy-500">{cert.course_title}</p>
              <p className="mt-1 font-body text-xs text-navy-400">{cert.certificate_number}</p>
            </div>

            <div className="mt-4">
              <label className="font-body text-sm font-bold text-navy-900">
                Reason for revocation
              </label>
              <p className="mt-0.5 font-body text-xs text-navy-400">
                This will be visible on the public verification page.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. Issued in error, academic dishonesty..."
                className="mt-2 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-900 shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-navy-200 px-4 py-2.5 font-body text-sm font-semibold text-navy-700 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(reason)}
                disabled={loading || !reason.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 font-body text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                <Ban size={15} /> Revoke Certificate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function AdminCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAllCertificates(search);
      setCerts(data);
    } catch (e) {
      setError(e.message || 'Could not load certificates.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  async function handleRevoke(reason) {
    if (!revokeTarget) return;
    setActionLoading(true);
    try {
      await revokeCertificate(revokeTarget.id, reason);
      setRevokeTarget(null);
      await load();
    } catch (e) {
      setError(e.message || 'Could not revoke certificate.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReactivate(cert) {
    setActionLoading(true);
    try {
      await reactivateCertificate(cert.id);
      await load();
    } catch (e) {
      setError(e.message || 'Could not reactivate certificate.');
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (r) => (
        <div>
          <p className="font-body text-sm font-semibold text-navy-900">{r.student_name}</p>
          {r.profiles?.email && (
            <p className="font-body text-xs text-navy-400">{r.profiles.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Course',
      render: (r) => (
        <div>
          <p className="font-body text-sm font-semibold text-navy-800">{r.course_title}</p>
          {r.lms_courses?.code && (
            <p className="font-body text-xs text-navy-400">{r.lms_courses.code}</p>
          )}
        </div>
      ),
    },
    {
      key: 'certificate_number',
      label: 'Certificate ID',
      render: (r) => (
        <span className="font-body text-xs font-mono text-navy-600">{r.certificate_number}</span>
      ),
    },
    {
      key: 'issued_at',
      label: 'Issued',
      render: (r) => (
        <span className="font-body text-xs text-navy-500">
          {new Date(r.issue_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex items-center gap-2">
          <a
            href={`/verify-certificate/${r.certificate_number}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-50 hover:text-navy-700"
            title="View public verification"
          >
            <ExternalLink size={15} />
          </a>
          {r.status === 'active' ? (
            <button
              onClick={() => setRevokeTarget(r)}
              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
              title="Revoke"
            >
              <Ban size={15} />
            </button>
          ) : (
            <button
              onClick={() => handleReactivate(r)}
              disabled={actionLoading}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-60"
              title="Reactivate"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Seo title="Certificates" description="Manage issued certificates." path="/admin/certificates" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Certificates</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          View and manage all issued certificates. Revoke certificates when necessary — revoked
          certificates show their status on the public verification page.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
            <Award size={20} />
          </span>
          <div>
            <p className="font-body text-xs text-navy-400">Total Issued</p>
            <p className="font-display text-xl font-bold text-navy-900">{certs.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="font-body text-xs text-navy-400">Active</p>
            <p className="font-display text-xl font-bold text-navy-900">
              {certs.filter((c) => c.status === 'active').length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Ban size={20} />
          </span>
          <div>
            <p className="font-body text-xs text-navy-400">Revoked</p>
            <p className="font-display text-xl font-bold text-navy-900">
              {certs.filter((c) => c.status === 'revoked').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <SectionCard>
          <form
            onSubmit={(e) => { e.preventDefault(); load(); }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or certificate ID..."
              className="flex-1 rounded-xl border border-navy-200 px-4 py-3 font-body text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <button type="submit" className="btn-gold inline-flex items-center justify-center gap-2">
              <Search size={16} /> Search
            </button>
          </form>

          <div className="mt-5">
            {loading && <LoadingState />}
            {error && <ErrorState message={error} />}
            {!loading && !error && certs.length === 0 && (
              <EmptyState
                icon={Award}
                title="No certificates found"
                message="Certificates will appear here when students complete eligible courses."
              />
            )}
            {!loading && !error && certs.length > 0 && (
              <DataTable columns={columns} rows={certs} />
            )}
          </div>
        </SectionCard>
      </div>

      <RevokeModal
        cert={revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        loading={actionLoading}
      />
    </>
  );
}
