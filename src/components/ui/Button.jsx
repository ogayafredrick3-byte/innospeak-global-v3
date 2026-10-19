import { motion } from 'framer-motion';
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
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="inline-block"
      >
        <Link to={to} className={classes} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }
  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={classes}
        {...props}
      >
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={classes}
      {...props}
    >
      {children}
    </motion.button>
  );
}
