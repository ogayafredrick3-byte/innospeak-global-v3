/**
 * CourseCatalogPicker — searchable picker over the course catalogue.
 *
 * Used on CreateCourse (and CourseBuilder settings) to link an LMS course
 * to its public catalogue entry. When a tutor selects a course, the parent
 * gets the full catalogue record so it can auto-fill title, description,
 * category, level, duration, and code.
 *
 * Reads directly from programmeData.js — no DB round-trip.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, X, BookOpen, CheckCircle2, Compass, FlaskConical, GraduationCap,
} from 'lucide-react';
import { COURSES } from '../../lib/data/programmeData';
import { cn } from '../../utils/cn.js';

const MAX_RESULTS = 20;

export default function CourseCatalogPicker({
  value,
  onChange,
  label = 'Link to catalogue course',
  helpText = 'Optional — links this LMS course to its public catalogue entry.',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selected = value ? COURSES.find((c) => c.code === value) : null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSES
      .filter((c) => {
        const division = c.division || c.pillar || 'academy';
        if (divisionFilter !== 'all' && division !== divisionFilter) return false;
        if (!q) return true;
        return (
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q) ||
          (c.pathwayId || '').toLowerCase().includes(q)
        );
      })
      .slice(0, MAX_RESULTS);
  }, [query, divisionFilter]);

  function handleSelect(course) {
    onChange(course.code, course);
    setOpen(false);
    setQuery('');
  }

  function handleClear() {
    onChange(null, null);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center justify-between gap-3">
        <label className="font-body text-sm font-bold text-navy-900">{label}</label>
        {selected && (
          <button
            type="button"
            onClick={handleClear}
            className="font-body text-xs font-semibold text-navy-400 transition-colors hover:text-rose-600"
          >
            Clear link
          </button>
        )}
      </div>
      {helpText && <p className="mt-0.5 font-body text-xs text-navy-400">{helpText}</p>}

      {selected ? (
        <div className="mt-2 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700">
            <CheckCircle2 size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm font-semibold text-navy-900">{selected.name}</p>
            <p className="mt-0.5 font-mono text-xs font-bold text-emerald-700">{selected.code}</p>
            <p className="mt-1 font-body text-xs text-navy-500">
              {selected.category}
              {selected.level && ` · ${selected.level}`}
              {selected.duration && ` · ${selected.duration}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 font-body text-xs font-bold text-gold-700 hover:text-gold-800"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-navy-200 bg-cream/40 px-4 py-3 text-left font-body text-sm text-navy-500 transition-colors hover:border-gold-400 hover:bg-gold-50/40 hover:text-gold-700"
        >
          <span>Search the course catalogue…</span>
          <Search size={15} className="shrink-0" />
        </button>
      )}

      {open && !selected && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-premium-lg">
          {/* Search bar */}
          <div className="flex items-center gap-2 border-b border-navy-100 px-3 py-2">
            <Search size={14} className="shrink-0 text-navy-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code, title, or pathway…"
              className="flex-1 bg-transparent py-1.5 font-body text-sm text-navy-900 outline-none placeholder:text-navy-300"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-700"
              aria-label="Close picker"
            >
              <X size={14} />
            </button>
          </div>

          {/* Division filter pills */}
          <div className="flex items-center gap-1 border-b border-navy-100 px-3 py-2">
            {[
              { id: 'all', label: 'All', icon: Compass },
              { id: 'academy', label: 'Academy', icon: GraduationCap },
              { id: 'labs', label: 'Labs', icon: FlaskConical },
            ].map((d) => {
              const Icon = d.icon;
              const isActive = divisionFilter === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDivisionFilter(d.id)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider transition-colors',
                    isActive ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                  )}
                >
                  <Icon size={10} />
                  {d.label}
                </button>
              );
            })}
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto">
            {results.length === 0 && (
              <p className="px-4 py-6 text-center font-body text-sm text-navy-400">
                No courses match your search.
              </p>
            )}
            {results.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelect(c)}
                className="flex w-full items-start gap-3 border-b border-navy-50 px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-gold-50/40"
              >
                <BookOpen size={14} className="mt-1 shrink-0 text-navy-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-semibold text-navy-900">{c.name}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 font-body text-xs text-navy-500">
                    <span className="font-mono font-bold text-gold-700">{c.code}</span>
                    {c.category && <span>· {c.category}</span>}
                    {c.level && <span>· {c.level}</span>}
                  </p>
                </div>
              </button>
            ))}
            {results.length >= MAX_RESULTS && query && (
              <p className="border-t border-navy-50 px-4 py-2 text-center font-body text-[11px] text-navy-400">
                Showing first {MAX_RESULTS} results. Refine your search for more.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}