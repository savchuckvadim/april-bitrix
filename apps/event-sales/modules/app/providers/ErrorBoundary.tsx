'use client';

import React from 'react';
import { logClient } from '../lib/helper/logClient';
import { ErrorPage } from '@/modules/pages';
import { errorHandler } from '../lib/error-handler';
// логгер на клиенте

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * «ResizeObserver loop …» — предупреждение спецификации, а не ошибка: браузер
 * сообщает, что наблюдатель размеров не успел за один кадр. Ловить его
 * экраном ошибки нельзя.
 */
const isResizeObserverNoise = (event: ErrorEvent): boolean =>
    !event.error && /ResizeObserver loop/i.test(event.message ?? '');

export class ErrorBoundary extends React.Component<Props, State> {
    private unsubscribe?: () => void;
    private unsubscribeCritical?: () => void;

    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    componentDidMount() {
        // Отлавливаем глобальные ошибки
        window.addEventListener('error', this.handleGlobalError);
        window.addEventListener(
            'unhandledrejection',
            this.handleUnhandledRejection,
        );

        // Подписываемся на критические ошибки из ErrorHandler
        this.unsubscribeCritical = errorHandler.subscribeToCriticalErrors(
            this.handleCriticalError,
        );
    }

    componentWillUnmount() {
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener(
            'unhandledrejection',
            this.handleUnhandledRejection,
        );

        // Отписываемся от ErrorHandler
        if (this.unsubscribeCritical) {
            this.unsubscribeCritical();
        }
    }

    handleGlobalError = (event: ErrorEvent) => {
        // Шум браузера, а не поломка приложения: сообщение о том, что цикл
        // ResizeObserver не уложился в кадр. Прилетает от стеклянных
        // поверхностей и выпадающих списков (они меряют себя на открытии),
        // приходит БЕЗ error-объекта — и роняло весь экран в «Что-то пошло
        // не так» ровно в момент выбора контакта.
        if (isResizeObserverNoise(event)) return;

        console.error('Global error caught:', event.error);
        this.setState({
            hasError: true,
            error: event.error || new Error(event.message),
            errorInfo: null,
        });
    };

    handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error('Unhandled promise rejection:', event.reason);
        this.setState({
            hasError: true,
            error:
                event.reason instanceof Error
                    ? event.reason
                    : new Error(String(event.reason)),
            errorInfo: null,
        });
    };

    handleCriticalError = (error: Error) => {
        console.error('Critical error from ErrorHandler:', error);
        this.setState({
            hasError: true,
            error,
            errorInfo: null,
        });
    };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ error, errorInfo });
        logClient('React ErrorBoundary', {
            error: error.toString(),
            stack: errorInfo.componentStack,
        });
    }

    resetError = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorPage
                    error={this.state.error || undefined}
                    resetError={this.resetError}
                />
            );
        }

        return this.props.children;
    }
}
