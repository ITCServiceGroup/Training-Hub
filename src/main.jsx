import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css'; // Moved CSS import before App
import './form-overrides.css'; // Import custom form styles after index.css
import App from './App';

// Configure base URL for GitHub Pages deployment
const basename = import.meta.env.BASE_URL === '/' ? '/' : '';
import { AuthProvider } from './contexts/AuthContext';
import { RBACProvider } from './contexts/RBACContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DashboardPreferencesProvider } from './contexts/DashboardPreferencesContext';
import { FullscreenProvider } from './contexts/FullscreenContext';
import { ToastProvider } from './components/common/ToastContainer';
import { NetworkProvider } from './contexts/NetworkContext';
import AppErrorBoundary from './components/common/AppErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Training Hub root element was not found');

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HashRouter
        basename={basename}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AppErrorBoundary>
          <AuthProvider>
            <RBACProvider>
              <ThemeProvider>
                <DashboardPreferencesProvider>
                  <FullscreenProvider>
                    <NetworkProvider>
                      <ToastProvider>
                        <App />
                      </ToastProvider>
                    </NetworkProvider>
                  </FullscreenProvider>
                </DashboardPreferencesProvider>
              </ThemeProvider>
            </RBACProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </HashRouter>
    </React.StrictMode>
);
