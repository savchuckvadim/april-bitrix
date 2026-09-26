'use client';

import { Button } from '@workspace/ui/components/button';
import { Preloader } from '@/modules/shared';
import type { AiStatus } from '@/modules/entities/ai-analytics';
import { aiSectionErrorHint } from '../../lib/ai-section-error.util';

export const AI_SECTION_ERROR_FALLBACK =
    'Не удалось получить данные AI-аналитики';

interface AiSectionStateProps {
    status: AiStatus;
    error: string | null;
    /** Текст под спиннером. */
    loadingText: string;
    /** Повтор запроса; без колбэка кнопки «Повторить» нет. */
    onRetry?: () => void;
    /** Запасной текст, если сервер не прислал сообщение. */
    fallbackError?: string;
}

/**
 * Состояния секции вкладки: idle/loading — спиннер с текстом; error — текст
 * сервера (403/400 из тела ответа), подсказка «что это значит» для типовых
 * случаев (витрина только руководителям, раздел выключен на портале) и
 * «Повторить»; ready — null.
 */
export const AiSectionState = ({
    status,
    error,
    loadingText,
    onRetry,
    fallbackError = AI_SECTION_ERROR_FALLBACK,
}: AiSectionStateProps) => {
    if (status === 'loading' || status === 'idle') {
        return (
            <div
                className="flex items-center justify-center gap-3 py-8 text-muted-foreground"
                aria-busy
            >
                <Preloader />
                <span className="text-sm">{loadingText}</span>
            </div>
        );
    }
    if (status === 'error') {
        const hint = aiSectionErrorHint(error);
        return (
            <div className="flex flex-col items-start gap-2 py-4" role="alert">
                <p className="text-sm text-destructive">
                    {error || fallbackError}
                </p>
                {hint && (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                )}
                {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        Повторить
                    </Button>
                )}
            </div>
        );
    }
    return null;
};
