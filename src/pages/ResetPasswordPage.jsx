import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '../config/supabase';
import { HiOutlineLockClosed } from 'react-icons/hi';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Check if user has valid session (from reset link)
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await getSupabaseClient().auth.getSession();
      if (!data.session) {
        setErrorMessage('Invalid or expired reset link. Please request a new one.');
      }
    };
    checkSession();
  }, []);

  const validatePassword = (password) => {
    const rules = [
      { test: /.{8,}/, message: 'At least 8 characters' },
      { test: /[A-Z]/, message: 'At least one uppercase letter' },
      { test: /[a-z]/, message: 'At least one lowercase letter' },
      { test: /[0-9]/, message: 'At least one number' },
    ];
    return rules.map(rule => ({
      passed: rule.test.test(password),
      message: rule.message
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const validation = validatePassword(newPassword);
    const allPassed = validation.every(rule => rule.passed);

    if (!allPassed) {
      setErrorMessage('Password does not meet requirements');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await getSupabaseClient().auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccessMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Password update error:', error);
      setErrorMessage(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Reset Password
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Enter your new password below
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger mb-4">{errorMessage}</div>
        )}

        {successMessage && (
          <div className="alert alert-success mb-4">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* New Password Field */}
          <div className="form-group mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg
                          focus:ring-2 focus:ring-primary focus:border-primary
                          dark:bg-slate-700 dark:text-white
                          transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0 flex items-center justify-center h-5 w-5 text-slate-400 dark:text-slate-500
                          hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Password Requirements:</p>
              {passwordValidation.map((rule, index) => (
                <div key={index} className="flex items-center text-xs mb-1">
                  <span className={rule.passed ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}>
                    {rule.passed ? '✓' : '○'} {rule.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Password Field */}
          <div className="form-group mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg
                          focus:ring-2 focus:ring-primary focus:border-primary
                          dark:bg-slate-700 dark:text-white
                          transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0 flex items-center justify-center h-5 w-5 text-slate-400 dark:text-slate-500
                          hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full btn-primary py-2.5 rounded-lg font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed
                      hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
