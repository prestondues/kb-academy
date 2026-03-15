import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { CurrentProfile } from './profileSession';

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: CurrentProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);