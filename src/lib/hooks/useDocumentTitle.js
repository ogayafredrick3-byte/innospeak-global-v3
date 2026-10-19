import { useEffect } from 'react';

/**
 * useDocumentTitle — lightweight SEO hook.
 *
 * Keeps the document title in sync with the current page. Call it from
 * any page component:
 *
 *   useDocumentTitle('About — InnoSpeak Global');
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
