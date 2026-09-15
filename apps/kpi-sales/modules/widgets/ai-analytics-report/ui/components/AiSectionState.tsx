'use client';

import { Button } from '@workspace/ui/components/button';
import { Preloader } from '@/modules/shared';
import type { AiStatus } from '@/modules/entities/ai-analytics';

interface AiSectionStateProps {
    status: AiStatus;
    error: string | null;
    /** Текст под спиннером. */
    loadingText: string;
    onRetry: () => void;
}

/** Состояния секции вкладки: загрузка / ошибка с повтором; ready — null. */
export const AiSectionState = ({
    status,
    error,
    loadingText,
    onRetry,
}: AiSectionStateProps) => {
    if (status === 'loading' || status === 'idle') {
        return (
            <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
                <Preloader />
                <span className="text-sm">{loadingText}</span>
            </div>
        );
    }
    if (status === 'error') {
        return (
            <div className="flex flex-col items-start gap-2 py-4">
                <p className="text-sm text-destructive">
                    {error || 'Не удалось получить данные AI-аналитики'}
                </p>
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Повторить
                </Button>
            </div>
        );
    }
    return null;
};
