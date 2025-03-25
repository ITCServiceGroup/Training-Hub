import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { quizResultsService } from '../../services/api/quizResults';
import Results from './Results';

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
  const [activeTab, setActiveTab] = useState('dashboard');
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
  
  // Styles
  const dashboardStyles = {
    display: 'flex',
    minHeight: 'calc(100vh - 140px)'
  };
  
  const sidebarStyles = {
    width: '250px',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '2rem 0'
  };
  
  const sidebarNavStyles = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };
  
  const sidebarItemStyles = (isActive) => ({
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    backgroundColor: isActive ? '#0f766e' : 'transparent',
    transition: 'background-color 0.2s'
  });
  
  const sidebarItemHoverStyles = {
    backgroundColor: '#0f766e'
  };
  
  const sidebarLinkStyles = {
    color: 'white',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };
  
  const contentStyles = {
    flex: 1,
    padding: '2rem',
    backgroundColor: '#f8fafc'
  };
  
  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  };
  
  const titleStyles = {
    fontSize: '1.75rem',
    color: '#0f172a',
    margin: 0
  };
  
  const userInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };
  
  const avatarStyles = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#0f766e',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  };
  
  const userNameStyles = {
    fontWeight: 'bold'
  };
  
  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  };
  
  const statCardStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column'
  };
  
  const statValueStyles = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: '0.5rem'
  };
  
  const statLabelStyles = {
    color: '#64748b',
    fontSize: '0.875rem'
  };
  
  const sectionStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem'
  };
  
  const sectionHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  };
  
  const sectionTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: 0
  };
  
  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse'
  };
  
  const thStyles = {
    textAlign: 'left',
    padding: '0.75rem',
    borderBottom: '1px solid #e2e8f0',
    color: '#64748b',
    fontWeight: 'normal'
  };
  
  const tdStyles = {
    padding: '0.75rem',
    borderBottom: '1px solid #e2e8f0'
  };
  
  const badgeStyles = (type) => {
    let color;
    switch (type) {
      case 'quiz_completion':
        color = '#0f766e';
        break;
      case 'study_guide_view':
        color = '#0369a1';
        break;
      default:
        color = '#64748b';
    }
    
    return {
      backgroundColor: `${color}20`,
      color: color,
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: 'bold'
    };
  };
  
  const cardGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  };
  
  const cardStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };
  
  const cardIconStyles = (color) => ({
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: color || '#0f766e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginBottom: '1rem'
  });
  
  const cardTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#0f172a'
  };
  
  const cardDescStyles = {
    color: '#64748b',
    marginBottom: '1rem',
    flex: '1'
  };
  
  const buttonStyles = {
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%'
  };
  
  const buttonHoverStyles = {
    backgroundColor: '#0c5e57'
  };
  
  const errorStyles = {
    padding: '2rem',
    backgroundColor: '#fee2e2',
    borderRadius: '0.5rem',
    color: '#b91c1c',
    marginBottom: '1rem'
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
  
  const getInitials = (email) => {
    if (!email) return 'A';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };
  
  // Error display
  if (error) {
    return (
      <div style={errorStyles}>
        <h2>Dashboard Error</h2>
        <div>{error}</div>
        <p>Please try <a href="/login">logging in</a> again.</p>
      </div>
    );
  }
  
  logAdmin('Rendering admin dashboard');
  
  return (
    <div style={dashboardStyles}>
      <div style={sidebarStyles}>
        <ul style={sidebarNavStyles}>
          <li 
            style={sidebarItemStyles(activeTab === 'dashboard')}
            onClick={() => setActiveTab('dashboard')}
            onMouseEnter={(e) => {
              if (activeTab !== 'dashboard') {
                Object.assign(e.currentTarget.style, sidebarItemHoverStyles);
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'dashboard') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <a href="#" style={sidebarLinkStyles} onClick={(e) => e.preventDefault()}>
              <span>📊</span> Dashboard
            </a>
          </li>
          <li 
            style={sidebarItemStyles(activeTab === 'study-guides')}
            onClick={() => setActiveTab('study-guides')}
            onMouseEnter={(e) => {
              if (activeTab !== 'study-guides') {
                Object.assign(e.currentTarget.style, sidebarItemHoverStyles);
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'study-guides') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <a href="#" style={sidebarLinkStyles} onClick={(e) => e.preventDefault()}>
              <span>📚</span> Study Guides
            </a>
          </li>
          <li 
            style={sidebarItemStyles(activeTab === 'questions')}
            onClick={() => setActiveTab('questions')}
            onMouseEnter={(e) => {
              if (activeTab !== 'questions') {
                Object.assign(e.currentTarget.style, sidebarItemHoverStyles);
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'questions') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <a href="#" style={sidebarLinkStyles} onClick={(e) => e.preventDefault()}>
              <span>❓</span> Questions
            </a>
          </li>
          <li 
            style={sidebarItemStyles(activeTab === 'quizzes')}
            onClick={() => setActiveTab('quizzes')}
            onMouseEnter={(e) => {
              if (activeTab !== 'quizzes') {
                Object.assign(e.currentTarget.style, sidebarItemHoverStyles);
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'quizzes') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <a href="#" style={sidebarLinkStyles} onClick={(e) => e.preventDefault()}>
              <span>📝</span> Quizzes
            </a>
          </li>
          <li 
            style={sidebarItemStyles(activeTab === 'results')}
            onClick={() => setActiveTab('results')}
            onMouseEnter={(e) => {
              if (activeTab !== 'results') {
                Object.assign(e.currentTarget.style, sidebarItemHoverStyles);
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'results') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <a href="#" style={sidebarLinkStyles} onClick={(e) => e.preventDefault()}>
              <span>📊</span> Results
            </a>
          </li>
          <li 
            style={sidebarItemStyles(activeTab === 'settings')}
            onClick={() => setActiveTab('settings')}
            onMouseEnter={(e) => {
              if (activeTab !== 'settings') {
                Object.assign(e.currentTarget.style, sidebarItemHoverStyles);
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'settings') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <a href="#" style={sidebarLinkStyles} onClick={(e) => e.preventDefault()}>
              <span>⚙️</span> Settings
            </a>
          </li>
        </ul>
      </div>
      
      <div style={contentStyles}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>
            {activeTab === 'dashboard' && 'Admin Dashboard'}
            {activeTab === 'study-guides' && 'Study Guides Management'}
            {activeTab === 'questions' && 'Questions Management'}
            {activeTab === 'quizzes' && 'Quizzes Management'}
            {activeTab === 'results' && 'Quiz Results'}
            {activeTab === 'settings' && 'Settings'}
          </h2>
          
          <div style={userInfoStyles}>
            <div style={avatarStyles}>
              {getInitials(user?.email)}
            </div>
            <div>
              <div style={userNameStyles}>{user?.email || 'Administrator'}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Admin</div>
            </div>
          </div>
        </div>
        
        {activeTab === 'dashboard' && (
          <>
            <div style={statsGridStyles}>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{quizStats.studyGuides}</div>
                <div style={statLabelStyles}>Study Guides</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{quizStats.questions}</div>
                <div style={statLabelStyles}>Questions</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{quizStats.quizzes}</div>
                <div style={statLabelStyles}>Quizzes</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{quizStats.completions}</div>
                <div style={statLabelStyles}>Quiz Completions</div>
              </div>
            </div>
            
            <div style={sectionStyles}>
              <div style={sectionHeaderStyles}>
                <h3 style={sectionTitleStyles}>Recent Activity</h3>
              </div>
              
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={thStyles}>Type</th>
                    <th style={thStyles}>User</th>
                    <th style={thStyles}>Item</th>
                    <th style={thStyles}>Date</th>
                    <th style={thStyles}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map(activity => (
                    <tr key={activity.id}>
                      <td style={tdStyles}>
                        <span style={badgeStyles(activity.type)}>
                          {getActivityTypeLabel(activity.type)}
                        </span>
                      </td>
                      <td style={tdStyles}>{activity.user}</td>
                      <td style={tdStyles}>{activity.item}</td>
                      <td style={tdStyles}>{formatDate(activity.date)}</td>
                      <td style={tdStyles}>{activity.score || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={sectionStyles}>
              <div style={sectionHeaderStyles}>
                <h3 style={sectionTitleStyles}>Quick Actions</h3>
              </div>
              
              <div style={cardGridStyles}>
                <div style={cardStyles}>
                  <div style={cardIconStyles('#0f766e')}>
                    <span>📚</span>
                  </div>
                  <h3 style={cardTitleStyles}>Study Guides</h3>
                  <p style={cardDescStyles}>Manage study guide content and categories.</p>
                  <button 
                    style={buttonStyles}
                    onClick={() => setActiveTab('study-guides')}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, buttonHoverStyles);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f766e';
                    }}
                  >
                    Manage Study Guides
                  </button>
                </div>
                
                <div style={cardStyles}>
                  <div style={cardIconStyles('#0e7490')}>
                    <span>❓</span>
                  </div>
                  <h3 style={cardTitleStyles}>Questions</h3>
                  <p style={cardDescStyles}>Create and edit questions for quizzes.</p>
                  <button 
                    style={buttonStyles}
                    onClick={() => setActiveTab('questions')}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, buttonHoverStyles);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f766e';
                    }}
                  >
                    Manage Questions
                  </button>
                </div>
                
                <div style={cardStyles}>
                  <div style={cardIconStyles('#0c4a6e')}>
                    <span>📝</span>
                  </div>
                  <h3 style={cardTitleStyles}>Quizzes</h3>
                  <p style={cardDescStyles}>Create and manage quizzes and access codes.</p>
                  <button 
                    style={buttonStyles}
                    onClick={() => setActiveTab('quizzes')}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, buttonHoverStyles);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f766e';
                    }}
                  >
                    Manage Quizzes
                  </button>
                </div>
                
                <div style={cardStyles}>
                  <div style={cardIconStyles('#0369a1')}>
                    <span>📊</span>
                  </div>
                  <h3 style={cardTitleStyles}>Results</h3>
                  <p style={cardDescStyles}>View quiz results and analytics.</p>
                  <button 
                    style={buttonStyles}
                    onClick={() => setActiveTab('results')}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, buttonHoverStyles);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f766e';
                    }}
                  >
                    View Results
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'results' ? (
          <Results />
        ) : activeTab !== 'dashboard' && (
          <div style={sectionStyles}>
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>
                {activeTab === 'study-guides' && 'Study Guides Management'}
                {activeTab === 'questions' && 'Questions Management'}
                {activeTab === 'quizzes' && 'Quizzes Management'}
                {activeTab === 'settings' && 'Settings'}
              </h3>
              <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
                This section is under development. Check back soon for updates!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
