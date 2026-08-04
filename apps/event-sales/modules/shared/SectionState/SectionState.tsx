'use client';

import { FC, ReactNode } from 'react';
import { Button } from '@workspace/ui/components/button';

export type SectionStatus = 'idle' | 'loading' | 'ready' | 'error';

interface SectionStateProps {
    status: SectionStatus;
    /** Есть ли что показывать при статусе ready. */
    isEmpty: boolean;
    /** Текст пустого состояния — у каждой секции он свой. */
    emptyText: string;
    /** Текст ошибки, если у секции он должен быть особым. */
    errorText?: string;
    onRetry?: () => void;
    children: ReactNode;
}

/**
 * Три состояния секции одним местом: грузится, не загрузилось, пусто.
 *
 * Пустое и «не загрузилось» специально разведены. У клиента, с которым только
 * начали работать, связей и истории может не быть вообще — и это нормальная
 * картина, а не сбой. Показывать в обоих случаях одно и то же значит либо
 * пугать менеджера там, где всё в порядке, либо прятать реальную ошибку.
 */
export const SectionState: FC<SectionStateProps> = ({
    status,
    isEmpty,
    emptyText,
    errorText,
    onRetry,
    children,
}) => {
    if (status === 'loading' || status === 'idle') {
        return (
            <div className="space-y-2" aria-busy>
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-12 animate-pulse rounded-md bg-muted"
                    />
                ))}
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="space-y-2">
                <p className="text-sm text-destructive">
                    {errorText ??
                        'Не удалось загрузить — портал не ответил. Данные не потеряны.'}
                </p>
                {onRetry && (
                    <Button size="sm" variant="outline" onClick={onRetry}>
                        Повторить
                    </Button>
                )}
            </div>
        );
    }

    if (isEmpty) {
        return <p className="text-sm text-muted-foreground">{emptyText}</p>;
    }

    return <>{children}</>;
};
