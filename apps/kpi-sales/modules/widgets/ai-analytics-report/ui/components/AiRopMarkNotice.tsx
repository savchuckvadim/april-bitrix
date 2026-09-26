'use client';

import type { ReactNode } from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { AiReadOnlyHint } from './AiReadOnlyHint';

interface AiRopMarkNoticeProps {
    text: string;
    /** Ошибка: красный текст и role="alert" (текст сервера как есть). */
    error?: boolean;
    /** Кнопка действия; без подписи или колбэка — только текст. */
    actionLabel?: string;
    actionIcon?: ReactNode;
    onAction?: () => void;
    actionDisabled?: boolean;
    /** Почему действие недоступно (режим «Смотреть как…»); null — доступно. */
    actionHint?: string | null;
}

/**
 * Строка состояния карточки слепой оценки: «подбора нет», «звонков для
 * оценки пока нет», ошибка сервера — и одна кнопка действия рядом.
 */
export const AiRopMarkNotice = ({
    text,
    error = false,
    actionLabel,
    actionIcon,
    onAction,
    actionDisabled = false,
    actionHint = null,
}: AiRopMarkNoticeProps) => (
    <div
        className="flex flex-wrap items-center gap-3 py-2"
        role={error ? 'alert' : undefined}
    >
        <p
            className={cn(
                'text-sm',
                error ? 'text-destructive' : 'text-muted-foreground',
            )}
        >
            {text}
        </p>
        {actionLabel && onAction && (
            <AiReadOnlyHint hint={actionHint}>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={actionDisabled || actionHint !== null}
                    onClick={onAction}
                >
                    {actionIcon}
                    {actionLabel}
                </Button>
            </AiReadOnlyHint>
        )}
    </div>
);
