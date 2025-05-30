import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useClass } from '../utils/classContext';
import { useNotes } from '../utils/noteContext';
import { Class, Module, Note } from '../types';

interface SearchResult {
  item: {
    type: 'module' | 'resource' | 'note';
    title: string;
    description?: string;
    content?: string;
    moduleId?: string;
    classId?: string;
    noteId?: string;
  };
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { enrolledClasses } = useClass();
  const { getAllUserNotes } = useNotes();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true);
        const userNotes = await getAllUserNotes();
        setNotes(userNotes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };
    loadNotes();
  }, []);

  // Create searchable items from all content
  const searchableItems = useMemo(() => {
    const moduleItems = enrolledClasses.flatMap((classItem: Class) => {
      const moduleItems = classItem.modules?.map((module: Module) => ({
        type: 'module' as const,
        title: module.title,
        description: module.description,
        moduleId: module.id,
        classId: classItem.id,
        content: `${module.title} ${module.description}`
      })) || [];

      const resourceItems = classItem.modules?.flatMap(module => 
        module.resources?.map(resource => ({
          type: 'resource' as const,
          title: resource.title,
          description: resource.description || '',
          moduleId: module.id,
          classId: classItem.id,
          content: `${resource.title} ${resource.description || ''}`
        })) || []
      ) || [];

      return [...moduleItems, ...resourceItems];
    });

    const noteItems = notes.map(note => ({
      type: 'note' as const,
      title: 'Note',
      description: note.content.substring(0, 100) + '...',
      moduleId: note.moduleId,
      noteId: note.id,
      content: note.content
    }));

    return [...moduleItems, ...noteItems];
  }, [enrolledClasses, notes]);

  // Initialize Fuse instance
  const fuse = new Fuse(searchableItems, {
    keys: ['title', 'description', 'content'],
    threshold: 0.3,
    includeScore: true
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const searchResults = fuse.search(value);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const { classId, moduleId } = result.item;
    if (classId && moduleId) {
      navigate(`/classes/${classId}/modules/${moduleId}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search modules, resources, and notes..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        {query && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleResultClick(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {result.item.title}
                  </h4>
                  {result.item.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {result.item.description}
                    </p>
                  )}
                  <span className="text-xs text-[#F98B3D] mt-1 block">
                    {result.item.type === 'module' ? 'Module' : result.item.type === 'resource' ? 'Resource' : 'Note'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-600">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}

export default SearchBar;