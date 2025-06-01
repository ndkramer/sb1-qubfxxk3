import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './utils/authContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ClassList from './pages/ClassList';
import ClassDetail from './pages/ClassDetail';
import ModuleDetail from './pages/ModuleDetail';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import { ClassProvider } from './utils/classContext';
import { ModuleProvider } from './utils/moduleContext';
import { NoteProvider } from './utils/noteContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import CourseAdmin from './pages/admin/CourseAdmin';
import ResourceAdmin from './pages/admin/ResourceAdmin';
import UserAdmin from './pages/admin/UserAdmin';
import ModuleAdmin from './pages/admin/ModuleAdmin';
import ModuleResourcesPage from './pages/admin/ModuleResourcesPage';
import AdminLayout from './pages/admin/AdminLayout';
import { AdminAuthProvider } from './utils/adminAuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  
  // Show loading spinner until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Only redirect once auth is fully initialized
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminAuthProvider>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </AdminAuthProvider>
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<CourseAdmin />} />
          <Route path="courses/:courseId/modules" element={<ModuleAdmin />} />
          <Route path="courses/:courseId/modules/:moduleId/resources" element={<ModuleResourcesPage />} />
          <Route path="resources" element={<ResourceAdmin />} />
          <Route path="users" element={<UserAdmin />} />
        </Route>

        {/* Protected User Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <ClassProvider>
              <ModuleProvider>
                <NoteProvider>
                  <Layout>
                    <Outlet />
                  </Layout>
                </NoteProvider>
              </ModuleProvider>
            </ClassProvider>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard\" replace />} />
          <Route path="dashboard/*" element={<Dashboard />} />
          <Route path="classes" element={<ClassList />} />
          <Route path="classes/:classId" element={<ClassDetail />} />
          <Route path="classes/:classId/modules/:moduleId" element={<ModuleDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;