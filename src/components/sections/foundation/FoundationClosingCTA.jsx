import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FOUNDATION_CLOSING } from './foundationData.js';

export default function FoundationClosingCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-navy-900 py-20 text-white sm:py-24">
      {/* Single soft accent */}
      <div className="pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="container-premium relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Heart size={28} className="text-emerald-300" />
          </div>

          <h2 className="mt-6 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {FOUNDATION_CLOSING.title}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-7 text-emerald-50/90 sm:text-lg">
            {FOUNDATION_CLOSING.subtitle}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to={FOUNDATION_CLOSING.primaryCta.to}
              className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3.5 sm:w-auto"
            >
              {FOUNDATION_CLOSING.primaryCta.label}
              <ArrowRight size={16} />
            </Link>
            <a
              href={FOUNDATION_CLOSING.secondaryCta.to}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-emerald-400 hover:bg-white/10 sm:w-auto"
            >
              {FOUNDATION_CLOSING.secondaryCta.label}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}