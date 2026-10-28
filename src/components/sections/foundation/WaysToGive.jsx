import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Sparkles, Heart, Laptop, ArrowRight, LogIn } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { WAYS_TO_GIVE } from './foundationData.js';

const ICONS = { award: Award, sparkles: Sparkles, heart: Heart, laptop: Laptop };

export default function WaysToGive() {
  return (
    <section id="ways-to-give" className="relative overflow-hidden bg-navy-950 py-20 sm:py-24">
      <div className="pointer-events-none absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-gold-500/5 blur-3xl" />

      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow="Support Our Work"
          title="Support a Program"
          subtitle="Your contribution supports a Foundation programme rather than an individual. Our team allocates funds where the need is greatest and reports on the impact."
          light
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {WAYS_TO_GIVE.map((way, i) => {
            const Icon = ICONS[way.icon] || Award;
            return (
              <motion.article
                key={way.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md">
                  <Icon size={20} strokeWidth={1.8} />
                </div>

                <h3 className="mt-5 font-display text-base font-bold text-white">
                  {way.title}
                </h3>
                <p className="mt-2 flex-1 font-body text-sm leading-6 text-white/70">
                  {way.description}
                </p>

                <Link
                  to={way.to}
                  className="mt-5 inline-flex items-center gap-1.5 font-body text-sm font-bold text-emerald-300 transition-all duration-300 group-hover:gap-2.5"
                >
                  {way.cta}
                  <ArrowRight size={14} />
                </Link>
              </motion.article>
            );
          })}
        </div>

        {/* Reassurance line */}
        <p className="mx-auto mt-10 max-w-2xl text-center font-body text-xs leading-6 text-white/60">
          Foundation staff manage all beneficiary selection and allocation. Supporters do not
          have direct contact with learners. This protects privacy and dignity on both sides.
        </p>

        {/* Sponsor sign-in link */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex justify-center"
        >
          <Link
            to="/sponsor/signin"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 font-body text-sm font-semibold text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400 hover:bg-white/10 hover:text-emerald-300"
          >
            <LogIn size={15} />
            Already a sponsor? Sign in to your portal
          </Link>
        </motion.div>
      </div>
    </section>
  );
}