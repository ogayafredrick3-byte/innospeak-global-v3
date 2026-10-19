import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading.jsx';
import Button from '../ui/Button.jsx';
import PartnerLogoShowcase from './PartnerLogoShowcase.jsx';
import PartnershipCards from './PartnershipCards.jsx';
import WhyPartnerHighlights from './WhyPartnerHighlights.jsx';

export default function Partners() {
  return (
    <section className="relative overflow-hidden bg-cream py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading
          eyebrow="Strategic Partners & Global Network"
          title="Building Futures, Together"
          subtitle="InnoSpeak Global partners with universities, technology companies, NGOs and international institutions to create world-class learning opportunities and shared impact."
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="mt-12"
        >
          <p className="mb-4 text-center font-display text-sm font-semibold uppercase tracking-wider text-navy-500">
            A Network Spanning Education, Industry & Innovation
          </p>
          <PartnerLogoShowcase />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <h3 className="mb-6 text-center font-display text-2xl font-bold text-navy-900">
            Partnership Opportunities
          </h3>
          <PartnershipCards />
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 overflow-hidden rounded-3xl bg-navy-gradient p-8 text-center shadow-premium-lg sm:p-12"
        >
          <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Become a Strategic Partner
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-navy-200 sm:text-base">
            Join a growing network of institutions and organisations shaping the next generation of global communicators, engineers and leaders.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button to="/apply" variant="gold" size="lg" className="group">
              Become a Partner
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button to="/contact" variant="outline" size="lg" className="border-white/30 text-white hover:border-gold-400 hover:text-gold-400">
              <Mail size={18} className="mr-2" />
              Contact Our Team
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
