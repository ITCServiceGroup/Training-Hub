import React, { useState, useContext, useEffect, useCallback } from 'react'; // Added useEffect, useCallback
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SidebarCategoryTree from './SidebarCategoryTree';
import { createContext } from 'react';
import { sectionsService } from '../../services/api/sections'; // Import sectionsService
import { MdDashboard, MdQuiz, MdOutlinePermMedia } from 'react-icons/md'; // Added MdOutlinePermMedia
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
  const { theme } = useTheme();
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
    if (path.includes('/admin/media')) return 'media'; // Added media check

    if (path.includes('/admin/quizzes')) return 'quizzes';
    if (path.includes('/admin/results')) return 'results';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  // Tailwind classes will be used instead of these style objects

  // Get page title based on active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Admin Dashboard';
      case 'study-guides': return 'Study Guides Management';
      case 'media': return 'Media Library'; // Added media title

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
      <div className="flex flex-1 overflow-hidden w-full m-0 p-0">
        <div className="w-[250px] bg-slate-200 dark:bg-slate-900 text-white dark:text-white pt-4 flex-shrink-0 mt-0 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          <ul className="list-none p-0 m-0">
            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin"
                className={`no-underline hover:no-underline flex items-center gap-3 w-full py-3 px-6 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
              >
                <MdDashboard className="text-lg" /> Dashboard
              </Link>
            </li>
            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'study-guides' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin/study-guides"
                className={`no-underline hover:no-underline flex items-center gap-3 w-full py-3 px-6 ${activeTab === 'study-guides' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
              >
                <BiBook className="text-lg" /> Study Guides
              </Link>
              {/* Sidebar Category Tree - Now consumes data from context */}
              <SidebarCategoryTree
                onSelectCategory={setSelectedCategory} // Still needed for selection logic
                selectedCategoryId={selectedCategory?.id} // Still needed for highlighting
              />
            </li>
            {/* Media Library Link */}
            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'media' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin/media"
                className={`no-underline hover:no-underline flex items-center gap-3 w-full py-3 px-6 ${activeTab === 'media' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
              >
                <MdOutlinePermMedia className="text-lg" /> Media Library
              </Link>
            </li>
            {/* End Media Library Link */}

            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'quizzes' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin/quizzes"
                className={`no-underline hover:no-underline flex items-center gap-3 w-full py-3 px-6 ${activeTab === 'quizzes' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
              >
                <MdQuiz className="text-lg" /> Quizzes
              </Link>
            </li>
            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'results' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin/results"
                className={`no-underline hover:no-underline flex items-center gap-3 w-full py-3 px-6 ${activeTab === 'results' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
              >
                <BiBarChart className="text-lg" /> Results
              </Link>
            </li>
            <li
              className={`group cursor-pointer transition-colors ${activeTab === 'settings' ? 'bg-primary' : 'hover:bg-primary'}`}
            >
              <Link
                to="/admin/settings"
                className={`no-underline hover:no-underline flex items-center gap-3 w-full py-3 px-6 ${activeTab === 'settings' ? 'text-white' : 'text-slate-800 dark:text-white group-hover:text-white'}`}
              >
                <FiSettings className="text-lg" /> Settings
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 min-w-0 w-full overflow-y-auto h-[calc(100vh-73px)]">
          {/* Render the child routes */}
          <Outlet />
        </div>
      </div>
    </CategoryContext.Provider>
  );
};

export default AdminLayout;
