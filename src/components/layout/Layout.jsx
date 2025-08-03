import React from 'react';
// Ensure useLocation is imported if not already
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useFullscreen } from '../../contexts/FullscreenContext';

const Layout = () => {
  const location = useLocation(); // Get location
  const { isFullscreen } = useFullscreen(); // Get fullscreen state
  const isAdminPage = location.pathname.startsWith('/admin'); // Check if admin page
  const isStudyGuidePage = location.pathname.startsWith('/study'); // Check if study guide page
  const isQuizPage = location.pathname.startsWith('/quiz'); // Check if quiz page

  return (
    <div className={`app-layout w-full flex flex-col ${isAdminPage || isStudyGuidePage || isFullscreen ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100`}>
      {!isFullscreen && <Header />}
      <main className={`main-content ${isAdminPage || isStudyGuidePage || isFullscreen ? 'flex-1 min-h-0' : 'flex-1'} flex flex-col w-full`}>
        {/* Apply padding conditionally - no padding for admin, study guide, or quiz pages */}
        <div
          className={`w-full ${isAdminPage || isStudyGuidePage || isFullscreen ? 'flex-1 min-h-0' : 'flex-1'} flex flex-col ${isAdminPage || isStudyGuidePage || isQuizPage || isFullscreen ? '' : 'p-8'}`}
          style={isStudyGuidePage || isQuizPage ? { overflow: 'visible !important' } : {}}
        >
          <Outlet />
        </div>
      </main>
      {!isFullscreen && <Footer />}
    </div>
  );
};

export default Layout;
