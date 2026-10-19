import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

/**
 * Card — premium rounded card with hover lift.
 *
 * Variants:
 *   solid  — white background, navy shadow
 *   glass  — glassmorphism (frosted glass)
 *   dark   — navy background for dark sections
 */
export default function Card({
  children,
  variant = 'solid',
  className,
  hover = true,
  ...rest
}) {
  const base =
    'rounded-2xl p-7 transition-all duration-300 border';
  const variants = {
    solid: 'bg-white shadow-premium border-navy-50',
    glass: 'glass shadow-premium',
    dark: 'bg-navy text-white shadow-premium-lg border-white/10',
  };
  const hoverCls = hover ? 'hover:shadow-premium-lg hover:-translate-y-1' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={cn(base, variants[variant], hoverCls, className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
