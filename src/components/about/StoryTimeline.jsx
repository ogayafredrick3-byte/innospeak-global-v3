import { motion } from 'framer-motion';
import { Eye, Building2, TrendingUp, Globe } from 'lucide-react';
import { OUR_STORY_TIMELINE } from './ourStoryData.js';

const ICONS = {
  eye: Eye,
  building: Building2,
  'trending-up': TrendingUp,
  globe: Globe,
};

export default function StoryTimeline() {
  return (
    <div className="relative mt-16">
      <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-gold-400 via-navy-300 to-gold-400 lg:left-1/2 lg:-translate-x-1/2" />

      <div className="space-y-12 lg:space-y-0">
        {OUR_STORY_TIMELINE.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Eye;
          const isLeft = i % 2 === 0;

          return (
            <div
              key={item.id}
              className={`relative flex items-center lg:mb-12 ${
                isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-6 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-cream bg-gold-gradient text-navy-900 shadow-gold lg:left-1/2"
              >
                <Icon size={20} strokeWidth={2} />
              </motion.div>

              <div className={`ml-16 lg:ml-0 lg:w-[calc(50%-3rem)] ${isLeft ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                <motion.div
                  initial={{ opacity: 0, x: isLeft ? -30 : 30, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-shadow duration-300 hover:shadow-premium-lg"
                >
                  <span className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
                    {item.phase}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold text-navy-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-navy-600">
                    {item.description}
                  </p>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
