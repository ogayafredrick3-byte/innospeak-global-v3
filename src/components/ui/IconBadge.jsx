import { cn } from '../../utils/cn.js';

/**
 * IconBadge — circular gold-tinted icon container.
 * Used on feature cards, ecosystem cards, "why choose us" etc.
 */
export default function IconBadge({ children, className, size = 'md' }) {
  const sizes = {
    sm: 'h-11 w-11 text-xl',
    md: 'h-14 w-14 text-2xl',
    lg: 'h-16 w-16 text-3xl',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/20',
        sizes[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
