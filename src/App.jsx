import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Layout Components
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load page components to reduce initial load time
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminStudyGuides = lazy(() => import('./pages/admin/StudyGuides'));
const AdminQuizzes = lazy(() => import('./pages/admin/AdminQuizzes'));
const QuizBuilderPage = lazy(() => import('./components/quiz-builder/QuizBuilderPage'));
const AdminResults = lazy(() => import('./pages/admin/Results'));
const MediaLibraryPage = lazy(() => import('./pages/admin/MediaLibraryPage'));

const SettingsPage = lazy(() => import('./pages/admin/SettingsPage')); // Import SettingsPage
const StudyGuidePage = lazy(() => import('./pages/StudyGuidePage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PracticeQuizPage = lazy(() => import('./components/practice-quiz/PracticeQuizPage'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

function App() {
  const { loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className={`w-full ${theme === 'dark' ? 'dark' : ''}`} style={{ minHeight: 'auto' }}>
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

          {/* Quiz Routes */}
          <Route path="quiz/access/:accessCode" element={
            <Suspense fallback={<LoadingFallback />}>
              <QuizPage />
            </Suspense>
          } />
          <Route path="quiz/:quizId" element={
            <Suspense fallback={<LoadingFallback />}>
              <QuizPage />
            </Suspense>
          } />
          <Route path="practice-quiz/:categoryId" element={
            <Suspense fallback={<LoadingFallback />}>
              <PracticeQuizPage />
            </Suspense>
          } />
          <Route path="quiz" element={
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

              {/* Quiz Management Routes */}
              <Route path="quizzes/*" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route index element={<AdminQuizzes />} />
                    <Route path="builder" element={<AdminQuizzes />} />
                    <Route path="builder/:quizId" element={<AdminQuizzes />} />
                    <Route path="codes/:quizId" element={<AdminQuizzes />} />
                  </Routes>
                </Suspense>
              } />

              <Route path="results" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminResults />
                </Suspense>
              } />
              <Route path="media" element={
                <Suspense fallback={<LoadingFallback />}>
                  <MediaLibraryPage />
                </Suspense>
              } />

              {/* Add Settings Route */}
              <Route path="settings" element={
                <Suspense fallback={<LoadingFallback />}>
                  <SettingsPage />
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
