import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { askTutor, askTutorStream, isTutorConfigured } from '../lib/tutor/tutorApi';
import { DEFAULT_PERSONA_ID } from '../lib/tutor/tutorPersonas';
import { useAuth } from '../context/AuthContext.jsx';
import useTutorMemory, { extractFacts } from '../lib/tutor/useTutorMemory';
import useLearnerContext from '../lib/tutor/useLearnerContext';

const STORAGE_PREFIX = 'innospeak.compass.sessions.v2';
const MAX_SESSIONS = 40;

let messageIdCounter = 0;
function nextMessageId() {
  messageIdCounter += 1;
  return `cm-${Date.now().toString(36)}-${messageIdCounter}`;
}

let sessionIdCounter = 0;
function nextSessionId() {
  sessionIdCounter += 1;
  return `cs-${Date.now().toString(36)}-${sessionIdCounter}`;
}

function storageKey(userId) {
  return `${STORAGE_PREFIX}.${userId || 'guest'}`;
}

function loadSessions(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSessions(userId, sessions) {
  try {
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify(sessions.slice(0, MAX_SESSIONS))
    );
  } catch {
    /* ignore */
  }
}

const NAME_INTRO_RE = /\b(?:my name is|i am|i'm|call me)\s+([A-Z][a-z]{1,20})\b/;

function extractNameIntro(text) {
  if (!text) return null;
  const match = text.match(NAME_INTRO_RE);
  return match ? match[1] : null;
}

export default function useTutorChat(initialPersonaId = DEFAULT_PERSONA_ID) {
  const { user } = useAuth();
  const memory = useTutorMemory();
  const learner = useLearnerContext();
  const userId = user?.id || null;

  // Refs keep latest values inside stable sendMessage without retriggering
  const learnerContextRef = useRef(learner.serialised);
  useEffect(() => { learnerContextRef.current = learner.serialised; }, [learner.serialised]);

  const factsRef = useRef([]);
  const topicsRef = useRef([]);
  useEffect(() => {
    factsRef.current = (memory.facts || []).map((f) => f.text);
    topicsRef.current = (memory.topics || []).map((t) => t.text);
  }, [memory.facts, memory.topics]);

  const [sessions, setSessions] = useState(() => loadSessions(userId));
  const [activeSessionId, setActiveSessionId] = useState(
    () => loadSessions(userId)[0]?.id || null
  );
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [streamingMessageId, setStreamingMessageId] = useState(null);

  useEffect(() => {
    const loaded = loadSessions(userId);
    setSessions(loaded);
    setActiveSessionId(loaded[0]?.id || null);
  }, [userId]);

  useEffect(() => {
    saveSessions(userId, sessions);
  }, [userId, sessions]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const messages = activeSession?.messages || [];
  const personaId = activeSession?.personaId || initialPersonaId;

  const updateSession = useCallback((sessionId, updater) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...updater(s), updatedAt: new Date().toISOString() } : s
      )
    );
  }, []);

  const createSession = useCallback(
    (personaIdForNew = initialPersonaId) => {
      const fresh = {
        id: nextSessionId(),
        personaId: personaIdForNew,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSessions((prev) => [fresh, ...prev]);
      setActiveSessionId(fresh.id);
      return fresh.id;
    },
    [initialPersonaId]
  );

  const newSession = useCallback(
    (personaIdForNew = initialPersonaId) => {
      setError(null);
      const current = sessions.find((s) => s.id === activeSessionId);
      if (current && current.messages.length === 0) {
        updateSession(current.id, (s) => ({ ...s, personaId: personaIdForNew, messages: [] }));
        return;
      }
      createSession(personaIdForNew);
    },
    [sessions, activeSessionId, initialPersonaId, createSession, updateSession]
  );

  const selectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
    setError(null);
  }, []);

  const deleteSession = useCallback(
    (sessionId) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== sessionId);
        if (activeSessionId === sessionId) {
          setActiveSessionId(next[0]?.id || null);
        }
        return next;
      });
    },
    [activeSessionId]
  );

  const resetConversation = useCallback(() => {
    if (!activeSessionId) {
      setError(null);
      return;
    }
    updateSession(activeSessionId, (s) => ({ ...s, messages: [] }));
    setError(null);
  }, [activeSessionId, updateSession]);

  const changePersona = useCallback(
    (nextPersonaId) => {
      setError(null);
      const current = sessions.find((s) => s.id === activeSessionId);
      if (current && current.messages.length === 0) {
        updateSession(current.id, (s) => ({ ...s, personaId: nextPersonaId }));
      } else {
        createSession(nextPersonaId);
      }
      memory.setPreferredMode(nextPersonaId);
    },
    [sessions, activeSessionId, createSession, updateSession, memory]
  );

  const sendMessage = useCallback(
    async (text, attachments = []) => {
      const trimmed = text.trim();
      if ((!trimmed && attachments.length === 0) || isSending) return;

      // Learn about the user from their message
      const introName = extractNameIntro(trimmed);
      if (introName) memory.rememberName(introName);
      const facts = extractFacts(trimmed);
      if (facts.length > 0) memory.rememberFacts(facts);
      if (trimmed) memory.rememberTopic(trimmed);

      // Ensure we have a session
      let sessionId = activeSessionId;
      let baseSessions = sessions;
      let current = baseSessions.find((s) => s.id === sessionId) || null;

      if (!current) {
        const fresh = {
          id: nextSessionId(),
          personaId: initialPersonaId,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        baseSessions = [fresh, ...baseSessions];
        sessionId = fresh.id;
        current = fresh;
        setSessions(baseSessions);
        setActiveSessionId(sessionId);
      }

      const userMessage = {
        id: nextMessageId(),
        role: 'user',
        content: trimmed,
        attachments: attachments.map(({ id, name, mimeType, kind, previewUrl, text: fileText }) => ({
          id, name, mimeType, kind, previewUrl,
          // Keep the file text small enough for localStorage
          text: fileText ? fileText.slice(0, 500) : undefined,
        })),
      };

      // Build a payload where text attachments become part of the content
      const history = [...(current.messages || []), userMessage];

      const assistantId = nextMessageId();

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [
                  ...history,
                  { id: assistantId, role: 'assistant', content: '', streaming: true },
                ],
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );
      setError(null);
      setIsSending(true);
      setStreamingMessageId(assistantId);

      const currentMode = current.personaId || initialPersonaId;

      // Build the API payload — text files folded into content
      const apiMessages = history.map(({ role, content, attachments: atts }, index) => {
        const isLast = index === history.length - 1;
        let finalContent = content;

        // Fold text attachments into the message content (small + cheap)
        if (isLast && attachments.length > 0) {
          const textFiles = attachments.filter((a) => a.kind === 'text' && a.text);
          for (const tf of textFiles) {
            finalContent += `\n\n[Attached file: ${tf.name}]\n${tf.text.slice(0, 6000)}`;
          }
        }

        return {
          role,
          content: finalContent,
          attachments: isLast
            ? attachments
                .filter((a) => a.kind !== 'text')
                .map(({ mimeType, base64 }) => ({ mimeType, base64 }))
            : undefined,
        };
      });

      const context = {
        name: memory.name || introName || null,
        learner: learnerContextRef.current || null,
        facts: factsRef.current,
        topics: topicsRef.current,
      };

      const updateAssistantContent = (content) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantId ? { ...m, content } : m
                  ),
                }
              : s
          )
        );
      };

      try {
        // Try streaming first; tutorApi falls back automatically
        await askTutorStream({
          personaId: currentMode,
          messages: apiMessages,
          context,
          onDelta: (_delta, fullText) => {
            updateAssistantContent(fullText);
          },
        });

        // Mark streaming done
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantId ? { ...m, streaming: false } : m
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : s
          )
        );
      } catch (err) {
        // Streaming failed → clear the placeholder and show the error
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.filter((m) => m.id !== assistantId),
                }
              : s
          )
        );
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setIsSending(false);
        setStreamingMessageId(null);
      }
    },
    [sessions, activeSessionId, initialPersonaId, isSending, memory]
  );

  return {
    personaId,
    messages,
    isSending,
    error,
    streamingMessageId,
    sendMessage,
    resetConversation,
    changePersona,
    sessions,
    activeSessionId,
    selectSession,
    newSession,
    deleteSession,
    learnerContext: learner.snapshot,
    learnerContextSerialised: learner.serialised,
    learnerContextLoading: learner.loading,
    refreshLearnerContext: learner.refresh,
    isConfigured: isTutorConfigured(),
  };
}