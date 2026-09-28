'use client';

import { MicroSkeleton, Spinner } from '@workspace/april-ui';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import {
    AI_JOB_STATUS_LABELS,
    aiUserErrorText,
    type AiJobStatus,
    type AiStatus,
} from '@/modules/entities/ai-analytics';
import { aiSectionErrorHint } from '../../lib/ai-section-error.util';

export const AI_QUEUED_ERROR_FALLBACK = 'Ошибка расчёта обзора';

interface AiQueuedStateProps {
    status: AiStatus;
    /** queued — «запрос в очереди…», processing — «сервер считает…». */
    jobStatus: AiJobStatus;
    error: string | null;
    /** Текст рядом со спиннером, пока считается. */
    loadingText: string;
    /** Сколько строк-скелетонов рисовать под спиннером. */
    skeletonRows?: number;
    /** Текст ошибки, когда сервер причины понятно не назвал (по умолчанию — про обзор). */
    errorFallback?: string;
    /** Повтор с force; без колбэка кнопки «Повторить» нет. */
    onRetry?: () => void;
}

/**
 * Состояния тяжёлой секции: idle/loading — скелетоны со спиннером и
 * человеческим текстом очереди («в очереди» / «считает»), error — Alert
 * с текстом сервера (служебный заменяется запасным), подсказкой для
 * типовых отказов доступа и «Повторить»; ready — null.
 */
export const AiQueuedState = ({
    status,
    jobStatus,
    error,
    loadingText,
    skeletonRows = 4,
    errorFallback = AI_QUEUED_ERROR_FALLBACK,
    onRetry,
}: AiQueuedStateProps) => {
    if (status === 'loading' || status === 'idle') {
        return (
            <div className="space-y-3 py-2" aria-busy>
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Spinner size="sm" />
                    <span className="text-sm">
                        {loadingText}
                        {jobStatus && (
                            <span className="ml-1 text-xs">
                                ({AI_JOB_STATUS_LABELS[jobStatus]})
                            </span>
                        )}
                    </span>
                </div>
                <div className="space-y-2">
                    {Array.from({ length: skeletonRows }, (_, index) => (
                        <MicroSkeleton key={index} className="h-6 w-full" />
                    ))}
                </div>
            </div>
        );
    }
    if (status === 'error') {
        const hint = aiSectionErrorHint(error);
        return (
            <Alert variant="destructive" className="my-2">
                <AlertTitle>Не удалось получить данные</AlertTitle>
                <AlertDescription className="flex flex-col items-start gap-2">
                    <span>{aiUserErrorText(error, errorFallback)}</span>
                    {hint && (
                        <span className="text-xs text-muted-foreground">
                            {hint}
                        </span>
                    )}
                    {onRetry && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={onRetry}
                        >
                            Повторить
                        </Button>
                    )}
                </AlertDescription>
            </Alert>
        );
    }
    return null;
};
