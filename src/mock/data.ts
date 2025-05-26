import { Class, Note, User } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
};

export const mockClasses: Class[] = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of computer science, including algorithms, data structures, and programming concepts.',
    instructor: 'Nick Kramer',
    thumbnailUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1600',
    instructorImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    instructorBio: 'Nick is a passionate educator and tech enthusiast with over a decade of experience in software development and AI technologies. As the founder of One80Labs, he specializes in making complex technical concepts accessible and engaging for learners of all levels. His innovative teaching approach combines practical industry experience with cutting-edge educational methods to deliver exceptional learning outcomes.',
    schedule: {
      startDate: '2024-06-17',
      endDate: '2024-06-18',
      startTime: '09:00',
      endTime: '16:00',
      timeZone: 'CST',
      location: 'Zoom Virtual Classroom'
    },
    modules: [
      {
        id: '101',
        title: 'Getting Started with Programming',
        description: 'An introduction to programming concepts and tools.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 1,
        resources: [
          {
            id: '1',
            title: 'Programming Fundamentals PDF',
            type: 'pdf',
            url: 'https://example.com/programming-fundamentals.pdf',
            description: 'A comprehensive guide to programming basics'
          },
          {
            id: '2',
            title: 'Code Practice Platform',
            type: 'link',
            url: 'https://codecademy.com',
            description: 'Interactive platform for practicing code'
          }
        ]
      },
      {
        id: '102',
        title: 'Variables and Data Types',
        description: 'Understanding variables, constants, and different data types.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 2,
        resources: []
      },
      {
        id: '103',
        title: 'Control Flow and Loops',
        description: 'How to control program flow using conditionals and loops.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 3
      }
    ]
  },
  {
    id: '2',
    title: 'Web Development Fundamentals',
    description: 'Master the basics of web development with HTML, CSS, and JavaScript.',
    instructor: 'Nick Kramer',
    thumbnailUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1600',
    instructorImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    instructorBio: 'Nick is a passionate educator and tech enthusiast with over a decade of experience in software development and AI technologies. As the founder of One80Labs, he specializes in making complex technical concepts accessible and engaging for learners of all levels. His innovative teaching approach combines practical industry experience with cutting-edge educational methods to deliver exceptional learning outcomes.',
    schedule: {
      startDate: '2024-07-15',
      endDate: '2024-07-16',
      startTime: '09:00',
      endTime: '16:00',
      timeZone: 'CST',
      location: 'Zoom Virtual Classroom'
    },
    modules: [
      {
        id: '201',
        title: 'HTML Basics',
        description: 'Introduction to HTML and document structure.',
        slideUrl: 'https://gamma.app/embed/Data-Driven-Solutions-Proposal-4ngwnu4gbx1i4n9',
        order: 1
      },
      {
        id: '202',
        title: 'CSS Styling',
        description: 'How to style web pages using CSS.',
        slideUrl: 'https://gamma.app/embed/Data-Driven-Solutions-Proposal-4ngwnu4gbx1i4n9',
        order: 2
      },
      {
        id: '203',
        title: 'JavaScript Fundamentals',
        description: 'Introduction to programming with JavaScript.',
        slideUrl: 'https://gamma.app/embed/Data-Driven-Solutions-Proposal-4ngwnu4gbx1i4n9',
        order: 3
      }
    ]
  },
  {
    id: '3',
    title: 'Data Science and Analytics',
    description: 'Learn how to analyze and interpret complex data using statistical methods and visualization techniques.',
    instructor: 'Nick Kramer',
    thumbnailUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1600',
    instructorImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    instructorBio: 'Nick is a passionate educator and tech enthusiast with over a decade of experience in software development and AI technologies. As the founder of One80Labs, he specializes in making complex technical concepts accessible and engaging for learners of all levels. His innovative teaching approach combines practical industry experience with cutting-edge educational methods to deliver exceptional learning outcomes.',
    schedule: {
      startDate: '2024-08-12',
      endDate: '2024-08-13',
      startTime: '09:00',
      endTime: '16:00',
      timeZone: 'CST',
      location: 'Zoom Virtual Classroom'
    },
    modules: [
      {
        id: '301',
        title: 'Introduction to Data Science',
        description: 'Overview of data science concepts and applications.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 1
      },
      {
        id: '302',
        title: 'Data Collection and Cleaning',
        description: 'Methods for gathering and preparing data for analysis.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 2
      },
      {
        id: '303',
        title: 'Statistical Analysis',
        description: 'Basic statistical methods for data analysis.',
        slideUrl: 'https://docs.google.com/presentation/d/1uMtpUazokJpshYfkOO7-opH9xBAJR7s_5MFj2aWfSfw/embed?start=false&loop=false&delayms=3000',
        order: 3
      }
    ]
  }
];

export const mockNotes: Note[] = [
  {
    id: '1',
    userId: '1',
    moduleId: '101',
    content: '<p>These are my notes about programming concepts. I found the section on algorithms particularly interesting.</p><ul><li>Remember to review the pseudocode examples</li><li>Practice writing basic algorithms</li></ul>',
    lastUpdated: '2023-09-15T14:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    moduleId: '201',
    content: '<p>HTML structure notes:</p><ul><li>Always include DOCTYPE</li><li>Remember semantic tags like &lt;article&gt; and &lt;section&gt;</li></ul>',
    lastUpdated: '2023-09-18T10:15:00Z'
  }
];

// Helper function to get a class by ID
export function getClassById(id: string): Class | undefined {
  return mockClasses.find(c => c.id === id);
}

// Helper function to sort classes by date
export function getSortedClasses(): Class[] {
  return [...mockClasses].sort((a, b) => {
    const dateA = new Date(a.schedule?.startDate || '');
    const dateB = new Date(b.schedule?.startDate || '');
    return dateA.getTime() - dateB.getTime();
  });
}

// Helper function to get a module by ID
export function getModuleById(classId: string, moduleId: string): Module | undefined {
  const classItem = getClassById(classId);
  if (!classItem) return undefined;
  return classItem.modules.find(m => m.id === moduleId);
}

// Helper function to get notes for a module
export function getNoteForModule(userId: string, moduleId: string): Note | undefined {
  return mockNotes.find(n => n.userId === userId && n.moduleId === moduleId);
}

// Helper function to save a note (in a real app, this would save to a database)
export function saveNote(note: Note): Note {
  const existingNoteIndex = mockNotes.findIndex(
    n => n.userId === note.userId && n.moduleId === note.moduleId
  );
  
  if (existingNoteIndex !== -1) {
    // Update existing note
    mockNotes[existingNoteIndex] = {
      ...note,
      lastUpdated: new Date().toISOString()
    };
    return mockNotes[existingNoteIndex];
  } else {
    // Create new note
    const newNote: Note = {
      ...note,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString()
    };
    mockNotes.push(newNote);
    return newNote;
  }
}