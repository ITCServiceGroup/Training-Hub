import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Layout Components
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Network Error Handling
import NetworkErrorBoundary from './components/common/NetworkErrorBoundary';
import AutoReload from './components/common/AutoReload';

// Lazy retry utility for robust chunk loading
import lazyRetry from './utils/lazyRetry';

// Lazy load page components with automatic retry on failure
const HomePage = lazyRetry(() => import('./pages/HomePage'));
const LoginPage = lazyRetry(() => import('./pages/LoginPage'));
const AdminDashboard = lazyRetry(() => import('./pages/admin/Dashboard'));
const AdminStudyGuides = lazyRetry(() => import('./pages/admin/StudyGuides'));
const AdminQuizzes = lazyRetry(() => import('./pages/admin/AdminQuizzes'));
const QuizBuilderPage = lazyRetry(() => import('./components/quiz-builder/QuizBuilderPage'));
const MediaLibraryPage = lazyRetry(() => import('./pages/admin/MediaLibraryPage'));

const SettingsPage = lazyRetry(() => import('./pages/admin/SettingsPage'));
const StudyGuidePage = lazyRetry(() => import('./pages/StudyGuidePage'));
const QuizPage = lazyRetry(() => import('./pages/QuizPage'));
const NotFoundPage = lazyRetry(() => import('./pages/NotFoundPage'));

// Legal pages
const PrivacyPolicyPage = lazyRetry(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazyRetry(() => import('./pages/TermsOfServicePage'));
const ContactUsPage = lazyRetry(() => import('./pages/ContactUsPage'));

// RBAC pages
const UnauthorizedPage = lazyRetry(() => import('./pages/UnauthorizedPage'));
const AccountInactivePage = lazyRetry(() => import('./pages/AccountInactivePage'));
const UserManagement = lazyRetry(() => import('./pages/admin/UserManagement'));
const ApprovalQueue = lazyRetry(() => import('./pages/admin/ApprovalQueue'));

// Enhanced loading fallback with network error detection
const LoadingFallback = () => {
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 10000); // Show timeout message after 10 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <LoadingSpinner size="lg" text="Still loading..." />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            This is taking longer than usual. Check your internet connection.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
};

function App() {
  const { loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <NetworkErrorBoundary>
      <AutoReload>
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
          <Route path="quiz/practice/:sectionId/:categoryId" element={
            <Suspense fallback={<LoadingFallback />}>
              <QuizPage />
            </Suspense>
          } />
          <Route path="quiz/practice/:sectionId" element={
            <Suspense fallback={<LoadingFallback />}>
              <QuizPage />
            </Suspense>
          } />
          <Route path="quiz/:quizId" element={
            <Suspense fallback={<LoadingFallback />}>
              <QuizPage />
            </Suspense>
          } />
          <Route path="quiz" element={
            <Suspense fallback={<LoadingFallback />}>
              <QuizPage />
            </Suspense>
          } />

          {/* Legal Pages */}
          <Route path="privacy-policy" element={
            <Suspense fallback={<LoadingFallback />}>
              <PrivacyPolicyPage />
            </Suspense>
          } />
          <Route path="terms-of-service" element={
            <Suspense fallback={<LoadingFallback />}>
              <TermsOfServicePage />
            </Suspense>
          } />
          <Route path="contact-us" element={
            <Suspense fallback={<LoadingFallback />}>
              <ContactUsPage />
            </Suspense>
          } />

          {/* RBAC Error Pages */}
          <Route path="unauthorized" element={
            <Suspense fallback={<LoadingFallback />}>
              <UnauthorizedPage />
            </Suspense>
          } />
          <Route path="account-inactive" element={
            <Suspense fallback={<LoadingFallback />}>
              <AccountInactivePage />
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

              <Route path="media" element={
                <Suspense fallback={<LoadingFallback />}>
                  <MediaLibraryPage />
                </Suspense>
              } />

              {/* User Management Route (Admin only) */}
              <Route path="users" element={
                <Suspense fallback={<LoadingFallback />}>
                  <UserManagement />
                </Suspense>
              } />

              {/* Approval Queue Route (Admin only) */}
              <Route path="approvals" element={
                <Suspense fallback={<LoadingFallback />}>
                  <ApprovalQueue />
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
      </AutoReload>
    </NetworkErrorBoundary>
  );
}

export default App;
