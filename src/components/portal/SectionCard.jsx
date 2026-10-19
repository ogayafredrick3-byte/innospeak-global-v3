export default function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-navy-100 bg-white p-5 shadow-premium sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="font-display text-lg font-bold text-navy-900">{title}</h2>}
            {description && <p className="mt-1 font-body text-sm text-navy-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={title || action ? 'mt-5' : ''}>{children}</div>
    </div>
  );
}
