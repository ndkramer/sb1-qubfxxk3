import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Private helper to clear client-side session state
  const _clearClientSession = () => {
    setUser(null);
    setIsLoading(false);
    setIsInitialized(true);
  };

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {      
      console.log('Auth state change:', event, session?.user?.id);

      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log('User signed out or deleted');
        _clearClientSession();
        return;
      }
      
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        try {
          console.log('User signed in:', session.user.id);
          console.log('User metadata:', session.user.user_metadata);
          const isSuperAdmin = String(session.user.user_metadata?.is_super_admin).toLowerCase() === 'true';
          console.log('Is super admin:', isSuperAdmin);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            avatar: session.user.user_metadata?.avatar_url,
            is_super_admin: isSuperAdmin
          });
        } catch (error) {
          console.error('Error updating user state:', error);
          _clearClientSession();
        } finally {
          setIsLoading(false);
          setIsInitialized(true);
        }
        return;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();      
      
      if (error) {
        console.error('Session check error:', error);
        _clearClientSession();
        return;
      }

      if (!session?.user) {
        console.log('No active session found');
        _clearClientSession();
        return;
      }

      // Set user from session
      console.log('Found existing session for user:', session.user.id);
      console.log('Session user metadata:', session.user.user_metadata);
      const isSuperAdmin = String(session.user.user_metadata?.is_super_admin).toLowerCase() === 'true';
      console.log('Is super admin:', isSuperAdmin);
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        avatar: session.user.user_metadata?.avatar_url,
        is_super_admin: isSuperAdmin
      });
    } catch (error) {
      console.error('Error checking session:', error);
      _clearClientSession();
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        console.log('Login successful for user:', data.user.id);
        // User will be set by the auth state change event
        setIsLoading(false);
        return { success: true };
      }

      console.error('No user data returned from login');
      setIsLoading(false);
      return { success: false, error: 'No user data returned' };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Checking session before logout');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found, clearing client state only');
        _clearClientSession();
        return;
      }

      console.log('Active session found, logging out');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // Check if the error is due to an invalid session
        if (error.message.includes('session_not_found') || error.message.includes('Session from session_id claim in JWT does not exist')) {
          console.log('Session already invalid on server, clearing client state');
        } else {
          console.warn('Error during explicit logout:', error);
        }
      }
      
      // Always clear the client session state, regardless of the signOut result
      _clearClientSession();
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      // Ensure client session is cleared even if there's an error
      _clearClientSession();
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      console.log('Updating password');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        return { success: false, error: error.message };
      }

      // Don't explicitly call logout - let the auth state change handle it
      return { success: true };
    } catch (error) {
      console.error('Unexpected password update error:', error);
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
    isInitialized,
    login,
    signup,
    logout,
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