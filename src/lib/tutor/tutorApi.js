import { supabase } from '../supabase/client';

/**
 * tutorApi — data layer for InnoSpeak Compass.
 *
 * Two paths:
 *   askTutor()       — single-shot request (fallback, no streaming)
 *   askTutorStream() — SSE stream with delta callbacks
 *
 * Streaming requires a direct fetch to the Edge Function URL because
 * supabase.functions.invoke buffers the whole response. We read the
 * anon key from env; if it's missing, we fall back to non-streaming.
 */

function getFunctionUrl() {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/functions/v1/tutor-chat`;
}

function getAnonKey() {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
}

/* ──────────────────────────────────────────────────────────────
   Non-streaming
   ────────────────────────────────────────────────────────────── */

export async function askTutor({ personaId, messages, context = null }) {
  if (!supabase) {
    throw new Error(
      'The AI Tutor is unavailable because Supabase has not been configured.'
    );
  }

  const { data, error } = await supabase.functions.invoke('tutor-chat', {
    body: { personaId, messages, context },
  });

  if (error) {
    throw new Error(error.message || 'The AI Tutor could not respond. Please try again.');
  }
  if (!data?.reply) {
    throw new Error('The AI Tutor sent back an empty response. Please try again.');
  }
  return data.reply;
}

/* ──────────────────────────────────────────────────────────────
   Streaming
   ────────────────────────────────────────────────────────────── */

/**
 * Stream a tutor reply.
 *
 * @param {object} params
 * @param {string} params.personaId
 * @param {Array}  params.messages
 * @param {object} params.context
 * @param {(delta: string, fullText: string) => void} params.onDelta
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<string>} the full reply text
 *
 * Throws on transport errors. If the server reports an error inside
 * the stream, throws that error. Falls back to non-streaming if
 * streaming isn't possible (missing URL/key, or the browser can't
 * read streams).
 */
export async function askTutorStream({
  personaId,
  messages,
  context = null,
  onDelta,
  signal,
}) {
  const url = getFunctionUrl();
  const key = getAnonKey();
  const canStream =
    Boolean(url) &&
    Boolean(key) &&
    typeof ReadableStream !== 'undefined' &&
    typeof TextDecoder !== 'undefined';

  if (!canStream) {
    // Graceful fallback — single-shot response, one big delta
    const reply = await askTutor({ personaId, messages, context });
    onDelta?.(reply, reply);
    return reply;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ personaId, messages, context, stream: true }),
    signal,
  });

  if (!res.ok || !res.body) {
    // Network/status error — fall back to non-streaming
    const reply = await askTutor({ personaId, messages, context });
    onDelta?.(reply, reply);
    return reply;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let streamError = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        for (const line of event.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          try {
            const parsed = JSON.parse(json);
            if (parsed.error) {
              streamError = parsed.error;
              break;
            }
            if (parsed.delta) {
              fullText += parsed.delta;
              onDelta?.(parsed.delta, fullText);
            }
            // parsed.done is a signal, nothing to do
          } catch {
            /* skip malformed event */
          }
        }
        if (streamError) break;
      }
      if (streamError) break;
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  if (streamError) throw new Error(streamError);
  if (!fullText.trim()) {
    throw new Error('The AI Tutor sent back an empty response. Please try again.');
  }
  return fullText;
}

export function isTutorConfigured() {
  return Boolean(supabase);
}