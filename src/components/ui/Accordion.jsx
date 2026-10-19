import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

/**
 * Accordion — accessible expand/collapse panel for FAQ sections.
 *
 * Renders a list of question/answer pairs. One panel open at a time.
 * Keyboard-accessible via native <button> elements. Animated with
 * Framer Motion height transitions.
 */
export default function Accordion({ items, className = '' }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className={`divide-y divide-navy/10 ${className}`} role="list">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} role="listitem">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors duration-200 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              <span className="text-base font-semibold text-navy">{item.question}</span>
              <span className="flex-shrink-0 text-gold transition-transform duration-300">
                {isOpen ? <Minus size={20} /> : <Plus size={20} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-sm leading-relaxed text-muted">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
