import React, { useState, useContext, useEffect, useCallback } from 'react'; // Added useEffect, useCallback
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SidebarCategoryTree from './SidebarCategoryTree';
import { createContext } from 'react';
import { sectionsService } from '../../services/api/sections'; // Import sectionsService
import { MdDashboard, MdQuiz } from 'react-icons/md';
import { BiBook, BiBarChart } from 'react-icons/bi';
import { BsQuestionCircle } from 'react-icons/bs';
import { FiSettings } from 'react-icons/fi';

// Create a context to share selected category, sections data, and refresh function
export const CategoryContext = createContext({
  selectedCategory: null,
  setSelectedCategory: () => {},
  resetStudyGuideSelection: () => {},
  setResetStudyGuideSelection: () => {}, // Added setter for completeness
  sectionsData: [], // Added sections data
  isLoadingSections: true, // Added loading state
  sectionsError: null, // Added error state
  refreshSectionsData: async () => {}, // Added refresh function
  optimisticallyUpdateSectionsOrder: (newSections) => {}, // Added optimistic update function
});

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resetStudyGuideSelection, setResetStudyGuideSelection] = useState(() => () => {});

  // State for sections data
  const [sectionsData, setSectionsData] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [sectionsError, setSectionsError] = useState(null);

  // Function to fetch/refresh sections data
  const refreshSectionsData = useCallback(async () => {
    setIsLoadingSections(true);
    setSectionsError(null);
    try {
      const data = await sectionsService.getSectionsWithCategories();
      // console.log removed
      setSectionsData(data);
    } catch (err) {
      console.error('Error loading sections data:', err);
      setSectionsError('Failed to load sections data');
    } finally {
      setIsLoadingSections(false);
    }
  }, []); // useCallback ensures the function identity is stable unless dependencies change

  // Function to optimistically update local state
  const optimisticallyUpdateSectionsOrder = useCallback((newSections) => {
    // Directly update the state with the reordered array
    setSectionsData(newSections);
  }, []); // No dependencies needed as it only uses the setter

  // Fetch initial data on mount
  useEffect(() => {
    refreshSectionsData();
  }, [refreshSectionsData]); // Depend on the stable refresh function

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
    <CategoryContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        resetStudyGuideSelection,
        setResetStudyGuideSelection,
        sectionsData, // Provide sections data
        isLoadingSections, // Provide loading state
        sectionsError, // Provide error state
        refreshSectionsData, // Provide refresh function
        optimisticallyUpdateSectionsOrder, // Provide optimistic update function
      }}
    >
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
                <MdDashboard style={{ fontSize: '18px' }} /> Dashboard
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
                <BiBook style={{ fontSize: '18px' }} /> Study Guides
              </Link>
              {/* Sidebar Category Tree - Now consumes data from context */}
              <SidebarCategoryTree
                onSelectCategory={setSelectedCategory} // Still needed for selection logic
                selectedCategoryId={selectedCategory?.id} // Still needed for highlighting
                sidebarLinkStyles={sidebarLinkStyles}
                sidebarItemHoverStyles={sidebarItemHoverStyles}
              />
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
                <BsQuestionCircle style={{ fontSize: '18px' }} /> Questions
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
                <MdQuiz style={{ fontSize: '18px' }} /> Quizzes
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
                <BiBarChart style={{ fontSize: '18px' }} /> Results
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
                <FiSettings style={{ fontSize: '18px' }} /> Settings
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
    </CategoryContext.Provider>
  );
};

export default AdminLayout;
