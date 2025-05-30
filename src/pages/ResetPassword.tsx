import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '../utils/supabase';
import Alert from '../components/Alert';
import Button from '../components/Button';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidatingSession, setIsValidatingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        const hash = window.location.hash;
        console.log('Hash:', hash);

        if (!hash) {
          setIsValidatingSession(false);
          setSessionError('No reset token found');
          return;
        }

        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        console.log('Tokens found:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

        if (!accessToken || !refreshToken) {
          setIsValidatingSession(false);
          setSessionError('Invalid reset link');
          return;
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Session error:', error);
          setSessionError('Session expired');
          return;
        }

        setIsValidatingSession(false);
      } catch (err) {
        console.error('Reset password error:', err);
        setIsValidatingSession(false);
        setSessionError('An error occurred');
      }
    };

    handlePasswordReset();
  }, []);

  useEffect(() => {
    if (sessionError) {
      const timer = setTimeout(() => {
        navigate('/login', {
          state: { error: 'Invalid or expired reset link. Please request a new password reset.' }
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionError, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
        await supabase.auth.signOut();
      }
    } catch (err) {
      setError('An error occurred while resetting your password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-[#F98B3D] flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">One80Learn</span>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Create New Password</h2>
          </div>
          
          <p className="text-center text-gray-600 mb-8">
            Please enter your new password below
          </p>
          
          {sessionError && (
            <Alert type="error" title="Error">
              Invalid or expired reset link. Redirecting to login...
            </Alert>
          )}

          {error && (
            <Alert
              type="error"
              title="Error"
              onClose={() => setError('')}
            >
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>{error}</span>
              </div>
            </Alert>
          )}

          {isValidatingSession ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F98B3D]"></div>
            </div>
          ) : isSuccess ? (
            <Alert type="success" title="Success">
              Password reset successful! Redirecting to login...
              <div className="mt-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  minLength={8}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                  placeholder="••••••••"
                />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  minLength={8}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                  placeholder="••••••••"
                />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full mt-6"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center text-[#F98B3D] hover:text-[#e07a2c] text-sm font-medium"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Need help? Contact support at support@one80learn.com</p>
      </div>
    </div>
  );
};

export default ResetPassword;