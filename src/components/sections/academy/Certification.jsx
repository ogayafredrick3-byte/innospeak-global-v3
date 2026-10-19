import { motion } from 'framer-motion';
import { Award, FileText, Briefcase, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

/**
 * Certification — what learners receive after completion.
 * 3 credential types + verification CTA.
 */

const CERTIFICATES = [
  {
    icon: Award,
    title: 'Digital Certificates',
    description:
      'Verified, shareable digital certificates that validate your achievements and skills.',
    hint: 'Issued by the division you studied under — Academy, Labs or Foundation.',
  },
  {
    icon: FileText,
    title: 'Professional Transcripts',
    description:
      'Detailed transcripts documenting the modules, assessments and outcomes you completed.',
    hint: 'Download as PDF, share with employers or institutions.',
  },
  {
    icon: Briefcase,
    title: 'Career Portfolio',
    description:
      'A curated portfolio of projects and evidence that showcases your real-world capability.',
    hint: 'Add to LinkedIn, CV or personal site — one click.',
  },
];

const container = staggerContainer(0.1, 0.1);

function CertCard({ icon: Icon, title, description, hint }) {
  return (
    <motion.article
      variants={fadeUpItem}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-7"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900 sm:h-14 sm:w-14">
        <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <h3 className="mt-5 font-display text-base font-bold text-navy-900 sm:text-lg">
        {title}
      </h3>
      <p className="mt-2 flex-1 font-body text-sm leading-6 text-navy-600">
        {description}
      </p>

      {hint && (
        <div className="mt-4 flex items-start gap-2 border-t border-navy-100 pt-4">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-gold-600" />
          <p className="font-body text-xs leading-5 text-navy-500">{hint}</p>
        </div>
      )}
    </motion.article>
  );
}

export default function Certification() {
  return (
    <section aria-label="Certification" className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <div className="mb-12 sm:mb-14 lg:mb-16">
          <SectionHeading
            eyebrow="Certification"
            title="Recognised Credentials for Every Step"
            subtitle="On successful completion of your programme, you receive a portfolio of credentials that document your growth and open new doors."
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7"
        >
          {CERTIFICATES.map((cert) => (
            <CertCard key={cert.title} {...cert} />
          ))}
        </motion.div>

        {/* Verification CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 flex justify-center"
        >
          <Link
            to="/verify-certificate"
            className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-6 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700"
          >
            <ShieldCheck size={16} />
            Verify an InnoSpeak Certificate
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}