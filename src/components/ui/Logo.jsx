import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoSrc from '../../assets/logo/logo.png';

/**
 * Wordmark — two-tone text logo fallback.
 *
 * "Inno" in gold (#D4A017), "Speak" in navy (#001F3F), with "GLOBAL"
 * below in small uppercase with generous letter-spacing.
 */
function Wordmark() {
  return (
    <span className="inline-flex flex-col leading-none">
      <span className="font-serif text-xl font-bold tracking-tight">
        <span className="text-gold">Inno</span>
        <span className="text-navy">Speak</span>
      </span>
      <span className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.35em] text-navy/50">
        Global
      </span>
    </span>
  );
}

/**
 * Logo — InnoSpeak Global brand mark.
 *
 * Renders the image at `src/assets/logo/logo.png` (52px tall) when it
 * loads successfully; otherwise falls back to the Wordmark. Links home.
 * Subtle scale-up on hover.
 */
export default function Logo({ className = '', onClick }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      to="/"
      onClick={onClick}
      className={`group inline-flex items-center ${className}`}
      aria-label="InnoSpeak Global — home"
    >
      <motion.span
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center"
      >
        {logoSrc && !imgFailed ? (
          <img
            src={logoSrc}
            alt="InnoSpeak Global"
            className="h-[52px] w-auto select-none"
            draggable={false}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <Wordmark />
        )}
      </motion.span>
    </Link>
  );
}
