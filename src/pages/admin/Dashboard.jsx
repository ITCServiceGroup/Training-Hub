import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { quizResultsService } from '../../services/api/quizResults';
import { studyGuidesService } from '../../services/api/studyGuides';

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
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-gray-100 text-gray-500';
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
      <div className="p-8 bg-red-100 rounded-lg text-red-700 mb-4">
        <h2>Dashboard Error</h2>
        <div>{error}</div>
        <p>Please try <a href="/login">logging in</a> again.</p>
      </div>
    );
  }

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
            {loading ? (
              <tr>
                <td colSpan="5" className="p-3 text-center text-slate-500">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-t-teal-500 border-slate-200 rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <tr key={activity.id}>
                  <td className="p-3 border-b border-slate-200">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getBadgeClasses(activity.type)}`}>
                      {getActivityTypeLabel(activity.type)}
                    </span>
                  </td>
                  <td className="p-3 border-b border-slate-200">{activity.user}</td>
                  <td className="p-3 border-b border-slate-200">{activity.item}</td>
                  <td className="p-3 border-b border-slate-200">{formatDate(activity.date)}</td>
                  <td className="p-3 border-b border-slate-200">{activity.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-3 text-center text-slate-500">
                  No recent activity
                </td>
              </tr>
            )}
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
