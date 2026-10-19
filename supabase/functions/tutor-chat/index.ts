// supabase/functions/tutor-chat/index.ts
//
// InnoSpeak Compass — Edge Function (Gemini backend)
//
// Features:
//   - Streaming responses via streamGenerateContent (SSE relay)
//   - PDF + text file attachments
//   - Learner memory facts (context.facts)
//   - Recent session topics (context.topics)
//   - Tutor persona for instructors/staff
//   - Graceful error handling at every step
//
// Deploy: supabase functions deploy tutor-chat
// Secret: supabase secrets set GEMINI_API_KEY=AIza...

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-3.5-flash-lite';
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;
const MAX_OUTPUT_TOKENS = 1800;
const MAX_HISTORY_MESSAGES = 24;
const MAX_LEARNER_CONTEXT_CHARS = 4000;
const MAX_FACTS = 20;
const MAX_TOPICS = 8;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ModeId = 'study' | 'build' | 'write' | 'career' | 'tutor';

const LEGACY_MODE_MAP: Record<string, ModeId> = {
  learner: 'study',
  innovator: 'career',
  engineer: 'build',
  developer: 'build',
};

const SYSTEM_PROMPTS: Record<ModeId, string> = {
  study:
    "You are InnoSpeak Compass in STUDY mode — a patient tutor for someone actively learning on the InnoSpeak Global platform. " +
    "InnoSpeak's pathways span Communication, Technical (web, data, AI/ML), and Leadership. " +
    "Explain concepts clearly, break topics into steps, check understanding with short questions, and offer to quiz or summarise. " +
    "When a question maps to an InnoSpeak course, mention it briefly using the exact course code (e.g. PY101). " +
    "Keep answers focused and practical.",
  build:
    "You are InnoSpeak Compass in BUILD mode — a coding and engineering assistant. " +
    "Help with code: debugging, review, explaining errors, idiomatic fixes. " +
    "Default to React, JavaScript/TypeScript, web development unless another stack is specified. " +
    "Use short code blocks, explain the 'why', and flag edge cases or risks. " +
    "Connect to InnoSpeak Labs courses (WEB101, REA101, JSC101) using exact codes when relevant. " +
    "Never write malicious or unsafe code.",
  write:
    "You are InnoSpeak Compass in WRITE mode — a writing partner. " +
    "Help with CVs, cover letters, essays, portfolio descriptions, professional emails. " +
    "Ask for audience and tone when unclear. Offer concrete rewrites, not vague advice. " +
    "Prefer clear, direct prose over corporate padding. " +
    "Suggest InnoSpeak courses that strengthen writing (ENG105, CVW101) using exact codes. " +
    "Never invent credentials, employers, or achievements the person hasn't mentioned.",
  career:
    "You are InnoSpeak Compass in CAREER mode — a career advisor. " +
    "Help with career pathing, interview prep, opportunity discovery, skill-gap analysis, translating learning into applications. " +
    "Reference the InnoSpeak Career Hub (opportunities, practical connections, employer partners). " +
    "Be honest about gaps and trade-offs. " +
    "Name exact InnoSpeak course codes when a skill would help. Keep answers concrete and action-oriented.",
  tutor:
    "You are InnoSpeak Compass in TUTOR mode — an instructional design and pedagogy assistant for instructors, teaching staff, and course designers on the InnoSpeak Global platform. " +
    "Help with lesson planning, learning outcomes, assessment design, rubric creation, curriculum structuring, feedback language, and inclusive teaching strategies. " +
    "Reference Bloom's taxonomy, constructive alignment, and backward design where relevant. " +
    "Match InnoSpeak's module → lesson → resource content pattern when suggesting structures. " +
    "Prefer concrete, actionable suggestions over abstract theory. " +
    "When drafting feedback or rubric language, model the tone InnoSpeak tutors should use: specific, respectful, growth-oriented.",
};

function resolveMode(raw: unknown): ModeId {
  if (typeof raw === 'string') {
    if (raw in SYSTEM_PROMPTS) return raw as ModeId;
    if (raw in LEGACY_MODE_MAP) return LEGACY_MODE_MAP[raw];
  }
  return 'study';
}

interface TutorContext {
  name?: string;
  learner?: string;
  facts?: string[];
  topics?: string[];
}

