export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-premium">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">
          {label}
        </span>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-navy-900">{value ?? '—'}</p>
      {hint && <p className="mt-1 font-body text-xs text-navy-400">{hint}</p>}
    </div>
  );
}
