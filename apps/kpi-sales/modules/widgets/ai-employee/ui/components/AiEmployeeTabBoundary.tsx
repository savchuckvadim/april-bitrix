'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { SectionCard } from '@workspace/april-ui';
import { logClient } from '@/modules/app/lib/helper/logClient';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';

interface AiEmployeeTabBoundaryProps {
    /** Код подвкладки — в журнал; смена подвкладки сбрасывает ошибку (key). */
    tab: string;
    children: ReactNode;
}

interface AiEmployeeTabBoundaryState {
    error: Error | null;
}

const T = AI_EMPLOYEE_TEXT.tabError;

/**
 * Ошибка одной подвкладки не роняет приложение целиком (05.11.2026:
 * «Обратная связь» давала белый экран «Application error», а консоль
 * фрейма Битрикса снаружи не видна): вместо подвкладки — карточка «не
 * открылась» с подробностями для разработчика, ошибка уходит в журнал
 * клиента. Остальные подвкладки работают.
 */
export class AiEmployeeTabBoundary extends Component<
    AiEmployeeTabBoundaryProps,
    AiEmployeeTabBoundaryState
> {
    state: AiEmployeeTabBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): AiEmployeeTabBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        void logClient(
            {
                title: 'AI: подвкладка сотрудника не открылась',
                level: 'error',
                context: `ai-employee:${this.props.tab}`,
                message: error.message,
                domain: typeof window === 'undefined' ? '' : window.location.host,
                userId: undefined,
            },
            { stack: error.stack ?? null, componentStack: info.componentStack ?? null },
        );
    }

    render(): ReactNode {
        const { error } = this.state;
        if (!error) return this.props.children;
        return (
            <SectionCard surface="glass" title={T.title} description={T.description}>
                <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer">{T.details}</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words">{error.message}</pre>
                </details>
            </SectionCard>
        );
    }
}
