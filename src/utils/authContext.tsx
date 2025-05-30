import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for stored session on component mount
  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem('demo_session');
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          setUser({
            id: sessionData.id || '42ef4962-cfd0-471e-9aa4-0de3d6ca51b0',
            email: sessionData.email || 'test@example.com',
            name: sessionData.name || 'Test User',
            avatar: sessionData.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
          });
        } catch (e) {
          console.error('Error parsing stored session:', e);
          localStorage.removeItem('demo_session');
        }
      }
      setIsInitialized(true);
    }
    
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', email);

      // Check for hardcoded credentials
      if (email === 'test@example.com' && password === 'password123') {
        // Create user object
        const userObj = {
          id: '42ef4962-cfd0-471e-9aa4-0de3d6ca51b0',
          email: 'test@example.com',
          name: 'Test User',
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
        };
        
        // Set user in state
        setUser(userObj);
        
        // Store session in localStorage
        localStorage.setItem('demo_session', JSON.stringify(userObj));
        console.log('Login successful for:', email);
        return { success: true };
      }
      
      console.error('Login failed: Invalid credentials');
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll just pretend to create an account
      // and then log the user in
      
      // Create user object
      const userObj = {
        id: '42ef4962-cfd0-471e-9aa4-0de3d6ca51b0',
        email,
        name,
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
      };
      
      // Set user in state
      setUser(userObj);
      
      // Store session in localStorage
      localStorage.setItem('demo_session', JSON.stringify(userObj));
      
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo_session');
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      console.log('Simulating password reset for:', email);
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
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    login,
    signup,
    logout,
    resetPassword
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