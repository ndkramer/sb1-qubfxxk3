import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { GraduationCap, AlertCircle, Loader2, Info } from 'lucide-react';
import Alert from '../components/Alert';

interface LocationState {
  from?: { pathname: string };
  message?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/dashboard';
  const message = state?.message;
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    // Only redirect if auth is initialized, user is authenticated, and we're on the login page
    if (isInitialized && isAuthenticated && location.pathname === '/login') {
      navigate(from, { replace: true });
    }
  }, [isInitialized, isAuthenticated, navigate, from, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('Login form submitted with email:', email);

    try {
      const { success, error: loginError } = await login(email, password);
      console.log('Login attempt result:', { success, error: loginError });

      if (!success) {
        console.error('Login failed:', loginError);
        setError(loginError || 'Invalid email or password.');
        setIsLoading(false);
      }
      // Note: We don't need to navigate here as the useEffect will handle it
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An error occurred. Please try again.');
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
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">Student Portal</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Student Login</h2>
          
          {message && (
            <Alert
              type="success"
              title="Success"
              onClose={() => navigate(location.pathname, { replace: true, state: {} })}
            >
              {message}
            </Alert>
          )}

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

          {showHint && (
            <Alert
              type="info"
              title="Demo Login"
              onClose={() => setShowHint(false)}
            >
              <div className="flex items-center">
                <Info className="w-4 h-4 mr-2" />
                <span>Use <strong>test@example.com</strong> / <strong>password123</strong> to log in</span>
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
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 bg-[#F98B3D] hover:bg-[#e07a2c] disabled:hover:bg-[#F98B3D] text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F98B3D] transition-colors duration-200 flex items-center justify-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-[#F98B3D] hover:text-[#e07a2c] font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Need help? Contact support at support@one80learn.com</p>
      </div>
    </div>
  );
}

export default Login;