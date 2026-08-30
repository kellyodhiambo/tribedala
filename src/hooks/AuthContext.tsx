import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import supabase from '@/hooks/useSupabase';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: string;
  creator_category: string;
  admin_role: string | null;
  bio: string;
  verified: boolean;
  featured: boolean;
  social_links: Record<string, string>;
  portfolio_links: Record<string, string>;
  location: string;
  status: string;
  notification_email: boolean;
  notification_inapp: boolean;
  privacy_profile_visible: boolean;
  privacy_allow_messages: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role?: string }>;
  signUp: (email: string, password: string, metadata: Record<string, unknown>) => Promise<{ error: string | null; user?: User | null }>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return;
      }

      if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Profile fetch exception:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: currentSession }, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).then(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
        
        // If user signed in via OAuth and doesn't have a profile yet, create one
        if (_event === 'signed_in' && newSession.user.identities && newSession.user.identities.length > 0) {
          const { data: existingProfile, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('id', newSession.user.id)
            .maybeSingle();

          if (!fetchError && !existingProfile) {
            // OAuth user exists in auth but not in public.users table - create profile
            const { error: createError } = await supabase.from('users').insert({
              id: newSession.user.id,
              email: newSession.user.email ?? '',
              full_name: newSession.user.user_metadata?.full_name ?? newSession.user.email?.split('@')[0] ?? 'User',
              role: 'member',
              creator_category: 'other',
              status: 'active',
              verified: true,
              avatar_url: newSession.user.user_metadata?.avatar_url ?? '',
              bio: '',
              location: '',
              updated_at: new Date().toISOString(),
            });

            if (!createError && mounted) {
              await fetchProfile(newSession.user.id);
            }
          }
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return { error: signInError.message };
      }

      const authUser = data.user;
      if (!authUser) {
        return { error: 'Unable to load your account.' };
      }

      const { data: profileRow, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile lookup error during sign in:', profileError);
      }

      return { error: null, role: profileRow?.role ?? 'member' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
      return { error: msg };
    }
  };

  const signUp = async (email: string, password: string, metadata: Record<string, unknown>) => {
    setError(null);
    try {
      const normalizedRole = String(metadata.role ?? 'member');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return { error: signUpError.message };
      }

      const authUser = signUpData?.user;
      if (!authUser?.id) {
        return { error: 'Account created, but the profile could not be saved. Please sign in again.' };
      }

      const requiresApproval = ['creator', 'organizer', 'business'].includes(normalizedRole);
      const { error: profileError } = await supabase.from('users').insert({
        id: authUser.id,
        email: authUser.email ?? email,
        full_name: String(metadata.full_name ?? ''),
        role: normalizedRole,
        creator_category: normalizedRole === 'creator' ? String(metadata.creator_category ?? 'other') : 'other',
        status: requiresApproval ? 'pending' : 'active',
        verified: !requiresApproval,
        avatar_url: '',
        bio: '',
        location: '',
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        setError(profileError.message);
        return { error: profileError.message || 'Failed to save profile', user: authUser };
      }

      return { error: null, user: authUser };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
      return { error: msg };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    try {
      const currentOrigin = window.location.origin;
      const basePath = (window as unknown as Record<string, string>).__BASE_PATH__ || '';
      const redirectUrl = `${currentOrigin}${basePath}/dashboard`;
      
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OAuth sign in failed';
      setError(msg);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await supabase.auth.signOut();
      setProfile(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      setError(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        error,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;