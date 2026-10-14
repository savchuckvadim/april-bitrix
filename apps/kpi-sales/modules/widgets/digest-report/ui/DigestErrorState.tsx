'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface DigestErrorStateProps {
    message: string | null;
    onRetry: () => void;
}

/** Расчёт упал: текст ошибки и повтор с forceRefresh. */
export const DigestErrorState = ({ message, onRetry }: DigestErrorStateProps) => (
    <div className="flex flex-col items-start gap-3 py-6">
        <p className="text-sm text-destructive">
            {message || 'Не удалось собрать дайджест дня'}
        </p>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onRetry}>
            <RefreshCw className="h-3 w-3" />
            Пересчитать
        </Button>
    </div>
);
