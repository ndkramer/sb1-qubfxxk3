import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/authContext';
import { AdminProvider } from './utils/adminContext';
import { ClassProvider } from './utils/classContext';
import { ModuleProvider } from './utils/moduleContext';
import { NoteProvider } from './utils/noteContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ClassList from './pages/ClassList';
import ClassDetail from './pages/ClassDetail';
import ModuleDetail from './pages/ModuleDetail';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard\" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/classes" element={
          <ProtectedRoute>
            <ClassList />
          </ProtectedRoute>
        } />
        <Route path="/classes/:classId" element={
          <ProtectedRoute>
            <ClassDetail />
          </ProtectedRoute>
        } />
        <Route path="/classes/:classId/modules/:moduleId" element={
          <ProtectedRoute>
            <ModuleDetail />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Route>
      <Route path="*" element={
        <ProtectedRoute>
          <Navigate to="/dashboard\" replace />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ClassProvider>
          <ModuleProvider>
            <NoteProvider>
              <AppRoutes />
            </NoteProvider>
          </ModuleProvider>
        </ClassProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;