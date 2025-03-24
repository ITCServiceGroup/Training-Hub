import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
  
  const { signIn, isAuthenticated, user, session, error: authError } = useAuth();
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

  logLogin('Rendering login form');
  return (
    <div className="login-page">
      <div className="card login-card">
        <h2>Admin Login</h2>
        
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
