'use client';

import React from 'react';
import { logClient } from '../lib/helper/logClient';
 // логгер на клиенте

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    logClient('React ErrorBoundary', {
      error: error.toString(),
      // stack: errorInfo.componentStack,
    });
  }

  render() {
    // if (this.state.hasError) {
    //   return (
    //     <div style={{ padding: 32 }}>
    //       <h1>Произошла ошибка.</h1>
    //       <pre>{this.state.error?.message}</pre>
    //     </div>
    //   );
    // }

    return this.props.children;
  }
}
