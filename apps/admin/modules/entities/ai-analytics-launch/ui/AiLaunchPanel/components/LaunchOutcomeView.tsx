'use client';

import { cn } from '@workspace/ui/lib/utils';
import { LAUNCH_TEXT } from '../../../consts/ai-analytics-launch.const';
import type { LaunchOutcome } from '../../../model';

interface LaunchOutcomeViewProps {
    outcome?: LaunchOutcome | null;
    error?: string | null;
}

/** JSON ответа для «подробнее»; несериализуемое — пусто. */
const formatRaw = (raw: unknown): string => {
    try {
        return JSON.stringify(raw, null, 2) ?? '';
    } catch {
        return '';
    }
};

/**
 * Итог нажатия: человеческий текст, «что дальше» и ответ сервера под
 * «подробнее». Ошибка — красным, с кодом ответа.
 */
export const LaunchOutcomeView = ({
    outcome,
    error,
}: LaunchOutcomeViewProps) => {
    if (error) {
        return (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <p className="font-medium text-destructive">
                    {LAUNCH_TEXT.errorTitle}
                </p>
                <p className="mt-1">{error}</p>
            </div>
        );
    }
    if (!outcome) return null;
    const raw = outcome.raw === undefined ? '' : formatRaw(outcome.raw);
    return (
        <div
            className={cn(
                'space-y-2 rounded-md border p-3 text-sm',
                outcome.ok
                    ? 'border-success/40 bg-success/5'
                    : 'border-warning/50 bg-warning/5',
            )}
        >
            <p>{outcome.text}</p>
            {outcome.next && (
                <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                        {LAUNCH_TEXT.nextPrefix}
                    </span>{' '}
                    {outcome.next}
                </p>
            )}
            {raw && (
                <details>
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                        {LAUNCH_TEXT.details}
                    </summary>
                    <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2 text-xs">
                        {raw}
                    </pre>
                </details>
            )}
        </div>
    );
};
