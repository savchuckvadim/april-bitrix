'use client';
import { Provider } from 'react-redux';
import { store } from '../model/store';
import { ErrorBoundary } from './ErrorBoundary';
import { useEffect } from 'react';
import App from '../ui/App';

export function AppProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Отладочный доступ к стору из консоли браузера.
        if (typeof window !== 'undefined') {
            (window as any).store = store;
        }
    }, []);
    return (
        <Provider store={store}>
            <ErrorBoundary>
                <App>
                    {children}
                </App>
            </ErrorBoundary>
        </Provider>
    );
}
