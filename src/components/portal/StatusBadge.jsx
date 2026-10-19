const TONE_MAP = {
  positive: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-gold-50 text-gold-700 ring-gold-600/20',
  negative: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  neutral: 'bg-navy-50 text-navy-700 ring-navy-600/10',
};

const STATUS_TONE = {
  registered: 'positive',
  present: 'positive',
  paid: 'positive',
  approved: 'positive',
  cleared: 'positive',
  available: 'positive',
  active: 'positive',
  eligible: 'positive',
  resolved: 'positive',
  read: 'positive',
  published: 'positive',

  submitted: 'pending',
  processing: 'pending',
  pending: 'pending',
  open: 'pending',
  in_progress: 'pending',
  unread: 'pending',
  applied: 'pending',
  under_review: 'pending',
  changes_requested: 'pending',
  draft: 'neutral',

  dropped: 'negative',
  absent: 'negative',
  rejected: 'negative',
  overdue: 'negative',
  withheld: 'negative',
  closed: 'negative',
  suspended: 'negative',
  not_eligible: 'negative',
};

function formatLabel(status) {
  return String(status || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status, className = '' }) {
  const tone = STATUS_TONE[String(status || '').toLowerCase()] || 'neutral';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-body text-xs font-semibold ring-1 ring-inset ${TONE_MAP[tone]} ${className}`}
    >
      {formatLabel(status)}
    </span>
  );
}
