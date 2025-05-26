import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Layers, User, BookOpen, ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react';
import SearchBar from './SearchBar';
import { useAuth } from '../utils/authContext';
import LoadingSpinner from './LoadingSpinner';
import { getSortedClasses } from '../mock/data';

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored ? JSON.parse(stored) : false;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>(() => {
    // Extract classId from URL if it exists
    const match = location.pathname.match(/\/classes\/([^\/]+)/);
    if (match) {
      return { [match[1]]: true };
    }
    return {};
  });

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  };

  const toggleClass = (classId: string) => {
    // Navigate to class page and expand the class
    navigate(`/classes/${classId}`);
    setExpandedClasses(prev => {
      const wasExpanded = prev[classId];
      return {
        [classId]: !wasExpanded
      };
    });
  };
  
  // Update expanded classes when route changes
  useEffect(() => {
    const match = location.pathname.match(/\/classes\/([^\/]+)/);
    if (match) {
      setExpandedClasses(prev => ({
        [match[1]]: true
      }));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-100 text-gray-900 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Link to="/" className={`flex items-center ${sidebarCollapsed ? '' : 'space-x-2'}`}>
              <div className="h-8 w-8 rounded-full bg-[#F98B3D] flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              {!sidebarCollapsed && <span className="font-bold text-xl text-gray-900">One80Learn</span>}
            </Link>
            <div className="flex items-center">
              <button
                className="hidden lg:block text-gray-500 hover:text-gray-700 transition-colors duration-200 mr-2"
                onClick={toggleSidebar}
              >
                <ChevronLeft size={20} className={`transform transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
              <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              >
              <X size={24} />
              </button>
            </div>
          </div>
          
          <nav className={`mt-10 space-y-1 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
            <Link 
              to="/dashboard" 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-md transition-colors duration-200 ${
                isActive('/dashboard') ? 'bg-[#F98B3D] text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Layers size={20} />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Link>
            
            {/* Enrolled Classes */}
            {!sidebarCollapsed && <div className="mt-2 mb-1">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Enrolled Classes
              </h3>
            </div>}
            {getSortedClasses().map((classItem) => (
              <div key={classItem.id}>
                <div
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-md transition-colors duration-200 ${
                    isActive(`/classes/${classItem.id}`) ? 'bg-[#F98B3D] text-white' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Link 
                    to={`/classes/${classItem.id}`}
                    className={`flex items-center ${sidebarCollapsed ? '' : 'space-x-3'} truncate flex-grow`}
                  >
                    <ChevronRight size={16} />
                    {!sidebarCollapsed && <span className="truncate">{classItem.title}</span>}
                  </Link>
                  {!sidebarCollapsed && (
                    <button
                      onClick={() => toggleClass(classItem.id)}
                      className="ml-2"
                    >
                      <ChevronDown
                        size={16}
                        className={`transform transition-transform duration-200 ${
                          expandedClasses[classItem.id] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
                
                {!sidebarCollapsed && <div
                  className={`overflow-hidden transition-all duration-200 ${
                    expandedClasses[classItem.id] ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  {classItem.modules.map((module) => (
                    <Link
                      key={module.id}
                      to={`/classes/${classItem.id}/modules/${module.id}`}
                      className={`flex items-center space-x-3 pl-8 pr-3 py-2 transition-colors duration-200 ${
                        isActive(`/classes/${classItem.id}/modules/${module.id}`)
                          ? 'bg-[#F98B3D]/10 text-[#F98B3D]'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                        {module.order}.
                      </div>
                      <span className="truncate text-sm">{module.title}</span>
                    </Link>
                  ))}
                </div>}
              </div>
            ))}
            
            <Link 
              to="/profile" 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-md transition-colors duration-200 ${
                isActive('/profile') ? 'bg-[#F98B3D] text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User size={20} />
              {!sidebarCollapsed && <span>Profile</span>}
            </Link>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="border-t border-gray-200 pt-4">
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 text-gray-700 hover:bg-gray-200 rounded-md transition-colors duration-200`}
            >
              <LogOut size={20} />
              {!sidebarCollapsed && <span>Log Out</span>}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="lg:hidden mb-4">
              <button
                className="text-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="min-h-[calc(100vh-theme(spacing.16))]">
                <Outlet />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;