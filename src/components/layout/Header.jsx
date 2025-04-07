import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-teal-700 text-white py-4 shadow-md">
      <div className="w-full px-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-white no-underline text-2xl font-bold">
            <h1 className="m-0 text-2xl">Training Hub</h1>
          </Link>

          <nav>
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
    </header>
  );
};

export default Header;
