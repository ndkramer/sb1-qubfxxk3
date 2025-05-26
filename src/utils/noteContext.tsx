import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Note } from '../types';

interface NoteContextType {
  notes: Record<string, Note>;
  isLoading: boolean;
  error: string | null;
  saveNote: (moduleId: string, content: string) => Promise<void>;
  deleteNote: (moduleId: string) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*');

      if (error) throw error;

      const notesMap = data.reduce((acc, note) => {
        acc[note.module_id] = note;
        return acc;
      }, {} as Record<string, Note>);

      setNotes(notesMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async (moduleId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .upsert({
          module_id: moduleId,
          content,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });

      if (error) throw error;

      setNotes(prev => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          content,
          last_updated: new Date().toISOString()
        }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
      throw err;
    }
  };

  const deleteNote = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('module_id', moduleId);

      if (error) throw error;

      setNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[moduleId];
        return newNotes;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  };

  const value = {
    notes,
    isLoading,
    error,
    saveNote,
    deleteNote
  };

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
}