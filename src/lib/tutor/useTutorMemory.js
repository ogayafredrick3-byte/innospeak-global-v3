import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * useTutorMemory — persistent memory for InnoSpeak Compass.
 *
 * Two layers:
 *   1. Facts the learner has told the AI ("I work at X", "I know Python")
 *   2. Topics from past sessions ("debugging a React hook", "CV review")
 *
 * Both survive across sessions. Facts are also fed to the AI so it
 * doesn't re-ask about things the learner already said.
 */

const STORAGE_KEY = 'innospeak.compass.memory.v2';
const MAX_FACTS = 20;
const MAX_TOPICS = 8;

// Module-level store + subscriber set
const runtimeStore = new Map();
const subscribers = new Map();

function readAllFromLS() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllToLS(all) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

function emptyMemory() {
  return {
    name: '',
    sessions: 0,
    preferredMode: null,
    facts: [],       // [{ id, text, addedAt }]
    topics: [],      // [{ text, at }]
  };
}

function getRuntime(key) {
  if (!runtimeStore.has(key)) {
    const all = readAllFromLS();
    runtimeStore.set(key, { ...emptyMemory(), ...(all[key] || {}) });
  }
  return runtimeStore.get(key);
}

function setRuntime(key, value) {
  runtimeStore.set(key, value);
  const all = readAllFromLS();
  all[key] = value;
  writeAllToLS(all);
  const subs = subscribers.get(key);
  if (subs) subs.forEach((fn) => fn(value));
}

function subscribe(key, fn) {
  if (!subscribers.has(key)) subscribers.set(key, new Set());
  subscribers.get(key).add(fn);
  return () => {
    const subs = subscribers.get(key);
    if (subs) subs.delete(fn);
  };
}

function userKey(user) {
  return user?.id || 'guest';
}

function timeOfDayPhrase(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Working late';
}

function firstNameFrom(value) {
  if (!value) return '';
  return String(value).trim().split(/\s+/)[0] || '';
}

function factId() {
  return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/* ──────────────────────────────────────────────────────────────
   Lightweight fact extraction
   ────────────────────────────────────────────────────────────── */

const FACT_PATTERNS = [
  // Identity
  { re: /\bmy name is ([A-Z][a-z]{1,20})\b/i,              build: (m) => `Name is ${m[1]}` },
  // Work
  { re: /\bi work (?:at|for) ([A-Za-z0-9 '&.,-]{2,60})/i,  build: (m) => `Works at ${m[1].trim()}` },
  { re: /\bi'm a ([A-Za-z][A-Za-z ]{2,40})\b/i,            build: (m) => `Is a ${m[1].trim()}` },
  { re: /\bi am a ([A-Za-z][A-Za-z ]{2,40})\b/i,           build: (m) => `Is a ${m[1].trim()}` },
  // Location
  { re: /\bi live in ([A-Z][A-Za-z '.,-]{2,50})/i,         build: (m) => `Lives in ${m[1].trim()}` },
  { re: /\bi'm based in ([A-Z][A-Za-z '.,-]{2,50})/i,      build: (m) => `Based in ${m[1].trim()}` },
  // Skills
  { re: /\bi know (python|javascript|typescript|react|node|java|c\+\+|html|css|sql)\b/i, build: (m) => `Knows ${m[1]}` },
  { re: /\bi'm learning ([A-Za-z][A-Za-z .+#-]{2,40})/i,   build: (m) => `Learning ${m[1].trim()}` },
  // Goals
  { re: /\bi want to become (?:a|an) ([A-Za-z][A-Za-z ]{2,50})/i, build: (m) => `Wants to become ${m[1].trim()}` },
  { re: /\bmy goal is to ([A-Za-z][A-Za-z ,'.-]{4,80})/i,  build: (m) => `Goal: ${m[1].trim()}` },
];

export function extractFacts(text) {
  if (!text) return [];
  const found = [];
  for (const { re, build } of FACT_PATTERNS) {
    const match = text.match(re);
    if (match) found.push(build(match));
  }
  return found;
}

/** Derive a short topic label from a user message. */
export function deriveTopic(text) {
  if (!text) return null;
  const cleaned = String(text).trim().replace(/\s+/g, ' ');
  if (cleaned.length < 6) return null;
  // Take first sentence, cap length
  const firstSentence = cleaned.split(/[.!?]/)[0] || cleaned;
  const topic = firstSentence.length > 80
    ? `${firstSentence.slice(0, 77)}…`
    : firstSentence;
  return topic;
}

/* ──────────────────────────────────────────────────────────────
   Hook
   ────────────────────────────────────────────────────────────── */

export default function useTutorMemory() {
  const { user, profile } = useAuth();
  const key = userKey(user);
  const [memory, setMemory] = useState(() => getRuntime(key));

  useEffect(() => {
    setMemory(getRuntime(key));
    return subscribe(key, setMemory);
  }, [key]);

  const name = useMemo(() => {
    return (
      firstNameFrom(profile?.full_name) ||
      firstNameFrom(user?.user_metadata?.full_name) ||
      firstNameFrom(memory.name) ||
      ''
    );
  }, [profile?.full_name, user?.user_metadata?.full_name, memory.name]);

  const rememberName = useCallback((raw) => {
    const first = firstNameFrom(raw);
    if (!first) return;
    const current = getRuntime(key);
    if (current.name === first) return;
    setRuntime(key, { ...current, name: first });
  }, [key]);

  const rememberFacts = useCallback((factTexts) => {
    const incoming = Array.isArray(factTexts) ? factTexts : [factTexts];
    if (incoming.length === 0) return;
    const current = getRuntime(key);
    const existing = new Set(current.facts.map((f) => f.text.toLowerCase()));
    const additions = incoming
      .filter((t) => typeof t === 'string' && t.trim())
      .filter((t) => !existing.has(t.toLowerCase()))
      .map((t) => ({ id: factId(), text: t.trim(), addedAt: new Date().toISOString() }));
    if (additions.length === 0) return;
    const next = [...current.facts, ...additions].slice(-MAX_FACTS);
    setRuntime(key, { ...current, facts: next });
  }, [key]);

  const rememberTopic = useCallback((text) => {
    const topic = deriveTopic(text);
    if (!topic) return;
    const current = getRuntime(key);
    const withoutDup = current.topics.filter((t) => t.text !== topic);
    const next = [{ text: topic, at: new Date().toISOString() }, ...withoutDup].slice(0, MAX_TOPICS);
    setRuntime(key, { ...current, topics: next });
  }, [key]);

  const clearFacts = useCallback(() => {
    const current = getRuntime(key);
    setRuntime(key, { ...current, facts: [] });
  }, [key]);

  const markSession = useCallback(() => {
    const current = getRuntime(key);
    setRuntime(key, { ...current, sessions: (current.sessions || 0) + 1 });
  }, [key]);

  const setPreferredMode = useCallback((modeId) => {
    const current = getRuntime(key);
    if (current.preferredMode === modeId) return;
    setRuntime(key, { ...current, preferredMode: modeId });
  }, [key]);

  return {
    name,
    isReturning: (memory.sessions || 0) > 0,
    greeting: timeOfDayPhrase(),
    sessions: memory.sessions || 0,
    preferredMode: memory.preferredMode,
    facts: memory.facts || [],
    topics: memory.topics || [],
    rememberName,
    rememberFacts,
    rememberTopic,
    clearFacts,
    markSession,
    setPreferredMode,
  };
}