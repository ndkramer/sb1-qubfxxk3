import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { getSortedClasses } from '../mock/data';
import ClassCard from '../components/ClassCard';
import { ArrowRight } from 'lucide-react';
import SearchBar from '../components/SearchBar';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Take only the first 3 classes for the dashboard
  const featuredClasses = getSortedClasses().slice(0, 3);

  return (
    <div>
      {/* Welcome section */}
      <div className="bg-gray-100 p-6 mb-8 -mx-6 -mt-6 lg:-mx-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-gray-900 text-2xl md:text-3xl font-bold mb-2 text-center">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mb-4 text-center">
            Continue your learning journey. You have access to {getSortedClasses().length} classes.
          </p>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="mb-8">
        <SearchBar />
      </div>
      
      {/* Featured classes */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Classes</h2>
          <Link 
            to="/classes" 
            className="text-[#F98B3D] hover:text-[#e07a2c] text-sm font-medium flex items-center"
          >
            View All
            <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredClasses.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;