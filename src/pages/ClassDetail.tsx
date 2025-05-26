import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { getClassById } from '../mock/data';
import ModuleCard from '../components/ModuleCard';

const ClassDetail: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  
  const classItem = classId ? getClassById(classId) : undefined;
  
  if (!classItem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Class not found</h2>
        <p className="text-gray-600 mb-6">The class you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => navigate('/classes')}
          className="px-4 py-2 bg-[#F98B3D] text-white rounded-md hover:bg-[#e07a2c] transition-colors duration-200"
        >
          Back to Classes
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Breadcrumb navigation */}
      <nav className="mb-4">
        <Link 
          to="/classes" 
          className="inline-flex items-center text-[#F98B3D] hover:text-[#e07a2c] text-sm font-medium"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to All Classes
        </Link>
      </nav>
      
      {/* Class header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="h-48 relative">
          <img 
            src={classItem.thumbnailUrl} 
            alt={classItem.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6">
              <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
                {classItem.title}
              </h1>
              <p className="text-gray-200">Instructor: {classItem.instructor}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">About This Class</h2>
          <p className="text-gray-700 mb-4">{classItem.description}</p>
          
          {/* Class Schedule */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Class Schedule</h3>
            {classItem.schedule ? (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Dates:</span> {new Date(classItem.schedule.startDate).toLocaleDateString()} - {new Date(classItem.schedule.endDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Time:</span> {classItem.schedule.startTime} - {classItem.schedule.endTime} {classItem.schedule.timeZone}
                </p>
                <p className="text-gray-700 flex items-center">
                  <span className="font-medium">Location:</span>{' '}
                  <span>{classItem.schedule.location}</span>
                  <a
                    href="https://www.one80labs.com/about"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-[#F98B3D] hover:text-[#e07a2c] inline-flex items-center"
                  >
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Schedule to be announced</p>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">{classItem.modules.length} modules</span>
          </div>
        </div>
      </div>
      
      {/* Module list */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Class Modules</h2>
        <div className="space-y-4">
          {classItem.modules
            .sort((a, b) => a.order - b.order)
            .map((module) => (
              <ModuleCard 
                key={module.id} 
                module={module}
                classId={classItem.id}
              />
            ))
          }
        </div>
      </div>
      
      {/* Meet the Instructor */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Meet Your Instructor</h2>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-full md:w-1/3">
              <img 
                src={classItem.instructor === "Nick Kramer" ? "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg" : classItem.instructorImage} 
                alt={classItem.instructor} 
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>
            <div className="w-full md:w-2/3">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{classItem.instructor}</h3>
              <p className="text-gray-700 mb-4">
                {classItem.instructor === "Nick Kramer" ? 
                  "Nick is a passionate educator and tech enthusiast with extensive experience in software development and AI technologies. He specializes in making complex technical concepts accessible and engaging for learners of all levels." 
                  : classItem.instructorBio}
              </p>
              
              {classItem.instructor === "Nick Kramer" && (
                <>
                  <div className="space-y-2 mb-6">
                    <a 
                      href="https://www.linkedin.com/in/nickolaskramer/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-[#F98B3D] hover:text-[#e07a2c]"
                    >
                      <span className="mr-2">LinkedIn Profile</span>
                      <ExternalLink size={16} />
                    </a>
                    <p className="text-gray-700">
                      <span className="font-medium">Email:</span> nick@one80labs.com
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Phone:</span> (402) 915-3613
                    </p>
                  </div>
                  
                  <a 
                    href="https://calendly.com/nickkramer" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-[#F98B3D] text-white rounded-md hover:bg-[#e07a2c] transition-colors duration-200"
                  >
                    Schedule Appointment
                    <ExternalLink size={16} className="ml-2" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;