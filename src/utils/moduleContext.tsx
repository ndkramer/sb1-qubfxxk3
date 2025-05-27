import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Module } from '../types';

interface ModuleContextType {
  currentModule: Module | null;
  moduleProgress: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  updateModuleProgress: (moduleId: string, completed: boolean) => Promise<void>;
  setCurrentModule: (module: Module | null) => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModuleProgress();
  }, []);

  const loadModuleProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        setModuleProgress({});
        return;
      }

      const { data, error } = await supabase
        .from('module_progress')
        .select(`
          module_id,
          completed
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = data.reduce((acc, curr) => {
        acc[curr.module_id] = curr.completed;
        return acc;
      }, {} as Record<string, boolean>);

      setModuleProgress(progressMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load module progress');
    } finally {
      setIsLoading(false);
    }
  };

  const updateModuleProgress = async (moduleId: string, completed: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('module_progress')
        .upsert([{
          user_id: user.id,
          module_id: moduleId,
          completed,
          last_accessed: new Date().toISOString()
        }], {
          onConflict: 'user_id,module_id'
        });

      if (error) throw error;

      setModuleProgress(prev => ({
        ...prev,
        [moduleId]: completed
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module progress');
      throw err;
    }
  };

  const value = {
    currentModule,
    moduleProgress,
    isLoading,
    error,
    updateModuleProgress,
    setCurrentModule
  };

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
}

export function useModule() {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModule must be used within a ModuleProvider');
  }
  return context;
}