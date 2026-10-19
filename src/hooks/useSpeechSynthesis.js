import { useCallback, useEffect, useState } from 'react';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

/**
 * useSpeechSynthesis — thin wrapper around the browser's built-in
 * text-to-speech, used to read tutor replies aloud. `speakingId` tracks
 * which message is currently playing so only one "Listen" button is lit
 * at a time, and clicking the active one stops it.
 */
export default function useSpeechSynthesis() {
  const [speakingId, setSpeakingId] = useState(null);

  useEffect(() => () => synth?.cancel(), []);

  const speak = useCallback(
    (id, text) => {
      if (!synth) return;
      synth.cancel();
      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      synth.speak(utterance);
    },
    [speakingId]
  );

  const stop = useCallback(() => {
    synth?.cancel();
    setSpeakingId(null);
  }, []);

  return { isSupported: Boolean(synth), speakingId, speak, stop };
}