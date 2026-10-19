import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Share2, Award, Check } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading.jsx';
import CertificateMock from './CertificateMock.jsx';
import {
  CERTIFICATE_INTRO,
  CERTIFICATE_TRUST_POINTS,
  CERTIFICATE_FEATURES,
} from './certificateData.js';

const TRUST_ICONS = {
  verifiable: ShieldCheck,
  shareable: Share2,
  division: Award,
};

export default function CertificatePreview() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-gold-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-0 h-72 w-72 rounded-full bg-navy-900/5 blur-3xl" />

      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow={CERTIFICATE_INTRO.eyebrow}
          title={CERTIFICATE_INTRO.title}
          subtitle={CERTIFICATE_INTRO.subtitle}
        />

        {/* Main layout: certificate left, trust points right */}
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Certificate mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-1"
          >
            <CertificateMock />
          </motion.div>

          {/* Trust points */}
          <div className="order-1 lg:order-2">
            <div className="space-y-6">
              {CERTIFICATE_TRUST_POINTS.map((point, i) => {
                const Icon = TRUST_ICONS[point.id] || ShieldCheck;
                return (
                  <motion.div
                    key={point.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400 shadow-md">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="font-body text-[11px] font-bold uppercase tracking-wider text-gold-600">
                        {point.label}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold text-navy-900">
                        {point.title}
                      </h3>
                      <p className="mt-1 font-body text-sm leading-6 text-navy-600">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to="/verify-certificate"
                className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3"
              >
                Verify a Certificate
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-6 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700"
              >
                Browse Certificates Courses
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Feature chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CERTIFICATE_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="flex items-center gap-3 rounded-xl border border-navy-100 bg-cream px-4 py-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/15">
                <Check size={13} className="text-gold-700" strokeWidth={3} />
              </span>
              <span className="font-body text-sm font-semibold text-navy-800">
                {feature.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}