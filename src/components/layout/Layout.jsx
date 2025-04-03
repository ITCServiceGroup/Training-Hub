import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isStudyGuidePage = location.pathname.includes('/study/');

  return (
    <div className="app-layout w-full flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-1 flex flex-col w-full">
        <div className="w-full flex-1 flex flex-col px-0">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
