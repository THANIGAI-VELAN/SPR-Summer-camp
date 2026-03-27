import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorData;
      try {
        if (this.state.error?.message) {
          errorData = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 text-zinc-50">
          <div className="max-w-md w-full bg-zinc-900 border border-red-900/50 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-red-500">Something went wrong</h2>
            <p className="text-zinc-400">
              {errorData ? 'A database permission error occurred.' : this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            {errorData && (
              <div className="bg-zinc-950 p-4 rounded text-xs font-mono text-zinc-300 overflow-auto">
                <p>Operation: {errorData.operationType}</p>
                <p>Path: {errorData.path}</p>
                <p>Error: {errorData.error}</p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-50 font-medium py-2 px-4 rounded transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
