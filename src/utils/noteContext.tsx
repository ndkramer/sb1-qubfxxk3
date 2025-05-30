import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './authContext';
import { Note } from '../types';

interface NoteContextType {
  isLoading: boolean;
  error: string | null;
  getNoteForModule: (moduleId: string) => Promise<Note | null>;
  getAllUserNotes: () => Promise<Note[]>;
  saveNote: (moduleId: string, content: string) => Promise<any>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getNoteForModule = useCallback(async (moduleId: string): Promise<Note | null> => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      setError(null);

      // Get note from localStorage
      const noteKey = `note_${user.id}_${moduleId}`;
      const storedNote = localStorage.getItem(noteKey);
      
      if (storedNote) {
        return JSON.parse(storedNote);
      }
      
      return null;
    } catch (err) {
      console.error('Error in getNoteForModule:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching notes');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveNote = useCallback(async (moduleId: string, content: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      const noteKey = `note_${user.id}_${moduleId}`;
      const now = new Date().toISOString();
      
      const note = {
        id: `${user.id}_${moduleId}`,
        userId: user.id,
        moduleId,
        content,
        created_at: localStorage.getItem(noteKey) ? JSON.parse(localStorage.getItem(noteKey)!).created_at : now,
        updated_at: now
      };
      
      // Save to localStorage
      localStorage.setItem(noteKey, JSON.stringify(note));
      
      // Also update the notes index
      const notesIndex = JSON.parse(localStorage.getItem(`notes_index_${user.id}`) || '[]');
      if (!notesIndex.includes(moduleId)) {
        notesIndex.push(moduleId);
        localStorage.setItem(`notes_index_${user.id}`, JSON.stringify(notesIndex));
      }
      
      return note;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getAllUserNotes = useCallback(async (): Promise<Note[]> => {
    if (!user?.id) return [];

    try {
      setIsLoading(true);
      setError(null);

      // Get notes index from localStorage
      const notesIndex = JSON.parse(localStorage.getItem(`notes_index_${user.id}`) || '[]');
      const notes: Note[] = [];
      
      // Get each note
      for (const moduleId of notesIndex) {
        const noteKey = `note_${user.id}_${moduleId}`;
        const storedNote = localStorage.getItem(noteKey);
        
        if (storedNote) {
          notes.push(JSON.parse(storedNote));
        }
      }
      
      return notes;
    } catch (err) {
      console.error('Error in getAllUserNotes:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching notes');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const value = {
    isLoading,
    error,
    getNoteForModule,
    getAllUserNotes,
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