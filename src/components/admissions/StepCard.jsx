import { motion } from 'framer-motion';
import { easeOutExpo } from '../../lib/motion/presets';
import { Sparkles } from 'lucide-react';

export default function StepCard({
  title,
  description,
  children,
  stepNum,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.55,
        ease: easeOutExpo,
      }}
      className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/90 shadow-2xl backdrop-blur-xl"
    >
      {/* Gold Accent */}
      <div className="h-1 w-full bg-gold-gradient" />

      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-navy-400/10 blur-3xl" />

      <div className="relative p-8 md:p-12">

        {/* Header */}
        <div className="mb-10 flex items-start justify-between gap-6">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-gradient text-navy-900 shadow-lg">

                <Sparkles size={20} />

              </div>

              <div>

                <span className="font-body text-xs font-bold uppercase tracking-[0.28em] text-gold-700">
                  Step {stepNum}
                </span>

                <h2 className="mt-1 font-display text-3xl font-bold text-navy-900">
                  {title}
                </h2>

              </div>

            </div>

            {description && (
              <p className="mt-5 max-w-3xl font-body text-base leading-8 text-navy-600">
                {description}
              </p>
            )}

          </div>

        </div>

        {/* Divider */}

        <div className="mb-10 h-px bg-gradient-to-r from-gold-300/60 via-navy-100 to-transparent" />

        {/* Form */}

        <div className="space-y-8">

          {children}

        </div>

      </div>

    </motion.div>
  );
}