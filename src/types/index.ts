export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Class {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl: string;
  instructorImage?: string;
  instructorBio?: string;
  schedule?: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    timeZone: string;
    location: string;
  };
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  slideUrl: string;
  order: number;
  resources: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link';
  url: string;
  description?: string;
}

export interface Note {
  id: string;
  userId: string;
  moduleId: string;
  content: string;
  lastUpdated: string;
}