import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { UserPlus, Search, Mail, Trash2, UserCog, X, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

interface UserData {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
  created_at: string;
}

const UserAdmin: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const apiUrl = `${supabaseUrl}/functions/v1/manage-users`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const apiUrl = `${supabaseUrl}/functions/v1/manage-users`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          fullName: fullName.trim() || undefined 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create user');
      }

      setSuccess('User created successfully! They will receive an email to set their password.');
      setFullName('');
      setEmail('');
      setShowCreateForm(false);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const apiUrl = `${supabaseUrl}/functions/v1/manage-users`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      setSuccess('User deleted successfully');
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleResetPassword = async (email: string) => {
    setIsResettingPassword(true);
    try {
      const redirectTo = window.location.origin + '/reset-password';
      console.log('Reset password redirect URL:', redirectTo);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) throw error;
      
      setSuccess('Password reset email sent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset password email');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.user_metadata.full_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Administration</h1>
            <p className="text-gray-600">Manage user accounts for the learning platform.</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            leftIcon={<UserPlus size={16} />}
          >
            Add User
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
          />
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <UserPlus className="w-6 h-6 mr-2 text-[#F98B3D]" />
                  Add New User
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label 
                    htmlFor="fullName" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name (Optional)
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F98B3D] focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                  >
                    Create User
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {(error || success) && (
        <div className="mb-6">
          {error && (
            <Alert
              type="error"
              title="Error"
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              type="success"
              title="Success"
              onClose={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoadingUsers ? (
          <div className="p-6 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-[#F98B3D] flex items-center justify-center text-white">
                          <UserCog size={16} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.user_metadata.full_name || 'No name'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleResetPassword(user.email)}
                        disabled={isResettingPassword}
                        className="text-[#F98B3D] hover:text-[#e07a2c] mr-3"
                        title="Reset password"
                      >
                        <Mail size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAdmin;