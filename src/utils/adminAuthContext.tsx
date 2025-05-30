import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AdminAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for stored admin session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('admin_session');
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        setUser({
          id: sessionData.id || 'admin-id',
          email: sessionData.email || 'admin@example.com',
          name: sessionData.name || 'Admin User',
          avatar: sessionData.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
        });
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing stored admin session:', e);
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // For demo purposes, accept any admin-like email
      if ((email.includes('admin') || email === 'Nick@one80services.com') && password.length > 0) {
        const userObj = {
          id: 'admin-id',
          email,
          name: 'Admin User',
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
        };
        
        setUser(userObj);
        setIsAuthenticated(true);
        localStorage.setItem('admin_session', JSON.stringify(userObj));
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid admin credentials' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      console.log('Simulating admin password reset for:', email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    resetPassword
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