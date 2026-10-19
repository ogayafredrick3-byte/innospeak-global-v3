import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { SUPPORT_STEPS } from './foundationData.js';

export default function HowSupportWorks() {
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="How to Get Support"
          title="From Application to Certificate"
          subtitle="Four clear steps. No bureaucracy. Most applicants receive a decision within 10 working days."
        />

        <div className="relative mt-14">
          {/* Connector line on desktop */}
          <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {SUPPORT_STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 font-display text-2xl font-bold text-white shadow-premium">
                    {step.number}
                  </div>
                  {i < SUPPORT_STEPS.length - 1 && (
                    <span className="pointer-events-none absolute -right-3 top-6 hidden text-emerald-500 lg:block">
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </span>
                  )}
                </div>

                <h3 className="mt-5 font-display text-base font-bold text-navy-900">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[16rem] font-body text-sm leading-6 text-navy-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            to="/apply?division=foundation"
            className="btn-gold inline-flex items-center gap-2 px-7 py-3"
          >
            Start Your Application
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}