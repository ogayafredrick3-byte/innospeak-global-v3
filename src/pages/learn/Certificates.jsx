import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, ExternalLink, ShieldCheck, Copy, Check, X, Calendar, Hash,
  BookOpen, Printer, Download, RefreshCw, Sparkles,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listMyCertificates, getMyCertificate } from '../../lib/supabase/lms';

const DIVISION_TOKENS = {
  academy: {
    label: 'InnoSpeak Global Academy',
    short: 'Academy',
    border: 'border-gold-500',
    seal: 'bg-gold-500',
    text: 'text-gold-700',
    divider: 'bg-gold-500',
  },
  labs: {
    label: 'InnoSpeak Global Labs',
    short: 'Labs',
    border: 'border-navy-700',
    seal: 'bg-navy-900',
    text: 'text-navy-700',
    divider: 'bg-navy-800',
  },
  foundation: {
    label: 'InnoSpeak Global Foundation',
    short: 'Foundation',
    border: 'border-emerald-600',
    seal: 'bg-emerald-600',
    text: 'text-emerald-700',
    divider: 'bg-emerald-600',
  },
};

function tokensFor(division) {
  return DIVISION_TOKENS[(division || 'academy').toLowerCase()] || DIVISION_TOKENS.academy;
}

/* ──────────────────────────────────────────────────────────────
   Certificate document — same layout, division-aware
   ────────────────────────────────────────────────────────────── */

