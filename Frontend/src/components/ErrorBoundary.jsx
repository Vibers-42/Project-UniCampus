/**
 * @file ErrorBoundary.jsx — Global React Error Boundary
 *
 * Catches any uncaught render/lifecycle error in the component tree below it.
 * Without this, a single component crash causes a completely blank white screen.
 *
 * Placement: wraps the entire <App /> in main.jsx.
 * Must be a class component — React error boundaries cannot be function components.
 */

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Navigate to dashboard as the safest recovery point
    window.location.href = '/dashboard';
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env.DEV;

    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-dark-900 border border-red-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-dark-100 mb-1">Something went wrong</h1>
          <p className="text-dark-400 text-sm mb-6">
            UniCampus encountered an unexpected error. Your data is safe.
          </p>

          {isDev && this.state.error && (
            <details className="mb-5">
              <summary className="text-xs text-red-400 font-mono cursor-pointer mb-2 select-none">
                Error details (dev only)
              </summary>
              <pre className="text-xs text-red-300 bg-dark-950 border border-red-500/20 rounded-xl
                p-3 overflow-auto max-h-48 font-mono whitespace-pre-wrap break-all">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => this.handleReset()}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white
                font-semibold rounded-xl transition-colors text-sm"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 bg-dark-800 hover:bg-dark-700 text-dark-200
                font-semibold rounded-xl transition-colors text-sm border border-dark-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
