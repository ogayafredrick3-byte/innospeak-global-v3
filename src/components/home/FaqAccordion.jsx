import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { FAQ_ITEMS } from './faqData.js';

export default function FaqAccordion() {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openId === item.id;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`overflow-hidden rounded-2xl border bg-white shadow-premium transition-all duration-300 ${
              isOpen ? 'border-gold-300/60 shadow-premium-lg' : 'border-navy-100'
            }`}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display text-base font-semibold text-navy-900 sm:text-lg">
                {item.question}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                  isOpen
                    ? 'bg-gold-gradient text-navy-900'
                    : 'bg-navy-50 text-navy-700'
                }`}
              >
                <Plus size={20} strokeWidth={2} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 font-body text-sm leading-relaxed text-navy-600 sm:text-base">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
