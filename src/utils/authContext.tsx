import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (!session) {
          await handleInvalidSession();
          return;
        }
      }

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          avatar: session.user.user_metadata?.avatar_url
        });
      } else {
        await handleInvalidSession();
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        await handleInvalidSession();
        return;
      }

      if (!session) {
        await handleInvalidSession();
        return;
      }

      // Attempt to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();

      if (refreshError || !refreshedSession) {
        console.error('Session refresh error:', refreshError);
        await handleInvalidSession();
        return;
      }

      setUser({
        id: refreshedSession.user.id,
        email: refreshedSession.user.email || '',
        name: refreshedSession.user.user_metadata?.full_name || refreshedSession.user.email?.split('@')[0] || 'User',
        avatar: refreshedSession.user.user_metadata?.avatar_url
      });
    } catch (error) {
      console.error('Error checking session:', error);
      await handleInvalidSession();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvalidSession = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during signout:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
      navigate('/login');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          avatar: data.user.user_metadata?.avatar_url
        });
        return { success: true };
      }

      return { success: false, error: 'No user data returned' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        return { success: true };
      }

      return { success: false, error: 'No user data returned' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  };

  const logout = async () => {
    await handleInvalidSession();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}