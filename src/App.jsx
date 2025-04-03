import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import TestPage from './pages/TestPage';

// Layout Components
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load page components to reduce initial load time
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminStudyGuides = lazy(() => import('./pages/admin/StudyGuides'));
const AdminResults = lazy(() => import('./pages/admin/Results'));
const MediaLibraryPage = lazy(() => import('./pages/admin/MediaLibraryPage')); // Added import
const StudyGuidePage = lazy(() => import('./pages/StudyGuidePage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading fallback 
const LoadingFallback = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  // Get auth state
  const { loading, isAuthenticated } = useAuth();
  
  // If auth is still loading, show loading indicator
  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className="app-container" style={{ width: '100%', minHeight: '100vh' }}>
      {/* For debug purposes, show auth state */}
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        background: '#eee', 
        padding: '5px', 
        fontSize: '12px',
        zIndex: 1000,
        opacity: 0.7
      }}>
        Auth: {isAuthenticated ? 'Logged In' : 'Not Logged In'}
      </div>
      
      <Routes>
        {/* Test route - always available for debugging */}
        <Route path="/test" element={<TestPage />} />
        
        {/* Main app routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <HomePage />
            </Suspense>
          } />
          
          <Route path="login" element={
            <Suspense fallback={<LoadingFallback />}>
              <LoginPage />
            </Suspense>
          } />
          
          <Route path="study/:sectionId?/:categoryId?/:studyGuideId?" element={
            <Suspense fallback={<LoadingFallback />}>
              <StudyGuidePage />
            </Suspense>
          } />
          
          <Route path="quiz/:quizId?" element={
            <Suspense fallback={<LoadingFallback />}>
              <QuizPage />
            </Suspense>
          } />
          
          {/* Admin Routes (Protected) */}
          <Route path="admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="study-guides" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminStudyGuides />
                </Suspense>
              } />
              <Route path="results" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminResults />
                </Suspense>
              } />
              {/* Added media route */}
              <Route path="media" element={
                <Suspense fallback={<LoadingFallback />}>
                  <MediaLibraryPage />
                </Suspense>
              } />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
          
          {/* 404 */}
          <Route path="*" element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          } />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
