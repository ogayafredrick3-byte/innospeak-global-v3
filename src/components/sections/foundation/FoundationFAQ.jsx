import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { FOUNDATION_FAQ } from './foundationData.js';

export default function FoundationFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Common Questions"
          title="Foundation FAQ"
          subtitle="Everything you need to know about applying for support or supporting a Foundation program."
        />

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {FOUNDATION_FAQ.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.q}
                className={`overflow-hidden rounded-2xl border bg-white shadow-premium transition-all duration-300 ${
                  isOpen ? 'border-emerald-300 shadow-premium-lg' : 'border-navy-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-cream/60"
                >
                  <span className="font-display text-base font-bold text-navy-900">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-900"
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-navy-100 px-6 py-5">
                        <p className="font-body text-sm leading-7 text-navy-600">
                          {item.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}