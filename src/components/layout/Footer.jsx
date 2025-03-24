import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Inline styles to ensure proper rendering
  const footerStyles = {
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    padding: '1.5rem 0',
    marginTop: '2rem'
  };
  
  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };
  
  const footerContentStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  };
  
  const copyrightStyles = {
    margin: '0',
    color: '#64748b'
  };
  
  const linksStyles = {
    display: 'flex',
    gap: '1.5rem'
  };
  
  const linkStyles = {
    color: '#0f766e',
    textDecoration: 'none'
  };
  
  return (
    <footer style={footerStyles}>
      <div style={containerStyles}>
        <div style={footerContentStyles}>
          <p style={copyrightStyles}>&copy; {currentYear} Training Hub. All rights reserved.</p>
          <div style={linksStyles}>
            <a href="#" onClick={(e) => e.preventDefault()} style={linkStyles}>Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()} style={linkStyles}>Terms of Service</a>
            <a href="#" onClick={(e) => e.preventDefault()} style={linkStyles}>Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
