import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../utils/authContext';
import { useAdmin } from '../../utils/adminContext';
import { BookOpen, AlertCircle, X } from 'lucide-react';
import Alert from '../../components/Alert';
import Button from '../../components/Button';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { login, resetPassword } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { success, error: loginError } = await login(email, password);
      if (success) {
        // Check if user is admin
        if (email === 'Nick@one80services.com') {
          navigate('/admin/dashboard');
        } else {
          setError('Access denied. Admin privileges required.');
        }
      } else {
        setError(loginError || 'Invalid email or password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { success, error: resetError } = await resetPassword(email);
      if (success) {
        setResetEmailSent(true);
      } else {
        setError(resetError || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-[#F98B3D] flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">Admin Portal</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Admin Login</h2>
          
          {error && (
            <Alert
              type="error"
              title="Authentication Error"
              onClose={() => setError('')}
            >
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>{error}</span>
              </div>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#F98B3D] hover:text-[#e07a2c]"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/login"
              className="text-[#F98B3D] hover:text-[#e07a2c] font-medium"
            >
              Return to Student Login
            </Link>
          </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Reset Password</h3>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            {resetEmailSent ? (
              <>
                <Alert type="success" title="Email Sent">
                  Check your email for password reset instructions.
                </Alert>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-[#F98B3D] text-white rounded-md hover:bg-[#e07a2c]"
                >
                  Close
                </button>
              </>
            ) : (
              <form onSubmit={handleResetPassword}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  className="w-full px-4 py-2 border rounded-md mb-4"
                  required
                />
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;