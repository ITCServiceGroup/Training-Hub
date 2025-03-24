import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import './utils/debugHelper';

console.log('Main.jsx is executing...');
console.log('Looking for root element:', document.getElementById('root'));

// Wrap in a try-catch to gracefully handle any auth context errors
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HashRouter>
        <AuthProvider>
          <App />
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
        <App />
      </HashRouter>
    </React.StrictMode>
  );
  console.log('React app has been rendered WITHOUT Auth Context (fallback)');
}
