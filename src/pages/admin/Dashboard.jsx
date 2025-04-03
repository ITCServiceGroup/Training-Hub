import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { quizResultsService } from '../../services/api/quizResults';

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

// Function to view all persisted logs
window.viewAdminLogs = () => {
  try {
    const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
    console.log('=== PERSISTED ADMIN LOGS ===', logs);
    return logs;
  } catch (e) {
    console.error('Failed to retrieve logs', e);
    return [];
  }
};

// Clear logs
window.clearAdminLogs = () => {
  localStorage.removeItem('adminLogs');
  console.log('Admin logs cleared');
};

const AdminDashboard = () => {
  const { user, session, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [quizStats, setQuizStats] = useState({
    studyGuides: 24, // Mock data
    questions: 156,  // Mock data
    quizzes: 12,    // Mock data
    completions: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quiz results data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        // Get total completions count
        const count = await quizResultsService.getTotalCount();
        setQuizStats(prev => ({ ...prev, completions: count }));

        // Get recent results
        const results = await quizResultsService.getRecentResults(5);
        const formattedResults = results.map(result => ({
          id: result.id,
          type: 'quiz_completion',
          user: result.ldap,
          item: result.quiz_type,
          date: result.date_of_test,
          score: result.score_text
        }));
        setRecentActivity(formattedResults);
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  // Log when the dashboard mounts
  useEffect(() => {
    logAdmin('AdminDashboard mounted');
    logAdmin('Auth state in dashboard', {
      hasUser: !!user,
      userEmail: user?.email,
      userRole: user?.role,
      hasSession: !!session,
      isAuthenticated,
      sessionExpires: session?.expires_at
    });

    // Check if the session is actually valid
    if (!isAuthenticated || !user || !session) {
      logAdmin('WARNING: Dashboard loaded but authentication may not be complete');
    }

    // Verify Supabase auth token
    const verifySession = async () => {
      try {
        // Just try to get the user - this will fail if the token isn't valid
        const { data, error } = await supabase.auth.getUser();
        logAdmin('Session verification result', { data, error });
      } catch (err) {
        logAdmin('Session verification failed', err);
        setError('Failed to verify session: ' + err.message);
      }
    };

    verifySession();
  }, []);

  // Log when auth state changes
  useEffect(() => {
    logAdmin('Auth state changed in dashboard', {
      isAuthenticated,
      hasUser: !!user
    });
  }, [user, isAuthenticated]);

  // Using Tailwind classes instead of inline styles

  // Helper function to get badge color classes based on activity type
  const getBadgeClasses = (type) => {
    switch (type) {
      case 'quiz_completion':
        return 'bg-teal-100 text-teal-700';
      case 'study_guide_view':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'quiz_completion':
        return 'Quiz Completion';
      case 'study_guide_view':
        return 'Study Guide View';
      default:
        return type;
    }
  };

  // Error display
  if (error) {
    return (
      <div className="p-8 bg-red-100 rounded-lg text-red-700 mb-4">
        <h2>Dashboard Error</h2>
        <div>{error}</div>
        <p>Please try <a href="/login">logging in</a> again.</p>
      </div>
    );
  }

  logAdmin('Rendering admin dashboard');

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow flex flex-col">
          <div className="text-4xl font-bold text-teal-700 mb-2">{quizStats.studyGuides}</div>
          <div className="text-sm text-slate-500">Study Guides</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow flex flex-col">
          <div className="text-4xl font-bold text-teal-700 mb-2">{quizStats.questions}</div>
          <div className="text-sm text-slate-500">Questions</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow flex flex-col">
          <div className="text-4xl font-bold text-teal-700 mb-2">{quizStats.quizzes}</div>
          <div className="text-sm text-slate-500">Quizzes</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow flex flex-col">
          <div className="text-4xl font-bold text-teal-700 mb-2">{quizStats.completions}</div>
          <div className="text-sm text-slate-500">Quiz Completions</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 m-0">Recent Activity</h3>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b border-slate-200 text-slate-500 font-normal">Type</th>
              <th className="text-left p-3 border-b border-slate-200 text-slate-500 font-normal">User</th>
              <th className="text-left p-3 border-b border-slate-200 text-slate-500 font-normal">Item</th>
              <th className="text-left p-3 border-b border-slate-200 text-slate-500 font-normal">Date</th>
              <th className="text-left p-3 border-b border-slate-200 text-slate-500 font-normal">Score</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map(activity => (
              <tr key={activity.id}>
                <td className="p-3 border-b border-slate-200">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getBadgeClasses(activity.type)}`}>
                    {getActivityTypeLabel(activity.type)}
                  </span>
                </td>
                <td className="p-3 border-b border-slate-200">{activity.user}</td>
                <td className="p-3 border-b border-slate-200">{activity.item}</td>
                <td className="p-3 border-b border-slate-200">{formatDate(activity.date)}</td>
                <td className="p-3 border-b border-slate-200">{activity.score || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg p-6 shadow mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 m-0">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
            <div className="w-[50px] h-[50px] rounded-full bg-teal-700 flex items-center justify-center text-2xl mb-4">
              <span>📚</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Study Guides</h3>
            <p className="text-slate-500 mb-4 flex-1">Manage study guide content and categories.</p>
            <Link
              to="/admin/study-guides"
              className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors w-full block text-center no-underline"
            >
              Manage Study Guides
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
            <div className="w-[50px] h-[50px] rounded-full bg-cyan-700 flex items-center justify-center text-2xl mb-4">
              <span>❓</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Questions</h3>
            <p className="text-slate-500 mb-4 flex-1">Create and edit questions for quizzes.</p>
            <Link
              to="/admin/questions"
              className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors w-full block text-center no-underline"
            >
              Manage Questions
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
            <div className="w-[50px] h-[50px] rounded-full bg-blue-900 flex items-center justify-center text-2xl mb-4">
              <span>📝</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Quizzes</h3>
            <p className="text-slate-500 mb-4 flex-1">Create and manage quizzes and access codes.</p>
            <Link
              to="/admin/quizzes"
              className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors w-full block text-center no-underline"
            >
              Manage Quizzes
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
            <div className="w-[50px] h-[50px] rounded-full bg-blue-700 flex items-center justify-center text-2xl mb-4">
              <span>📊</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Results</h3>
            <p className="text-slate-500 mb-4 flex-1">View quiz results and analytics.</p>
            <Link
              to="/admin/results"
              className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-2 px-4 text-sm font-bold cursor-pointer transition-colors w-full block text-center no-underline"
            >
              View Results
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
