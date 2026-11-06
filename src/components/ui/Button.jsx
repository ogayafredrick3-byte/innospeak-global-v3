import { Link } from 'react-router-dom';

const baseClasses = {
  gold: 'btn-gold',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

export default function Button({
  children,
  to,
  href,
  variant = 'gold',
  size = 'md',
  className = '',
  withArrow,
  ...props
}) {
  const variantClass = baseClasses[variant] || baseClasses.gold;
  const sizeClass = size === 'lg' ? 'px-8 py-4 text-base' : size === 'sm' ? 'px-4 py-2 text-xs' : '';
  const classes = `${variantClass} ${sizeClass} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
