import { useState, useEffect } from 'react';
import { useRBAC, ROLES } from '../../../contexts/RBACContext';
import { createUser, updateUserProfile, getPotentialSupervisors } from '../../../services/api/users';
import { organizationService } from '../../../services/api/organization';

const UserForm = ({ user, onClose }) => {
  const { profile, getRoleDisplayName } = useRBAC();
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    password: '',
    role: 'technician',
    market_id: null,
    reports_to_user_id: null,
    is_active: true
  });

  const [markets, setMarkets] = useState([]);
  const [potentialSupervisors, setPotentialSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadMarkets();

    if (isEditing) {
      setFormData({
        display_name: user.display_name || '',
        email: user.email || '',
        password: '', // Never pre-fill password
        role: user.role || 'technician',
        market_id: user.market_id || null,
        reports_to_user_id: user.reports_to_user_id || null,
        is_active: user.is_active ?? true
      });
    }
  }, [user, isEditing]);

  useEffect(() => {
    // Load potential supervisors when role or market changes
    if (formData.role && formData.role !== 'super_admin' && formData.role !== 'admin' && formData.role !== 'aom') {
      loadPotentialSupervisors(formData.role, formData.market_id);
    } else {
      setPotentialSupervisors([]);
      setFormData(prev => ({ ...prev, reports_to_user_id: null }));
    }
  }, [formData.role, formData.market_id]);

  const loadMarkets = async () => {
    try {
      const data = await organizationService.getMarkets();
      if (data) {
        // Filter markets based on current user's role
        if (profile.role === 'aom' || profile.role === 'supervisor') {
          // AOM and Supervisor can only create users in their own market
          const userMarket = data.find(m => m.id === profile.market_id);
          setMarkets(userMarket ? [userMarket] : []);

          // Auto-select the user's market
          if (userMarket && !isEditing) {
            setFormData(prev => ({ ...prev, market_id: userMarket.id }));
          }
        } else {
          // Super Admin and Admin can see all markets
          setMarkets(data);
        }
      }
    } catch (error) {
      console.error('Error loading markets:', error);
    }
  };

  const loadPotentialSupervisors = async (role, marketId) => {
    const { data } = await getPotentialSupervisors(role, marketId);
    if (data) {
      setPotentialSupervisors(data);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' ? null : value)
    }));
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: newRole,
      // Clear market if role is admin
      market_id: (newRole === 'super_admin' || newRole === 'admin') ? null : prev.market_id,
      reports_to_user_id: null
    }));
  };

  const getAvailableRoles = () => {
    // Super Admin can assign any role
    if (profile.role === 'super_admin') {
      return Object.values(ROLES);
    }

    // Admin can assign any non-admin role
    if (profile.role === 'admin') {
      return [ROLES.AOM, ROLES.SUPERVISOR, ROLES.LEAD_TECH, ROLES.TECHNICIAN];
    }

    // AOM can assign supervisor, lead tech, technician
    if (profile.role === 'aom') {
      return [ROLES.SUPERVISOR, ROLES.LEAD_TECH, ROLES.TECHNICIAN];
    }

    // Supervisor can assign lead tech and technician
    if (profile.role === 'supervisor') {
      return [ROLES.LEAD_TECH, ROLES.TECHNICIAN];
    }

    return [];
  };

  const validateForm = () => {
    if (!formData.display_name.trim()) {
      setError('Display name is required');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!isEditing && !formData.password) {
      setError('Password is required for new users');
      return false;
    }

    if (!isEditing && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!formData.role) {
      setError('Role is required');
      return false;
    }

    // Regional roles must have a market
    if (!['super_admin', 'admin'].includes(formData.role) && !formData.market_id) {
      setError('Market is required for this role');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        // Update existing user
        const updates = {
          display_name: formData.display_name,
          role: formData.role,
          market_id: formData.market_id,
          reports_to_user_id: formData.reports_to_user_id,
          is_active: formData.is_active
        };

        const { error } = await updateUserProfile(user.user_id, updates);

        if (error) throw error;
      } else {
        // Create new user
        const { error } = await createUser({
          display_name: formData.display_name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          market_id: formData.market_id,
          reports_to_user_id: formData.reports_to_user_id
        });

        if (error) throw error;
      }

      onClose(true); // Success
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const availableRoles = getAvailableRoles();
  const requiresMarket = formData.role && !['super_admin', 'admin'].includes(formData.role);
  const requiresSupervisor = formData.role && !['super_admin', 'admin', 'aom'].includes(formData.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isEditing ? 'Update user information and permissions' : 'Add a new user to the system'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEditing}
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="john.doe@example.com"
            />
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed after creation</p>
            )}
          </div>

          {/* Password (only for new users) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1 text-gray-600 hover:text-gray-800"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableRoles.map(role => (
                <option key={role} value={role}>
                  {getRoleDisplayName(role)}
                </option>
              ))}
            </select>
          </div>

          {/* Market (required for regional roles) */}
          {requiresMarket && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Market <span className="text-red-500">*</span>
              </label>
              <select
                name="market_id"
                value={formData.market_id || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a market</option>
                {markets.map(market => (
                  <option key={market.id} value={market.id}>
                    {market.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reports To (required for some roles) */}
          {requiresSupervisor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reports To {potentialSupervisors.length > 0 && <span className="text-red-500">*</span>}
              </label>
              <select
                name="reports_to_user_id"
                value={formData.reports_to_user_id || ''}
                onChange={handleChange}
                required={potentialSupervisors.length > 0}
                disabled={potentialSupervisors.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {potentialSupervisors.length === 0 ? 'No supervisors available' : 'Select a supervisor'}
                </option>
                {potentialSupervisors.map(supervisor => (
                  <option key={supervisor.user_id} value={supervisor.user_id}>
                    {supervisor.display_name} ({getRoleDisplayName(supervisor.role)})
                  </option>
                ))}
              </select>
              {potentialSupervisors.length === 0 && formData.market_id && (
                <p className="text-xs text-orange-600 mt-1">
                  No supervisors found for this market. Create a supervisor first.
                </p>
              )}
            </div>
          )}

          {/* Active Status (only for editing) */}
          {isEditing && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Account is active
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => onClose(false)}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="spinner-small"></div>}
              {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
