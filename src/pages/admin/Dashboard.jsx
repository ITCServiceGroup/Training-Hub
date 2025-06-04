import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../config/supabase';
import { quizResultsService } from '../../services/api/quizResults';
import { studyGuidesService } from '../../services/api/studyGuides';
import { BiBook } from 'react-icons/bi';
import { MdQuiz } from 'react-icons/md';
import { BiBarChart } from 'react-icons/bi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Debug helper function with localStorage persistence
const logAdmin = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[ADMIN ${timestamp}] ${message}`;
  console.log(logMessage);

  // Format data as string if present
  let dataString = '';
  if (data) {
    console.log(`[ADMIN DATA]`, data);
    try {
      dataString = JSON.stringify(data, null, 2);
    } catch (e) {
      dataString = `[Unable to stringify: ${e.message}]`;
    }
  }

  // Persist to localStorage
  try {
    const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
    logs.push({ timestamp, type: 'ADMIN', message, data: dataString });
    // Keep only last 100 logs
    if (logs.length > 100) logs.shift();
    localStorage.setItem('adminLogs', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to persist log to localStorage', e);
  }
};

// Clear logs
window.clearAdminLogs = () => {
  localStorage.removeItem('adminLogs');
  console.log('Admin logs cleared');
};

const AdminDashboard = () => {
  const { user, session, isAuthenticated } = useAuth();
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';

  // Get current secondary color for the theme
  const currentSecondaryColor = themeColors.secondary[isDark ? 'dark' : 'light'];

  const [error, setError] = useState(null);
  const [quizStats, setQuizStats] = useState({
    studyGuides: 0,
    questions: 156,  // Mock data
    quizzes: 12,    // Mock data
    completions: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quiz results data and study guide count
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        logAdmin('Fetching dashboard data');

        // Get total study guides count
        const studyGuideCount = await studyGuidesService.getCount();
        setQuizStats(prev => ({ ...prev, studyGuides: studyGuideCount }));

        // Get total completions count
        const count = await quizResultsService.getTotalCount();
        logAdmin('Total quiz completions:', count);
        setQuizStats(prev => ({ ...prev, completions: count }));

        // Get recent results
        logAdmin('Fetching recent quiz results...');
        const results = await quizResultsService.getRecentResults(5);

        // Results are already formatted by the service
        logAdmin('Received quiz results:', results);
        setRecentActivity(results);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        logAdmin('Error in fetchDashboardData:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Log when the dashboard mounts
  useEffect(() => {
    logAdmin('AdminDashboard mounted');
  }, []);

  // Helper function to get badge color classes based on activity type
  const getBadgeClasses = (type) => {
    switch (type) {
      case 'quiz_completion':
        return 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border border-primary/30 dark:border-primary/30';
      default:
        return 'bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary border border-secondary/30 dark:border-secondary/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        logAdmin('Invalid date:', dateString);
        return '-';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      logAdmin('Error formatting date:', e);
      return '-';
    }
  };

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'quiz_completion':
        return 'Quiz Completion';
      default:
        return type;
    }
  };

  // Error display
  if (error) {
    return (
      <div className="p-8 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 mb-4">
        <h2 className="font-bold mb-2">Dashboard Error</h2>
        <div className="mb-2">{error}</div>
        <p>Please try <a href="/login" className="text-red-700 dark:text-red-300 underline hover:no-underline">logging in</a> again.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-700 rounded-lg p-6 shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 flex flex-col hover:shadow-lg transition-shadow duration-200">
          <div className="text-4xl font-bold text-primary mb-2">{quizStats.studyGuides}</div>
          <div className="text-sm text-slate-500 dark:text-slate-300">Study Guides</div>
        </div>
        <div className="bg-white dark:bg-slate-700 rounded-lg p-6 shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 flex flex-col hover:shadow-lg transition-shadow duration-200">
          <div className="text-4xl font-bold text-primary mb-2">{quizStats.questions}</div>
          <div className="text-sm text-slate-500 dark:text-slate-300">Questions</div>
        </div>
        <div className="bg-white dark:bg-slate-700 rounded-lg p-6 shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 flex flex-col hover:shadow-lg transition-shadow duration-200">
          <div className="text-4xl font-bold text-primary mb-2">{quizStats.quizzes}</div>
          <div className="text-sm text-slate-500 dark:text-slate-300">Quizzes</div>
        </div>
        <div className="bg-white dark:bg-slate-700 rounded-lg p-6 shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 flex flex-col hover:shadow-lg transition-shadow duration-200">
          <div className="text-4xl font-bold text-primary mb-2">{quizStats.completions}</div>
          <div className="text-sm text-slate-500 dark:text-slate-300">Quiz Completions</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-700 rounded-lg p-6 shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">Recent Activity</h3>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium">Type</th>
              <th className="text-left p-3 border-b-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium">User</th>
              <th className="text-left p-3 border-b-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium">Item</th>
              <th className="text-left p-3 border-b-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium">Date</th>
              <th className="text-left p-3 border-b-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-3">
                  <LoadingSpinner size="md" text="Loading..." />
                </td>
              </tr>
            ) : recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <tr key={activity.id}>
                  <td className="p-3 border-b border-slate-200 dark:border-slate-600">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getBadgeClasses(activity.type)}`}>
                      {getActivityTypeLabel(activity.type)}
                    </span>
                  </td>
                  <td className="p-3 border-b border-slate-200 dark:border-slate-600 dark:text-white">{activity.user}</td>
                  <td className="p-3 border-b border-slate-200 dark:border-slate-600 dark:text-white">{activity.item}</td>
                  <td className="p-3 border-b border-slate-200 dark:border-slate-600 dark:text-white">{formatDate(activity.date)}</td>
                  <td className="p-3 border-b border-slate-200 dark:border-slate-600 dark:text-white">{activity.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-3 text-center text-slate-500 dark:text-slate-300">
                  No recent activity
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white dark:bg-slate-700 rounded-lg p-6 shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/study-guides"
            className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 p-6 flex flex-col items-center text-center h-full hover:shadow-lg transition-shadow duration-200 hover:bg-primary-light/10 no-underline"
          >
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center mb-4 shadow-md"
              style={{ backgroundColor: currentSecondaryColor }}
            >
              <BiBook className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Study Guides</h3>
            <p className="text-slate-500 dark:text-slate-300 mb-4 flex-1">Manage study guide content and categories.</p>
            <span className="bg-primary hover:bg-primary-dark text-white border-none rounded py-2 px-4 text-sm font-bold transition-colors w-full block text-center">
              Manage Study Guides
            </span>
          </Link>



          <Link
            to="/admin/quizzes"
            className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 p-6 flex flex-col items-center text-center h-full hover:shadow-lg transition-shadow duration-200 hover:bg-primary-light/10 no-underline"
          >
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center mb-4 shadow-md"
              style={{ backgroundColor: currentSecondaryColor }}
            >
              <MdQuiz className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Quizzes</h3>
            <p className="text-slate-500 dark:text-slate-300 mb-4 flex-1">Create and manage quizzes and access codes.</p>
            <span className="bg-primary hover:bg-primary-dark text-white border-none rounded py-2 px-4 text-sm font-bold transition-colors w-full block text-center">
              Manage Quizzes
            </span>
          </Link>

          <Link
            to="/admin/results"
            className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg border border-slate-100 dark:border-slate-600 p-6 flex flex-col items-center text-center h-full hover:shadow-lg transition-shadow duration-200 hover:bg-primary-light/10 no-underline"
          >
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center mb-4 shadow-md"
              style={{ backgroundColor: currentSecondaryColor }}
            >
              <BiBarChart className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Results</h3>
            <p className="text-slate-500 dark:text-slate-300 mb-4 flex-1">View quiz results and analytics.</p>
            <span className="bg-primary hover:bg-primary-dark text-white border-none rounded py-2 px-4 text-sm font-bold transition-colors w-full block text-center">
              View Results
            </span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
