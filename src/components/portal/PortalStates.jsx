import { TriangleAlert } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-100 border-t-gold-500" />
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-body text-sm text-navy-800">
      <TriangleAlert size={16} className="mt-0.5 shrink-0 text-rose-600" />
      <span>{message || 'Something went wrong. Please try again.'}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="rounded-xl border border-dashed border-navy-200 bg-cream px-6 py-10 text-center">
      {Icon && (
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
          <Icon size={20} />
        </span>
      )}
      {title && <p className="mt-3 font-body text-sm font-semibold text-navy-800">{title}</p>}
      {message && <p className="mt-1 font-body text-sm text-navy-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
