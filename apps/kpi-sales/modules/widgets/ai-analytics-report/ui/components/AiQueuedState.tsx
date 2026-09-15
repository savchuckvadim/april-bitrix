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
    type AiJobStatus,
    type AiStatus,
} from '@/modules/entities/ai-analytics';

interface AiQueuedStateProps {
    status: AiStatus;
    jobStatus: AiJobStatus;
    error: string | null;
    /** Текст рядом со спиннером, пока считается. */
    loadingText: string;
    /** Сколько строк-скелетонов рисовать под спиннером. */
    skeletonRows?: number;
    onRetry: () => void;
}

/**
 * Состояния тяжёлой секции: idle/loading — скелетоны со спиннером и
 * текстом («в очереди» / «считает»), error — Alert с сообщением и
 * «Повторить»; ready — null.
 */
export const AiQueuedState = ({
    status,
    jobStatus,
    error,
    loadingText,
    skeletonRows = 4,
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
        return (
            <Alert variant="destructive" className="my-2">
                <AlertTitle>Не удалось получить данные</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-3">
                    <span>{error || 'Ошибка расчёта обзора'}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={onRetry}
                    >
                        Повторить
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }
    return null;
};
