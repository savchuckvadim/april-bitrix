'use client';

import { cn } from '@workspace/ui/lib/utils';

interface AiFeedbackErrorProps {
    /** «Не сохранилось: …» (formatAiFeedbackError); null — ничего. */
    error: string | null;
    className?: string;
}

/** Короткая ошибка записи реакции рядом с кнопкой; повтор — тот же клик. */
export const AiFeedbackError = ({ error, className }: AiFeedbackErrorProps) =>
    error ? (
        <span
            role="alert"
            className={cn('text-[0.6875rem] text-destructive', className)}
        >
            {error}
        </span>
    ) : null;
