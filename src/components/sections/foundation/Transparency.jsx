import { motion } from 'framer-motion';
import { ShieldCheck, BarChart3 } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { TRANSPARENCY } from './foundationData.js';

export default function Transparency() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Accountability"
          title="Accountability Before Claims"
          subtitle={TRANSPARENCY.summary}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Publish allocations only when reviewed records exist. */}
          <div className="space-y-5">
            {TRANSPARENCY.items.length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <p className="font-display text-lg font-bold text-navy-900">Allocation breakdown not yet published</p>
                <p className="mt-2 font-body text-sm leading-6 text-navy-700">We will show category percentages only after they can be reconciled to reviewed financial records. This avoids presenting proposed budgets as actual expenditure.</p>
              </div>
            ) : TRANSPARENCY.items.map((item, i) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-body text-sm font-bold text-navy-900">
                    {item.category}
                  </span>
                  <span className="font-display text-lg font-bold text-emerald-700">
                    {item.percentage}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700"
                  />
                </div>
                <p className="mt-1.5 font-body text-xs text-navy-500">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Commitment card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-premium sm:p-10"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md">
              <ShieldCheck size={26} strokeWidth={1.8} />
            </div>
            <h3 className="mt-6 font-display text-xl font-bold text-navy-900">
              Our commitment to you
            </h3>
            <p className="mt-3 font-body text-sm leading-7 text-navy-700">
              {TRANSPARENCY.commitment}
            </p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4">
              <BarChart3 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
              <div className="font-body text-xs leading-5 font-semibold text-navy-700">
                {TRANSPARENCY.reportingNote}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}