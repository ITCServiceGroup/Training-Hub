import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css'; // Moved CSS import before App
import './form-overrides.css'; // Import custom form styles after index.css
import App from './App';

// Configure base URL for GitHub Pages deployment
const basename = import.meta.env.BASE_URL === '/' ? '/' : '';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/common/ToastContainer';
import './utils/debugHelper';

console.log('Main.jsx is executing...');
console.log('Looking for root element:', document.getElementById('root'));

// Wrap in a try-catch to gracefully handle any auth context errors
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HashRouter
        basename={basename}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </HashRouter>
    </React.StrictMode>
  );
  console.log('React app has been rendered with Auth Context!');
} catch (error) {
  console.error('Error rendering with Auth Context:', error);

  // Fallback to render without AuthProvider if there's an error
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HashRouter
        basename={basename}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </HashRouter>
    </React.StrictMode>
  );
  console.log('React app has been rendered WITHOUT Auth Context (fallback)');
}
