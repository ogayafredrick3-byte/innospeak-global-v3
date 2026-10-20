import { safeHttpUrl } from '../security/urls.js';

/** Validate tutor-entered lesson fields before they are persisted or published. */
export function getLessonValidationError({
  title,
  videoUrl = '',
  externalUrl = '',
  content = '',
  practicalActivity = '',
  resourceCount = 0,
  publish = false,
} = {}) {
  if (!String(title || '').trim()) return 'Add a lesson title before saving.';
  if (videoUrl && !safeHttpUrl(videoUrl)) return 'The video URL must be a valid HTTP or HTTPS URL.';
  if (externalUrl && !safeHttpUrl(externalUrl)) return 'The external URL must be a valid HTTP or HTTPS URL.';

  const plainContent = String(content || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  const hasTeachingMaterial = plainContent.length >= 20 || Boolean(videoUrl && safeHttpUrl(videoUrl)) ||
    Boolean(externalUrl && safeHttpUrl(externalUrl)) || Boolean(String(practicalActivity || '').trim()) ||
    Number(resourceCount) > 0;

  if (publish && !hasTeachingMaterial) {
    return 'Add lesson content, a valid video or external link, a practical activity, or at least one saved resource before publishing. You can save an incomplete lesson as a draft.';
  }
  return null;
}
