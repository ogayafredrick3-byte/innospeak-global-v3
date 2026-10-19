import { motion } from 'framer-motion';

/**
 * Stagger — animates a list of children with a stagger delay.
 * Wrap motion children with <Stagger> to get the cascade effect.
 */
export default function Stagger({
  children,
  delay = 0,
  stagger = 0.1,
  className,
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem — child of <Stagger>. Place inside a Stagger container.
 */
export function StaggerItem({ children, className }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
