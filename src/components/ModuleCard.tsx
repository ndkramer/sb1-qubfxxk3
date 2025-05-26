import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Module } from '../types';

interface ModuleCardProps {
  module: Module;
  classId: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, classId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/classes/${classId}/modules/${module.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center mb-2">
        <div className="flex-shrink-0 bg-[#F98B3D] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
          {module.order}
        </div>
        <h3 className="font-medium text-lg">{module.title}</h3>
      </div>
      <p className="text-gray-600 ml-11">{module.description}</p>
      <div className="mt-3 ml-11">
        <button 
          className="text-[#F98B3D] text-sm font-medium hover:text-[#e07a2c] transition-colors duration-200"
        >
          Open Module
        </button>
      </div>
    </div>
  );
};

export default ModuleCard;