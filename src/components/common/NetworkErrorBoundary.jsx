import React from 'react';
import { useNetworkStatus } from '../../contexts/NetworkContext';

class NetworkErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a network-related error
    const isNetworkError = error && error.message && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('NetworkError') ||
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED')
    );

    if (isNetworkError) {
      console.log('[NETWORK ERROR BOUNDARY] Caught network error:', error.message);
      return { hasError: true };
    }

    // Log non-network errors but don't handle them
    console.log('[NETWORK ERROR BOUNDARY] Non-network error, letting it bubble up:', error);
    return null;
  }

  componentDidCatch(error, errorInfo) {
    const isNetworkError = error && error.message && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('NetworkError') ||
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED')
    );

    if (isNetworkError) {
      console.warn('[NETWORK ERROR BOUNDARY] Caught network error:', error.message);
      console.warn('Error details:', errorInfo);
      
      this.setState({
        error: error,
        errorInfo: errorInfo
      });

      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    } else {
      // Re-throw non-network errors so they can be caught by other error boundaries
      console.warn('[NETWORK ERROR BOUNDARY] Re-throwing non-network error:', error);
      throw error;
    }
  }

  retry = () => {
    console.log('[NETWORK ERROR BOUNDARY] Retrying...');
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  reloadPage = () => {
    console.log('[NETWORK ERROR BOUNDARY] Reloading page...');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <NetworkErrorFallback
          error={this.state.error}
          onRetry={this.retry}
          onReload={this.reloadPage}
          retryCount={this.state.retryCount}
        />
      );
    }

    return this.props.children;
  }
}

const NetworkErrorFallback = ({ error, onRetry, onReload, retryCount }) => {
  const { isOnline, reconnectCount } = useNetworkStatus();

  React.useEffect(() => {
    if (reconnectCount > 0 && retryCount < 3) {
      console.log('[NETWORK ERROR BOUNDARY] Network reconnected, auto-retrying...');
      setTimeout(() => {
        onRetry();
      }, 1000);
    }
  }, [reconnectCount, onRetry, retryCount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Connection Problem
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {!isOnline 
              ? "You're currently offline. The app will automatically retry when your connection is restored."
              : "There was a problem loading the app. This usually happens after your device goes to sleep."
            }
          </p>

          {/* Network status indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
              isOnline 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div className="space-y-3">
            {isOnline && (
              <button
                onClick={onRetry}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                Try Again
              </button>
            )}
            
            <button
              onClick={onReload}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              Reload Page
            </button>
          </div>

          {retryCount > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              Retry attempts: {retryCount}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const NetworkErrorBoundary = (props) => {
  return <NetworkErrorBoundaryClass {...props} />;
};

export default NetworkErrorBoundary;