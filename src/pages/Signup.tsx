import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import Alert from '../components/Alert';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!email || !password || !name) {
      setError('All fields are required');
      return;
    }
    
    if (!email || !password || !name) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const { success, error: signupError } = await signup(email, password, name);
      if (success) {
        // Handle success with or without email confirmation
        if (signupError?.includes('check your email')) {
          navigate('/login', {
            state: {
              from,
              message: signupError
            }
          });
        } else {
          // Direct login if no email confirmation required
          navigate('/login', {
            state: {
              from,
              message: 'Account created successfully! Please log in.'
            }
          });
        }
      } else {
        setError(signupError || 'Failed to create account');
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
              <span className="font-bold text-2xl text-gray-900">One80Learn</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Create your account</h2>
          
          {error && (
            <Alert
              type="error"
              title="Registration Error"
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 8 characters
              </p>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 bg-[#F98B3D] hover:bg-[#e07a2c] disabled:hover:bg-[#F98B3D] text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F98B3D] transition-colors duration-200 flex items-center justify-center ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                state={{ from }}
                className="text-[#F98B3D] hover:text-[#e07a2c] font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;