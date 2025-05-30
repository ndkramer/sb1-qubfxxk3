import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './authContext';
import { Class } from '../types';

// Mock data for classes
const MOCK_CLASSES: Class[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of computer science, including algorithms, data structures, and programming concepts.',
    instructor: 'Nick Kramer',
    thumbnailUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
    schedule_data: {
      startDate: '2024-06-17',
      endDate: '2024-06-18',
      startTime: '09:00',
      endTime: '16:00',
      timeZone: 'CST',
      location: 'Zoom Virtual Classroom'
    },
    modules: [
      {
        id: 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
        title: 'Getting Started with Programming',
        description: 'An introduction to programming concepts and tools.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 1,
        resources: [
          {
            id: '11111111-aaaa-1111-aaaa-111111111111',
            title: 'Programming Fundamentals PDF',
            type: 'pdf',
            url: 'https://example.com/programming-fundamentals.pdf',
            description: 'A comprehensive guide to programming basics'
          },
          {
            id: '11111111-aaaa-2222-aaaa-111111111111',
            title: 'Code Practice Platform',
            type: 'link',
            url: 'https://codecademy.com',
            description: 'Interactive platform for practicing code'
          }
        ]
      },
      {
        id: 'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa',
        title: 'Variables and Data Types',
        description: 'Understanding variables, constants, and different data types.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 2,
        resources: []
      },
      {
        id: 'aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa',
        title: 'Control Flow and Loops',
        description: 'How to control program flow using conditionals and loops.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 3,
        resources: []
      }
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Web Development Fundamentals',
    description: 'Master the basics of web development with HTML, CSS, and JavaScript.',
    instructor: 'Nick Kramer',
    thumbnailUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg',
    schedule_data: {
      startDate: '2024-07-15',
      endDate: '2024-07-16',
      startTime: '09:00',
      endTime: '16:00',
      timeZone: 'CST',
      location: 'Zoom Virtual Classroom'
    },
    modules: [
      {
        id: 'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb',
        title: 'HTML Basics',
        description: 'Introduction to HTML and document structure.',
        slideUrl: 'https://gamma.app/embed/Data-Driven-Solutions-Proposal-4ngwnu4gbx1i4n9',
        order: 1,
        resources: []
      },
      {
        id: 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
        title: 'CSS Styling',
        description: 'How to style web pages using CSS.',
        slideUrl: 'https://gamma.app/embed/Data-Driven-Solutions-Proposal-4ngwnu4gbx1i4n9',
        order: 2,
        resources: []
      },
      {
        id: 'bbbbbbbb-3333-3333-3333-bbbbbbbbbbbb',
        title: 'JavaScript Fundamentals',
        description: 'Introduction to programming with JavaScript.',
        slideUrl: 'https://gamma.app/embed/Data-Driven-Solutions-Proposal-4ngwnu4gbx1i4n9',
        order: 3,
        resources: []
      }
    ]
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Data Science and Analytics',
    description: 'Learn how to analyze and interpret complex data using statistical methods and visualization techniques.',
    instructor: 'Nick Kramer',
    thumbnailUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg',
    schedule_data: {
      startDate: '2024-08-12',
      endDate: '2024-08-13',
      startTime: '09:00',
      endTime: '16:00',
      timeZone: 'CST',
      location: 'Zoom Virtual Classroom'
    },
    modules: [
      {
        id: 'cccccccc-1111-1111-1111-cccccccccccc',
        title: 'Introduction to Data Science',
        description: 'Overview of data science concepts and applications.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 1,
        resources: []
      },
      {
        id: 'cccccccc-2222-2222-2222-cccccccccccc',
        title: 'Data Collection and Cleaning',
        description: 'Methods for gathering and preparing data for analysis.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 2,
        resources: []
      },
      {
        id: 'cccccccc-3333-3333-3333-cccccccccccc',
        title: 'Statistical Analysis',
        description: 'Basic statistical methods for data analysis.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 3,
        resources: []
      }
    ]
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'Machine Learning Fundamentals',
    description: 'Explore the foundations of machine learning, including supervised and unsupervised learning, neural networks, and practical applications.',
    instructor: 'Nick Kramer',
    thumbnailUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    schedule_data: {
      startDate: '2024-09-16',
      endDate: '2024-09-17',
      startTime: '09:00',
      endTime: '16:00',
      timeZone: 'CST',
      location: 'Zoom Virtual Classroom'
    },
    modules: [
      {
        id: 'dddddddd-1111-1111-1111-dddddddddddd',
        title: 'Introduction to Machine Learning',
        description: 'Understanding the basic concepts and types of machine learning.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 1,
        resources: [
          {
            id: '44444444-aaaa-1111-aaaa-444444444444',
            title: 'Machine Learning Basics PDF',
            type: 'pdf',
            url: 'https://example.com/ml-basics.pdf',
            description: 'A comprehensive introduction to machine learning concepts'
          },
          {
            id: '44444444-aaaa-2222-aaaa-444444444444',
            title: 'Python for ML Tutorial',
            type: 'link',
            url: 'https://scikit-learn.org/stable/tutorial/basic/tutorial.html',
            description: 'Interactive tutorial for machine learning with Python'
          }
        ]
      },
      {
        id: 'dddddddd-2222-2222-2222-dddddddddddd',
        title: 'Supervised Learning Techniques',
        description: 'Deep dive into classification and regression algorithms.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 2,
        resources: []
      },
      {
        id: 'dddddddd-3333-3333-3333-dddddddddddd',
        title: 'Neural Networks and Deep Learning',
        description: 'Understanding neural network architectures and training methodologies.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 3,
        resources: []
      }
    ]
  }
];

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
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadEnrolledClasses();
    } else {
      setEnrolledClasses([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadEnrolledClasses = async () => {
    try {
      setIsLoading(true);
      console.log('ClassProvider - Starting to load enrolled classes');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data
      setEnrolledClasses(MOCK_CLASSES);
      
    } catch (err) {
      console.error('Error loading classes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshClasses = async () => {
    if (isAuthenticated && user) {
      await loadEnrolledClasses();
    }
  };

  const enrollInClass = async (classId: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the class to enroll in
      const classToEnroll = MOCK_CLASSES.find(c => c.id === classId);
      
      if (!classToEnroll) {
        throw new Error('Class not found');
      }
      
      // Check if already enrolled
      if (!enrolledClasses.some(c => c.id === classId)) {
        setEnrolledClasses(prev => [...prev, classToEnroll]);
      }
      
    } catch (err) {
      console.error('Error enrolling in class:', err);
      setError(err instanceof Error ? err.message : 'Failed to enroll in class');
      throw err;
    } finally {
      setIsLoading(false);
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