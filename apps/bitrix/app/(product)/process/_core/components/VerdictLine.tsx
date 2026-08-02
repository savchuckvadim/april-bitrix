'use client';

import type { FC, ElementType } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { ProcessVerdict, VerdictTone } from '../copy/verdict';

const TONE_ICON: Record<VerdictTone, ElementType> = {
    success: CheckCircle2,
    warning: AlertTriangle,
    destructive: XCircle,
};

const TONE_CLASS: Record<VerdictTone, string> = {
    success: 'border-success/40 bg-success/10 text-success',
    warning: 'border-warning/40 bg-warning/10 text-warning',
    destructive: 'border-destructive/40 bg-destructive/10 text-destructive',
};

export interface VerdictLineProps {
    verdict: ProcessVerdict;
    /** Компактный режим для вида без скролла: только заголовок и рабочее место. */
    compact?: boolean;
    className?: string;
}

/**
 * Вердикт по текущей конфигурации: что получилось, где работает менеджер и
 * чем за это приходится платить. Цена берётся дословно из документации —
 * страница не продаёт схему, а показывает её как есть.
 */
export const VerdictLine: FC<VerdictLineProps> = ({
    verdict,
    compact = false,
    className,
}) => {
    const Icon = TONE_ICON[verdict.tone];

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                'rounded-xl border px-4 py-3',
                TONE_CLASS[verdict.tone],
                className,
            )}
        >
            <p className="flex items-start gap-2 font-semibold text-balance">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {verdict.headline}
            </p>

            <p className="text-foreground/80 mt-1.5 pl-6 text-sm leading-snug">
                {verdict.workplace}
            </p>

            {!compact &&
                (verdict.gain.length > 0 || verdict.price.length > 0) && (
                    <dl className="mt-3 grid gap-3 pl-6 sm:grid-cols-2">
                        {verdict.gain.length > 0 && (
                            <div>
                                <dt className="text-success text-xs font-bold tracking-widest uppercase">
                                    Что выигрываем
                                </dt>
                                <dd className="text-foreground/80 mt-1 space-y-1 text-xs leading-snug">
                                    {verdict.gain.map(item => (
                                        <p key={item}>{item}</p>
                                    ))}
                                </dd>
                            </div>
                        )}

                        {verdict.price.length > 0 && (
                            <div>
                                <dt className="text-warning text-xs font-bold tracking-widest uppercase">
                                    Чем платим
                                </dt>
                                <dd className="text-foreground/80 mt-1 space-y-1 text-xs leading-snug">
                                    {verdict.price.map(item => (
                                        <p key={item}>{item}</p>
                                    ))}
                                </dd>
                            </div>
                        )}
                    </dl>
                )}
        </div>
    );
};
