import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { AuthContext } from './AuthContext';
import { getCurrentProfile, type CurrentProfile } from './profileSession';

function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const currentUser = session?.user ?? null;

    setSession(session);
    setUser(currentUser);

    if (currentUser?.id) {
      const profileData = await getCurrentProfile(currentUser.id);
      setProfile(profileData);
    } else {
      setProfile(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadSessionAndProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user?.id) {
        const profileData = await getCurrentProfile(session.user.id);
        if (!mounted) return;
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false);
    }

    loadSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      setTimeout(async () => {
        if (!mounted) return;

        if (session?.user?.id) {
          const profileData = await getCurrentProfile(session.user.id);
          if (!mounted) return;
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      refreshProfile,
    }),
    [session, user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;