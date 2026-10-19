import { useMemo } from 'react';
import { motion } from 'framer-motion';
import useMediaQuery from '../../hooks/useMediaQuery.js';

/**
 * ClosingParticles — subtle animated floating particles rendered as
 * small gold/navy dots drifting upward. Respects prefers-reduced-motion.
 */
export default function ClosingParticles() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 3,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
        gold: i % 3 === 0,
      })),
    []
  );

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${
            p.gold ? 'bg-gold-400/20' : 'bg-white/10'
          }`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
