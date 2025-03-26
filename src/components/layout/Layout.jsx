import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <div className="app-layout" style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div className="container" style={{ 
          width: '100%', 
          maxWidth: isAdminPage ? 'none' : '1600px',
          margin: isAdminPage ? '0' : '0 auto',
          padding: isAdminPage ? '0' : '0 1rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
