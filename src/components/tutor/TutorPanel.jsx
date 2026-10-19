import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, TriangleAlert, Paperclip, Mic, X,
  Volume2, VolumeX, FileText,
} from 'lucide-react';
import TutorMessageBubble from './TutorMessageBubble';
import TutorTypingIndicator from './TutorTypingIndicator';
import TutorGreeting from './TutorGreeting';
import { getPersonaById } from '../../lib/tutor/tutorPersonas';
import useTutorMemory from '../../lib/tutor/useTutorMemory';
import { cn } from '../../utils/cn.js';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis';
import {
  fileToAttachment,
  MAX_ATTACHMENTS,
  formatFileSize,
  MAX_FILE_SIZE_BYTES,
} from '../../lib/tutor/attachments';

export default function TutorPanel({
  personaId,
  messages,
  isSending,
  error,
  onSend,
  variant = 'compact',
  memory: memoryProp = null,
}) {
  const [draft, setDraft] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [attachError, setAttachError] = useState(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const persona = getPersonaById(personaId);

  const internalMemory = useTutorMemory();
  const memory = memoryProp || internalMemory;

  const {
    isSupported: micSupported,
    isListening,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition({
    onResult: (transcript) => {
      setDraft((prev) => (prev ? `${prev} ${transcript}` : transcript));
    },
  });

  const { isSupported: speechSupported, speakingId, speak, stop: stopSpeaking } = useSpeechSynthesis();

  // Track last auto-spoken message so we don't replay on re-render
  const lastSpokenRef = useRef(null);

  // Auto-scroll on new content (including streaming)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  // Voice mode — auto-speak the newest assistant message once streaming finishes
  useEffect(() => {
    if (!voiceMode || !speechSupported) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;
    if (last.streaming) return;
    if (!last.content?.trim()) return;
    if (lastSpokenRef.current === last.id) return;

    lastSpokenRef.current = last.id;
    speak(last.id, last.content);
  }, [messages, voiceMode, speechSupported, speak]);

  // Voice mode — restart mic when AI finishes speaking
  useEffect(() => {
    if (!voiceMode || !micSupported) return;
    if (speakingId) return;              // AI still talking
    if (isListening) return;             // mic already live
    if (isSending) return;               // request in flight
    // Small delay so the user's own voice doesn't immediately retrigger
    const t = setTimeout(() => {
      try { startListening(); } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(t);
  }, [voiceMode, micSupported, speakingId, isListening, isSending, startListening]);

  function handleSubmit(e) {
    e.preventDefault();
    if ((!draft.trim() && pendingAttachments.length === 0) || isSending) return;
    onSend(draft, pendingAttachments);
    setDraft('');
    setPendingAttachments([]);
  }

  function handleStarterClick(prompt) {
    if (isSending) return;
    onSend(prompt, []);
  }

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setAttachError(null);
    const room = MAX_ATTACHMENTS - pendingAttachments.length;
    if (room <= 0) {
      setAttachError(`You can attach up to ${MAX_ATTACHMENTS} files at a time.`);
      return;
    }

    const toProcess = files.slice(0, room);
    const results = await Promise.allSettled(toProcess.map(fileToAttachment));

    const successes = [];
    let firstError = null;
    for (const r of results) {
      if (r.status === 'fulfilled') successes.push(r.value);
      else firstError = firstError || r.reason?.message;
    }

    if (successes.length > 0) setPendingAttachments((prev) => [...prev, ...successes]);
    if (firstError) setAttachError(firstError);
  }

  function removeAttachment(id) {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function toggleMic() {
    if (isListening) stopListening();
    else startListening();
  }

  function toggleVoiceMode() {
    const next = !voiceMode;
    setVoiceMode(next);
    if (!next) {
      stopSpeaking?.();
      stopListening();
    }
  }

  const listPadding = variant === 'full' ? 'px-4 py-6 sm:px-6' : 'px-4 py-4';
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* Voice mode bar — only when active */}
      <AnimatePresence>
        {voiceMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-gold-200 bg-gold-50/70"
          >
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-600" />
                </span>
                <p className="font-body text-[11px] font-bold uppercase tracking-wider text-gold-800">
                  Voice mode active
                </p>
              </div>
              <button
                type="button"
                onClick={toggleVoiceMode}
                className="font-body text-[11px] font-bold text-gold-800 hover:text-gold-900"
              >
                Exit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message list */}
      <div ref={scrollRef} className={cn('flex-1 space-y-4 overflow-y-auto', listPadding)}>
        {isEmpty && !isSending && (
          <TutorGreeting
            greeting={memory.greeting}
            name={memory.name}
            isReturning={memory.isReturning}
            persona={persona}
            onStarterClick={handleStarterClick}
            compact={variant !== 'full'}
            recentTopics={memory.topics}
          />
        )}

        {messages.map((m) => (
          <TutorMessageBubble
            key={m.id}
            id={m.id}
            role={m.role}
            content={m.content}
            attachments={m.attachments}
            streaming={m.streaming}
            isSpeaking={speechSupported && speakingId === m.id}
            onToggleSpeak={speechSupported ? speak : undefined}
          />
        ))}

        {isSending && !messages.some((m) => m.streaming) && <TutorTypingIndicator />}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-xl border border-gold-300 bg-gold-50 px-4 py-3 font-body text-sm text-navy-800"
          >
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-gold-700" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-navy-100 bg-white/90 backdrop-blur-md">
        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {pendingAttachments.map((a) => (
              <div key={a.id} className="group relative">
                {a.kind === 'image' || a.kind === 'video' ? (
                  <div className="h-14 w-14 overflow-hidden rounded-lg border border-navy-100 shadow-premium">
                    {a.kind === 'video' ? (
                      <video src={a.previewUrl} className="h-full w-full object-cover" />
                    ) : (
                      <img src={a.previewUrl} alt={a.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                ) : (
                  <div className="flex h-14 max-w-[10rem] items-center gap-1.5 rounded-lg border border-navy-100 bg-cream px-2.5 shadow-premium">
                    <FileText size={12} className="shrink-0 text-navy-500" />
                    <span className="truncate font-body text-[10px] font-semibold text-navy-800">
                      {a.name}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  aria-label={`Remove ${a.name}`}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-white shadow-premium transition-transform duration-150 hover:scale-110"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {attachError && (
          <p className="px-4 pt-2 font-body text-[11px] text-gold-700">{attachError}</p>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 sm:p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,application/pdf,text/*,.md,.js,.jsx,.ts,.tsx,.py,.html,.css,.json,.csv,.sql,.yml,.yaml"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || pendingAttachments.length >= MAX_ATTACHMENTS}
            aria-label="Attach a file"
            title={`Attach a file (max ${formatFileSize(MAX_FILE_SIZE_BYTES)} each)`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-navy-400 transition-colors duration-200 hover:bg-navy-50 hover:text-navy-700 disabled:opacity-40"
          >
            <Paperclip size={17} />
          </button>

          {/* Voice mode toggle */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceMode}
              aria-label={voiceMode ? 'Exit voice mode' : 'Start voice mode'}
              title={voiceMode ? 'Exit voice mode' : 'Voice mode — speak and listen'}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
                voiceMode
                  ? 'bg-gold-500/15 text-gold-700 ring-1 ring-gold-400/40'
                  : 'text-navy-400 hover:bg-navy-50 hover:text-navy-700'
              )}
            >
              {voiceMode ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
          )}

          {micSupported && (
            <button
              type="button"
              onClick={toggleMic}
              disabled={isSending}
              aria-label={isListening ? 'Stop voice input' : 'Speak your question'}
              className={cn(
                'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 disabled:opacity-40',
                isListening
                  ? 'bg-gold-500/10 text-gold-600 ring-1 ring-gold-400/40'
                  : 'text-navy-400 hover:bg-navy-50 hover:text-navy-700'
              )}
            >
              {isListening && (
                <motion.span
                  className="absolute inset-0 rounded-xl bg-gold-400/30"
                  animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <Mic size={17} className="relative" />
            </button>
          )}

          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              isListening
                ? 'Listening…'
                : memory.name
                  ? `Ask anything, ${memory.name}…`
                  : 'Ask Compass anything…'
            }
            disabled={isSending}
            className="flex-1 rounded-xl border border-navy-100 bg-white px-4 py-2.5 font-body text-sm text-navy-900 placeholder:text-navy-300 transition-colors duration-200 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30 disabled:opacity-60"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isSending || (!draft.trim() && pendingAttachments.length === 0)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900 shadow-gold transition-opacity duration-200 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}