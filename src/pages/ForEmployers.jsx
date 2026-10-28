import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Handshake,
  Target,
  Users,
} from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import HeroBackground from '../components/ui/HeroBackground.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../lib/motion/presets';

const container = staggerContainer(0.08, 0.05);

const BENEFITS = [
  { icon: GraduationCap, title: 'Find Talent',           description: 'Discover emerging professionals with structured learning and practical evidence of what they can do.' },
  { icon: Users,         title: 'Host Internships',      description: 'Offer practical experience and build a pipeline of skilled, work-ready candidates.' },
  { icon: Target,        title: 'Submit a Project',      description: 'Present a real-world problem for learners to solve as part of their practical work.' },
  { icon: Handshake,     title: 'Partner With InnoSpeak', description: 'Collaborate on training, mentorship, challenges, curriculum, Labs and career events.' },
];

const STEPS = [
  { number: '01', title: 'Create your organisation', description: 'Sign up and set up your organisation profile in a few minutes.' },
  { number: '02', title: 'Post opportunities',       description: 'Jobs, internships, projects, challenges, freelance work or mentorship.' },
  { number: '03', title: 'Review applications',      description: 'Learners apply with their skills, portfolio and credentials in one place.' },
  { number: '04', title: 'Build your pipeline',      description: 'Track outcomes, hire talent and grow long-term collaborations.' },
];

export default function ForEmployers() {
  return (
    <>
      <Seo
        title="For Employers & Organisations — InnoSpeak Global"
        description="Connect with emerging talent who combine structured learning with practical evidence of what they can do."
        path="/for-employers"
      />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-28 pb-16 md:pt-32 md:pb-20">
        <HeroBackground />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold-500/15 blur-[120px]"
          aria-hidden="true"
        />

        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 font-body text-[11px] font-bold uppercase tracking-wider text-gold-300 backdrop-blur-sm">
              <Building2 size={12} aria-hidden="true" />
              For Employers & Organizations
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.12] text-white sm:text-5xl lg:text-6xl">
              Connect with emerging
              <span className="block text-gradient-gold">talent that delivers.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl font-body text-base leading-[1.7] text-navy-200 sm:text-lg">
              Work with learners who combine structured learning with practical
              evidence of what they can do.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/employer"
                className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
              >
                Employer Portal
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300 sm:w-auto"
              >
                Talk to Our Team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Benefits ═══ */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="What You Get"
            title="Four ways to work with InnoSpeak talent"
            subtitle="Choose the engagement that fits your needs, from one-off projects to long-term talent pipelines."
          />

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
          >
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUpItem}
                className="group rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
                  <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                  {title}
                </h3>
                <p className="mt-2 font-body text-sm leading-6 text-navy-500">
                  {description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="bg-cream py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="How It Works"
            title="From sign-up to shortlist in four steps"
            subtitle="A straightforward workflow for real organisations, with no complicated setup."
          />

          <motion.ol
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
          >
            {STEPS.map(({ number, title, description }) => (
              <motion.li
                key={number}
                variants={fadeUpItem}
                className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium"
              >
                <p className="font-mono text-2xl font-bold text-gold-600">{number}</p>
                <h3 className="mt-4 font-display text-base font-bold text-navy-900">
                  {title}
                </h3>
                <p className="mt-2 font-body text-sm leading-6 text-navy-500">
                  {description}
                </p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="bg-navy-900 py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-300">
              Ready to Start?
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Access the Employer Portal
            </h2>
            <p className="mt-5 font-body text-base leading-[1.7] text-navy-200">
              Get in touch to request employer access. Our team will set up your
              organisation and give you a portal account.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="btn-gold inline-flex items-center gap-2 px-7 py-3">
                Request Access
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/partnerships"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300"
              >
                Partnership Details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}