import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Class } from '../types';

interface ClassContextType {
  enrolledClasses: Class[];
  isLoading: boolean;
  error: string | null;
  refreshClasses: () => Promise<void>;
  enrollInClass: (classId: string) => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export function ClassProvider({ children }: { children: React.ReactNode }) {
  const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnrolledClasses();
  }, []);

  const loadEnrolledClasses = async () => {
    try {
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          class_id,
          classes (
            id,
            title,
            description,
            instructor_id,
            thumbnail_url,
            instructor_image,
            instructor_bio,
            schedule_data,
            modules (
              id,
              title,
              description,
              slide_url,
              order,
              resources (*)
            )
          )
        `)
        .eq('status', 'active');

      if (enrollmentError) throw enrollmentError;

      const classes = enrollments
        .map(e => e.classes)
        .filter((c): c is Class => c !== null)
        .sort((a, b) => {
          const dateA = new Date(a.schedule_data?.startDate || '');
          const dateB = new Date(b.schedule_data?.startDate || '');
          return dateA.getTime() - dateB.getTime();
        });

      setEnrolledClasses(classes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrolled classes');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshClasses = async () => {
    setIsLoading(true);
    await loadEnrolledClasses();
  };

  const enrollInClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          class_id: classId,
          status: 'active'
        });

      if (error) throw error;

      await refreshClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll in class');
      throw err;
    }
  };

  const value = {
    enrolledClasses,
    isLoading,
    error,
    refreshClasses,
    enrollInClass
  };

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>;
}

export function useClass() {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
}