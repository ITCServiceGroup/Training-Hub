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

          <nav className="flex">
            <ul className="flex list-none m-0 p-0">
              <li className="ml-6">
                <Link to="/" className="text-white no-underline font-medium">Home</Link>
              </li>
              <li className="ml-6">
                <Link to="/study" className="text-white no-underline font-medium">Study Guides</Link>
              </li>
              <li className="ml-6">
                <Link to="/quiz" className="text-white no-underline font-medium">Quizzes</Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li className="ml-6">
                    <Link to="/admin" className="text-white no-underline font-medium">Admin</Link>
                  </li>
                  <li className="ml-6">
                    <button className="bg-transparent border-none text-white cursor-pointer font-medium p-0" onClick={handleSignOut}>
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li className="ml-6">
                  <Link to="/login" className="text-white no-underline font-medium">Admin Login</Link>
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
