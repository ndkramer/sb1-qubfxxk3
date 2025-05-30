import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { BookOpen, Search, Plus, Pencil, Trash2, X, FileText, Layers } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  thumbnail_url: string;
  schedule_data: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    timeZone: string;
    location: string;
  };
  created_at: string;
}

const CourseAdmin: React.FC = () => {
  const navigate = useNavigate();
  console.log('CourseAdmin - Component mounted');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [duplicatingCourse, setDuplicatingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    timeZone: 'CST',
    location: 'Zoom Virtual Classroom'
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title,
        description: editingCourse.description,
        thumbnailUrl: editingCourse.thumbnail_url,
        startDate: editingCourse.schedule_data.startDate,
        endDate: editingCourse.schedule_data.endDate,
        startTime: editingCourse.schedule_data.startTime,
        endTime: editingCourse.schedule_data.endTime,
        timeZone: editingCourse.schedule_data.timeZone,
        location: editingCourse.schedule_data.location
      });
    } else {
      setFormData({
        title: '',
        description: '',
        thumbnailUrl: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        timeZone: 'CST',
        location: 'Zoom Virtual Classroom'
      });
    }
  }, [editingCourse]);

  const loadCourses = async () => {
    console.log('CourseAdmin - Loading courses');
    try {
      setIsLoading(true);
      setError(null);

      // Get current auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('CourseAdmin - Auth session:', session?.user?.email);
      if (sessionError) {
        console.error('CourseAdmin - Session error:', sessionError);
      }

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('CourseAdmin - Query response:', { data, error });

      if (error) {
        console.error('CourseAdmin - Error loading courses:', error);
        throw error;
      }

      console.log('CourseAdmin - Courses loaded:', data);
      setCourses(data || []);
    } catch (err) {
      console.error('CourseAdmin - Error loading courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('classes')
        .insert([{
          title: formData.title,
          description: formData.description,
          instructor_id: user.id,
          thumbnail_url: formData.thumbnailUrl,
          schedule_data: {
            startDate: formData.startDate,
            endDate: formData.endDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            timeZone: formData.timeZone,
            location: formData.location
          }
        }])
        .select()
        .single();

      if (error) throw error;

      setSuccess('Course created successfully!');
      setShowFormModal(false);
      setFormData({
        title: '',
        description: '',
        thumbnailUrl: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        timeZone: 'CST',
        location: 'Zoom Virtual Classroom'
      });
      loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('classes')
        .update({
          title: formData.title,
          description: formData.description,
          thumbnail_url: formData.thumbnailUrl,
          schedule_data: {
            startDate: formData.startDate,
            endDate: formData.endDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            timeZone: formData.timeZone,
            location: formData.location
          }
        })
        .eq('id', editingCourse.id);

      if (error) throw error;

      setSuccess('Course updated successfully!');
      setShowFormModal(false);
      setEditingCourse(null);
      loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowFormModal(true);
  };

  const handleDuplicateCourse = async (course: Course) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('classes')
        .insert([{
          title: `${course.title} (Copy)`,
          description: course.description,
          instructor_id: user.id,
          thumbnail_url: course.thumbnail_url,
          schedule_data: {
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            timeZone: 'CST',
            location: 'Zoom Virtual Classroom'
          }
        }])
        .select()
        .single();

      if (error) throw error;

      // Now duplicate all modules for this course
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('class_id', course.id)
        .order('order');

      if (modulesError) throw modulesError;

      if (modules && modules.length > 0) {
        const newModules = modules.map(module => ({
          class_id: data.id,
          title: module.title,
          description: module.description,
          slide_url: module.slide_url,
          order: module.order
        }));

        const { error: insertModulesError } = await supabase
          .from('modules')
          .insert(newModules);

        if (insertModulesError) throw insertModulesError;
      }

      setSuccess('Course duplicated successfully!');
      loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      
      setSuccess('Course deleted successfully');
      loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(course => {
    const searchLower = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(searchLower) ||
      course.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Management</h1>
            <p className="text-gray-600">Create and manage courses for the learning platform.</p>
          </div>
          <Button
            onClick={() => {
              setEditingCourse(null);
              setShowFormModal(true);
            }}
            leftIcon={<Plus size={16} />}
          >
            Create Course
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
          />
        </div>
      </div>

      {/* Create Course Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BookOpen className="w-6 h-6 mr-2 text-[#F98B3D]" />
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingCourse(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={editingCourse ? handleUpdateSubmit : handleCreateSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    placeholder="Introduction to Programming"
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
                    placeholder="Enter course description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFormModal(false);
                      setEditingCourse(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                  >
                    {editingCourse ? 'Update Course' : 'Create Course'}
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

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <Alert
              type="error"
              title="Error Loading Courses"
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No courses found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={course.thumbnail_url}
                            alt={course.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {course.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(course.schedule_data.startDate).toLocaleDateString()} - {new Date(course.schedule_data.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {course.schedule_data.startTime} - {course.schedule_data.endTime} {course.schedule_data.timeZone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="text-[#F98B3D] hover:text-[#e07a2c]"
                        title="Edit course"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/courses/${course.id}/modules`)}
                        className="text-[#F98B3D] hover:text-[#e07a2c] ml-3"
                        title="Manage modules"
                      >
                        <Layers size={16} />
                      </button>
                      <button
                        onClick={() => handleDuplicateCourse(course)}
                        className="text-[#F98B3D] hover:text-[#e07a2c] ml-3"
                        title="Duplicate course"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900 ml-3"
                        title="Delete course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAdmin;