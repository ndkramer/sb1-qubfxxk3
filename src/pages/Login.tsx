import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { BookOpen, AlertCircle } from 'lucide-react';
import Alert from '../components/Alert';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { success, error: loginError } = await login(email, password);
      if (success) {
        navigate(from, { replace: true });
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-[#F98B3D] flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">One80Learn</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Log in to your account</h2>
          
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
                placeholder="you@example.com"
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
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 bg-[#F98B3D] hover:bg-[#e07a2c] text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F98B3D] transition-colors duration-200 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                state={{ from }}
                className="text-[#F98B3D] hover:text-[#e07a2c] font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;