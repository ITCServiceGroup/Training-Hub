import React from 'react';
// Ensure useLocation is imported if not already
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation(); // Get location
  const isAdminPage = location.pathname.startsWith('/admin'); // Check if admin page
  const isStudyGuidePage = location.pathname.startsWith('/study'); // Check if study guide page

  return (
    <div className="app-layout w-full flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <Header />
      <main className="main-content flex-1 flex flex-col w-full">
        {/* Apply padding conditionally - no padding for admin or study guide pages */}
        <div
          className={`w-full flex-1 flex flex-col ${isAdminPage || isStudyGuidePage ? '' : 'p-8'}`}
          style={isStudyGuidePage ? { overflow: 'visible !important' } : {}}
        >
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
