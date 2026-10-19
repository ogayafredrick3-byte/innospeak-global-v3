import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, PanelLeft, X } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import HeroBackground from '../components/ui/HeroBackground.jsx';
import TutorPanel from '../components/tutor/TutorPanel.jsx';
import TutorPersonaChips from '../components/tutor/TutorPersonaChips.jsx';
import TutorSessionsRail from '../components/tutor/TutorSessionsRail.jsx';
import TutorContextRail from '../components/tutor/TutorContextRail.jsx';
import { getPersonaById } from '../lib/tutor/tutorPersonas.js';
import useTutorChat from '../hooks/useTutorChat.js';
import useTutorMemory from '../lib/tutor/useTutorMemory.js';

export default function Tutor() {
  const {
    personaId,
    messages,
    isSending,
    error,
    sendMessage,
    resetConversation,
    changePersona,
    sessions,
    activeSessionId,
    selectSession,
    newSession,
    deleteSession,
    isConfigured,
    learnerContext,
    learnerContextLoading,
    refreshLearnerContext,
  } = useTutorChat();

  const memory = useTutorMemory();
  const markedRef = useRef(false);

  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;
    memory.markSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (personaId) memory.setPreferredMode(personaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaId]);

  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);

  return (
    <>
      <Seo
        title="Compass — InnoSpeak AI Workspace"
        description="Your AI workspace for studying, building, writing, and career development on InnoSpeak Global."
        path="/tutor"
      />

      {/* Top banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-24 pb-10 md:pt-28 md:pb-12">
        <HeroBackground variant="learning" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-gold-500/15 blur-[120px]"
          aria-hidden="true"
        />

        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-gold-300 backdrop-blur-sm">
                <Sparkles size={11} />
                InnoSpeak Compass
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                {memory.name ? `${memory.greeting}, ${memory.name}.` : `${memory.greeting}.`}
              </h1>
              <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-navy-200 sm:text-base">
                Your AI workspace for studying, building, writing, and career
                development — grounded in your InnoSpeak courses, projects, and goals.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMobileSessionsOpen(true)}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 font-body text-xs font-bold text-white backdrop-blur-sm transition-all hover:border-gold-400 hover:bg-white/10 hover:text-gold-300 lg:hidden"
            >
              <PanelLeft size={14} />
              Sessions ({sessions.length})
            </button>
          </motion.div>
        </div>
      </section>

      {/* Workspace */}
      <section className="bg-cream py-8 sm:py-10">
        <div className="container-premium">
          <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
            <aside className="hidden xl:block">
              <div className="sticky top-24 h-[calc(100vh-8rem)]">
                <TutorSessionsRail
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onNewSession={newSession}
                  onSelectSession={selectSession}
                  onDeleteSession={deleteSession}
                  preferredMode={personaId}
                />
              </div>
            </aside>

            <div className="flex min-h-[calc(100vh-14rem)] flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-premium-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 px-4 py-3.5 sm:px-5">
                <TutorPersonaChips activeId={personaId} onChange={changePersona} size="sm" />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={resetConversation}
                    disabled={messages.length === 0}
                    aria-label="Reset current conversation"
                    title="Clear current conversation"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>

              {!isConfigured ? (
                <div className="flex flex-1 items-center justify-center px-6 text-center">
                  <div className="max-w-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
                      <Sparkles size={24} />
                    </div>
                    <h2 className="mt-5 font-display text-lg font-bold text-navy-900">
                      The Compass isn&rsquo;t connected yet
                    </h2>
                    <p className="mt-2 font-body text-sm leading-6 text-navy-500">
                      The AI backend needs to be configured. Check back soon.
                    </p>
                  </div>
                </div>
              ) : (
                <TutorPanel
                  personaId={personaId}
                  messages={messages}
                  isSending={isSending}
                  error={error}
                  onSend={sendMessage}
                  variant="full"
                  memory={memory}
                />
              )}
            </div>

            <aside className="hidden xl:block">
              <div className="sticky top-24">
                <TutorContextRail
                  personaId={personaId}
                  memory={memory}
                  learnerContext={learnerContext}
                  learnerLoading={learnerContextLoading}
                  onRefreshContext={refreshLearnerContext}
                />
              </div>
            </aside>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center font-body text-[11px] leading-5 text-navy-400">
            Responses are AI-generated and may be imperfect. Use judgment for anything
            high-stakes, and verify important details against official sources.
          </p>
        </div>
      </section>

      {/* Mobile sessions drawer */}
      <AnimatePresence>
        {mobileSessionsOpen && (
          <div className="fixed inset-0 z-[70] flex xl:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
              onClick={() => setMobileSessionsOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex w-72 max-w-[80%] flex-col bg-cream p-3 shadow-premium-lg"
            >
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                  Sessions
                </p>
                <button
                  type="button"
                  onClick={() => setMobileSessionsOpen(false)}
                  className="rounded-lg p-1.5 text-navy-500 hover:bg-navy-100"
                  aria-label="Close sessions"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <TutorSessionsRail
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onNewSession={(modeId) => {
                    newSession(modeId);
                    setMobileSessionsOpen(false);
                  }}
                  onSelectSession={(id) => {
                    selectSession(id);
                    setMobileSessionsOpen(false);
                  }}
                  onDeleteSession={deleteSession}
                  preferredMode={personaId}
                />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}