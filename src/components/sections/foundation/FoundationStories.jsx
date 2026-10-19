import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PenLine, Inbox } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import StoryCard from './StoryCard.jsx';
import StoryModal from './StoryModal.jsx';
import StorySubmissionForm from './StorySubmissionForm.jsx';
import StoryModerationPanel from './StoryModerationPanel.jsx';
import {
  FOUNDATION_STORIES,
  STORY_CATEGORIES,
  STORIES_INTRO,
} from './foundationStoriesData.js';
import {
  submitStory,
  getApprovedStories,
  getPendingStories,
} from '../../../lib/data/storyStore.js';

export default function FoundationStories() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openStory, setOpenStory] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [moderationOpen, setModerationOpen] = useState(false);
  const [localApproved, setLocalApproved] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(() => {
    setLocalApproved(getApprovedStories());
    setPendingCount(getPendingStories().length);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const allStories = useMemo(
    () => [...localApproved, ...FOUNDATION_STORIES],
    [localApproved]
  );

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return allStories;
    return allStories.filter((s) => s.category === activeCategory);
  }, [allStories, activeCategory]);

  const counts = useMemo(() => {
    const map = { all: allStories.length };
    STORY_CATEGORIES.forEach((cat) => {
      if (cat.id === 'all') return;
      map[cat.id] = allStories.filter((s) => s.category === cat.id).length;
    });
    return map;
  }, [allStories]);

  function handleSubmit(payload) {
    submitStory(payload);
    refresh();
  }

  function handleModerationClose() {
    setModerationOpen(false);
    refresh();
  }

  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-premium">
        {/* Heading row: heading + actions */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={STORIES_INTRO.eyebrow}
            title={STORIES_INTRO.title}
            subtitle={STORIES_INTRO.subtitle}
          />

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {pendingCount > 0 && (
              <motion.button
                type="button"
                onClick={() => setModerationOpen(true)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 font-body text-sm font-bold text-amber-800 shadow-sm transition hover:bg-amber-100"
              >
                <Inbox size={16} />
                {pendingCount} pending
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 font-body text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={() => setFormOpen(true)}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03]"
            >
              <PenLine size={16} />
              Share Your Story
            </motion.button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
          {STORY_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = counts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                    : 'border-navy-100 bg-white text-navy-700 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {cat.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-navy-100 text-navy-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {filtered.map((story, i) => (
              <StoryCard key={story.id} story={story} onOpen={setOpenStory} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center"
          >
            <p className="font-body text-sm text-navy-500">
              No stories in this category yet.
            </p>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="btn-gold mt-5 inline-flex items-center gap-2 px-6 py-3"
            >
              <PenLine size={16} />
              Be the first to share
            </button>
          </motion.div>
        )}
      </div>

      {/* Story reader modal */}
      <StoryModal story={openStory} onClose={() => setOpenStory(null)} />

      {/* Story submission modal */}
      <StorySubmissionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Moderation panel */}
      <StoryModerationPanel
        open={moderationOpen}
        onClose={handleModerationClose}
        onChanged={refresh}
      />
    </section>
  );
}