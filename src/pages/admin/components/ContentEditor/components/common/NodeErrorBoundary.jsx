import React from 'react';

/**
 * Error boundary specifically designed to catch and handle Craft.js node-related errors
 * such as "Node does not exist, it may have been removed"
 */
class NodeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a node-related error
    const isNodeError = error.message && (
      error.message.includes('Node does not exist') ||
      error.message.includes('Invariant failed') ||
      error.message.includes('useNode')
    );

    if (isNodeError) {
      return { hasError: true };
    }

    // For non-node errors, let them bubble up
    return null;
  }

  componentDidCatch(error, errorInfo) {
    const isNodeError = error.message && (
      error.message.includes('Node does not exist') ||
      error.message.includes('Invariant failed') ||
      error.message.includes('useNode')
    );

    if (isNodeError) {
      console.warn('NodeErrorBoundary caught a node-related error:', error.message);
      console.warn('Error details:', errorInfo);
      
      this.setState({
        error: error,
        errorInfo: errorInfo
      });

      // Optionally report to error tracking service
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    } else {
      // Re-throw non-node errors
      throw error;
    }
  }

  componentDidUpdate(prevProps) {
    // Reset error state if the component key changes (indicating a new component instance)
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI for node errors
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback - render nothing to avoid breaking the layout
      return null;
    }

    return this.props.children;
  }
}

export default NodeErrorBoundary;
