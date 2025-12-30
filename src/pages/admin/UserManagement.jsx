import { useState, useEffect, useRef } from 'react';
import { useRBAC, ROLES } from '../../contexts/RBACContext';
import { getAllUsers, setUserActiveStatus, deleteUserProfile, getUserStats } from '../../services/api/users';
import UserForm from './components/UserForm';

const UserManagement = () => {
  const { profile, canManageSpecificUser, getRoleDisplayName } = useRBAC();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filterRole, filterStatus, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await getAllUsers();

    if (error) {
      setError('Failed to load users: ' + error.message);
      setLoading(false);
      return;
    }

    setUsers(data || []);
    setLoading(false);
  };

  const loadStats = async () => {
    const { data } = await getUserStats();
    if (data) {
      setStats(data);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(user => user.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(user => !user.is_active);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.display_name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    if (!canManageSpecificUser(user)) {
      alert('You do not have permission to edit this user.');
      return;
    }
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleToggleActive = async (user) => {
    if (!canManageSpecificUser(user)) {
      alert('You do not have permission to modify this user.');
      return;
    }

    if (!confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.display_name}?`)) {
      return;
    }

    const { error } = await setUserActiveStatus(user.user_id, !user.is_active);

    if (error) {
      alert('Failed to update user status: ' + error.message);
      return;
    }

    loadUsers();
    loadStats();
  };

  const handleDeleteUser = async (user) => {
    if (!canManageSpecificUser(user)) {
      alert('You do not have permission to delete this user.');
      return;
    }

    if (!confirm(`Are you sure you want to DELETE ${user.display_name}? This action cannot be undone.`)) {
      return;
    }

    const { error } = await deleteUserProfile(user.user_id);

    if (error) {
      alert('Failed to delete user: ' + error.message);
      return;
    }

    loadUsers();
    loadStats();
  };

  const handleFormClose = (success) => {
    setShowUserForm(false);
    setSelectedUser(null);
    if (success) {
      loadUsers();
      loadStats();
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200',
      admin: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
      aom: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
      supervisor: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
      lead_tech: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-100',
      technician: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-100'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Create User
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-300">{stats.inactive}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
              {(stats.byRole.super_admin || 0) + (stats.byRole.admin || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 border border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="aom">AOM</option>
              <option value="supervisor">Supervisor</option>
              <option value="lead_tech">Lead Tech</option>
              <option value="technician">Technician</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden border border-slate-100 dark:border-slate-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-800/70">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Market
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Reports To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No users found matching your filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-slate-800/70">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.display_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {user.markets?.name || <span className="text-gray-400 dark:text-gray-500">Nationwide</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {user.reports_to?.display_name || <span className="text-gray-400 dark:text-gray-500">—</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {canManageSpecificUser(user) && (
                        <>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={user.is_active ? 'text-orange-600 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-200' : 'text-green-600 hover:text-green-900 dark:text-green-300 dark:hover:text-green-200'}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          {user.user_id !== profile.user_id && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900 dark:text-red-300 dark:hover:text-red-200"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                      {!canManageSpecificUser(user) && (
                        <span className="text-gray-400 dark:text-gray-500">No access</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={selectedUser}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default UserManagement;
