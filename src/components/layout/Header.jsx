import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-teal-700 text-white py-4 shadow-md relative z-[100]">
      <div className="w-full px-6">
        <div className="flex justify-between items-center">
          {/* Logo - smaller on mobile */}
          <Link to="/" className="text-white no-underline text-xl md:text-2xl font-bold relative z-10">
            <h1 className="m-0">Training Hub</h1>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-teal-600 rounded-md transition-colors relative z-10"
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
                  className="inline-block text-white no-underline font-medium hover:bg-teal-600 hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/study"
                  className="inline-block text-white no-underline font-medium hover:bg-teal-600 hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors"
                >
                  Study Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="inline-block text-white no-underline font-medium hover:bg-teal-600 hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors"
                >
                  Quizzes
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/admin"
                      className="inline-block text-white no-underline font-medium hover:bg-teal-600 hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors"
                    >
                      Admin
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="inline-block bg-transparent border-none text-white cursor-pointer font-medium hover:bg-teal-600 hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="inline-block text-white no-underline font-medium hover:bg-teal-600 hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors"
                  >
                    Admin Login
                  </Link>
                </li>
              )}
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
          md:hidden fixed right-0 top-0 w-64 h-full bg-teal-700 shadow-lg
          transform transition-transform duration-300 ease-in-out z-[95]
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="pt-20 px-4">
          <nav>
            <ul className="list-none m-0 p-0 space-y-2">
              <li>
                <Link
                  to="/"
                  className="block text-white no-underline font-medium hover:bg-teal-600 px-3 py-3 rounded-md transition-colors"
                  onClick={handleMenuItemClick}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/study"
                  className="block text-white no-underline font-medium hover:bg-teal-600 px-3 py-3 rounded-md transition-colors"
                  onClick={handleMenuItemClick}
                >
                  Study Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="block text-white no-underline font-medium hover:bg-teal-600 px-3 py-3 rounded-md transition-colors"
                  onClick={handleMenuItemClick}
                >
                  Quizzes
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/admin"
                      className="block text-white no-underline font-medium hover:bg-teal-600 px-3 py-3 rounded-md transition-colors"
                      onClick={handleMenuItemClick}
                    >
                      Admin
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left bg-transparent border-none text-white cursor-pointer font-medium hover:bg-teal-600 px-3 py-3 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="block text-white no-underline font-medium hover:bg-teal-600 px-3 py-3 rounded-md transition-colors"
                    onClick={handleMenuItemClick}
                  >
                    Admin Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
