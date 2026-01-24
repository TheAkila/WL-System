import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Key, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'technical',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required');
      return;
    }

    try {
      await api.post('/admin/users', formData);
      toast.success('User created successfully');
      setShowForm(false);
      setFormData({ email: '', password: '', role: 'technical' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to create user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update role');
    }
  };

  const handlePasswordReset = async (userId) => {
    const newPassword = prompt('Enter new password (minimum 6 characters):');
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.put(`/admin/users/${userId}/password`, { newPassword });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleDelete = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to delete user: ${email}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'technical':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300';
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 font-ui">
            Manage system users and access control
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>{showForm ? 'Cancel' : 'Create User'}</span>
        </button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="card card-lg mb-8">
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-6">
            Create New User
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input"
              >
                <option value="viewer">Viewer</option>
                <option value="technical">Technical</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                Create User
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="card text-center py-12">
          <p className="text-slate-600 dark:text-zinc-400">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="card card-lg text-center py-12">
          <Users className="mx-auto text-slate-300 dark:text-zinc-600 mb-4" size={64} />
          <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-2">
            No users found
          </h3>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-700">
              <thead className="bg-slate-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-slate-200 dark:divide-zinc-800">
                {users.map((user) => {
                  const isCurrentUser = user.id === currentUser?.id;
                  
                  return (
                    <tr key={user.id} className={isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {user.email}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                              (You)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={isCurrentUser}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${getRoleBadgeClass(user.role)} ${
                            isCurrentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                          }`}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="technical">Technical</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-zinc-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePasswordReset(user.id)}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600"
                            title="Reset Password"
                          >
                            <Key size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.email)}
                            disabled={isCurrentUser}
                            className={`p-2 rounded-lg transition-colors text-red-600 ${
                              isCurrentUser
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:bg-red-50 dark:hover:bg-red-900/30'
                            }`}
                            title={isCurrentUser ? 'Cannot delete yourself' : 'Delete User'}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Alert */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
        <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Security Notice:</strong> Admin users have full system access. Technical users can manage competitions and sessions. Viewers have read-only access.
        </div>
      </div>
    </div>
  );
}
