import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useFullscreen } from '../../contexts/FullscreenContext';
import { createContext } from 'react';
import { MdDashboard, MdQuiz, MdOutlinePermMedia, MdChevronLeft, MdChevronRight } from 'react-icons/md'; // Added MdOutlinePermMedia
import { BiBook } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';

// Create a context to share selected category
export const CategoryContext = createContext({
  selectedCategory: null,
  setSelectedCategory: () => {},
  resetStudyGuideSelection: () => {},
  setResetStudyGuideSelection: () => {}, // Added setter for completeness
});

const AdminLayout = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isFullscreen, exitFullscreen } = useFullscreen();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resetStudyGuideSelection, setResetStudyGuideSelection] = useState(() => () => {});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Auto-exit fullscreen when navigating away from content editing
  useEffect(() => {
    const isOnStudyGuidesPage = location.pathname.startsWith('/admin/study-guides');
    if (isFullscreen && !isOnStudyGuidesPage) {
      exitFullscreen();
    }
  }, [location.pathname, isFullscreen, exitFullscreen]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Determine active tab based on the current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/admin') return 'dashboard';
    if (path.includes('/admin/study-guides')) return 'study-guides';
    if (path.includes('/admin/media')) return 'media';
    if (path.includes('/admin/quizzes')) return 'quizzes';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  // Get page title based on active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Admin Dashboard';
      case 'study-guides': return 'Creation Management';
      case 'media': return 'Media Library';
      case 'quizzes': return 'Quiz Management';
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
      }}
    >
      <div className="flex flex-1 overflow-hidden w-full m-0 p-0 min-h-0">
        {!isFullscreen && (
          <div className={`${sidebarCollapsed ? 'w-[72px]' : 'w-[250px]'} bg-slate-100 dark:bg-slate-700 text-white dark:text-white flex-shrink-0 mt-0 flex flex-col transition-all duration-300 ease-in-out shadow-md dark:shadow-lg border-r border-slate-200 dark:border-slate-600`}>
          <ul className="list-none p-0 m-0 flex-1">
            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin"
                className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
                title={sidebarCollapsed ? 'Dashboard' : ''}
              >
                <MdDashboard className="text-lg flex-shrink-0" />
                <span className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>Dashboard</span>
              </Link>
            </li>
            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'study-guides' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin/study-guides"
                className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === 'study-guides' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
                title={sidebarCollapsed ? 'Create' : ''}
              >
                <BiBook className="text-lg flex-shrink-0" />
                <span className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>Create</span>
              </Link>
            </li>
            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'media' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin/media"
                className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === 'media' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
                title={sidebarCollapsed ? 'Media Library' : ''}
              >
                <MdOutlinePermMedia className="text-lg flex-shrink-0" />
                <span className={`ml-3 transition-all duration-300 whitespace-nowrap ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>Media Library</span>
              </Link>
            </li>
            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'quizzes' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin/quizzes"
                className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === 'quizzes' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
                title={sidebarCollapsed ? 'Quiz' : ''}
              >
                <MdQuiz className="text-lg flex-shrink-0" />
                <span className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>Quiz</span>
              </Link>
            </li>
            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'settings' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin/settings"
                className={`no-underline hover:no-underline flex items-center px-6 w-full py-3 ${activeTab === 'settings' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
                title={sidebarCollapsed ? 'Settings' : ''}
              >
                <FiSettings className="text-lg flex-shrink-0" />
                <span className={`ml-3 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>Settings</span>
              </Link>
            </li>
          </ul>
            {/* Toggle button at bottom - entire area is clickable */}
            <div
              className="flex justify-center p-4 border-t border-slate-300 dark:border-slate-600 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <div className="text-slate-800 dark:text-white">
                {sidebarCollapsed ? <MdChevronRight className="text-lg" /> : <MdChevronLeft className="text-lg" />}
              </div>
            </div>
          </div>
        )}

        <div className={`flex-1 ${isFullscreen ? 'p-0' : 'p-4'} bg-slate-50 dark:bg-slate-800 min-w-0 w-full overflow-y-auto min-h-0`}>
          {/* Render the child routes */}
          <Outlet />
        </div>
      </div>
    </CategoryContext.Provider>
  );
};

export default AdminLayout;
