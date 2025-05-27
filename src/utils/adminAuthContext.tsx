import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface AdminAuthContextType {
  admin: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setAdmin(null);
        setIsLoading(false);
        navigate('/admin/login');
        return;
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        const email = session.user.email?.toLowerCase();
        if (email === 'nick@one80services.com') {
          setAdmin({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || 'Admin',
            avatar: session.user.user_metadata?.avatar_url
          });
        } else {
          await handleInvalidSession();
        }
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        await handleInvalidSession();
        return;
      }

      const email = session.user.email?.toLowerCase();
      if (email === 'nick@one80services.com') {
        setAdmin({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 'Admin',
          avatar: session.user.user_metadata?.avatar_url
        });
      } else {
        await handleInvalidSession();
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking session:', error);
      await handleInvalidSession();
    }
  };

  const handleInvalidSession = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setAdmin(null);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error during signout:', error);
      setAdmin(null);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      if (email.toLowerCase() !== 'nick@one80services.com') {
        return { success: false, error: 'Invalid admin credentials' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setAdmin({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || 'Admin',
          avatar: data.user.user_metadata?.avatar_url
        });
        return { success: true };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await handleInvalidSession();
  };

  const resetPassword = async (email: string) => {
    try {
      if (email.toLowerCase() !== 'nick@one80services.com') {
        return { success: false, error: 'Invalid admin email' };
      }

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
    admin,
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout,
    resetPassword,
    updatePassword
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}