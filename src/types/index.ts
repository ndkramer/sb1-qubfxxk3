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
  schedule_data?: {
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
  type: 'pdf' | 'word' | 'excel' | 'video' | 'link';
  url?: string;
  description?: string;
  file_type?: string;
  file_size?: number;
  order?: number;
  file_path?: string;
  download_count?: number;
  module_id?: string;
}

export interface Note {
  id: string;
  userId: string;
  moduleId: string;
  content: string;
  created_at: string;
  updated_at: string;
}