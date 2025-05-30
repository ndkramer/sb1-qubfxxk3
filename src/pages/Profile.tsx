import React, { useState } from 'react';
import { useAuth } from '../utils/authContext';
import { User, Camera, Mail } from 'lucide-react';
import Alert from '../components/Alert';
import Button from '../components/Button';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('saved');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }, 800);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">
          Manage your account settings and profile information.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={40} className="text-gray-400" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50"
              >
                <Camera size={16} className="text-gray-600" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-medium text-gray-900 mb-1">{formData.name}</h2>
              <p className="text-gray-600 flex items-center">
                <Mail size={16} className="mr-2" />
                {formData.email}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                />
              </div>
              
              <div className="pt-4">
                <Button
                  disabled={isSaving}
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
                
                {saveStatus === 'saved' && (
                  <span className="ml-4 text-green-600 text-sm">Profile updated successfully!</span>
                )}
                
                {saveStatus === 'error' && (
                  <span className="ml-4 text-red-600 text-sm">Error updating profile!</span>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;