/**
 * attachments — turn files the user picks in the Composer into
 * payloads the Edge Function can send to Gemini.
 *
 * Categories:
 *   image/*          → base64 + inlineData
 *   video/*          → base64 + inlineData
 *   application/pdf  → base64 + inlineData
 *   text/*, code     → read as text, sent as message content
 *
 * Text/code files stay as text (cheap, Gemini reads them fine).
 * Everything else is base64 inline (Gemini's native multimodal format).
 */

export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB per file
export const MAX_ATTACHMENTS = 4;

const IMAGE_VIDEO_PREFIXES = ['image/', 'video/'];
const TEXT_PREFIXES = ['text/'];
const PDF_MIME = 'application/pdf';

// Common code file extensions we treat as text
const CODE_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'kt', 'swift',
  'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'html', 'css', 'scss', 'sass',
  'json', 'yaml', 'yml', 'toml', 'xml', 'md', 'markdown', 'csv', 'sql',
  'sh', 'bash', 'zsh', 'env', 'ini', 'conf', 'log', 'txt',
]);

export function isAcceptedFile(file) {
  const type = file.type || '';
  if (IMAGE_VIDEO_PREFIXES.some((p) => type.startsWith(p))) return true;
  if (TEXT_PREFIXES.some((p) => type.startsWith(p))) return true;
  if (type === PDF_MIME) return true;

  // Fall back to extension for common code files with unknown mime
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext && CODE_EXTENSIONS.has(ext)) return true;

  return false;
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let attachmentIdCounter = 0;
function nextAttachmentId() {
  attachmentIdCounter += 1;
  return `attachment-${attachmentIdCounter}`;
}

function classifyFile(file) {
  const type = file.type || '';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type === PDF_MIME) return 'pdf';

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (CODE_EXTENSIONS.has(ext)) return 'text';

  return 'text';
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Couldn't read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Couldn't read ${file.name}.`));
    reader.readAsText(file);
  });
}

/**
 * Read a File into an attachment object.
 *
 * Shape:
 *   { id, name, mimeType, kind, size, previewUrl?, base64?, text? }
 *
 * - image / video / pdf: `base64` populated, `previewUrl` populated
 * - text:               `text` populated (base64 omitted)
 */
export async function fileToAttachment(file) {
  if (!isAcceptedFile(file)) {
    throw new Error(`${file.name} isn't a supported file type.`);
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`${file.name} is too large (max ${formatFileSize(MAX_FILE_SIZE_BYTES)}).`);
  }

  const kind = classifyFile(file);
  const base = {
    id: nextAttachmentId(),
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    kind,
    size: file.size,
  };

  if (kind === 'text') {
    const text = await readAsText(file);
    return { ...base, text };
  }

  const dataUrl = await readAsDataURL(file);
  const base64 = dataUrl.split(',')[1] || '';

  // PDFs don't render in <img> or <video> — no preview
  const previewUrl = kind === 'image' || kind === 'video' ? dataUrl : undefined;

  return { ...base, base64, previewUrl };
}