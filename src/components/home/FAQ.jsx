import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading.jsx';
import Button from '../ui/Button.jsx';
import FaqAccordion from './FaqAccordion.jsx';
import { FAQ_CTA } from './faqData.js';

export default function FAQ() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Frequently Asked Questions"
          title="Everything You Need to Know"
          subtitle="Find quick answers to the most common questions about studying at InnoSpeak Global."
        />

        <div className="mt-12">
          <FaqAccordion />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-3xl bg-navy-gradient p-8 text-center shadow-premium-lg sm:p-12"
        >
          <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {FAQ_CTA.title}
          </h3>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm text-navy-200 sm:text-base">
            {FAQ_CTA.subtitle}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button to="/contact" variant="gold" size="lg" className="group">
              <Mail size={18} className="mr-2" />
              {FAQ_CTA.buttons[0].label}
            </Button>
            <Button
              to="/apply"
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:border-gold-400 hover:text-gold-400"
            >
              {FAQ_CTA.buttons[1].label}
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
