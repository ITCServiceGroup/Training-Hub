import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { supabase } from '../../config/supabase'; // Import Supabase client
import ConfirmationDialog from '../../components/common/ConfirmationDialog'; // Import ConfirmationDialog
// Removed InputField and Button imports as they don't exist

const SettingsPage = () => {
  const { user } = useAuth(); // Get user data from context
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false); // Loading state for profile update
  const [isChangingPassword, setIsChangingPassword] = useState(false); // Loading state for password change
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  // State for profile form
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  // State for password form
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  // State for quiz settings - Initialize with defaults, will be overwritten by localStorage if available
  const [quizSettings, setQuizSettings] = useState({
    defaultTimer: 60,
    defaultQuestionRandomization: true,
    defaultAnswerRandomization: true,
  });
  // State for archived quizzes (placeholder)
  const [archivedQuizzes, setArchivedQuizzes] = useState([
    { id: 1, title: 'Archived Quiz 1' },
    { id: 2, title: 'Archived Quiz 2' },
  ]);
  // State for system settings
  const [systemSettings, setSystemSettings] = useState({
    theme: 'light', // Default theme, load from localStorage or backend
  });

  // Load quiz setting preferences from localStorage and fetch archived quizzes on mount
  useEffect(() => {
    // Load preferences
    const savedTimer = localStorage.getItem('quizDefaultTimer');
    const savedQRand = localStorage.getItem('quizDefaultQuestionRandomization');
    const savedARand = localStorage.getItem('quizDefaultAnswerRandomization');

    setQuizSettings(prev => ({
      ...prev,
      defaultTimer: savedTimer ? parseInt(savedTimer, 10) : prev.defaultTimer,
      defaultQuestionRandomization: savedQRand !== null ? JSON.parse(savedQRand) : prev.defaultQuestionRandomization,
      defaultAnswerRandomization: savedARand !== null ? JSON.parse(savedARand) : prev.defaultAnswerRandomization,
    }));

    // TODO: Fetch actual default quiz settings from backend if/when implemented
    console.log('Fetching default quiz settings (using localStorage)...');

    // Placeholder: Fetch archived quizzes logic would go here
    console.log('Fetching archived quizzes (placeholder)...');
    // fetchArchivedQuizzes(); // Call the actual fetch function here when ready

    // TODO: Load theme preference from localStorage/backend
  }, []); // Empty dependency array: Load preferences only once on mount


  // Populate profile form when user data is available
  useEffect(() => {
    if (user) {
      // Use user_metadata.full_name if available, otherwise fallback or leave empty
      setProfileData({ name: user.user_metadata?.full_name || '', email: user.email || '' });
    }
  }, [user]); // Dependency array now uses the stable user object from context

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleQuizSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizSettings(prevSettings => { // Need to wrap the logic inside the setter function
      const newValue = type === 'checkbox' ? checked : value;
      const updatedSettings = {
        ...prevSettings,
        [name]: newValue,
      };

      // Save preference to localStorage
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
      // Optionally show an error dialog
    }

      return updatedSettings; // Return the new state
    }); // Close the setter function
  };

  // Remove handleQuizSettingsSubmit as it's no longer needed
  // const handleQuizSettingsSubmit = (e) => { ... };

  // Keep only one definition of handleRestoreQuiz
  const handleRestoreQuiz = (quizId) => {
    // TODO: Implement API call to restore quiz
    console.log('Restoring quiz:', quizId);
    alert('Quiz restore functionality not yet connected.');
    // Example: Update local state after successful restore
    // setArchivedQuizzes(prev => prev.filter(q => q.id !== quizId));
  };

  const handleSystemSettingChange = (e) => {
    const { name, value } = e.target;
    setSystemSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));
    // TODO: Implement theme switching logic (e.g., update localStorage, apply class to body)
    console.log('Changing theme to:', value);
    alert('Theme switching functionality not yet fully connected.');
  };


  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      alert('Name cannot be empty.');
      return;
    }
    setIsUpdatingProfile(true); // Set loading state
    try {
      // Update the user metadata
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileData.name }
      });

      if (error) {
        throw error; // Throw error to be caught by catch block
      }

      // Show success dialog
      setDialogTitle('Success');
      setDialogMessage('Profile updated successfully!');
      setDialogOpen(true);
      // Optionally, trigger a refresh of user data if AuthContext doesn't update automatically
      // await refreshAuthData(); // Assuming such a function exists in AuthContext

    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error dialog
      setDialogTitle('Error');
      setDialogMessage(`Failed to update profile: ${error.message}`);
      setDialogOpen(true);
    } finally {
      setIsUpdatingProfile(false); // Reset loading state
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!passwordData.currentPassword) {
      setDialogTitle('Error');
      setDialogMessage('Current password cannot be empty.');
      setDialogOpen(true);
      return;
    }
    if (!passwordData.newPassword) {
      setDialogTitle('Error');
      setDialogMessage('New password cannot be empty.');
      setDialogOpen(true);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setDialogTitle('Error');
      setDialogMessage("New passwords don't match!");
      setDialogOpen(true);
      return;
    }
    // Add more complex password validation if needed (e.g., length, characters)

    setIsChangingPassword(true); // Set loading state
    try {
      // 1. Verify current password by attempting sign-in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email, // Get email from auth context
        password: passwordData.currentPassword,
      });

      if (signInError) {
        // If sign-in fails, it's likely the wrong current password
        console.error('Password verification failed:', signInError);
        setDialogTitle('Error');
        setDialogMessage('Incorrect current password.');
        setDialogOpen(true);
        setIsChangingPassword(false); // Reset loading state early
        return; // Stop the process
      }

      // 2. If verification succeeds, update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        throw updateError; // Throw error to be caught by outer catch block
      }

      setDialogTitle('Success');
      setDialogMessage('Password changed successfully!');
      setDialogOpen(true);
      // Clear password fields after successful change
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (error) {
      console.error('Error changing password:', error); // Catches errors from updateUser
      setDialogTitle('Error');
      setDialogMessage(`Failed to change password: ${error.message}`);
      setDialogOpen(true);
    } finally {
      setIsChangingPassword(false); // Reset loading state
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* User Account Settings */}
      <section className="mb-8 p-4 border rounded shadow-sm">
        <h2 className="text-xl font-medium mb-4">User Account</h2>
        {/* Profile Information */}
        {/* Profile Information */}
        {/* Profile Information */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Profile Information</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="profileName" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                id="profileName"
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Your full name"
                className="w-full py-2 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label htmlFor="profileEmail" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                id="profileEmail"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="your.email@example.com"
                className="w-full py-2 px-3 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed"
                disabled // Typically email is not changed directly here, or requires verification
              />
            </div>
            <button
              type="submit"
              disabled={isUpdatingProfile} // Disable button when loading
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isUpdatingProfile
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
              }`}
            >
              {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div>
          <h3 className="text-lg font-medium mb-2">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword" // Ensure name matches state key
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
                className="w-full py-2 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                required // Make it required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="w-full py-2 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className="w-full py-2 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={isChangingPassword} // Disable button when loading
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isChangingPassword
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
              }`}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </section>

      {/* Quiz Settings */}
      <section className="mb-8 p-4 border rounded shadow-sm">
        <h2 className="text-xl font-medium mb-4">Quiz Creation Defaults (Preferences)</h2>
        {/* Removed form tag as saving happens onChange */}
        <div className="space-y-4"> {/* Added container div */}
          {/* Default Quiz Timer */}
          <div>
            <label htmlFor="defaultTimer" className="block text-sm font-medium text-slate-700 mb-1">Default Quiz Timer (minutes)</label>
            <input
              id="defaultTimer"
              type="number"
              name="defaultTimer"
              value={quizSettings.defaultTimer}
              onChange={handleQuizSettingChange}
              min="1"
              className="w-full py-2 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          {/* Default Question Randomization */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="defaultQuestionRandomization"
              name="defaultQuestionRandomization"
              checked={quizSettings.defaultQuestionRandomization}
              onChange={handleQuizSettingChange}
              className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
            />
            <label htmlFor="defaultQuestionRandomization" className="text-sm text-slate-700">Enable Default Question Randomization</label>
          </div>
          {/* Default Answer Option Randomization */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="defaultAnswerRandomization"
              name="defaultAnswerRandomization"
              checked={quizSettings.defaultAnswerRandomization}
              onChange={handleQuizSettingChange}
              className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
            />
            <label htmlFor="defaultAnswerRandomization" className="text-sm text-slate-700">Enable Default Answer Option Randomization</label>
          </div>
          {/* Removed Save Button */}
        </div> {/* Close container div */}

        {/* Quiz Archiving */}
        <div>
          <h3 className="text-lg font-medium mb-4">Archived Quizzes</h3>
          {archivedQuizzes.length > 0 ? (
            <ul className="space-y-2">
              {archivedQuizzes.map((quiz) => (
                <li key={quiz.id} className="flex justify-between items-center p-2 border border-slate-200 rounded">
                  <span className="text-sm text-slate-700">{quiz.title}</span>
                  <button
                    onClick={() => handleRestoreQuiz(quiz.id)}
                    className="py-1 px-3 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No archived quizzes found.</p>
          )}
        </div>
      </section>

      {/* System Settings */}
      <section className="p-4 border rounded shadow-sm">
        <h2 className="text-xl font-medium mb-4">System Settings</h2>
        {/* Theme */}
        {/* Theme */}
        <div>
          <h3 className="text-lg font-medium mb-2">Theme</h3>
          <select
            name="theme"
            value={systemSettings.theme}
            onChange={handleSystemSettingChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            {/* Add other themes if needed */}
          </select>
          {/* Consider adding a button to save system settings if needed, or save on change */}
        </div>
      </section>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => setDialogOpen(false)} // Simple close for info dialog
        title={dialogTitle}
        description={dialogMessage}
        confirmButtonText="OK" // Change button text for info
        // Hide cancel button if not needed for info dialog
        // cancelButtonText="" // Or adjust component to hide it based on prop
      />
    </div>
  );
};

export default SettingsPage;
