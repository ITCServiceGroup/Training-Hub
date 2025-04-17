import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css'; // Moved CSS import before App
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './utils/debugHelper';

console.log('Main.jsx is executing...');
console.log('Looking for root element:', document.getElementById('root'));

// Wrap in a try-catch to gracefully handle any auth context errors
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HashRouter>
        <AuthProvider>
          <ThemeProvider>
            <App />
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
      <HashRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HashRouter>
    </React.StrictMode>
  );
  console.log('React app has been rendered WITHOUT Auth Context (fallback)');
}