function sanitizeContext(raw: unknown): TutorContext {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const out: TutorContext = {};

  if (typeof obj.name === 'string') {
    const trimmed = obj.name.trim().slice(0, 40);
    if (/^[A-Za-z][A-Za-z'-]*$/.test(trimmed)) out.name = trimmed;
  }

  if (typeof obj.learner === 'string') {
    const trimmed = obj.learner.trim().slice(0, MAX_LEARNER_CONTEXT_CHARS);
    if (trimmed) out.learner = trimmed;
  }

  if (Array.isArray(obj.facts)) {
    out.facts = obj.facts
      .filter((f): f is string => typeof f === 'string')
      .map((f) => f.trim().slice(0, 200))
      .filter(Boolean)
      .slice(0, MAX_FACTS);
  }

  if (Array.isArray(obj.topics)) {
    out.topics = obj.topics
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.trim().slice(0, 120))
      .filter(Boolean)
      .slice(0, MAX_TOPICS);
  }

  return out;
}

function buildSystemPrompt(modeId: ModeId, context: TutorContext): string {
  const parts: string[] = [SYSTEM_PROMPTS[modeId]];

  if (context.learner) {
    parts.push(
      '---\n' +
        'Here is what you know about this learner from their InnoSpeak account. ' +
        'FACTUAL background — reference naturally when relevant. ' +
        'Never list it back verbatim. Never invent details not listed here.\n\n' +
        context.learner
    );
  }

  if (context.facts && context.facts.length > 0) {
    parts.push(
      '---\n' +
        'Things this person has told you in past conversations (remembered across sessions):\n' +
        context.facts.map((f) => `- ${f}`).join('\n') +
        '\n\nUse these naturally. Do not re-ask about them.'
    );
  }

  if (context.topics && context.topics.length > 0) {
    parts.push(
      '---\n' +
        'Recent topics they have asked about in past sessions (most recent first):\n' +
        context.topics.map((t) => `- ${t}`).join('\n')
    );
  }

  if (context.name) {
    parts.push(
      `\nThe person you're talking to is named ${context.name}. ` +
        'Address them by first name occasionally — naturally, not every reply.'
    );
  }

  return parts.join('\n\n');
}

interface Attachment {
  mimeType: string;
  base64: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
}

const MAX_ATTACHMENTS_PER_MESSAGE = 4;

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const cleaned = raw
    .filter(
      (m): m is Record<string, unknown> =>
        Boolean(m) && (m.role === 'user' || m.role === 'assistant')
    )
    .map((m) => {
      const content = typeof m.content === 'string' ? m.content.slice(0, 8000) : '';
      const attachments = Array.isArray(m.attachments)
        ? m.attachments
            .filter(
              (a: unknown): a is Attachment =>
                Boolean(a) &&
                typeof (a as Attachment).mimeType === 'string' &&
                typeof (a as Attachment).base64 === 'string'
            )
            .slice(0, MAX_ATTACHMENTS_PER_MESSAGE)
        : undefined;
      return { role: m.role as 'user' | 'assistant', content, attachments };
    })
    .filter(
      (m) => m.content.trim().length > 0 || (m.attachments && m.attachments.length > 0)
    );

  return cleaned.slice(-MAX_HISTORY_MESSAGES);
}

function toGeminiContents(messages: ChatMessage[]) {
  return messages.map((m) => {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    if (m.content) parts.push({ text: m.content });
    for (const a of m.attachments ?? []) {
      parts.push({ inlineData: { mimeType: a.mimeType, data: a.base64 } });
    }
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function sseResponse(stream: ReadableStream) {
  return new Response(stream, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

/* ──────────────────────────────────────────────────────────────
   Streaming handler — pipes Gemini SSE through as reframed events
   ────────────────────────────────────────────────────────────── */

async function handleStreamingRequest(
  modeId: ModeId,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<Response> {
  const geminiRes = await fetch(
    `${GEMINI_BASE}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: toGeminiContents(messages),
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.8 },
      }),
    }
  );

  if (!geminiRes.ok || !geminiRes.body) {
    const errText = await geminiRes.text().catch(() => '');
    console.error('Gemini stream error:', geminiRes.status, errText);

    const message =
      geminiRes.status === 429
        ? "I'm getting a lot of requests right now. Please try again in a moment."
        : 'I could not respond right now. Please try again.';

    // Emit as SSE error so client handles it uniformly
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
        controller.close();
      },
    });
    return sseResponse(stream);
  }

  const reader = geminiRes.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const json = line.slice(6).trim();
            if (!json) continue;
            try {
              const parsed = JSON.parse(json);
              const text = (parsed.candidates?.[0]?.content?.parts ?? [])
                .map((p: { text?: string }) => p.text ?? '')
                .join('');
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`)
                );
              }
            } catch {
              /* skip malformed */
            }
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } catch (err) {
        console.error('Stream relay error:', err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'The connection dropped mid-response.' })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return sseResponse(stream);
}

/* ──────────────────────────────────────────────────────────────
   Non-streaming handler (fallback + explicit non-stream requests)
   ────────────────────────────────────────────────────────────── */

async function handleNonStreamingRequest(
  modeId: ModeId,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<Response> {
  const geminiRes = await fetch(`${GEMINI_BASE}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: toGeminiContents(messages),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.8 },
    }),
  });

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error('Gemini API error:', geminiRes.status, errText);

    if (geminiRes.status === 429) {
      return jsonResponse(
        { error: "I'm getting a lot of requests right now. Please try again in a moment." },
        429
      );
    }
    return jsonResponse({ error: 'I could not respond right now. Please try again.' }, 502);
  }

  const data = await geminiRes.json();
  const reply = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part: { text?: string }) => part.text ?? '')
    .join('\n')
    .trim();

  if (!reply) {
    return jsonResponse({ error: 'I sent back an empty response. Please try again.' }, 502);
  }

  return jsonResponse({ reply });
}

/* ──────────────────────────────────────────────────────────────
   Entry
   ────────────────────────────────────────────────────────────── */

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!GEMINI_API_KEY) {
    return jsonResponse({ error: 'The AI Tutor is not configured on the server yet.' }, 500);
  }

  try {
    const body = await req.json();
    const modeId = resolveMode(body?.personaId);
    const context = sanitizeContext(body?.context);
    const messages = sanitizeMessages(body?.messages);
    const wantStream = body?.stream === true;

    if (messages.length === 0) {
      return jsonResponse({ error: 'No message provided.' }, 400);
    }

    const systemPrompt = buildSystemPrompt(modeId, context);

    if (wantStream) {
      return await handleStreamingRequest(modeId, systemPrompt, messages);
    }
    return await handleNonStreamingRequest(modeId, systemPrompt, messages);
  } catch (err) {
    console.error('tutor-chat error:', err);
    return jsonResponse({ error: 'Something went wrong. Please try again.' }, 500);
  }
});