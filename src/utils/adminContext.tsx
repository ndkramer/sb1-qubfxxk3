import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Class, Module } from '../types';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  createClass: (classData: Omit<Class, 'id' | 'modules'>) => Promise<void>;
  updateClass: (id: string, classData: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  createModule: (moduleData: Omit<Module, 'id'>) => Promise<void>;
  updateModule: (id: string, moduleData: Partial<Module>) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === 'Nick@one80services.com') {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createClass = async (classData: Omit<Class, 'id' | 'modules'>) => {
    try {
      const { error } = await supabase
        .from('classes')
        .insert([classData]);
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class');
      throw err;
    }
  };

  const updateClass = async (id: string, classData: Partial<Class>) => {
    try {
      const { error } = await supabase
        .from('classes')
        .update(classData)
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class');
      throw err;
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class');
      throw err;
    }
  };

  const createModule = async (moduleData: Omit<Module, 'id'>) => {
    try {
      const { error } = await supabase
        .from('modules')
        .insert([moduleData]);
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module');
      throw err;
    }
  };

  const updateModule = async (id: string, moduleData: Partial<Module>) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module');
      throw err;
    }
  };

  const deleteModule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module');
      throw err;
    }
  };

  const value = {
    isAdmin,
    isLoading,
    error,
    createClass,
    updateClass,
    deleteClass,
    createModule,
    updateModule,
    deleteModule
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}