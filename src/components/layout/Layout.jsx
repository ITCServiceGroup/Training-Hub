import React from 'react';
// Ensure useLocation is imported if not already
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation(); // Get location
  const isAdminPage = location.pathname.startsWith('/admin'); // Check if admin page
  // isStudyGuidePage check seems unused here, can be removed if not needed elsewhere in this file
  // const isStudyGuidePage = location.pathname.includes('/study/');

  return (
    <div className="app-layout w-full flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-1 flex flex-col w-full">
        {/* Apply padding conditionally based on whether it's an admin page */}
        <div className={`w-full flex-1 flex flex-col ${isAdminPage ? 'p-0' : 'px-8 pt-8 pb-4'}`}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
