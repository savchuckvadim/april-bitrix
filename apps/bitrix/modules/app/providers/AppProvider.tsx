'use client';
import { Provider } from 'react-redux';
import { store } from '../model/store';
import { ErrorBoundary } from './ErrorBoundary';
import App from '../ui/App';
import { useEffect } from 'react';

export function AppProvider({ children }: { children: React.ReactNode }) {
    console.log('AppProvider');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).store = store;
            console.log('store', (window as any).store);
        }
    }, []);
    return (
        <Provider store={store}>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </Provider>
    );
}
