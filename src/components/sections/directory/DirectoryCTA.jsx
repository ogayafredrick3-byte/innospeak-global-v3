import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function DirectoryCTA({ config }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-12 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-7 sm:p-10"
    >
      <h2 className="font-display text-2xl font-bold text-navy-900">
        Keep the platform connected
      </h2>
      <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-600">
        Rather than displaying an empty or fake page, use the connected learning areas below
        as the next step.
      </p>
      <Link
        to={config.to}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
      >
        {config.cta}
        <ArrowRight size={15} />
      </Link>
    </motion.div>
  );
}
