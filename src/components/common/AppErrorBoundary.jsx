import React from "react";
import {
  createCorrelationId,
  reportSafeError,
} from "../../utils/safeTelemetry";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, correlationId: null };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
      correlationId: createCorrelationId(),
    };
  }

  componentDidCatch(error, errorInfo) {
    void errorInfo;
    reportSafeError(
      "application.render_failure",
      error,
      this.state.correlationId,
    );
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 dark:bg-slate-900 dark:text-white">
        <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-2xl font-semibold">
            Training Hub could not load
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Your work has not been submitted. Reload the page to try again.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Reference: {this.state.correlationId}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reload Training Hub
          </button>
        </div>
      </main>
    );
  }
}

export default AppErrorBoundary;
