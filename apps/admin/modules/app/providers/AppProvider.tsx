'use client';
import { Provider } from 'react-redux';
import { store } from '../model/store';
import { ErrorBoundary } from './ErrorBoundary';
import { useEffect } from 'react';
import App from '../ui/App';

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
                <App>
                    {children}
                </App>
            </ErrorBoundary>
        </Provider>
    );
}
