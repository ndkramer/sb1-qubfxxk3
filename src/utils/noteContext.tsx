import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { Note } from '../types';

interface NoteContextType {
  isLoading: boolean;
  error: string | null;
  getNoteForModule: (moduleId: string) => Promise<Note | null>;
  saveNote: (moduleId: string, content: string) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNoteForModule = useCallback(async (moduleId: string): Promise<Note | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('module_id', moduleId)
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching notes');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveNote = useCallback(async (moduleId: string, content: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('notes')
        .upsert({
          module_id: moduleId,
          user_id: user.id,
          content,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    isLoading,
    error,
    getNoteForModule,
    saveNote,
  };

  return (
    <NoteContext.Provider value={value}>
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
}