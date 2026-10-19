import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function SectionHeading({ eyebrow, title, subtitle, center = true, className = '', light = false }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`${center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}
    >
      {eyebrow && (
        <motion.span variants={itemVariants} className="eyebrow">
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        variants={itemVariants}
        className={`mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem] ${light ? 'text-white' : 'text-navy-900'}`}
      >
        {title}
      </motion.h2>
      <motion.div
        variants={itemVariants}
        className="mx-auto mt-5 h-1 w-20 rounded-full bg-gold-gradient"
      />
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className={`mt-5 font-body text-base leading-relaxed sm:text-lg ${light ? 'text-white/65' : 'text-navy-600'}`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
