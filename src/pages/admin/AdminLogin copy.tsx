import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../utils/adminAuthContext';
import { Shield, AlertCircle, X, Lock } from 'lucide-react';
import Alert from '../../components/Alert';
import Button from '../../components/Button';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const { login, resetPassword: resetPasswordAdmin } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: number;
    if (cooldownTime > 0) {
      timer = window.setInterval(() => {
        setCooldownTime((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { success, error: loginError } = await login(email, password);
      if (success) {
        navigate('/admin/dashboard');
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
    console.log('[DEBUG] AdminLogin: Starting password reset for:', email);
    setIsLoading(true);
    
    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (cooldownTime > 0) {
      setError(`Please wait ${cooldownTime} seconds before requesting another reset email.`);
      setIsLoading(false);
      return;
    }

    try {
      console.log('[DEBUG] AdminLogin: Submitting reset password form');
      const result = await resetPasswordAdmin(email);
      console.log('[DEBUG] AdminLogin: Reset password result:', result);
      
      const { success, error: resetError } = result;
      if (success) {
        console.log('[DEBUG] AdminLogin: Password reset email sent successfully');
        setResetEmailSent(true);
        setCooldownTime(24); // Set to 24 seconds to match Supabase's rate limit
        setError('');
      } else {
        console.error('[DEBUG] AdminLogin: Password reset failed:', resetError);
        if (resetError?.includes('rate_limit')) {
          setError('Please wait before requesting another reset email.');
          setCooldownTime(24); // Set to 24 seconds to match Supabase's rate limit
        } else {
          setError(resetError || 'Failed to send reset email');
        }
      }
    } catch (err) {
      console.error('[DEBUG] AdminLogin: Unexpected error during password reset:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-[#F98B3D] p-6">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                <Shield size={24} className="text-[#F98B3D]" />
              </div>
              <span className="font-bold text-2xl text-white">Admin Portal</span>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Secure Admin Access</h2>
          </div>
          
          <p className="text-center text-gray-600 mb-8">
            Please enter your administrator credentials to continue
          </p>
          
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
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                placeholder="Enter admin email"
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
                  className="text-sm text-[#F98B3D] hover:text-[#e07a2c] cursor-pointer select-none"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only authorized administrators can access this portal
              </p>
            </div>
            
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-[#F98B3D] hover:bg-[#e07a2c]"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <div className="mt-8 text-center border-t pt-6">
            <Link 
              to="/login"
              className="inline-flex items-center text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login', { replace: true });
              }}
            >
              <span className="mr-2">←</span>
              Return to Student Portal
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Protected access for One80Learn administrators only</p>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Reset Password</h3>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            {resetEmailSent ? (
              <>
                <Alert type="success" title="Email Sent">
                  If an account exists with this email, you will receive password reset instructions.
                  {cooldownTime > 0 && (
                    <p className="mt-2 text-sm">
                      You can request another reset email in {cooldownTime} seconds.
                    </p>
                  )}
                </Alert>
                <Button
                  className="w-full mt-4"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setError('');
                  }}
                >
                  Close
                </Button>
              </>
            ) : (
              <form onSubmit={handleResetPassword}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent mb-4"
                  required
                />
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setResetEmailSent(false);
                      setShowForgotPassword(false);
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={!email.trim() || isLoading || cooldownTime > 0}
                  >
                    {cooldownTime > 0 
                      ? `Wait ${cooldownTime}s` 
                      : 'Send Reset Link'
                    }
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