function CertificateDocument({ cert }) {
  if (!cert) return null;
  const t = tokensFor(cert.division);
  const issueDate = new Date(cert.issue_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const completionDate = new Date(cert.completion_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const verifyUrl = `${window.location.origin}/verify-certificate/${cert.certificate_number}`;

  return (
    <div className="certificate-print-area mx-auto max-w-3xl">
      <div className={`relative overflow-hidden rounded-3xl border-4 ${t.border} bg-white p-8 shadow-premium-lg sm:p-12`}>
        {/* Corner ornaments */}
        <div className="pointer-events-none absolute left-0 top-0 h-24 w-24 rounded-tl-3xl border-l-4 border-t-4 border-navy-900" />
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-tr-3xl border-r-4 border-t-4 border-navy-900" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-bl-3xl border-b-4 border-l-4 border-navy-900" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-br-3xl border-b-4 border-r-4 border-navy-900" />

        {/* Watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Award size={200} className="text-navy-50 opacity-70" />
        </div>

        <div className="relative z-10 text-center">
          {/* Header */}
          <div className="flex flex-col items-center gap-2">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${t.seal}`}>
              <Award size={28} className="text-white" />
            </div>
            <p className="font-display text-lg font-bold tracking-wide text-navy-900">
              {t.label}
            </p>
            <div className={`mt-1 h-px w-32 ${t.divider}`} />
          </div>

          <p className={`mt-6 font-body text-xs font-semibold uppercase tracking-[0.3em] ${t.text}`}>
            Certificate of Completion
          </p>

          <p className="mt-6 font-body text-sm text-navy-500">This certifies that</p>
          <p className="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
            {cert.student_name}
          </p>

          <p className="mt-4 font-body text-sm text-navy-500">has successfully completed</p>
          <p className="mt-2 font-display text-xl font-bold text-navy-800 sm:text-2xl">
            {cert.course_title}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-body text-xs text-navy-500">
            <span>
              Completed: <strong className="text-navy-700">{completionDate}</strong>
            </span>
            <span>
              Issued: <strong className="text-navy-700">{issueDate}</strong>
            </span>
          </div>

          {cert.instructor_name && (
            <p className="mt-4 font-body text-xs text-navy-500">
              Instructor: <strong className="text-navy-700">{cert.instructor_name}</strong>
            </p>
          )}

          <div className="mt-10 flex items-end justify-center gap-12">
            <div className="text-center">
              <div className="h-8 w-40 border-b border-navy-300" />
              <p className="mt-1 font-body text-xs font-semibold text-navy-600">
                {t.short} Director
              </p>
              <p className="font-body text-xs text-navy-400">{t.label}</p>
            </div>
            {cert.instructor_name && (
              <div className="text-center">
                <div className="h-8 w-40 border-b border-navy-300" />
                <p className="mt-1 font-body text-xs font-semibold text-navy-600">
                  {cert.instructor_name}
                </p>
                <p className="font-body text-xs text-navy-400">Instructor</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center gap-1">
            <p className="font-body text-xs text-navy-400">
              Certificate ID:{' '}
              <strong className="font-mono text-navy-600">{cert.certificate_number}</strong>
            </p>
            <p className="font-body text-[11px] text-navy-400">
              Verify at: {verifyUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Detail modal
   ────────────────────────────────────────────────────────────── */

function CertificateDetailModal({ certificateId, onClose }) {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!certificateId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getMyCertificate(certificateId);
      setCert(data);
    } catch (e) {
      setError(e.message || 'Could not load certificate.');
    } finally {
      setLoading(false);
    }
  }, [certificateId]);

  useEffect(() => { load(); }, [load]);

  const verifyUrl = cert
    ? `${window.location.origin}/verify-certificate/${cert.certificate_number}`
    : '';

  function handleCopyLink() {
    if (!verifyUrl) return;
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <AnimatePresence>
      {certificateId && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-navy-950/70 p-4 print:static print:bg-white print:p-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative my-8 w-full max-w-4xl rounded-3xl bg-cream p-6 shadow-premium-lg print:my-0 print:rounded-none print:bg-white print:p-0 print:shadow-none sm:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Close certificate"
              className="absolute right-4 top-4 z-20 rounded-lg bg-white/80 p-2 text-navy-600 shadow-sm transition-colors hover:bg-white print:hidden"
            >
              <X size={20} />
            </button>

            {loading && <LoadingState />}
            {error && <ErrorState message={error} />}

            {cert && !loading && (
              <div>
                {/* Action bar */}
                <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="btn-gold inline-flex items-center gap-2"
                  >
                    <Printer size={16} /> Print / Save PDF
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-2.5 font-body text-sm font-semibold text-navy-700 shadow-sm transition-colors hover:bg-navy-50"
                  >
                    {copied ? (
                      <Check size={16} className="text-emerald-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                    {copied ? 'Link Copied' : 'Copy Verification Link'}
                  </button>
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-2.5 font-body text-sm font-semibold text-navy-700 shadow-sm transition-colors hover:bg-navy-50"
                  >
                    <ExternalLink size={16} /> Open Verification Page
                  </a>
                </div>

                <CertificateDocument cert={cert} />

                {/* Details grid */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2 print:hidden">
                  <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3">
                    <Hash size={16} className="text-gold-600" />
                    <div className="min-w-0">
                      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                        Certificate ID
                      </p>
                      <p className="truncate font-mono text-sm font-semibold text-navy-800">
                        {cert.certificate_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <div>
                      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                        Status
                      </p>
                      <StatusBadge status={cert.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3">
                    <Calendar size={16} className="text-gold-600" />
                    <div>
                      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                        Issue Date
                      </p>
                      <p className="font-body text-sm font-semibold text-navy-800">
                        {new Date(cert.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3">
                    <BookOpen size={16} className="text-gold-600" />
                    <div className="min-w-0">
                      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                        Course
                      </p>
                      <p className="truncate font-body text-sm font-semibold text-navy-800">
                        {cert.course_title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────────────────────
   Certificate card
   ────────────────────────────────────────────────────────────── */

function CertificateCard({ cert, onClick }) {
  const t = tokensFor(cert.division);
  const title = cert.course_title || cert.lms_courses?.title || 'Course Certificate';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left"
    >
      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-gold-300/60 group-hover:shadow-premium-lg">
        {/* Top strip with division accent */}
        <div className={`-mx-5 -mt-5 mb-4 h-1 ${t.divider}`} />

        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
            <Award size={19} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold leading-snug text-navy-900">
              {title}
            </h3>
            <p className="mt-0.5 font-mono text-[11px] text-navy-400">
              {cert.certificate_number}
            </p>
          </div>
          <StatusBadge status={cert.status} />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-4">
          <div className="flex items-center gap-4 font-body text-xs text-navy-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(cert.issue_date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-600" />
              {cert.status === 'active' ? 'Verified' : 'Revoked'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 font-body text-xs font-bold text-gold-700 transition-all duration-300 group-hover:gap-2">
            View
            <ExternalLink size={11} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
   ────────────────────────────────────────────────────────────── */

export default function Certificates() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    listMyCertificates()
      .then((d) => {
        setData(d);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  return (
    <>
      <Seo
        title="My Certificates"
        description="Your verified InnoSpeak Global learning credentials."
        path="/learn/certificates"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Credentials
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            My Certificates
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            Completed courses issue verifiable credentials. Click a certificate
            to view, print, or share it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="btn-outline inline-flex shrink-0 items-center gap-2 text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading && (
        <SectionCard className="mt-6">
          <LoadingState />
        </SectionCard>
      )}

      {error && !loading && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-body text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <SectionCard className="mt-6">
          <EmptyState
            icon={Award}
            title="No certificates yet"
            message="Complete an eligible course to receive a verifiable certificate."
          />
        </SectionCard>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {data.map((c) => (
              <CertificateCard
                key={c.id}
                cert={c}
                onClick={() => setSelectedCertId(c.id)}
              />
            ))}
          </div>

          {/* Info footer */}
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50/60 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900">
              <Sparkles size={17} strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-body text-sm font-bold text-navy-900">
                Every certificate is verifiable
              </p>
              <p className="mt-1 font-body text-xs leading-5 text-navy-600">
                Share your certificate ID or verification link with employers
                and institutions. They can confirm authenticity in seconds.
              </p>
            </div>
          </div>
        </>
      )}

      <CertificateDetailModal
        certificateId={selectedCertId}
        onClose={() => setSelectedCertId(null)}
      />
    </>
  );
}