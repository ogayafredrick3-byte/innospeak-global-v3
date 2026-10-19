import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { getProgrammeByCode } from '../../lib/data/programmeData';
import { cn } from '../../utils/cn.js';

const INTERNAL_LINK_RE = /^\/[a-z0-9\-_/]*$/i;
const COURSE_CODE_RE = /\b([A-Z]{2,4}\d{3})\b/g;

function extractCourseCodes(content) {
  if (!content) return [];
  const seen = new Set();
  const result = [];
  const matches = content.matchAll(COURSE_CODE_RE);
  for (const match of matches) {
    const code = match[1];
    if (seen.has(code)) continue;
    const course = getProgrammeByCode(code);
    if (!course) continue;
    seen.add(code);
    result.push({ code, course });
  }
  return result;
}

/* ──────────────────────────────────────────────────────────────
   Inline parsing
   ────────────────────────────────────────────────────────────── */

function renderInline(text, keyPrefix = 'i') {
  const parts = [];
  const codeSplit = String(text).split(/(`[^`]+`)/g);

  codeSplit.forEach((chunk, ci) => {
    if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 2) {
      parts.push(
        <code
          key={`${keyPrefix}-c${ci}`}
          className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-[12px] text-navy-800"
        >
          {chunk.slice(1, -1)}
        </code>
      );
      return;
    }

    const boldSplit = chunk.split(/(\*\*[^*]+\*\*)/g);
    boldSplit.forEach((seg, bi) => {
      if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
        parts.push(
          <strong key={`${keyPrefix}-b${ci}-${bi}`} className="font-semibold text-navy-900">
            {seg.slice(2, -2)}
          </strong>
        );
        return;
      }

      const linkSplit = seg.split(/(https?:\/\/[^\s)]+|\/[a-z0-9\-_/]+)/gi);
      linkSplit.forEach((piece, li) => {
        if (!piece) return;
        if (/^https?:\/\//i.test(piece)) {
          parts.push(
            <a
              key={`${keyPrefix}-a${ci}-${bi}-${li}`}
              href={piece}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-gold-700 underline decoration-gold-400/60 underline-offset-2 hover:text-gold-800"
            >
              {piece}
            </a>
          );
          return;
        }
        if (INTERNAL_LINK_RE.test(piece)) {
          parts.push(
            <Link
              key={`${keyPrefix}-l${ci}-${bi}-${li}`}
              to={piece}
              className="font-semibold text-gold-700 underline decoration-gold-400/60 underline-offset-2 hover:text-gold-800"
            >
              {piece}
            </Link>
          );
          return;
        }
        parts.push(piece);
      });
    });
  });

  return parts.length > 0 ? parts : [text];
}

/* ──────────────────────────────────────────────────────────────
   Block parsing
   ────────────────────────────────────────────────────────────── */

function parseBlocks(content) {
  const blocks = [];
  const lines = String(content || '').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: 'code', lang, text: codeLines.join('\n') });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: 'p', text: paraLines.join(' ') });
  }

  return blocks;
}

function MessageBlocks({ content }) {
  const blocks = parseBlocks(content);
  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <pre
              key={idx}
              className="overflow-x-auto rounded-xl border border-navy-800 bg-navy-950 px-3.5 py-3 font-mono text-[12px] leading-6 text-emerald-100"
            >
              {block.lang && (
                <span className="mb-1 block font-body text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
                  {block.lang}
                </span>
              )}
              <code>{block.text}</code>
            </pre>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="ml-1 space-y-1.5">
              {block.items.map((item, ii) => (
                <li key={ii} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span className="flex-1">{renderInline(item, `ul-${idx}-${ii}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={idx} className="ml-1 space-y-1.5">
              {block.items.map((item, ii) => (
                <li key={ii} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold-500/15 font-body text-[10px] font-bold text-gold-700">
                    {ii + 1}
                  </span>
                  <span className="flex-1">{renderInline(item, `ol-${idx}-${ii}`)}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="whitespace-pre-wrap">
            {renderInline(block.text, `p-${idx}`)}
          </p>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Course chips
   ────────────────────────────────────────────────────────────── */

function CourseChips({ courses }) {
  if (courses.length === 0) return null;
  return (
    <div className="mt-3 border-t border-navy-100 pt-3">
      <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
        Related courses
      </p>
      <div className="flex flex-wrap gap-1.5">
        {courses.map(({ code, course }) => (
          <Link
            key={code}
            to={`/courses/${code}`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-navy-100 bg-cream px-3 py-1.5 transition-all hover:border-gold-300 hover:bg-gold-50/60"
          >
            <span className="font-mono text-[10px] font-bold text-gold-700">{code}</span>
            <span className="max-w-[14rem] truncate font-body text-[11px] font-semibold text-navy-800 group-hover:text-navy-900">
              {course.name}
            </span>
            <ArrowRight
              size={10}
              className="shrink-0 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Attachment chips
   ────────────────────────────────────────────────────────────── */

function AttachmentRow({ attachments }) {
  if (!attachments || attachments.length === 0) return null;

  const imageVideos = attachments.filter((a) => a.kind === 'image' || a.kind === 'video');
  const files = attachments.filter((a) => a.kind === 'pdf' || a.kind === 'text');

  return (
    <>
      {imageVideos.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {imageVideos.map((a) => (
            <div key={a.id} className="h-24 w-24 overflow-hidden rounded-lg ring-1 ring-white/20">
              {a.kind === 'video' ? (
                <video src={a.previewUrl} controls className="h-full w-full object-cover" />
              ) : (
                <img src={a.previewUrl} alt={a.name} className="h-full w-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {files.map((a) => (
            <span
              key={a.id}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-navy-50 px-2.5 py-1.5"
            >
              <FileText size={11} className="shrink-0 text-navy-500" />
              <span className="truncate font-body text-[11px] font-semibold text-navy-800">
                {a.name}
              </span>
              <span className="shrink-0 font-body text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                {a.kind}
              </span>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   Bubble
   ────────────────────────────────────────────────────────────── */

export default function TutorMessageBubble({
  id,
  role,
  content,
  attachments = [],
  streaming = false,
  isSpeaking = false,
  onToggleSpeak,
}) {
  const isUser = role === 'user';

  const relatedCourses = useMemo(
    () => (isUser || streaming ? [] : extractCourseCodes(content)),
    [content, isUser, streaming]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <span className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/20">
          <Sparkles size={14} />
        </span>
      )}
      <div
        className={cn(
          'group max-w-[85%] rounded-2xl px-4 py-3 font-body text-sm leading-relaxed',
          isUser
            ? 'rounded-br-md bg-navy-900 text-white shadow-premium'
            : 'rounded-bl-md border border-navy-100 bg-white text-navy-800 shadow-premium'
        )}
      >
        <AttachmentRow attachments={attachments} />

        {content && (
          isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <>
              <MessageBlocks content={content} />
              {streaming && (
                <span
                  className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-gold-500 align-middle"
                  aria-hidden="true"
                />
              )}
            </>
          )
        )}

        {!isUser && !streaming && relatedCourses.length > 0 && (
          <CourseChips courses={relatedCourses} />
        )}

        {!isUser && content && !streaming && onToggleSpeak && (
          <button
            type="button"
            onClick={() => onToggleSpeak(id, content)}
            aria-label={isSpeaking ? 'Stop reading aloud' : 'Read this reply aloud'}
            className={cn(
              'mt-2 flex items-center gap-1 rounded-md font-body text-[11px] font-semibold transition-opacity duration-200',
              isSpeaking
                ? 'text-gold-600 opacity-100'
                : 'text-navy-400 opacity-0 hover:text-gold-600 group-hover:opacity-100'
            )}
          >
            {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            {isSpeaking ? 'Stop' : 'Listen'}
          </button>
        )}
      </div>
    </motion.div>
  );
}