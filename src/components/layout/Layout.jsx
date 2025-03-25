import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="app-layout" style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main className="main-content" style={{ flex: 1 }}>
        <div className="container" style={{ maxWidth: '1600px', margin: '0 auto', padding: window.location.pathname.startsWith('/admin') ? '0' : '0 1rem' }}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
