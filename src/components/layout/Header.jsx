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

  // Inline styles to ensure proper rendering
  const headerStyles = {
    backgroundColor: '#0f766e',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const headerContentStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const logoStyles = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  };

  const navStyles = {
    display: 'flex'
  };

  const ulStyles = {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0
  };

  const liStyles = {
    marginLeft: '1.5rem'
  };

  const linkStyles = {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500'
  };

  const buttonStyles = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '500',
    padding: 0
  };

  return (
    <header style={headerStyles}>
      <div style={containerStyles}>
        <div style={headerContentStyles}>
          <Link to="/" style={logoStyles}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Training Hub</h1>
          </Link>
          
          <nav style={navStyles}>
            <ul style={ulStyles}>
              <li style={liStyles}>
                <Link to="/" style={linkStyles}>Home</Link>
              </li>
              <li style={liStyles}>
                <Link to="/study" style={linkStyles}>Study Guides</Link>
              </li>
              <li style={liStyles}>
                <Link to="/quiz" style={linkStyles}>Quizzes</Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li style={liStyles}>
                    <Link to="/admin" style={linkStyles}>Admin</Link>
                  </li>
                  <li style={liStyles}>
                    <button style={buttonStyles} onClick={handleSignOut}>
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li style={liStyles}>
                  <Link to="/login" style={linkStyles}>Admin Login</Link>
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
