'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/observability/logger';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.critical('GlobalErrorBoundary', 'Uncaught component exception detected.', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[200px] w-full flex flex-col items-center justify-center p-8 bg-black/40 border border-red-500/30 rounded-lg backdrop-blur-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-2">Tactical System Interruption</h2>
          <p className="text-gray-400 text-center text-sm mb-6 max-w-md">
            The application encountered a critical runtime exception. 
            Telemetry logs have been updated for audit.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-all duration-300 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Re-initialize Interface
          </button>
          <div className="mt-8 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
            Audit ID: {Date.now().toString(36).toUpperCase()}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
