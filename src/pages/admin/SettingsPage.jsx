import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useDashboardPreferences } from '../../contexts/DashboardPreferencesContext';
import { supabase } from '../../config/supabase';
import { quizzesService } from '../../services/api/quizzes';

import ColorPicker from '../../components/common/ColorPicker';
import { Dialog } from '@headlessui/react';
import { organizationService } from '../../services/api/organization';
import MultiSelect from './components/Filters/MultiSelect';
import SingleSelect from './components/Filters/SingleSelect';
import { useDashboards } from './hooks/useDashboards';

const SettingsPage = () => {
  // Scroll to top when component mounts - handle both window and container scroll
  useEffect(() => {
    const scrollToTop = () => {
      // Scroll the main window
      window.scrollTo(0, 0);
      
      // Find and scroll the admin layout container (which has overflow-y-auto)
      const mainContentContainer = document.querySelector('.overflow-y-auto');
      if (mainContentContainer) {
        mainContentContainer.scrollTop = 0;
      }
      
      // Also scroll any parent containers that might have scroll
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    // Immediate scroll
    scrollToTop();
    
    // Scroll after a short delay to handle layout shifts
    const scrollTimeout = setTimeout(scrollToTop, 50);
    
    // Scroll after content loads
    const scrollTimeout2 = setTimeout(scrollToTop, 200);
    
    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(scrollTimeout2);
    };
  }, []);
  const [supervisors, setSupervisors] = useState([]);
  const [markets, setMarkets] = useState([]);
  
  // Get user dashboards for the default dashboard setting
  const { dashboards, loading: dashboardsLoading, setAsDefaultDashboard } = useDashboards();
  const { dashboardPreferences, updateDashboardPreferences } = useDashboardPreferences();
  const [isLoadingOrganization, setIsLoadingOrganization] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { user } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('input'); // 'input' or 'error'
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // State for profile form
  const [profileData, setProfileData] = useState({ name: '', email: '' });

  // State for password form with visibility toggles
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  // Password strength validation
  const validatePassword = (password) => {
    const rules = [
      { test: /.{8,}/, message: 'At least 8 characters' },
      { test: /[A-Z]/, message: 'At least one uppercase letter' },
      { test: /[a-z]/, message: 'At least one lowercase letter' },
      { test: /[0-9]/, message: 'At least one number' },
      { test: /[^A-Za-z0-9]/, message: 'At least one special character' }
    ];
    return rules.map(rule => ({
      passed: rule.test.test(password),
      message: rule.message
    }));
  };

  const passwordValidation = useMemo(() =>
    validatePassword(passwordData.newPassword),
    [passwordData.newPassword]
  );

  // Quiz settings state
  const [quizSettings, setQuizSettings] = useState({
    defaultTimer: 0,
    defaultQuestionRandomization: true,
    defaultAnswerRandomization: true,
  });

  // Dashboard settings state
  const [dashboardSettings, setDashboardSettings] = useState({
    defaultTimePeriod: 'last-30-days',
    defaultMarkets: [],
    defaultShowNames: false, // false = anonymous by default, true = show names
    defaultDashboard: '', // default dashboard template name
    disableHoverDrillDown: false // false = hover enabled (default), true = hover disabled
  });

  // State for archived quizzes
  const [archivedQuizzes, setArchivedQuizzes] = useState([
    { id: 1, title: 'Archived Quiz 1' },
    { id: 2, title: 'Archived Quiz 2' },
  ]);

  // Get theme from ThemeContext
  const {
    theme,
    themeMode,
    setThemeMode,
    themeColors,
    colorModes,
    setPrimaryColor,
    setSecondaryColor,
    toggleAutoCalculate,
    applyPresetTheme,
    presetThemes,
    hexToRgbObject,
    rgbObjectToHex
  } = useTheme();

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    theme: themeMode || 'system',
  });

  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  // Active section state for navigation
  const [activeSection, setActiveSection] = useState('account');

  const fetchArchivedQuizzes = useCallback(async () => {
    setIsLoadingArchived(true);
    try {
      const data = await quizzesService.getArchivedQuizzes();
      setArchivedQuizzes(data);
    } catch (error) {
      console.error("Failed to fetch archived quizzes", error);
      setDialogTitle('Error');
      setDialogMessage('Failed to load archived quizzes.');
      setDialogType('error');
      setDialogOpen(true);
    } finally {
      setIsLoadingArchived(false);
    }
  }, []);

  // Function to handle section navigation
  const navigateToSection = (sectionId) => {
    setActiveSection(sectionId);
  };

  // Function to render the active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountSection();
      case 'quiz':
        return renderQuizSection();
      case 'dashboard':
        return renderDashboardSection();
      case 'organization':
        return renderOrganizationSection();
      case 'system':
        return renderSystemSection();
      default:
        return renderAccountSection();
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const fetchOrganizationData = useCallback(async () => {
    setIsLoadingOrganization(true);
    try {
      const [supervisorsData, marketsData] = await Promise.all([
        organizationService.getSupervisors(),
        organizationService.getMarkets()
      ]);
      setSupervisors(supervisorsData);
      setMarkets(marketsData);
    } catch (error) {
      console.error('Error fetching organization data:', error);
      setDialogTitle('Error');
      setDialogMessage('Failed to load organization data');
      setDialogType('error');
      setDialogOpen(true);
    } finally {
      setIsLoadingOrganization(false);
    }
  }, []);

  const handleEditItem = (item, type) => {
    setEditingItem({ ...item, type });
    setDialogTitle(`Edit ${type}`);
    setDialogMessage(`Update ${type.toLowerCase()} name:`);
    setDialogType('input');
    setDialogOpen(true);
  };

  const handleDeleteItem = async (id, type) => {
    try {
      if (type === 'Supervisor') {
        await organizationService.deleteSupervisor(id);
      } else {
        await organizationService.deleteMarket(id);
      }
      fetchOrganizationData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setDialogTitle('Error');
      setDialogMessage(`Failed to delete ${type.toLowerCase()}`);
      setDialogType('error');
      setDialogOpen(true);
    }
  };

  const handleEditSupervisor = (supervisor) => {
    handleEditItem(supervisor, 'Supervisor');
  };

  const handleDeleteSupervisor = (id) => {
    handleDeleteItem(id, 'Supervisor');
  };

  const handleEditMarket = (market) => {
    handleEditItem(market, 'Market');
  };

  const handleDeleteMarket = (id) => {
    handleDeleteItem(id, 'Market');
  };

  const handleToggleSupervisorStatus = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await organizationService.deactivateSupervisor(id);
      } else {
        await organizationService.activateSupervisor(id);
      }
      fetchOrganizationData();
    } catch (error) {
      console.error('Error toggling supervisor status:', error);
      setDialogTitle('Error');
      setDialogMessage(`Failed to ${currentStatus ? 'deactivate' : 'activate'} supervisor`);
      setDialogType('error');
      setDialogOpen(true);
    }
  };

  const handleSaveItem = async () => {
    const inputValue = document.querySelector('.dialog-input')?.value;
    const marketSelect = document.querySelector('.market-select');
    const statusSelect = document.querySelector('.status-select');
    
    if (!inputValue?.trim()) {
      setDialogTitle('Error');
      setDialogMessage('Name cannot be empty');
      setDialogType('error');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        if (editingItem.type === 'Supervisor') {
          const updates = { name: inputValue };
          if (marketSelect) {
            updates.market_id = parseInt(marketSelect.value);
          }
          if (statusSelect) {
            updates.is_active = statusSelect.value === 'true';
          }
          await organizationService.updateSupervisor(editingItem.id, updates);
        } else {
          await organizationService.updateMarket(editingItem.id, inputValue);
        }
      } else {
        // Add new item
        const type = dialogTitle.includes('Supervisor') ? 'Supervisor' : 'Market';
        if (type === 'Supervisor') {
          const marketId = marketSelect ? parseInt(marketSelect.value) : null;
          if (!marketId) {
            setDialogTitle('Error');
            setDialogMessage('Please select a market for this supervisor');
            setDialogType('error');
            return;
          }
          await organizationService.addSupervisor(inputValue, marketId);
        } else {
          await organizationService.addMarket(inputValue);
        }
      }

      setEditingItem(null);
      setDialogOpen(false);
      fetchOrganizationData();
    } catch (error) {
      console.error('Error saving item:', error);
      setDialogTitle('Error');
      setDialogMessage(error.message);
      setDialogType('error');
      setDialogOpen(true);
    }
  };


  useEffect(() => {
    const savedTimer = localStorage.getItem('quizDefaultTimer');
    const savedQRand = localStorage.getItem('quizDefaultQuestionRandomization');
    const savedARand = localStorage.getItem('quizDefaultAnswerRandomization');

    setQuizSettings(prev => ({
      ...prev,
      defaultTimer: savedTimer ? parseInt(savedTimer, 10) : prev.defaultTimer,
      defaultQuestionRandomization: savedQRand !== null ? JSON.parse(savedQRand) : prev.defaultQuestionRandomization,
      defaultAnswerRandomization: savedARand !== null ? JSON.parse(savedARand) : prev.defaultAnswerRandomization,
    }));

    fetchArchivedQuizzes();
    fetchOrganizationData();
  }, [fetchArchivedQuizzes, fetchOrganizationData]);

  useEffect(() => {
    setDashboardSettings(prev => ({
      ...prev,
      defaultTimePeriod: dashboardPreferences.defaultTimePeriod || 'last-30-days',
      defaultMarkets: dashboardPreferences.defaultMarkets || [],
      defaultShowNames: dashboardPreferences.defaultShowNames ?? false,
      defaultDashboard: dashboardPreferences.defaultDashboard || '',
      disableHoverDrillDown: dashboardPreferences.disableHoverDrillDown ?? false
    }));
  }, [dashboardPreferences]);


  // Ensure the stored default dashboard is valid
  useEffect(() => {
    if (dashboards.length === 0) return;

    if (dashboardPreferences.defaultDashboard) {
      const defaultExists = dashboards.some(
        dashboard => dashboard.name === dashboardPreferences.defaultDashboard
      );

      if (!defaultExists) {
        const fallback = dashboards[0];
        if (fallback) {
          console.log('Default dashboard missing, falling back to:', fallback.name);
          updateDashboardPreferences({ defaultDashboard: fallback.name });
        }
      }
    } else {
      const fallback = dashboards.find(d => d.is_default) || dashboards[0];
      if (fallback) {
        console.log('No default dashboard set, using:', fallback.name);
        updateDashboardPreferences({ defaultDashboard: fallback.name });
      }
    }
  }, [dashboards, dashboardPreferences.defaultDashboard, updateDashboardPreferences]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.user_metadata?.full_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleQuizSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizSettings(prevSettings => {
      const newValue = type === 'checkbox' ? checked : value;
      const updatedSettings = {
        ...prevSettings,
        [name]: newValue,
      };

      try {
        if (name === 'defaultTimer') {
          localStorage.setItem('quizDefaultTimer', newValue);
        } else if (name === 'defaultQuestionRandomization') {
          localStorage.setItem('quizDefaultQuestionRandomization', JSON.stringify(newValue));
        } else if (name === 'defaultAnswerRandomization') {
          localStorage.setItem('quizDefaultAnswerRandomization', JSON.stringify(newValue));
        }
      } catch (error) {
        console.error("Failed to save quiz setting preference to localStorage", error);
      }

      return updatedSettings;
    });
  };

  const handleDashboardSettingChange = async (name, value) => {
    setDashboardSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));

    try {
      if (name === 'defaultDashboard') {
        if (value) {
          const selectedDashboard = dashboards.find(d => d.name === value);
          if (selectedDashboard) {
            await setAsDefaultDashboard(selectedDashboard.id);
          }
        } else {
          await setAsDefaultDashboard(null);
        }
      } else {
        await updateDashboardPreferences({ [name]: value });
      }
    } catch (error) {
      console.error('Failed to save dashboard preference:', error);
    }
  };


  const handleRestoreQuiz = async (quizId) => {
    try {
      await quizzesService.restore(quizId);
      setDialogTitle('Success');
      setDialogMessage('Quiz restored successfully!');
      setDialogType('error'); // Success messages also use error type for now
      setDialogOpen(true);
      fetchArchivedQuizzes();
    } catch (error) {
      console.error(`Error restoring quiz ${quizId}:`, error);
      setDialogTitle('Error');
      setDialogMessage(`Failed to restore quiz: ${error.message}`);
      setDialogType('error');
      setDialogOpen(true);
    }
  };

  const handleSystemSettingChange = (e) => {
    const { name, value } = e.target;
    setSystemSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));

    // Apply theme change using ThemeContext
    if (name === 'theme') {
      setThemeMode(value);
      console.log('Theme changed to:', value);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      alert('Name cannot be empty.');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileData.name }
      });

      if (error) throw error;

      setDialogTitle('Success');
      setDialogMessage('Profile updated successfully!');
      setDialogType('error'); // Success messages also use error type for now
      setDialogOpen(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setDialogTitle('Error');
      setDialogMessage(`Failed to update profile: ${error.message}`);
      setDialogType('error');
      setDialogOpen(true);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate password requirements
    const validation = validatePassword(passwordData.newPassword);
    const hasFailedRules = validation.some(rule => !rule.passed);

    if (hasFailedRules) {
      setDialogTitle('Error');
      setDialogMessage('Please ensure your new password meets all requirements.');
      setDialogType('error');
      setDialogOpen(true);
      return;
    }

    if (!passwordData.currentPassword) {
      setDialogTitle('Error');
      setDialogMessage('Current password cannot be empty.');
      setDialogType('error');
      setDialogOpen(true);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setDialogTitle('Error');
      setDialogMessage("New passwords don't match!");
      setDialogType('error');
      setDialogOpen(true);
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      });

      if (signInError) {
        console.error('Password verification failed:', signInError);
        setDialogTitle('Error');
        setDialogMessage('Incorrect current password.');
        setDialogType('error');
        setDialogOpen(true);
        setIsChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      setDialogTitle('Success');
      setDialogMessage('Password changed successfully!');
      setDialogType('error'); // Success messages also use error type for now
      setDialogOpen(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      });

    } catch (error) {
      console.error('Error changing password:', error);
      setDialogTitle('Error');
      setDialogMessage(`Failed to change password: ${error.message}`);
      setDialogType('error');
      setDialogOpen(true);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Render functions for each section
  const renderAccountSection = () => (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-medium mb-4 dark:text-white">User Account</h2>

      {/* Profile Information */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Profile Information</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label htmlFor="profileName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input
              id="profileName"
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              placeholder="Your full name"
              className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="profileEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              id="profileEmail"
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              placeholder="your.email@example.com"
              className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-700 dark:text-slate-300 cursor-not-allowed"
              disabled
            />
          </div>
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isUpdatingProfile
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            }`}
          >
            {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div>
        <h3 className="text-lg font-medium mb-4 dark:text-white">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={passwordData.showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                autoComplete="current-password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full py-2 px-3 pr-10 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('showCurrentPassword')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500"
              >
                {passwordData.showCurrentPassword ? (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                ) : (
                  <AiOutlineEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={passwordData.showNewPassword ? 'text' : 'password'}
                name="newPassword"
                autoComplete="new-password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full py-2 px-3 pr-10 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('showNewPassword')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500"
              >
                {passwordData.showNewPassword ? (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                ) : (
                  <AiOutlineEye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-2 space-y-2">
              {passwordValidation.map((rule, index) => (
                <div
                  key={index}
                  className={`flex items-center text-sm ${
                    rule.passed ? 'text-green-600' : 'text-slate-500'
                  }`}
                >
                  <svg
                    className={`mr-2 h-4 w-4 ${
                      rule.passed ? 'text-green-500' : 'text-slate-400'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {rule.passed ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  {rule.message}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={passwordData.showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full py-2 px-3 pr-10 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('showConfirmPassword')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500"
              >
                {passwordData.showConfirmPassword ? (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                ) : (
                  <AiOutlineEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isChangingPassword
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            }`}
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </section>
  );

  const renderQuizSection = () => (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-medium mb-4 dark:text-white">Quiz Creation Defaults</h2>
      <div className="space-y-6">
        {/* Default Quiz Timer with Slider */}
        <div className="space-y-2 relative">
          <label htmlFor="defaultTimer" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Default Quiz Timer
            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{quizSettings.defaultTimer} minutes</span>
          </label>
          <input
            id="defaultTimer"
            type="range"
            name="defaultTimer"
            value={quizSettings.defaultTimer}
            onChange={handleQuizSettingChange}
            min="0"
            max="180"
            step="5"
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-0.5">
            <span>0 min</span>
            <span className="absolute left-1/2 transform -translate-x-1/2">90 min</span>
            <span>180 min</span>
          </div>
        </div>

        {/* Default Question Randomization */}
        <div className="mb-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="defaultQuestionRandomization"
              name="defaultQuestionRandomization"
              checked={quizSettings.defaultQuestionRandomization}
              onChange={handleQuizSettingChange}
              className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded flex-shrink-0 mt-0.5"
            />
            <div className="ml-3">
              <label htmlFor="defaultQuestionRandomization" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Question Order Randomization
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Automatically shuffle the order of questions for each quiz attempt. This helps prevent memorization and promotes active learning.
              </p>
            </div>
          </div>
        </div>

        {/* Default Answer Option Randomization */}
        <div className="mb-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="defaultAnswerRandomization"
              name="defaultAnswerRandomization"
              checked={quizSettings.defaultAnswerRandomization}
              onChange={handleQuizSettingChange}
              className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded flex-shrink-0 mt-0.5"
            />
            <div className="ml-3">
              <label htmlFor="defaultAnswerRandomization" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Answer Choice Randomization
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Shuffle the order of answer choices for multiple choice questions. This discourages position-based memorization.
              </p>
              <div className="mt-2 rounded-md bg-slate-50 dark:bg-slate-800 p-3 text-sm">
                <p className="text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Note:</span> This only affects multiple choice questions. True/False and other question types remain unchanged.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Note */}
        <div className="mt-6 rounded-md bg-primary/10 dark:bg-primary/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-primary dark:text-primary">
                Settings are automatically saved when changed. These preferences will be used as defaults when creating new quizzes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Archiving Section */}
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-medium mb-2 dark:text-white">Archived Quizzes</h3>
        <button
          onClick={() => setIsArchiveModalOpen(true)}
          className="inline-flex justify-center py-2 px-4 border border-secondary shadow-sm text-sm font-medium rounded-md text-secondary bg-white dark:bg-slate-800 hover:bg-secondary/10 dark:hover:bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
        >
          Manage Archived Quizzes ({archivedQuizzes.length})
        </button>
      </div>
    </section>
  );

  const renderOrganizationSection = () => (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-medium mb-6 dark:text-white">Organization Management</h2>

      {/* Supervisors */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium dark:text-white">Supervisors</h3>
          <button
            onClick={() => {
              setDialogTitle('Add New Supervisor');
              setDialogMessage('Enter supervisor name:');
              setDialogType('input');
              setDialogOpen(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
          >
            Add Supervisor
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Market</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {supervisors.map((supervisor) => (
                <tr key={supervisor.id} className={supervisor.is_active ? '' : 'opacity-60'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-200">
                    {supervisor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {supervisor.markets?.name || 'No Market'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      supervisor.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {supervisor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => handleEditSupervisor(supervisor)}
                        className="text-primary hover:text-primary-dark dark:hover:text-primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleSupervisorStatus(supervisor.id, supervisor.is_active)}
                        className={supervisor.is_active 
                          ? "text-orange-600 hover:text-orange-900 dark:hover:text-orange-400"
                          : "text-green-600 hover:text-green-900 dark:hover:text-green-400"
                        }
                      >
                        {supervisor.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteSupervisor(supervisor.id)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Markets */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium dark:text-white">Markets</h3>
          <button
            onClick={() => {
              setDialogTitle('Add New Market');
              setDialogMessage('Enter market name:');
              setDialogType('input');
              setDialogOpen(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
          >
            Add Market
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {markets.map((market) => (
                <tr key={market.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-200">{market.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditMarket(market)}
                      className="text-primary hover:text-primary-dark dark:hover:text-primary mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMarket(market.id)}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const renderDashboardSection = () => (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-medium mb-4 dark:text-white">Dashboard Defaults</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Set default values for Dashboard Global Filters. These will be applied when you first visit the Dashboard, but can be changed at any time.
      </p>

      <div className="space-y-6">
        {/* Default Time Period */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Default Time Period
          </label>
          <div className="w-64">
            <SingleSelect
              value={dashboardSettings.defaultTimePeriod}
              onChange={(value) => handleDashboardSettingChange('defaultTimePeriod', value)}
              options={[
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: 'last-7-days', label: 'Last 7 Days' },
                { value: 'last-30-days', label: 'Last 30 Days' },
                { value: 'this-month', label: 'This Month' },
                { value: 'this-quarter', label: 'This Quarter' },
                { value: 'this-year', label: 'This Year' },
                { value: 'all-time', label: 'All Time' },
                { value: 'custom', label: 'Custom' },
              ]}
              placeholder="Select default time period"
              className="w-full"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            This will be the default time range when you first load the Dashboard.
          </p>
        </div>

        {/* Default Markets */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Default Markets
          </label>
          <div className="w-64">
            <MultiSelect
              type="markets"
              value={dashboardSettings.defaultMarkets}
              onChange={(value) => handleDashboardSettingChange('defaultMarkets', value)}
              hideLabel={true}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Pre-select these markets when the Dashboard loads. Leave empty to show all markets by default.
          </p>
        </div>

        {/* Default Names Display */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Names Display
          </label>
          <div className="flex items-start">
            <input
              type="checkbox"
              id="defaultShowNames"
              checked={dashboardSettings.defaultShowNames}
              onChange={(e) => handleDashboardSettingChange('defaultShowNames', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded flex-shrink-0 mt-0.5"
            />
            <div className="ml-3">
              <label htmlFor="defaultShowNames" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Show Names by Default
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                When enabled, dashboard charts will show actual names instead of anonymous identifiers by default. This affects Top/Bottom Performers, Score Trend (Individual mode), and Time vs Score charts.
              </p>
            </div>
          </div>
        </div>

        {/* Disable Hover Drill-Down */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Chart Interactions
          </label>
          <div className="flex items-start">
            <input
              type="checkbox"
              id="disableHoverDrillDown"
              checked={dashboardSettings.disableHoverDrillDown}
              onChange={(e) => handleDashboardSettingChange('disableHoverDrillDown', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded flex-shrink-0 mt-0.5"
            />
            <div className="ml-3">
              <label htmlFor="disableHoverDrillDown" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Disable Hover Drill-Down
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                When enabled, hovering over charts will not trigger drill-down filtering. Click interactions will still work for drill-down functionality.
              </p>
            </div>
          </div>
        </div>

        {/* Default Dashboard */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Default Dashboard
          </label>
          <div className="w-64">
            <SingleSelect
              value={dashboardSettings.defaultDashboard}
              onChange={(value) => handleDashboardSettingChange('defaultDashboard', value)}
              options={dashboards.map(dashboard => ({
                value: dashboard.name,
                label: dashboard.name
              }))}
              placeholder={
                dashboardsLoading 
                  ? "Loading dashboards..." 
                  : dashboards.length === 0 
                    ? "No dashboards available" 
                    : "Select default dashboard"
              }
              disabled={dashboardsLoading || dashboards.length === 0}
              className="w-full"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {dashboards.length === 0 && !dashboardsLoading 
              ? "Create dashboards on the Dashboard page to set a default here."
              : "When set, this dashboard will automatically load when you visit the Dashboard page. You can also set the default by clicking the star icon next to a dashboard name in the dashboard dropdown."
            }
          </p>
        </div>

        {/* Reset to Defaults */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Reset Options</h3>
          <div className="flex gap-3">
            <button
              onClick={() => {
                handleDashboardSettingChange('defaultTimePeriod', 'last-30-days');
                handleDashboardSettingChange('defaultMarkets', []);
                handleDashboardSettingChange('defaultShowNames', false);
                handleDashboardSettingChange('disableHoverDrillDown', false);
                // Don't reset defaultDashboard since there's no "no default" option
              }}
              className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Reset to System Defaults
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            This will reset the time period to "Last 30 Days", clear all default markets, set names to anonymous by default, and enable hover drill-down.
          </p>
        </div>

        {/* Settings Note */}
        <div className="mt-6 rounded-md bg-primary/10 dark:bg-primary/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-primary dark:text-primary">
                Dashboard defaults are automatically saved when changed. These settings take effect the next time you visit the Dashboard and can always be overridden using the Dashboard's filter controls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderSystemSection = () => (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-medium mb-4 dark:text-white">System Settings</h2>

      <div className="space-y-8">
        {/* Theme Mode */}
        <div>
          <h3 className="text-lg font-medium mb-2 dark:text-white">Theme</h3>
          <div className="grid grid-cols-3 gap-4">
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                systemSettings.theme === 'light'
                  ? 'border-primary shadow-sm bg-white dark:bg-slate-800'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              onClick={() => handleSystemSettingChange({ target: { name: 'theme', value: 'light' } })}
            >
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-white border border-slate-300"></span>
                <span className="text-sm font-medium dark:text-white">Light Mode</span>
              </div>
            </div>
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                systemSettings.theme === 'dark'
                  ? 'border-primary shadow-sm bg-slate-800 text-white'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              onClick={() => handleSystemSettingChange({ target: { name: 'theme', value: 'dark' } })}
            >
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600"></span>
                <span className="text-sm font-medium">Dark Mode</span>
              </div>
            </div>
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                systemSettings.theme === 'system'
                  ? 'border-primary shadow-sm bg-white dark:bg-slate-800'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              onClick={() => handleSystemSettingChange({ target: { name: 'theme', value: 'system' } })}
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 relative overflow-hidden">
                  <div className="w-1/2 h-full bg-white"></div>
                  <div className="w-1/2 h-full bg-slate-800 absolute top-0 right-0"></div>
                </div>
                <span className="text-sm font-medium dark:text-white">System</span>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Colors */}
        <div>
          <h3 className="text-lg font-medium mb-4 dark:text-white">Theme Colors</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Choose from beautiful preset themes or customize your organization's brand colors.
          </p>

          <div className="space-y-8">
            {/* Preset Themes */}
            <div>
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">Preset Themes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {presetThemes.map((preset, index) => (
                  <div
                    key={index}
                    className="cursor-pointer group"
                    onClick={() => applyPresetTheme(index)}
                  >
                    <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
                      {/* Color Preview */}
                      <div className="flex mb-2">
                        <div
                          className="w-8 h-8 rounded-l-md border border-r-0 border-slate-300 dark:border-slate-600"
                          style={{ backgroundColor: preset.primary.light }}
                        />
                        <div
                          className="w-8 h-8 border border-l-0 border-r-0 border-slate-300 dark:border-slate-600"
                          style={{ backgroundColor: preset.primary.dark }}
                        />
                        <div
                          className="w-8 h-8 border border-l-0 border-r-0 border-slate-300 dark:border-slate-600"
                          style={{ backgroundColor: preset.secondary.light }}
                        />
                        <div
                          className="w-8 h-8 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600"
                          style={{ backgroundColor: preset.secondary.dark }}
                        />
                      </div>
                      {/* Theme Info */}
                      <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                        {preset.name}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">Custom Colors</h4>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                {/* Primary and Secondary Colors in a compact horizontal layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Primary Color */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-m font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Primary Color
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Used for primary buttons, links, focus states, and success messages
                      </p>
                    </div>

                    {/* Auto-calculation toggle */}
                    <div className="mb-4">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={colorModes.primary.autoCalculate}
                          onChange={() => toggleAutoCalculate('primary')}
                          className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded flex-shrink-0 mt-0.5"
                        />
                        <div className="ml-3">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            Auto-convert colors between themes
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Color pickers in horizontal layout */}
                    <div className="flex gap-4">
                      {/* Light mode */}
                      <div className="flex-1">
                        <label className="block text-xs text-slate-600 dark:text-slate-400 mb-2">Light Mode</label>
                        <ColorPicker
                          color={hexToRgbObject(themeColors.primary.light)}
                          onChange={(color) => setPrimaryColor(rgbObjectToHex(color), 'light')}
                          hideOpacity={true}
                        />
                      </div>

                      {/* Dark mode */}
                      <div className="flex-1">
                        <label className="block text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Dark Mode {colorModes.primary.autoCalculate && <span className="text-slate-500">(Auto)</span>}
                        </label>
                        <ColorPicker
                          color={hexToRgbObject(themeColors.primary.dark)}
                          onChange={(color) => setPrimaryColor(rgbObjectToHex(color), 'dark')}
                          disabled={colorModes.primary.autoCalculate}
                          hideOpacity={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-m font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Secondary Color
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Used for icons, secondary buttons, and info states
                      </p>
                    </div>

                    {/* Auto-calculation toggle */}
                    <div className="mb-4">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={colorModes.secondary.autoCalculate}
                          onChange={() => toggleAutoCalculate('secondary')}
                          className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded flex-shrink-0 mt-0.5"
                        />
                        <div className="ml-3">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            Auto-convert colors between themes
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Color pickers in horizontal layout */}
                    <div className="flex gap-4">
                      {/* Light mode */}
                      <div className="flex-1">
                        <label className="block text-xs text-slate-600 dark:text-slate-400 mb-2">Light Mode</label>
                        <ColorPicker
                          color={hexToRgbObject(themeColors.secondary.light)}
                          onChange={(color) => setSecondaryColor(rgbObjectToHex(color), 'light')}
                          hideOpacity={true}
                        />
                      </div>

                      {/* Dark mode */}
                      <div className="flex-1">
                        <label className="block text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Dark Mode {colorModes.secondary.autoCalculate && <span className="text-slate-500">(Auto)</span>}
                        </label>
                        <ColorPicker
                          color={hexToRgbObject(themeColors.secondary.dark)}
                          onChange={(color) => setSecondaryColor(rgbObjectToHex(color), 'dark')}
                          disabled={colorModes.secondary.autoCalculate}
                          hideOpacity={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="flex h-full">
      {/* Navigation Sidebar */}
      <div className="w-64 pr-4 flex-shrink-0">
        <nav className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-700 h-full rounded-lg shadow-sm dark:shadow-lg">
        <ul className="space-y-2 mt-8">
          <li>
            <button
              onClick={() => navigateToSection('account')}
              className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                activeSection === 'account'
                  ? 'bg-primary text-white'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              User Account
            </button>
          </li>
          <li>
            <button
              onClick={() => navigateToSection('quiz')}
              className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                activeSection === 'quiz'
                  ? 'bg-primary text-white'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Quiz Preferences
            </button>
          </li>
          <li>
            <button
              onClick={() => navigateToSection('dashboard')}
              className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                activeSection === 'dashboard'
                  ? 'bg-primary text-white'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Dashboard Defaults
            </button>
          </li>
          <li>
            <button
              onClick={() => navigateToSection('organization')}
              className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                activeSection === 'organization'
                  ? 'bg-primary text-white'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Organization Management
            </button>
          </li>
          <li>
            <button
              onClick={() => navigateToSection('system')}
              className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                activeSection === 'system'
                  ? 'bg-primary text-white'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              System Settings
            </button>
          </li>
        </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderActiveSection()}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              {dialogTitle}
            </Dialog.Title>

            {dialogType === 'input' ? (
              // Input dialog for adding/editing items
              <>
                <div className="mt-2 space-y-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="dialog-input w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                      defaultValue={editingItem?.name || ''}
                      placeholder="Enter name"
                    />
                  </div>
                  
                  {/* Supervisor-specific fields */}
                  {(dialogTitle.includes('Supervisor')) && (
                    <>
                      {/* Market selection */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Market
                        </label>
                        <select 
                          className="market-select w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                          defaultValue={editingItem?.market_id || editingItem?.markets?.id || ''}
                        >
                          <option value="">Select Market</option>
                          {markets.map((market) => (
                            <option key={market.id} value={market.id}>
                              {market.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Status selection (only for editing) */}
                      {editingItem && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Status
                          </label>
                          <select 
                            className="status-select w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                            defaultValue={editingItem?.is_active ? 'true' : 'false'}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none"
                    onClick={handleSaveItem}
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              // Error/Success dialog - just show message with OK button
              <>
                <div className="mt-2">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {dialogMessage}
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none"
                    onClick={() => setDialogOpen(false)}
                  >
                    OK
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Archived Quizzes Modal */}
      <Dialog open={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)} className="relative z-50">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

        {/* Modal Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <Dialog.Title className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Archived Quizzes
            </Dialog.Title>

            {/* List Content */}
            <div className="max-h-96 overflow-y-auto mb-6 pr-2">
              {isLoadingArchived ? (
                <p className="text-slate-500 dark:text-slate-400">Loading archived quizzes...</p>
              ) : archivedQuizzes.length > 0 ? (
                <ul className="space-y-2">
                  {archivedQuizzes.map((quiz) => (
                    <li key={quiz.id} className="flex justify-between items-center p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{quiz.title}</span>
                      <button
                        onClick={() => handleRestoreQuiz(quiz.id)}
                        className="py-1 px-3 border border-secondary shadow-sm text-sm font-medium rounded-md text-secondary bg-white dark:bg-slate-800 hover:bg-secondary/10 dark:hover:bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secondary"
                      >
                        Restore
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No archived quizzes found.</p>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="py-2 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-700 dark:text-white cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
