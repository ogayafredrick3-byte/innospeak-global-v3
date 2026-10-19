import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { getProfile, signOutUser, isAuthConfigured } from '../lib/supabase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const authEventSeen = useRef(false);
  const profileRequest = useRef(0);
  const profileUserId = useRef(null);
  const configured = isAuthConfigured();

  useEffect(() => {
    if (!configured || !supabase) {
      setSession(null);
      setProfile(null);
      profileUserId.current = null;
      setProfileLoading(false);
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventSeen.current = true;
      if (!mounted) return;
      const nextUserId = nextSession?.user?.id ?? null;
      if (profileUserId.current !== nextUserId) {
        profileUserId.current = nextUserId;
        setProfile(null);
        setProfileLoading(Boolean(nextUserId));
      }
      setSession(nextSession ?? null);
      setLoading(false);
    });

    // The subscription is registered before getSession so an auth event cannot
    // be overwritten by a slower initial-session request.
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!mounted || authEventSeen.current) return;
        if (error) throw error;
        const nextSession = data?.session ?? null;
        const nextUserId = nextSession?.user?.id ?? null;
        profileUserId.current = nextUserId;
        setProfile(null);
        setProfileLoading(Boolean(nextUserId));
        setSession(nextSession);
      })
      .catch(() => {
        if (mounted && !authEventSeen.current) setSession(null);
      })
      .finally(() => {
        if (mounted && !authEventSeen.current) setLoading(false);
      });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, [configured]);

  useEffect(() => {
    const requestId = ++profileRequest.current;
    if (!session?.user?.id) {
      setProfile(null);
      setProfileLoading(false);
      return undefined;
    }

    let cancelled = false;
    setProfile(null);
    setProfileLoading(true);
    getProfile(session.user.id)
      .then((nextProfile) => {
        if (!cancelled && requestId === profileRequest.current) setProfile(nextProfile ?? null);
      })
      .catch(() => {
        if (!cancelled && requestId === profileRequest.current) setProfile(null);
      })
      .finally(() => {
        if (!cancelled && requestId === profileRequest.current) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const signOut = useCallback(async () => {
    await signOutUser();
    profileRequest.current += 1;
    profileUserId.current = null;
    setSession(null);
    setProfile(null);
    setProfileLoading(false);
    setLoading(false);
  }, []);

  const value = {
    user: session?.user ?? null,
    session,
    profile,
    loading,
    profileLoading,
    signOut,
    isConfigured: configured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
