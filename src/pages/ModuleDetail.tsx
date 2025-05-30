import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, FileText, Link as LinkIcon, ExternalLink, CheckCircle } from 'lucide-react';
import { useAuth } from '../utils/authContext';
import { useClass } from '../utils/classContext';
import { useModule } from '../utils/moduleContext';
import { useNotes } from '../utils/noteContext';
import RichTextEditor from '../components/RichTextEditor';
import ErrorBoundary from '../components/ErrorBoundary';
import SlideViewer from '../components/SlideViewer';
import Button from '../components/Button';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

const ModuleDetail: React.FC = () => {
  const { classId, moduleId } = useParams<{ classId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { enrolledClasses, isLoading: classLoading } = useClass();
  const { user, isAuthenticated } = useAuth();
  const { getNoteForModule, saveNote, isLoading: isNoteLoading } = useNotes();
  const { moduleProgress, updateModuleProgress } = useModule();
  
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [lastSaved, setLastSaved] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  
  const classItem = classId ? enrolledClasses.find(c => c.id === classId) : undefined;
  const module = classItem?.modules.find(m => m.id === moduleId);
  
  // Debug logs
  console.log('Module Data:', {
    moduleId,
    module,
    slideUrl: module?.slideUrl
  });

  const isModuleCompleted = moduleId ? moduleProgress[moduleId] : false;

  useEffect(() => {
    let isMounted = true;

    async function loadNote() {
      if (!moduleId || !user?.id) {
        return;
      }

      try {
        setError(null);
        setNoteError(null);

        const note = await getNoteForModule(moduleId);

        if (isMounted) {
          if (note) {
            setNoteContent(note.content);
            setLastSaved(note.lastUpdated);
          } else {
            setNoteContent('');
            setLastSaved(undefined);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading note:', error);
          setNoteError('Failed to load note');
          setNoteContent('');
          setLastSaved(undefined);
        }
      }
    }

    loadNote();
    
    return () => {
      isMounted = false;
    };
  }, [moduleId, user?.id]);

  const handleToggleProgress = async () => {
    if (!moduleId) return;
    
    setIsUpdatingProgress(true);
    setProgressError('');
    
    try {
      await updateModuleProgress(moduleId, !isModuleCompleted);
    } catch (error) {
      setProgressError('Failed to update progress');
      console.error('Error updating progress:', error);
    } finally {
      setIsUpdatingProgress(false);
    }
  };
  
  const handleSaveNote = async () => {
    if (!moduleId || !isAuthenticated) {
      setSaveStatus('error');
      setNoteError('Please log in to save notes');
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('saving');
    setNoteError(null);
    
    try {
      const savedNote = await saveNote(moduleId, noteContent);
      if (savedNote) {
        setLastSaved(savedNote.updated_at);
        setSaveStatus('saved');

        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('error');
      setNoteError('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (classLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F98B3D]"></div>
      </div>
    );
  }
  
  if (!classItem || !module) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Module not found</h2>
        <p className="text-gray-600 mb-6">The module you're looking for doesn't exist or you don't have access to it.</p>
        <Button
          onClick={() => navigate('/classes')}
        >
          Back to Classes
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Breadcrumb navigation */}
      <nav className="mb-4">
        <Link 
          to={`/classes/${classId}`} 
          className="inline-flex items-center text-[#F98B3D] hover:text-[#e07a2c] font-medium"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to {classItem.title}
        </Link>
      </nav>
      
      {/* Module header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#F98B3D] text-white w-10 h-10 rounded-full flex items-center justify-center mr-4">
                {module.order}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
                <p className="text-gray-600">{module.description}</p>
              </div>
            </div>
            <Button
              onClick={handleToggleProgress}
              isLoading={isUpdatingProgress}
              variant={isModuleCompleted ? 'outline' : 'primary'}
              leftIcon={isModuleCompleted ? <CheckCircle size={16} /> : undefined}
            >
              {isModuleCompleted ? 'Completed' : 'Mark as Complete'}
            </Button>
          </div>
          
          {progressError && (
            <Alert type="error" onClose={() => setProgressError('')}>
              {progressError}
            </Alert>
          )}
        </div>
      </div>
      
      {/* Content area */}
      <div className="space-y-6">
        {/* Slides column */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(60vh-100px)]">
          <div className="h-full relative">
            <ErrorBoundary>
              <SlideViewer
                url={module.slide_url}
                title={`Slides for ${module.title}`}
              />
            </ErrorBoundary>
          </div>
        </div>
        
        {/* Notes column */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Notes</h2>
              <div className="flex items-center">
                {saveStatus === 'saved' && (
                  <span className="text-green-600 text-sm mr-3">Saved successfully!</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-red-600 text-sm mr-3">Error saving!</span>
                )}
                {noteError && (
                  <span className="text-red-600 text-sm mr-3">{noteError}</span>
                )}
                <Button
                  onClick={handleSaveNote}
                  isLoading={isSaving}
                  leftIcon={<Save size={16} />}
                >
                  Save Notes
                </Button>
              </div>
            </div>
            
            <div className="min-h-[300px] max-h-[400px] overflow-y-auto">
              {isNoteLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <LoadingSpinner />
                </div>
              ) : (
                <RichTextEditor
                  initialValue={noteContent}
                  onChange={setNoteContent}
                  onSave={handleSaveNote}
                  placeholder="Start typing your notes about this module..."
                  lastSaved={lastSaved}
                />
              )}
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
              Press Ctrl+S (Cmd+S on Mac) to save your notes.
            </p>
          </div>
        </div>
        
        {/* Additional Resources */}
        {module.resources && module.resources.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Additional Resources</h2>
                <span className="text-sm text-gray-500">{module.resources.length} resources available</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {module.resources.map((resource) => (
                  <div 
                    key={resource.id}
                    className="group flex flex-col p-4 border border-gray-100 rounded-lg hover:border-[#F98B3D] hover:shadow-md transition-all duration-200 bg-gray-50"
                  >
                    <div className="flex items-center mb-3">
                      {resource.type === 'pdf' ? (
                        <FileText className="w-5 h-5 text-[#F98B3D] mr-2" />
                      ) : (
                        <LinkIcon className="w-5 h-5 text-[#F98B3D] mr-2" />
                      )}
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#F98B3D] transition-colors duration-200">
                        {resource.title}
                      </h3>
                    </div>
                    
                    {resource.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                    
                    <div className="mt-auto">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[#F98B3D] hover:text-[#e07a2c] text-sm font-medium group-hover:translate-x-1 transition-transform duration-200"
                      >
                        {resource.type === 'pdf' ? 'Download PDF' : 'Visit Resource'}
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleDetail;