import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../utils/authContext';
import Alert from '../components/Alert';
import Button from '../components/Button';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  useEffect(() => {
    // Get access token from URL hash
    const hash = window.location.hash;
    if (!hash.includes('access_token=')) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, []);

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
      const { success, error: updateError } = await updatePassword(newPassword);
      
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Password has been reset successfully. Please log in with your new password.' }
          });
        }, 3000);
      } else {
        setError(updateError || 'Failed to update password');
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
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-[#F98B3D] flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">One80Learn</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Reset Password</h2>

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

          {isSuccess ? (
            <Alert type="success" title="Success">
              Password reset successful! Redirecting to login...
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-[#F98B3D] hover:text-[#e07a2c] text-sm font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;