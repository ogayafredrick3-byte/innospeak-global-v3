import { motion } from 'framer-motion';
import { ArrowRight, Brain, Code, Cloud, ShieldCheck, BarChart3, Cog, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../../ui/SectionHeading.jsx';
import {
  staggerContainer,
  fadeUpItem,
  inViewOnce,
} from '../../../lib/motion/presets';
import { LAB_SCHOOLS } from '../../../lib/data/labsData';
import { COURSES } from '../../../lib/data/programmeData';

const ICON_MAP = {
  Brain,
  Code,
  Cloud,
  ShieldCheck,
  BarChart3,
  Cog,
  Sparkles,
};

const container = staggerContainer(0.08, 0.05);

function TrackCard({ track, index }) {
  const Icon = ICON_MAP[track.icon] || Brain;

  const trackCourses = COURSES.filter((c) => c.pathwayId === track.id);
  const sampleCourses = trackCourses.slice(0, 3);

  return (
    <motion.article
      variants={fadeUpItem}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-premium-lg sm:p-7"
    >
      {/* Top row: icon + number */}
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
          <Icon size={22} strokeWidth={1.8} />
        </div>
        <span className="font-display text-sm font-bold tracking-wide text-navy-200">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-5 font-display text-lg font-bold leading-snug text-navy-900">
        {track.title}
      </h3>

      {/* Description */}
      <p className="mt-2 flex-1 font-body text-sm leading-6 text-navy-600">
        {track.description}
      </p>

      {/* Popular courses */}
      {sampleCourses.length > 0 && (
        <div className="mt-5 border-t border-navy-100 pt-5">
          <p className="mb-3 font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
            Popular courses
          </p>
          <ul className="space-y-2">
            {sampleCourses.map((c) => (
              <li key={c.code}>
                <Link
                  to={`/courses/${c.code}`}
                  className="flex items-center gap-2 font-body text-sm text-navy-700 transition-colors hover:text-gold-700"
                >
                  <span className="shrink-0 font-mono text-[11px] font-bold text-gold-600">
                    {c.code}
                  </span>
                  <span className="truncate">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer: count + explore */}
      <div className="mt-5 flex items-center justify-between border-t border-navy-100 pt-4">
        <span className="font-body text-sm font-bold text-navy-900">
          {trackCourses.length} {trackCourses.length === 1 ? 'course' : 'courses'}
        </span>
        <Link
          to={`/courses?track=${track.id}`}
          className="inline-flex items-center gap-1 font-body text-sm font-bold text-gold-700 transition-all duration-300 group-hover:gap-2"
        >
          Explore
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}

export default function LabTracks() {
  return (
    <section className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <div className="mb-12 sm:mb-14 lg:mb-16">
          <SectionHeading
            eyebrow="Lab Tracks"
            title="Build Your Specialisation"
            subtitle="Seven tracks. Each one a route from fundamentals to production-grade skills — software, data, AI, cloud, security, engineering and creative technology."
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-7"
        >
          {LAB_SCHOOLS.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 text-center"
        >
          <Link
            to="/courses"
            className="btn-gold inline-flex items-center gap-2 px-7 py-3"
          >
            Browse all Labs courses
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}