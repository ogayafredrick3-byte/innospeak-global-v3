import { motion } from 'framer-motion';
import { BookOpen, Target, Sparkles, Heart } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading.jsx';
import StoryTimeline from './StoryTimeline.jsx';
import { OUR_STORY_PARAGRAPHS } from './ourStoryData.js';

const PILLAR_ICONS = [
  { icon: Sparkles, label: 'Confidence', color: 'gold' },
  { icon: Target, label: 'Innovation', color: 'navy' },
  { icon: BookOpen, label: 'Communication', color: 'gold' },
  { icon: Heart, label: 'Practical Skills', color: 'navy' },
];

export default function OurStory() {
  return (
    <section className="relative overflow-hidden bg-cream py-20 sm:py-24">
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-gold-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-20 h-72 w-72 rounded-full bg-navy-200/20 blur-3xl" />

      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow="Our Story"
          title="The Journey of InnoSpeak Global"
          subtitle="From a bold vision to a growing global ecosystem — discover how InnoSpeak Global came to life and where we are headed next."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-5">
            {OUR_STORY_PARAGRAPHS.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-body text-base leading-relaxed text-navy-600 sm:text-lg"
              >
                {para}
              </motion.p>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col justify-center rounded-3xl bg-navy-gradient p-8 shadow-premium-lg sm:p-10"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-gold-500/15 blur-3xl" />

            <h3 className="relative font-display text-xl font-bold text-white sm:text-2xl">
              Education should inspire...
            </h3>

            <div className="relative mt-6 grid grid-cols-2 gap-4">
              {PILLAR_ICONS.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.label}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -4 }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors duration-300 hover:border-gold-400/30"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        pillar.color === 'gold'
                          ? 'bg-gold-gradient text-navy-900'
                          : 'bg-white/10 text-gold-400'
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <span className="font-body text-sm font-semibold text-white">
                      {pillar.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <p className="relative mt-6 border-t border-white/10 pt-6 font-body text-sm italic leading-relaxed text-navy-200">
              We bridge the gap between education and real-world opportunities — preparing learners for academic excellence, employment, entrepreneurship and global leadership.
            </p>
          </motion.div>
        </div>

        <StoryTimeline />
      </div>
    </section>
  );
}
