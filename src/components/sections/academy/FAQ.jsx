import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

/**
 * FAQ — Academy frequently asked questions.
 * Custom accordion (matches Foundation FAQ pattern).
 */

const FAQS = [
  {
    question: 'Who can apply?',
    answer:
      'Anyone aged 16 and above — students, professionals, graduates, job seekers and lifelong learners — is welcome to apply. Our programmes span beginner to advanced levels, so there is a starting point for everyone.',
  },
  {
    question: 'Are classes online?',
    answer:
      'Yes. Most programmes are offered online, with select programmes available in physical or hybrid mode. You can choose the study mode that best fits your schedule and location.',
  },
  {
    question: 'Do I receive a certificate?',
    answer:
      'Yes. On successful completion of your programme you receive a verified digital certificate, a professional transcript and a career portfolio documenting your projects and achievements.',
  },
  {
    question: 'How long are programmes?',
    answer:
      'Programme durations vary — most run between 6 and 16 weeks, depending on the pathway and level. Each programme page lists its exact duration and study mode.',
  },
  {
    question: 'What are the payment options?',
    answer:
      'We offer affordable fees with flexible payment options, including instalment plans for selected programmes. Contact our admissions team to discuss the option that works best for you.',
  },
  {
    question: 'Can I apply for more than one programme?',
    answer:
      'Yes. You can apply for multiple programmes. Each application is reviewed independently, and we will confirm your enrollment for each one you are admitted to.',
  },
];

const container = staggerContainer(0.08, 0.08);

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <motion.div
      variants={fadeUpItem}
      className={`overflow-hidden rounded-2xl border bg-white shadow-premium transition-all duration-300 ${
        isOpen ? 'border-gold-300/60 shadow-premium-lg' : 'border-navy-100'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 sm:px-6 sm:py-5"
      >
        <span className="font-display text-sm font-semibold text-navy-900 sm:text-base lg:text-lg">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 sm:h-9 sm:w-9 ${
            isOpen ? 'bg-gold-gradient text-navy-900' : 'bg-navy-50 text-navy-700'
          }`}
        >
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 font-body text-sm leading-6 text-navy-600 sm:px-6 sm:text-base sm:leading-7">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section aria-label="Frequently asked questions" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <div className="mb-12 sm:mb-14 lg:mb-16">
          <SectionHeading
            eyebrow="Frequently Asked Questions"
            title="Everything You Need to Know"
            subtitle="Answers to the questions we hear most often. Can't find what you're looking for? Our admissions team is happy to help."
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="mx-auto max-w-3xl space-y-3 sm:space-y-4"
        >
          {FAQS.map((item, i) => (
            <FaqItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border border-gold-200 bg-gold-50/60 p-5 sm:flex-row sm:p-6"
        >
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900">
              <MessageCircle size={18} />
            </div>
            <div>
              <p className="font-body text-sm font-bold text-navy-900">
                Still have a question?
              </p>
              <p className="mt-0.5 font-body text-xs text-navy-600">
                Our admissions team responds within 24 hours.
              </p>
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 font-body text-sm font-bold text-white transition-all duration-300 hover:bg-navy-800"
          >
            Contact Us
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}