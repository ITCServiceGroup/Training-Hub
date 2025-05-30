import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import { FiSun, FiMoon, FiSettings, FiLogOut } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';

const Header = () => {
  const { isAuthenticated, signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // Function to get the page title based on the current path
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/admin') return 'Admin Dashboard';
    if (path.includes('/admin/study-guides')) return 'Study Guides Management';
    if (path.includes('/admin/media')) return 'Media Library';
    if (path.includes('/admin/questions')) return 'Questions Management';
    if (path.includes('/admin/quizzes')) return 'Quizzes Management';
    if (path.includes('/admin/results')) return 'Quiz Results';
    if (path.includes('/admin/settings')) return 'Settings';

    return null; // Return null for non-admin pages
  };

  const pageTitle = getPageTitle();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  const getInitials = (email) => {
    if (!email) return 'A';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Add safety checks for event and event.target
      if (!event || !event.target) {
        return;
      }

      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-primary text-white py-4 shadow-md sticky top-0 z-[100]">
      <div className="w-full px-6">
        <div className="flex justify-between items-center">
          {/* Logo and page title */}
          <div className="flex items-center">
            <Link to="/" className="text-white no-underline text-xl md:text-2xl font-bold relative z-10">
              <h1 className="m-0">Training Hub</h1>
            </Link>
            {pageTitle && (
              <div className="ml-6 text-xl font-semibold border-l border-primary-dark dark:border-slate-600 pl-6">
                {pageTitle}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-primary-dark rounded-md transition-colors relative z-10"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex list-none m-0 p-0 gap-4 items-center">
              <li>
                <Link
                  to="/"
                  className="inline-block text-white no-underline font-medium hover:bg-primary-dark hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/study"
                  className="inline-block text-white no-underline font-medium hover:bg-primary-dark hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors"
                >
                  Study Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="inline-block text-white no-underline font-medium hover:bg-primary-dark hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors"
                >
                  Quizzes
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  {/* User Profile Dropdown */}
                  <li className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center gap-2 text-white hover:bg-primary-dark px-3 py-2 rounded-md transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-bold">
                        {getInitials(user?.email)}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{user?.email || 'Administrator'}</span>
                        <span className="text-xs text-slate-200">Admin</span>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-10 border border-slate-200 dark:border-slate-700">
                        <Link
                          to="/admin"
                          className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 no-underline"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <div className="flex items-center">
                            <MdDashboard className="mr-2 text-slate-700 dark:text-slate-200" />
                            <span className="text-slate-700 dark:text-slate-200">Admin Dashboard</span>
                          </div>
                        </Link>
                        <Link
                          to="/admin/settings"
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 no-underline"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <div className="flex items-center">
                            <FiSettings className="mr-2 text-slate-700 dark:text-slate-200" />
                            <span className="text-slate-700 dark:text-slate-200">Settings</span>
                          </div>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <div className="flex items-center">
                            <FiLogOut className="mr-2 text-slate-700 dark:text-slate-200" />
                            <span className="text-slate-700 dark:text-slate-200">Sign Out</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="inline-block text-white no-underline font-medium hover:bg-primary hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors"
                  >
                    Admin Login
                  </Link>
                </li>
              )}
              {/* Theme toggle button */}
              <li>
                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center p-2 text-primary bg-white dark:text-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md transition-colors"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      <div
        className={`
          md:hidden fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300
          ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          z-[90]
        `}
        onClick={() => setIsMenuOpen(false)}
      />
      <div
        className={`
          md:hidden fixed right-0 top-0 w-64 h-full bg-primary shadow-lg
          transform transition-transform duration-300 ease-in-out z-[95]
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="pt-20 px-4">
          {pageTitle && (
            <div className="mb-4 pb-3 border-b border-primary-dark dark:border-slate-700">
              <h2 className="text-xl font-semibold text-white">{pageTitle}</h2>
            </div>
          )}
          <nav>
            <ul className="list-none m-0 p-0 space-y-2">
              <li>
                <Link
                  to="/"
                  className="block text-white no-underline font-medium hover:bg-primary-dark px-3 py-3 rounded-md transition-colors"
                  onClick={handleMenuItemClick}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/study"
                  className="block text-white no-underline font-medium hover:bg-primary-dark px-3 py-3 rounded-md transition-colors"
                  onClick={handleMenuItemClick}
                >
                  Study Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="block text-white no-underline font-medium hover:bg-primary-dark px-3 py-3 rounded-md transition-colors"
                  onClick={handleMenuItemClick}
                >
                  Quizzes
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  {/* User info in mobile menu */}
                  <li className="mt-4 mb-2">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold">
                        {getInitials(user?.email)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user?.email || 'Administrator'}</div>
                        <div className="text-xs text-slate-200">Admin</div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link
                      to="/admin"
                      className="flex items-center text-white no-underline font-medium hover:bg-primary-dark hover:text-white px-3 py-3 rounded-md transition-colors"
                      onClick={handleMenuItemClick}
                    >
                      <MdDashboard className="mr-2" />
                      Admin Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/settings"
                      className="flex items-center text-white no-underline font-medium hover:bg-primary-dark hover:text-white px-3 py-3 rounded-md transition-colors"
                      onClick={handleMenuItemClick}
                    >
                      <FiSettings className="mr-2" />
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center text-left bg-transparent border-none text-white cursor-pointer font-medium hover:bg-primary-dark px-3 py-3 rounded-md transition-colors"
                    >
                      <FiLogOut className="mr-2" />
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="block text-white no-underline font-medium hover:bg-primary-dark px-3 py-3 rounded-md transition-colors"
                    onClick={handleMenuItemClick}
                  >
                    Admin Login
                  </Link>
                </li>
              )}
              {/* Theme toggle button */}
              <li className="mt-4">
                <button
                  onClick={toggleTheme}
                  className="flex items-center w-full text-white font-medium hover:bg-primary dark:hover:bg-slate-700 px-3 py-3 rounded-md transition-colors"
                >
                  <span className="mr-2">
                    {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
                  </span>
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
