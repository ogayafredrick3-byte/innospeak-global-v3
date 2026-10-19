const ALLOWED_TAGS = new Set([
  'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BR', 'HR',
  'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'BLOCKQUOTE',
  'PRE', 'CODE', 'A', 'SPAN', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD',
]);
const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'FORM', 'INPUT', 'BUTTON', 'TEMPLATE', 'META', 'LINK']);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function markdownToHtml(markdown) {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const output = [];
  let paragraph = [];
  let listType = null;
  let listItems = [];
  let quoteLines = [];

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${paragraph.map(inlineMarkdown).join('<br>')}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (listType && listItems.length) {
      output.push(`<${listType}>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${listType}>`);
    }
    listType = null;
    listItems = [];
  };
  const flushQuote = () => {
    if (quoteLines.length) output.push(`<blockquote>${quoteLines.map(inlineMarkdown).join('<br>')}</blockquote>`);
    quoteLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    const bullet = trimmed.match(/^[-*+]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    const quote = trimmed.match(/^>\s?(.*)$/);

    if (!trimmed) {
      flushParagraph(); flushList(); flushQuote();
      continue;
    }
    if (heading) {
      flushParagraph(); flushList(); flushQuote();
      const level = heading[1].length;
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    if (bullet || ordered) {
      flushParagraph(); flushQuote();
      const nextType = bullet ? 'ul' : 'ol';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((bullet || ordered)[1]);
      continue;
    }
    if (quote) {
      flushParagraph(); flushList();
      quoteLines.push(quote[1]);
      continue;
    }
    flushList(); flushQuote();
    paragraph.push(trimmed);
  }
  flushParagraph(); flushList(); flushQuote();
  return output.join('');
}

/**
 * Sanitise instructor-authored HTML before it is inserted into the lesson DOM.
 * Rich-text formatting is retained; scripts, embeds, event handlers, inline
 * styles and unsafe URL schemes are removed. Plain Markdown is rendered first.
 */
export function sanitizeLessonContent(value) {
  const source = String(value ?? '');
  if (!source.trim()) return '';

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(source);
  const candidate = looksLikeHtml ? source : markdownToHtml(source);

  if (typeof DOMParser === 'undefined') return escapeHtml(candidate);

  const parsed = new DOMParser().parseFromString(candidate, 'text/html');
  const documentRef = parsed;

  function cleanNode(node) {
    if (node.nodeType === 3) return documentRef.createTextNode(node.nodeValue || '');
    if (node.nodeType !== 1) return null;

    const tag = node.tagName.toUpperCase();
    if (DROP_TAGS.has(tag)) return null;
    if (!ALLOWED_TAGS.has(tag)) {
      const fragment = documentRef.createDocumentFragment();
      Array.from(node.childNodes).forEach((child) => {
        const cleaned = cleanNode(child);
        if (cleaned) fragment.appendChild(cleaned);
      });
      return fragment;
    }

    const safe = documentRef.createElement(tag.toLowerCase());
    if (tag === 'A') {
      const rawHref = node.getAttribute('href') || '';
      const href = rawHref.trim();
      const safeProtocol = /^(https?:|mailto:)/i.test(href) || (/^(\/|#|\?)/.test(href) && !/^\/\//.test(href));
      if (href && safeProtocol) safe.setAttribute('href', href);
      safe.setAttribute('rel', 'noopener noreferrer');
      safe.setAttribute('target', '_blank');
      const title = node.getAttribute('title');
      if (title) safe.setAttribute('title', title.slice(0, 200));
    }
    Array.from(node.childNodes).forEach((child) => {
      const cleaned = cleanNode(child);
      if (cleaned) safe.appendChild(cleaned);
    });
    return safe;
  }

  const container = documentRef.createElement('div');
  Array.from(documentRef.body.childNodes).forEach((node) => {
    const cleaned = cleanNode(node);
    if (cleaned) container.appendChild(cleaned);
  });
  return container.innerHTML;
}

export default function SafeLessonContent({ content, className = '' }) {
  const html = sanitizeLessonContent(content);
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
