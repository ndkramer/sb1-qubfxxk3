import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, FileText, Link as LinkIcon, ExternalLink, Download, CheckCircle } from 'lucide-react';
import { getClassById, getModuleById, getNoteForModule, saveNote } from '../mock/data';
import { useAuth } from '../utils/authContext';
import { useModule } from '../utils/moduleContext';
import RichTextEditor from '../components/RichTextEditor';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Button from '../components/Button';
import Alert from '../components/Alert';

const ModuleDetail: React.FC = () => {
  const { classId, moduleId } = useParams<{ classId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { moduleProgress, updateModuleProgress } = useModule();
  
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progressError, setProgressError] = useState('');
  
  // Get class and module data
  const classItem = classId ? getClassById(classId) : undefined;
  const module = classId && moduleId ? getModuleById(classId, moduleId) : undefined;
  
  const isModuleCompleted = moduleId ? moduleProgress[moduleId] : false;
  
  // Load existing note if available
  useEffect(() => {
    if (user && moduleId) {
      const existingNote = getNoteForModule(user.id, moduleId);
      if (existingNote) {
        setNoteContent(existingNote.content);
      } else {
        setNoteContent('');
      }
    }
  }, [user, moduleId]);
  
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
  
  // Save note function
  const handleSaveNote = () => {
    if (!user || !moduleId) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      saveNote({
        id: '', // This will be set in the mock function
        userId: user.id,
        moduleId,
        content: noteContent,
        lastUpdated: new Date().toISOString()
      });
      
      setTimeout(() => {
        setSaveStatus('saved');
        setIsSaving(false);
        
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }, 800);
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('error');
      setIsSaving(false);
    }
  };
  
  const handleDownload = async () => {
    if (!module || !classItem) return;

    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text(module.title, 20, 20);
    
    // Add module info
    pdf.setFontSize(12);
    pdf.text(`Module ${module.order} - ${classItem.title}`, 20, 30);
    pdf.text(`Instructor: ${classItem.instructor}`, 20, 40);
    
    // Add slide content
    pdf.addPage();
    pdf.text('Slides', 20, 20);
    const slideFrame = document.querySelector('iframe');
    if (slideFrame) {
      try {
        const canvas = await html2canvas(slideFrame);
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 20, 30, 170, 100);
      } catch (error) {
        console.error('Error capturing slides:', error);
      }
    }
    
    // Add notes
    pdf.addPage();
    pdf.text('Notes', 20, 20);
    pdf.setFontSize(11);
    const notes = noteContent.replace(/<[^>]+>/g, '').trim();
    pdf.text(notes || 'No notes taken', 20, 30);
    
    // Save the PDF
    pdf.save(`${module.title} - Notes and Slides.pdf`);
  };
  
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
            <iframe 
              src={module.slideUrl}
              frameBorder="0" 
              allowFullScreen
              allow="fullscreen"
              title={`Slides for ${module.title}`}
              className="w-full h-full absolute inset-0"
            />
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
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  leftIcon={<Download size={16} />}
                  className="mr-3"
                >
                  Download PDF
                </Button>
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
              <RichTextEditor
                initialValue={noteContent}
                onChange={setNoteContent}
                placeholder="Start typing your notes about this module..."
              />
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
              Notes are saved for this module and will be available when you return.
            </p>
          </div>
        </div>
        
        {/* Additional Resources */}
        {module.resources && module.resources.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Resources</h2>
              <div className="space-y-4">
                {module.resources.map((resource) => (
                  <div 
                    key={resource.id}
                    className="flex items-start p-4 border border-gray-100 rounded-lg hover:border-[#F98B3D] transition-colors duration-200"
                  >
                    <div className="flex-shrink-0 mr-4">
                      {resource.type === 'pdf' ? (
                        <FileText className="w-6 h-6 text-[#F98B3D]" />
                      ) : (
                        <LinkIcon className="w-6 h-6 text-[#F98B3D]" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className="text-gray-600 text-sm mb-2">{resource.description}</p>
                      )}
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[#F98B3D] hover:text-[#e07a2c] text-sm font-medium"
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