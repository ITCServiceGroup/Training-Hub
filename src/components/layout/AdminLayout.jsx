import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Determine active tab based on the current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/admin') return 'dashboard';
    if (path.includes('/admin/study-guides')) return 'study-guides';
    if (path.includes('/admin/questions')) return 'questions';
    if (path.includes('/admin/quizzes')) return 'quizzes';
    if (path.includes('/admin/results')) return 'results';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };
  
  const activeTab = getActiveTab();
  
  // Styles
  const dashboardStyles = {
    display: 'flex',
    minHeight: 'calc(100vh - 64px)', // Adjust based on header height
    overflow: 'hidden',
    width: '100%',
    margin: 0,
    padding: 0
  };
  
  const sidebarStyles = {
    width: '250px',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '2rem 0',
    flexShrink: 0,
    marginTop: 0
  };
  
  const sidebarNavStyles = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };
  
  const contentStyles = {
    flex: '1 1 auto',
    padding: '2rem',
    backgroundColor: '#f8fafc',
    minWidth: 0,
    width: '100%',
    overflow: 'auto',
    marginTop: 0
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
  
  const getInitials = (email) => {
    if (!email) return 'A';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };
  
  // Get page title based on active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Admin Dashboard';
      case 'study-guides': return 'Study Guides Management';
      case 'questions': return 'Questions Management';
      case 'quizzes': return 'Quizzes Management';
      case 'results': return 'Quiz Results';
      case 'settings': return 'Settings';
      default: return 'Admin Dashboard';
    }
  };
  
  return (
    <div style={dashboardStyles}>
      <div style={sidebarStyles}>
        <ul style={sidebarNavStyles}>
          <li 
            style={sidebarItemStyles(activeTab === 'dashboard')}
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
            <Link 
              to="/admin" 
              style={sidebarLinkStyles}
              className="no-underline"
            >
              <span>📊</span> Dashboard
            </Link>
          </li>
          <li 
            style={sidebarItemStyles(activeTab === 'study-guides')}
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
            <Link 
              to="/admin/study-guides" 
              style={sidebarLinkStyles}
              className="no-underline"
            >
              <span>📚</span> Study Guides
            </Link>
          </li>
          <li 
            style={sidebarItemStyles(activeTab === 'questions')}
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
            <Link 
              to="/admin/questions" 
              style={sidebarLinkStyles}
              className="no-underline"
            >
              <span>❓</span> Questions
            </Link>
          </li>
          <li 
            style={sidebarItemStyles(activeTab === 'quizzes')}
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
            <Link 
              to="/admin/quizzes" 
              style={sidebarLinkStyles}
              className="no-underline"
            >
              <span>📝</span> Quizzes
            </Link>
          </li>
          <li 
            style={sidebarItemStyles(activeTab === 'results')}
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
            <Link 
              to="/admin/results" 
              style={sidebarLinkStyles}
              className="no-underline"
            >
              <span>📊</span> Results
            </Link>
          </li>
          <li 
            style={sidebarItemStyles(activeTab === 'settings')}
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
            <Link 
              to="/admin/settings" 
              style={sidebarLinkStyles}
              className="no-underline"
            >
              <span>⚙️</span> Settings
            </Link>
          </li>
        </ul>
      </div>
      
      <div style={contentStyles}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>
            {getPageTitle()}
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
        
        {/* Render the child routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
