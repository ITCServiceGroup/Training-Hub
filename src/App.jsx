import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

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
    <div className="app-container w-full min-h-screen">
      {/* For debug purposes, show auth state */}
      <div className="fixed bottom-[10px] right-[10px] bg-gray-200 p-[5px] text-xs z-[1000] opacity-70">
        Auth: {isAuthenticated ? 'Logged In' : 'Not Logged In'}
      </div>

      <Routes>
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
