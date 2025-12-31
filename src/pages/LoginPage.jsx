import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Dialog } from '@headlessui/react';
import { getSupabaseClient } from '../config/supabase';

// Debug helper function
const logLogin = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[LOGIN ${timestamp}] ${message}`);
  if (data) {
    console.log(`[LOGIN DATA]`, data);
  }
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const { signIn, isAuthenticated, user, session, error: authError } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Log component mount and authentication state
  useEffect(() => {
    logLogin('LoginPage mounted');
    logLogin('Initial auth state', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasSession: !!session,
      authError
    });
  }, []);
  
  // Log when authentication state changes
  useEffect(() => {
    logLogin('Auth state changed', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasSession: !!session,
      authError
    });
    
    if (isAuthenticated) {
      logLogin('User is authenticated, will redirect to admin');
    }
  }, [isAuthenticated, user, session, authError]);

  // If already authenticated, redirect to admin
  if (isAuthenticated) {
    logLogin('Redirecting to admin due to authenticated state');
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    logLogin('Login form submitted', { email });
    
    if (!email || !password) {
      const message = 'Please enter both email and password';
      logLogin(message);
      setErrorMessage(message);
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      logLogin('Calling signIn function');
      const response = await signIn(email, password);
      logLogin('SignIn response', response);
      
      if (response.error) {
        logLogin('Error in response', response.error);
        throw new Error(response.error.message || 'Failed to sign in');
      }
      
      // Navigate to admin dashboard on successful login
      logLogin('Login successful, navigating to admin dashboard');
      navigate('/admin');
      logLogin('Navigate function called');
    } catch (error) {
      logLogin('Login error caught', error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    setResetError('');

    try {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
        resetEmail,
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (error) throw error;

      setResetEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setResetError(error.message || 'Failed to send reset email. Please try again.');
    }
  };

  logLogin('Rendering login form');
  return (
    <div className="login-page">
      <div className="card login-card">
        {/* Enhanced Title Section */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Sign in to access your training dashboard
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger mb-4">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Field with Icon */}
          <div className="form-group mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineMail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-10 pr-3 py-3 border rounded-lg
                          focus:ring-2 focus:ring-primary focus:border-primary
                          focus:shadow-lg
                          transition-all duration-200 ease-in-out
                          disabled:opacity-50 disabled:cursor-not-allowed
                          placeholder-slate-400 dark:placeholder-slate-500"
                style={{
                  backgroundColor: theme === 'dark' ? '#334155' : '#ffffff',
                  color: theme === 'dark' ? '#f8fafc' : '#374151',
                  borderColor: theme === 'dark' ? '#64748b' : '#cbd5e1'
                }}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Field with Icon and Toggle */}
          <div className="form-group mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-10 pr-10 py-3 border rounded-lg
                          focus:ring-2 focus:ring-primary focus:border-primary
                          focus:shadow-lg
                          transition-all duration-200 ease-in-out
                          disabled:opacity-50 disabled:cursor-not-allowed
                          placeholder-slate-400 dark:placeholder-slate-500"
                style={{
                  backgroundColor: theme === 'dark' ? '#334155' : '#ffffff',
                  color: theme === 'dark' ? '#f8fafc' : '#374151',
                  borderColor: theme === 'dark' ? '#64748b' : '#cbd5e1'
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0 flex items-center justify-center h-5 w-5 text-slate-400 dark:text-slate-500
                          hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                ) : (
                  <AiOutlineEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(true)}
              className="text-sm font-medium transition-colors underline-offset-2 hover:underline"
              style={{ color: 'var(--primary-color)' }}
            >
              Forgot password?
            </button>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center mb-6">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600
                        dark:bg-slate-700 focus:ring-2 focus:ring-primary
                        transition-colors"
              style={{ accentColor: 'var(--primary-color)' }}
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
            >
              Keep me signed in
            </label>
          </div>

          {/* Submit Button with Loading State */}
          <button
            type="submit"
            disabled={isLoading}
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
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => {
          setForgotPasswordOpen(false);
          setResetEmail('');
          setResetEmailSent(false);
          setResetError('');
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <Dialog.Title className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Reset Your Password
            </Dialog.Title>

            {!resetEmailSent ? (
              <>
                <Dialog.Description className="text-sm text-slate-600 dark:text-slate-300 mb-5">
                  Enter your email address and we'll send you a link to reset your password.
                </Dialog.Description>

                {resetError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-300">{resetError}</p>
                  </div>
                )}

                <div className="mb-5">
                  <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiOutlineMail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      type="email"
                      id="reset-email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border rounded-lg
                                focus:ring-2 focus:ring-primary focus:border-primary
                                focus:shadow-lg
                                transition-all duration-200 ease-in-out
                                placeholder-slate-400 dark:placeholder-slate-500"
                      style={{
                        backgroundColor: theme === 'dark' ? '#334155' : '#ffffff',
                        color: theme === 'dark' ? '#f8fafc' : '#374151',
                        borderColor: theme === 'dark' ? '#64748b' : '#cbd5e1'
                      }}
                      placeholder="you@example.com"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300
                              hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={!resetEmail}
                    className="px-4 py-2 text-sm text-white rounded-lg transition-colors
                              disabled:opacity-50 disabled:cursor-not-allowed btn-primary"
                  >
                    Send Reset Link
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Password reset link sent! Check your email inbox and follow the instructions to reset your password.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordOpen(false);
                      setResetEmail('');
                      setResetEmailSent(false);
                    }}
                    className="px-4 py-2 text-sm text-white rounded-lg transition-colors btn-primary"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default LoginPage;
