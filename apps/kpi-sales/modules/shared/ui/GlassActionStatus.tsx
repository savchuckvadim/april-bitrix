'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export type GlassActionStatusKind = 'progress' | 'success' | 'error';

interface GlassActionStatusProps {
    status: GlassActionStatusKind;
    title: string;
    /** Пояснение под заголовком (например «может занять до минуты»). */
    description?: string;
    /** Текст ошибки (при status='error'). */
    error?: string | null;
    /** Кнопки действий под статусом (Готово / Назад и т.п.). */
    actions?: React.ReactNode;
}

/**
 * Статус долгой операции внутри стеклянного диалога (паттерн создания
 * публичной ссылки): отправили → крутится индикатор с пояснением →
 * успех/ошибка с действиями. Переиспользуемый для любых диалогов.
 */
export const GlassActionStatus: React.FC<GlassActionStatusProps> = ({
    status,
    title,
    description,
    error,
    actions,
}) => (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
        {status === 'progress' && (
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        )}
        {status === 'success' && (
            <CheckCircle2 className="h-10 w-10 text-success" />
        )}
        {status === 'error' && (
            <AlertCircle className="h-10 w-10 text-destructive" />
        )}
        <p className="text-lg font-semibold">{title}</p>
        {description && (
            <p className="max-w-sm text-sm text-muted-foreground">
                {description}
            </p>
        )}
        {status === 'error' && error && (
            <p className="max-w-sm rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
            </p>
        )}
        {actions && (
            <div className="mt-2 flex items-center gap-2">{actions}</div>
        )}
    </div>
);
