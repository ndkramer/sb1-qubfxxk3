import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Lock, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

const ResetPassword: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      setVerificationError('Invalid or missing access token');
      setIsVerifying(false);
      return;
    }

    // Set the access token in the session
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: ''
    });
    
    setIsVerifying(false);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password has been reset successfully. Please log in with your new password.' }
        });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 relative">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 min-h-[300px]">
          <div className="flex justify-center mb-8">
            <div className="h-12 w-12 rounded-full bg-[#F98B3D] flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Reset Your Password
          </h2>

          {isVerifying ? (
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">Verifying your reset link...</p>
            </div>
          ) : verificationError ? (
            <div className="text-center">
              <Alert type="error" title="Verification Error">
                {verificationError}
              </Alert>
              <Button
                className="mt-6"
                onClick={() => navigate('/login')}
              >
                Return to Login
              </Button>
            </div>
          ) : success ? (
            <div className="text-center">
              <Alert type="success" title="Success">
                Password reset successful!
              </Alert>
              <Button
                className="mt-6"
                onClick={() => navigate('/login', {
                  state: { message: 'Password has been reset successfully. Please log in with your new password.' }
                })}
              >
                Continue to Login
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <Alert
                  type="error"
                  title="Error"
                  onClose={() => setError(null)}
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>{error}</span>
                  </div>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;