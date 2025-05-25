import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../config/supabase';
import { quizzesService } from '../../services/api/quizzes';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { Dialog } from '@headlessui/react';
import { organizationService } from '../../services/api/organization';

const SettingsPage = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [isLoadingOrganization, setIsLoadingOrganization] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { user } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
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

  // State for archived quizzes
  const [archivedQuizzes, setArchivedQuizzes] = useState([
    { id: 1, title: 'Archived Quiz 1' },
    { id: 2, title: 'Archived Quiz 2' },
  ]);

  // Get theme from ThemeContext
  const {
    theme,
    setThemeMode,
    themeColors,
    colorModes,
    setPrimaryColor,
    setSecondaryColor,
    toggleAutoCalculate,
    resetColors
  } = useTheme();

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    theme: theme || 'light',
  });

  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  const fetchArchivedQuizzes = useCallback(async () => {
    setIsLoadingArchived(true);
    try {
      const data = await quizzesService.getArchivedQuizzes();
      setArchivedQuizzes(data);
    } catch (error) {
      console.error("Failed to fetch archived quizzes", error);
      setDialogTitle('Error');
      setDialogMessage('Failed to load archived quizzes.');
      setDialogOpen(true);
    } finally {
      setIsLoadingArchived(false);
    }
  }, []);

  // Function to handle smooth scrolling
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
      setDialogOpen(true);
    } finally {
      setIsLoadingOrganization(false);
    }
  }, []);

  const handleEditItem = (item, type) => {
    setEditingItem({ ...item, type });
    setDialogTitle(`Edit ${type}`);
    setDialogMessage(`Update ${type.toLowerCase()} name:`);
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

  const handleSaveItem = async () => {
    const inputValue = document.querySelector('.dialog-input')?.value;
    if (!inputValue?.trim()) {
      setDialogTitle('Error');
      setDialogMessage('Name cannot be empty');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        if (editingItem.type === 'Supervisor') {
          await organizationService.updateSupervisor(editingItem.id, inputValue);
        } else {
          await organizationService.updateMarket(editingItem.id, inputValue);
        }
      } else {
        // Add new item
        const type = dialogTitle.includes('Supervisor') ? 'Supervisor' : 'Market';
        if (type === 'Supervisor') {
          await organizationService.addSupervisor(inputValue);
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


  const handleRestoreQuiz = async (quizId) => {
    try {
      await quizzesService.restore(quizId);
      setDialogTitle('Success');
      setDialogMessage('Quiz restored successfully!');
      setDialogOpen(true);
      fetchArchivedQuizzes();
    } catch (error) {
      console.error(`Error restoring quiz ${quizId}:`, error);
      setDialogTitle('Error');
      setDialogMessage(`Failed to restore quiz: ${error.message}`);
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
      setDialogOpen(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setDialogTitle('Error');
      setDialogMessage(`Failed to update profile: ${error.message}`);
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
      setDialogOpen(true);
      return;
    }

    if (!passwordData.currentPassword) {
      setDialogTitle('Error');
      setDialogMessage('Current password cannot be empty.');
      setDialogOpen(true);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setDialogTitle('Error');
      setDialogMessage("New passwords don't match!");
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
      setDialogOpen(true);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-800">
      {/* Navigation Sidebar */}
      <nav className="w-64 bg-white dark:bg-slate-900 p-6 border-r border-slate-200 dark:border-slate-700 sticky top-0 h-screen">
        <ul className="space-y-2 mt-8">
          <li>
            <a
              href="#account"
              onClick={(e) => { e.preventDefault(); scrollToSection('account'); }}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              User Account
            </a>
          </li>
          <li>
            <a
              href="#quiz"
              onClick={(e) => { e.preventDefault(); scrollToSection('quiz'); }}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              Quiz Preferences
            </a>
          </li>
          <li>
            <a
              href="#organization"
              onClick={(e) => { e.preventDefault(); scrollToSection('organization'); }}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              Organization Management
            </a>
          </li>
          <li>
            <a
              href="#archived"
              onClick={(e) => { e.preventDefault(); scrollToSection('archived-section'); }}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              Archived Quizzes
            </a>
          </li>
          <li>
            <a
              href="#theme-colors"
              onClick={(e) => { e.preventDefault(); scrollToSection('theme-colors'); }}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              Theme Colors
            </a>
          </li>
          <li>
            <a
              href="#system"
              onClick={(e) => { e.preventDefault(); scrollToSection('system'); }}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              System Settings
            </a>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <div className="space-y-6">
          {/* User Account Settings */}
          <section id="account" className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
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

          {/* Quiz Settings */}
          <section id="quiz" className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
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
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="defaultQuestionRandomization"
                      name="defaultQuestionRandomization"
                      checked={quizSettings.defaultQuestionRandomization}
                      onChange={handleQuizSettingChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                    />
                  </div>
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
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="defaultAnswerRandomization"
                      name="defaultAnswerRandomization"
                      checked={quizSettings.defaultAnswerRandomization}
                      onChange={handleQuizSettingChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                    />
                  </div>
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
            <div id="archived-section" className="mt-6 border-t pt-6"> {/* Added ID here */}
              <h3 className="text-lg font-medium mb-2 dark:text-white">Archived Quizzes</h3>
              <button
                onClick={() => setIsArchiveModalOpen(true)}
                className="inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Manage Archived Quizzes ({archivedQuizzes.length})
              </button>
            </div>
          </section>

          {/* Organization Management */}
          <section id="organization" className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-medium mb-6 dark:text-white">Organization Management</h2>

            {/* Supervisors */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium dark:text-white">Supervisors</h3>
                <button
                  onClick={() => {
                    setDialogTitle('Add New Supervisor');
                    setDialogMessage('Enter supervisor name:');
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {supervisors.map((supervisor) => (
                      <tr key={supervisor.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-200">{supervisor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              onClick={() => handleEditSupervisor(supervisor)}
                              className="text-primary hover:text-primary-dark dark:hover:text-primary"
                            >
                              Edit
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

          {/* Theme Colors */}
          <section id="theme-colors" className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-medium mb-4 dark:text-white">Theme Colors</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Customize your organization's brand colors. These colors will be used throughout the application for buttons, links, and other interactive elements.
            </p>

            <div className="space-y-6">
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Primary Color
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Used for buttons, links, focus states, and primary actions
                </p>

                {/* Auto-calculation toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={colorModes.primary.autoCalculate}
                      onChange={() => toggleAutoCalculate('primary')}
                      className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Auto-convert colors between themes
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">
                    {colorModes.primary.autoCalculate
                      ? 'Dark mode color is automatically calculated from light mode color'
                      : 'Choose separate colors for light and dark modes'
                    }
                  </p>
                </div>

                {/* Color pickers */}
                <div className="space-y-4">
                  {/* Light mode color */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeColors.primary.light}
                        onChange={(e) => setPrimaryColor(e.target.value, 'light')}
                        className="w-12 h-12 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          Light Mode
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {themeColors.primary.light}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div
                        className="h-8 rounded flex items-center justify-center text-white text-xs font-medium border border-slate-300 dark:border-slate-600"
                        style={{ backgroundColor: themeColors.primary.light }}
                      >
                        Light Mode Preview
                      </div>
                    </div>
                  </div>

                  {/* Dark mode color */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeColors.primary.dark}
                        onChange={(e) => setPrimaryColor(e.target.value, 'dark')}
                        disabled={colorModes.primary.autoCalculate}
                        className={`w-12 h-12 rounded border border-slate-300 dark:border-slate-600 cursor-pointer ${
                          colorModes.primary.autoCalculate ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                      <div className="text-sm">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          Dark Mode
                          {colorModes.primary.autoCalculate && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">(Auto)</span>
                          )}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {themeColors.primary.dark}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div
                        className="h-8 rounded flex items-center justify-center text-white text-xs font-medium border border-slate-300 dark:border-slate-600"
                        style={{ backgroundColor: themeColors.primary.dark }}
                      >
                        Dark Mode Preview
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Secondary Color
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Used for secondary actions, accents, and complementary elements
                </p>

                {/* Auto-calculation toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={colorModes.secondary.autoCalculate}
                      onChange={() => toggleAutoCalculate('secondary')}
                      className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Auto-convert colors between themes
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">
                    {colorModes.secondary.autoCalculate
                      ? 'Dark mode color is automatically calculated from light mode color'
                      : 'Choose separate colors for light and dark modes'
                    }
                  </p>
                </div>

                {/* Color pickers */}
                <div className="space-y-4">
                  {/* Light mode color */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeColors.secondary.light}
                        onChange={(e) => setSecondaryColor(e.target.value, 'light')}
                        className="w-12 h-12 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          Light Mode
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {themeColors.secondary.light}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div
                        className="h-8 rounded flex items-center justify-center text-white text-xs font-medium border border-slate-300 dark:border-slate-600"
                        style={{ backgroundColor: themeColors.secondary.light }}
                      >
                        Light Mode Preview
                      </div>
                    </div>
                  </div>

                  {/* Dark mode color */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeColors.secondary.dark}
                        onChange={(e) => setSecondaryColor(e.target.value, 'dark')}
                        disabled={colorModes.secondary.autoCalculate}
                        className={`w-12 h-12 rounded border border-slate-300 dark:border-slate-600 cursor-pointer ${
                          colorModes.secondary.autoCalculate ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                      <div className="text-sm">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          Dark Mode
                          {colorModes.secondary.autoCalculate && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">(Auto)</span>
                          )}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {themeColors.secondary.dark}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div
                        className="h-8 rounded flex items-center justify-center text-white text-xs font-medium border border-slate-300 dark:border-slate-600"
                        style={{ backgroundColor: themeColors.secondary.dark }}
                      >
                        Dark Mode Preview
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={resetColors}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
                >
                  Reset to Default Colors
                </button>
              </div>
            </div>
          </section>

          {/* System Settings */}
          <section id="system" className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-medium mb-4 dark:text-white">System Settings</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2 dark:text-white">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              {dialogTitle}
            </Dialog.Title>
            <div className="mt-2">
              <input
                type="text"
                className="dialog-input w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                defaultValue={editingItem?.name || ''}
                placeholder={dialogMessage}
              />
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
                        className="py-1 px-3 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
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
