import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { Library, Search, Plus, Pencil, Trash2, X, ArrowLeft, ArrowUp, ArrowDown, GripVertical, Link as LinkIcon, FileSpreadsheet, FileVideo, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Resource } from '../../types';

interface Module {
  id: string;
  class_id: string;
  title: string;
  description: string;
  slide_url: string;
  order: number;
  created_at: string;
  content?: string;
  resources?: any[];
}

interface Course {
  id: string;
  title: string;
}

const ModuleAdmin: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slideUrl: '',
    content: ''
  });

  useEffect(() => {
    if (courseId) {
      loadCourseAndModules();
      loadAllResources();
    }
  }, [courseId]);

  const loadAllResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllResources(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    }
  };

  useEffect(() => {
    if (editingModule) {
      setFormData({
        title: editingModule.title,
        description: editingModule.description,
        slideUrl: editingModule.slide_url,
        content: editingModule.content || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        slideUrl: '',
        content: ''
      });
    }
  }, [editingModule]);

  useEffect(() => {
    if (editingModule) {
      const loadModuleResources = async () => {
        try {
          const { data, error } = await supabase
            .from('resources')
            .select('id')
            .eq('module_id', editingModule.id);

          if (error) throw error;
          setSelectedResources(data?.map(r => r.id) || []);
        } catch (err) {
          console.error('Error loading module resources:', err);
        }
      };
      loadModuleResources();
    } else {
      setSelectedResources([]);
    }
  }, [editingModule]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updates = items.map((module, index) => ({
      id: module.id,
      class_id: module.class_id,
      title: module.title,
      description: module.description,
      slide_url: module.slide_url,
      order: index + 1
    }));
    
    try {
      const { error } = await supabase
        .from('modules')
        .upsert(updates);

      if (error) throw error;
      
      loadCourseAndModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder modules');
    }
  };

  const handleResourceDragEnd = async (result: any) => {
    console.log('Drag end result:', result);
    
    if (!result.destination || !result.draggableId) return;
    
    console.log('Source:', result.source);
    console.log('Destination:', result.destination);
    console.log('Current selected resources:', selectedResources);
    
    const resourceId = result.draggableId;
    const isAdding = result.destination.droppableId === 'selected';
    
    console.log('Resource ID:', resourceId);
    console.log('Is adding:', isAdding);
    
    if (isAdding) {
      setSelectedResources(prev => [...prev, resourceId]);
    } else {
      setSelectedResources(prev => prev.filter(id => id !== resourceId));
    }
    
    console.log('Updated selected resources:', selectedResources);
  };

  const loadCourseAndModules = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('classes')
        .select('id, title')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`
          *,
          resources (
            id,
            title,
            type,
            url,
            description,
            file_type,
            file_size,
            order,
            file_path,
            download_count
          )
        `)
        .eq('class_id', courseId)
        .order('order');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResources = async () => {
    if (!editingModule) return;
    
    try {
      await supabase
        .from('resources')
        .update({ module_id: null })
        .eq('module_id', editingModule.id);

      if (selectedResources.length > 0) {
        await supabase
          .from('resources')
          .update({ module_id: editingModule.id })
          .in('id', selectedResources);
      }

      setSuccess('Resources updated successfully!');
      setShowResourceModal(false);
      loadCourseAndModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resources');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'word':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'video':
        return <FileVideo className="w-4 h-4 text-purple-500" />;
      default:
        return <LinkIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newOrder = modules.length > 0 
        ? Math.max(...modules.map(m => m.order)) + 1 
        : 1;

      const { data, error } = await supabase
        .from('modules')
        .insert([{
          class_id: courseId,
          title: formData.title,
          description: formData.description,
          slide_url: formData.slideUrl,
          order: newOrder
        }])
        .select()
        .single();

      if (error) throw error;

      setSuccess('Module created successfully!');
      setShowFormModal(false);
      setFormData({
        title: '',
        description: '',
        slideUrl: '',
        content: ''
      });
      loadCourseAndModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('modules')
        .update({
          title: formData.title,
          description: formData.description,
          slide_url: formData.slideUrl,
        })
        .eq('id', editingModule.id);

      if (error) throw error;

      setSuccess('Module updated successfully!');
      setShowFormModal(false);
      setEditingModule(null);
      loadCourseAndModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
      
      setSuccess('Module deleted successfully');
      loadCourseAndModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module');
    }
  };

  const handleMoveModule = async (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = modules.findIndex(m => m.id === moduleId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;

    try {
      const currentModule = modules[currentIndex];
      const targetModule = modules[newIndex];

      const updates = [
        {
          id: currentModule.id,
          class_id: currentModule.class_id,
          title: currentModule.title,
          description: currentModule.description,
          slide_url: currentModule.slide_url,
          order: targetModule.order
        },
        {
          id: targetModule.id,
          class_id: targetModule.class_id,
          title: targetModule.title,
          description: targetModule.description,
          slide_url: targetModule.slide_url,
          order: currentModule.order
        }
      ];

      const { error } = await supabase
        .from('modules')
        .upsert(updates);

      if (error) throw error;

      loadCourseAndModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder modules');
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('modules')
        .update({
          content: formData.content
        })
        .eq('id', editingModule.id);

      if (error) throw error;

      setSuccess('Module content updated successfully!');
      setShowContentModal(false);
      setEditingModule(null);
      loadCourseAndModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module content');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModules = modules.filter(module => {
    const searchLower = searchQuery.toLowerCase();
    return (
      module.title.toLowerCase().includes(searchLower) ||
      module.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/courses')}
          className="flex items-center text-[#F98B3D] hover:text-[#e07a2c] mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Courses
        </button>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {course ? `Modules for ${course.title}` : 'Loading...'}
            </h1>
            <p className="text-gray-600">Manage modules for this course.</p>
          </div>
          <Button
            onClick={() => {
              setEditingModule(null);
              setShowFormModal(true);
            }}
            leftIcon={<Plus size={16} />}
          >
            Add Module
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
          />
        </div>
      </div>

      {/* Module Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-[#F98B3D]" />
                  {editingModule ? 'Edit Module' : 'Create New Module'}
                </h2>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingModule(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={editingModule ? handleUpdateSubmit : handleCreateSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    placeholder="Introduction to the Course"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    placeholder="Enter module description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slide URL
                  </label>
                  <input
                    type="url"
                    value={formData.slideUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, slideUrl: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    placeholder="https://docs.google.com/presentation/d/..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the URL for the presentation (Google Slides or Gamma)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    placeholder="Enter additional module content or notes..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This content will be available to students as supplementary material
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFormModal(false);
                      setEditingModule(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                  >
                    {editingModule ? 'Update Module' : 'Create Module'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {(error || success) && (
        <div className="mb-6">
          {error && (
            <Alert
              type="error"
              title="Error"
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              type="success"
              title="Success"
              onClose={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}
        </div>
      )}

      {/* Modules List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No modules found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredModules.map((module, index) => (
              <div
                key={module.id}
                className="flex items-center p-4 bg-white"
              >
                <div className="mr-4 cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {module.description}
                      </p>
                      {/* Resource Bar */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {module.resources?.map((resource) => (
                          <span
                            key={resource.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {getResourceIcon(resource.type)}
                            <span className="ml-1.5">{resource.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleMoveModule(module.id, 'up')}
                          disabled={index === 0}
                          className={`text-gray-400 hover:text-gray-600 ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveModule(module.id, 'down')}
                          disabled={index === modules.length - 1}
                          className={`text-gray-400 hover:text-gray-600 ${index === modules.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setEditingModule(module);
                          setShowFormModal(true);
                        }}
                        className="text-[#F98B3D] hover:text-[#e07a2c]"
                        title="Edit module"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/courses/${courseId}/modules/${module.id}/resources`)}
                        className="text-[#F98B3D] hover:text-[#e07a2c] ml-3"
                        title="Manage resources"
                      >
                        <Library size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-600 hover:text-red-900 ml-3"
                        title="Delete module"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleAdmin;