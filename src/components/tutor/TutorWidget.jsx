import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Maximize2, RotateCcw } from 'lucide-react';
import useTutorChat from '../../hooks/useTutorChat';
import TutorPanel from './TutorPanel';
import TutorPersonaChips from './TutorPersonaChips';

/**
 * TutorWidget — floating "InnoSpeak Tutor" launcher, mounted once in
 * AppLayout so it persists (and keeps its conversation) across route
 * changes. Expands into a compact chat panel; "Open full session" hands
 * off to the /tutor page for deeper work.
 */
export default function TutorWidget() {
  const [open, setOpen] = useState(false);
  const {
    personaId,
    messages,
    isSending,
    error,
    sendMessage,
    resetConversation,
    changePersona,
    isConfigured,
  } = useTutorChat();

  return (
    <div className="fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-premium-lg backdrop-blur-md sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-navy-100 bg-navy-gradient px-4 py-3.5">
              <div>
                <p className="font-display text-sm font-bold text-white">InnoSpeak Tutor</p>
                <p className="font-body text-[11px] text-navy-100/80">AI help for your work</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetConversation}
                  aria-label="Reset conversation"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-100 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw size={15} />
                </button>
                <Link
                  to="/tutor"
                  onClick={() => setOpen(false)}
                  aria-label="Open full tutor session"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-100 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                >
                  <Maximize2 size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close tutor"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-100 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isConfigured ? (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <p className="font-body text-sm text-navy-500">
                  The AI Tutor isn't connected yet. Check back soon.
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-navy-100 px-3 py-2.5">
                  <TutorPersonaChips activeId={personaId} onChange={changePersona} />
                </div>
                <TutorPanel
                  personaId={personaId}
                  messages={messages}
                  isSending={isSending}
                  error={error}
                  onSend={sendMessage}
                  variant="compact"
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher button */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? 'Close AI Tutor' : 'Open AI Tutor'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-navy-900 shadow-gold transition-shadow duration-300 hover:shadow-premium-lg"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            {open ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}