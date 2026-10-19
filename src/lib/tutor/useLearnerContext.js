import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  buildLearnerContext,
  serialiseLearnerContext,
} from './learnerContext';

/**
 * useLearnerContext — React hook that loads and caches the learner's
 * InnoSpeak snapshot. Fetches once per signed-in session, exposes
 * `refresh()` for the context rail's manual refresh button.
 *
 * Never throws. Never blocks the chat UI. If the fetch fails or the
 * user isn't signed in, `context` is null and callers fall back to a
 * context-free AI session.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Module-level cache so the /tutor page and any future caller share data
let cache = { userId: null, snapshot: null, serialised: '', fetchedAt: 0 };

export default function useLearnerContext() {
  const { user, profile } = useAuth();
  const userId = user?.id || null;

  const [state, setState] = useState(() => ({
    loading: Boolean(userId),
    snapshot: cache.userId === userId ? cache.snapshot : null,
    serialised: cache.userId === userId ? cache.serialised : '',
  }));

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (force = false) => {
      if (!userId) {
        setState({ loading: false, snapshot: null, serialised: '' });
        return;
      }

      const fresh = !force && cache.userId === userId;
      const withinTtl = Date.now() - cache.fetchedAt < CACHE_TTL_MS;

      if (fresh && withinTtl && cache.snapshot) {
        setState({
          loading: false,
          snapshot: cache.snapshot,
          serialised: cache.serialised,
        });
        return;
      }

      setState((s) => ({ ...s, loading: true }));

      try {
        const snapshot = await buildLearnerContext({ id: userId, profile });
        const serialised = serialiseLearnerContext(snapshot);

        cache = {
          userId,
          snapshot,
          serialised,
          fetchedAt: Date.now(),
        };

        if (mountedRef.current) {
          setState({ loading: false, snapshot, serialised });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[useLearnerContext] build failed:', err?.message || err);
        if (mountedRef.current) {
          setState({ loading: false, snapshot: null, serialised: '' });
        }
      }
    },
    [userId, profile]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return {
    loading: state.loading,
    snapshot: state.snapshot,
    serialised: state.serialised,
    refresh,
    isAvailable: Boolean(state.snapshot),
  };
}

/** Clear the cache — call after the learner updates their portfolio, etc. */
export function invalidateLearnerContext() {
  cache = { userId: null, snapshot: null, serialised: '', fetchedAt: 0 };
}