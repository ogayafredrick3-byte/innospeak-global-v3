import { useEffect, useState, useCallback } from 'react';
import { FileText, Check, Trash2, ChevronDown, MapPin, Star } from 'lucide-react';
import { STORY_CATEGORY_LABELS } from '../../components/sections/foundation/foundationStoriesData.js';
import {
  getPendingStories,
  getApprovedStories,
  getRejectedStories,
  approveStory,
  rejectStory,
  deleteStory,
} from '../../lib/data/storyStore.js';

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

export default function FoundationStories() {
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const refresh = useCallback(() => {
    const data =
      tab === 'pending' ? getPendingStories() :
      tab === 'approved' ? getApprovedStories() :
      getRejectedStories();
    setItems(data);
  }, [tab]);

  useEffect(() => { refresh(); }, [refresh]);

  function handleApprove(id) { approveStory(id); refresh(); }
  function handleReject(id) { rejectStory(id); refresh(); }
  function handleDelete(id) { deleteStory(id); refresh(); }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wider text-emerald-700">
              Foundation
            </p>
            <h1 className="font-display text-2xl font-bold text-navy-900">
              Story Moderation
            </h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-navy-600">
          Approve, reject or delete learner, sponsor, activity and review submissions from the Foundation page.
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold transition ${
              tab === t.id
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                : 'border-navy-100 bg-white text-navy-700 hover:border-emerald-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <FileText size={24} className="text-emerald-600" />
          </div>
          <h3 className="mt-5 font-display text-lg font-bold text-navy-900">
            No {tab} stories
          </h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
            Submissions from the Foundation page appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((story) => {
            const isOpen = expanded === story.id;
            return (
              <div key={story.id} className="rounded-2xl border border-navy-100 bg-white shadow-sm">
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {STORY_CATEGORY_LABELS[story.category] || 'Story'}
                    </span>
                    {story.category === 'review' && story.rating && (
                      <span className="inline-flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={12}
                            className={n <= story.rating ? 'fill-emerald-500 text-emerald-500' : 'text-navy-200'}
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
                    {story.author.role && (<><span>·</span><span>{story.author.role}</span></>)}
                    {story.location && (<><span>·</span><span className="inline-flex items-center gap-1"><MapPin size={10} />{story.location}</span></>)}
                  </div>
                  <p className="mt-3 line-clamp-2 font-body text-sm leading-6 text-navy-600">
                    {story.excerpt}
                  </p>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : story.id)}
                    className="mt-3 inline-flex items-center gap-1 font-body text-xs font-bold text-navy-700 hover:text-emerald-700"
                  >
                    {isOpen ? 'Hide' : 'Read full story'}
                    <ChevronDown size={12} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-navy-100 bg-cream/40 px-5 py-5">
                    <p className="whitespace-pre-line font-body text-sm leading-7 text-navy-700">
                      {story.body}
                    </p>
                    {story.image && (
                      <img src={story.image} alt="" className="mt-4 w-full rounded-xl object-cover" />
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-navy-100 p-4 sm:flex-row sm:items-center sm:justify-end">
                  {tab === 'pending' && (
                    <>
                      <button onClick={() => handleReject(story.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 font-body text-sm font-bold text-red-600 hover:bg-red-50">
                        <Trash2 size={14} /> Reject
                      </button>
                      <button onClick={() => handleApprove(story.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-2.5 font-body text-sm font-bold text-white shadow-md">
                        <Check size={14} /> Approve & Publish
                      </button>
                    </>
                  )}
                  {tab !== 'pending' && (
                    <button onClick={() => handleDelete(story.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 font-body text-sm font-bold text-red-600 hover:bg-red-50">
                      <Trash2 size={14} /> Delete permanently
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}