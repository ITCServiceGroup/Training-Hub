import React, { useState, useContext, useEffect, useCallback } from 'react'; // Added useEffect, useCallback
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
    if (path.includes('/admin/questions')) return 'questions';
    if (path.includes('/admin/quizzes')) return 'quizzes';
    if (path.includes('/admin/results')) return 'results';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  // Tailwind classes will be used instead of these style objects

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
      case 'media': return 'Media Library'; // Added media title
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
      <div className="flex min-h-[calc(100vh-64px)] overflow-hidden w-full m-0 p-0">
        <div className="w-[250px] bg-slate-800 text-white py-8 flex-shrink-0 mt-0">
          <ul className="list-none p-0 m-0">
            <li
              className={`py-3 px-6 cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
            >
              <Link
                to="/admin"
                className="text-white no-underline hover:text-white hover:no-underline flex items-center gap-3"
              >
                <MdDashboard className="text-lg" /> Dashboard
              </Link>
            </li>
            <li
              className={`py-3 px-6 cursor-pointer transition-colors ${activeTab === 'study-guides' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
            >
              <Link
                to="/admin/study-guides"
                className="text-white no-underline hover:text-white hover:no-underline flex items-center gap-3"
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
              className={`py-3 px-6 cursor-pointer transition-colors ${activeTab === 'media' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
            >
              <Link
                to="/admin/media"
                className="text-white no-underline hover:text-white hover:no-underline flex items-center gap-3"
              >
                <MdOutlinePermMedia className="text-lg" /> Media Library
              </Link>
            </li>
            {/* End Media Library Link */}
            <li
              className={`py-3 px-6 cursor-pointer transition-colors ${activeTab === 'questions' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
            >
              <Link
                to="/admin/questions"
                className="text-white no-underline hover:text-white hover:no-underline flex items-center gap-3"
              >
                <BsQuestionCircle className="text-lg" /> Questions
              </Link>
            </li>
            <li
              className={`py-3 px-6 cursor-pointer transition-colors ${activeTab === 'quizzes' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
            >
              <Link
                to="/admin/quizzes"
                className="text-white no-underline hover:text-white hover:no-underline flex items-center gap-3"
              >
                <MdQuiz className="text-lg" /> Quizzes
              </Link>
            </li>
            <li
              className={`py-3 px-6 cursor-pointer transition-colors ${activeTab === 'results' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
            >
              <Link
                to="/admin/results"
                className="text-white no-underline hover:text-white hover:no-underline flex items-center gap-3"
              >
                <BiBarChart className="text-lg" /> Results
              </Link>
            </li>
            <li
              className={`py-3 px-6 cursor-pointer transition-colors ${activeTab === 'settings' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
            >
              <Link
                to="/admin/settings"
                className="text-white no-underline hover:text-white hover:no-underline flex items-center gap-3"
              >
                <FiSettings className="text-lg" /> Settings
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex-1 p-4 bg-slate-50 min-w-0 w-full overflow-auto mt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[1.75rem] text-slate-900 m-0">
              {getPageTitle()}
            </h2>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold">
                {getInitials(user?.email)}
              </div>
              <div>
                <div className="font-bold">{user?.email || 'Administrator'}</div>
                <div className="text-xs text-slate-500">Admin</div>
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
