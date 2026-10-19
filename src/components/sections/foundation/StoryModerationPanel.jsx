import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, MapPin, Clock, Star, ChevronDown } from 'lucide-react';
import { STORY_CATEGORY_LABELS } from './foundationStoriesData.js';
import {
  getPendingStories,
  approveStory,
  rejectStory,
} from '../../../lib/data/storyStore.js';

/**
 * StoryModerationPanel — reviews pending Foundation story submissions.
 * In demo mode reads from localStorage. When Supabase is wired, replace
 * the store import with a Supabase query.
 */
export default function StoryModerationPanel({ open, onClose, onChanged }) {
  const [stories, setStories] = useState([]);
  const [expanded, setExpanded] = useState(null);

  function refresh() {
    setStories(getPendingStories());
  }

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  function handleApprove(id) {
    approveStory(id);
    refresh();
    onChanged?.();
  }

  function handleReject(id) {
    rejectStory(id);
    refresh();
    onChanged?.();
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm sm:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-premium-lg"
        >
          {/* Header */}
          <div className="border-b border-navy-100 bg-gradient-to-br from-emerald-50 to-white px-6 py-6 sm:px-8 sm:py-7">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy-900 shadow-md transition hover:bg-cream"
            >
              <X size={18} />
            </button>
            <p className="font-body text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Moderation
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
              Pending Stories
            </h2>
            <p className="mt-2 font-body text-sm leading-6 text-navy-600">
              {stories.length === 0
                ? 'No submissions waiting.'
                : `${stories.length} submission${stories.length === 1 ? '' : 's'} awaiting review.`}
            </p>
          </div>

          {/* List */}
          <div className="max-h-[65vh] overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
            {stories.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-body text-sm text-navy-500">
                  Nothing to review right now.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map((story) => {
                  const isOpen = expanded === story.id;
                  return (
                    <div
                      key={story.id}
                      className="rounded-2xl border border-navy-100 bg-white shadow-sm"
                    >
                      {/* Summary row */}
                      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                              {STORY_CATEGORY_LABELS[story.category] || 'Story'}
                            </span>
                            {story.category === 'review' && story.rating && (
                              <span className="inline-flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    size={12}
                                    className={
                                      n <= story.rating
                                        ? 'fill-emerald-500 text-emerald-500'
                                        : 'text-navy-200'
                                    }
                                  />
                                ))}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2 font-display text-base font-bold text-navy-900">
                            {story.title}
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs text-navy-500">
                            <span>{story.author.name}</span>
                            {story.author.role && (
                              <>
                                <span>·</span>
                                <span>{story.author.role}</span>
                              </>
                            )}
                            {story.location && (
                              <>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin size={10} />
                                  {story.location}
                                </span>
                              </>
                            )}
                          </div>

                          <p className="mt-3 line-clamp-2 font-body text-sm leading-6 text-navy-600">
                            {story.excerpt}
                          </p>

                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : story.id)}
                            className="mt-3 inline-flex items-center gap-1 font-body text-xs font-bold text-navy-700 hover:text-emerald-700"
                          >
                            {isOpen ? 'Hide full story' : 'Read full story'}
                            <ChevronDown
                              size={12}
                              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Expanded body */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-navy-100"
                          >
                            <div className="space-y-4 bg-cream/40 px-5 py-5">
                              <p className="whitespace-pre-line font-body text-sm leading-7 text-navy-700">
                                {story.body}
                              </p>

                              {story.image && (
                                <img
                                  src={story.image}
                                  alt=""
                                  className="w-full rounded-xl object-cover"
                                />
                              )}

                              {story.gallery && story.gallery.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                  {story.gallery.map((url, i) => (
                                    <img
                                      key={i}
                                      src={url}
                                      alt=""
                                      className="aspect-square w-full rounded-lg object-cover"
                                    />
                                  ))}
                                </div>
                              )}

                              {story.videoUrl && (
                                <p className="font-body text-xs text-navy-600">
                                  Video URL: {story.videoUrl}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 border-t border-navy-100 p-4 sm:flex-row sm:items-center sm:justify-end">
                        <button
                          type="button"
                          onClick={() => handleReject(story.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 font-body text-sm font-bold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(story.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-2.5 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                        >
                          <Check size={14} />
                          Approve & Publish
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}