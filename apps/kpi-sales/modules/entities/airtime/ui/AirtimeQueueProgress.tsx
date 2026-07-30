'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import type { AirtimeProgressDto } from '@workspace/nest-kpi-report-sales-api';
import { Preloader } from '@/modules/shared';
import { formatEta } from '../lib/queue-flow.util';

interface AirtimeQueueProgressProps {
    progress: AirtimeProgressDto | null;
    className?: string;
}

/**
 * Центрированный индикатор сборки — для состояния, когда данных ещё нет
 * совсем (ни одного готового месяца). Чистая вёрстка — данные из слайса.
 */
export const AirtimeQueueProgress: React.FC<AirtimeQueueProgressProps> = ({
    progress,
    className,
}) => {
    const total = progress?.totalMonths ?? 0;
    const ready = progress?.readyMonths ?? 0;
    const percent = total > 0 ? Math.round((ready / total) * 100) : 0;
    const eta = formatEta(progress?.etaSeconds);

    return (
        <div
            className={`flex flex-col items-center gap-2 text-muted-foreground ${className ?? ''}`}
        >
            <div className="flex items-center gap-3">
                <Preloader />
                <span className="text-sm">
                    Собираем эфирное время
                    {total > 0 && ` · готово ${ready} из ${total} мес`}
                    {eta && ` · осталось ${eta}`}
                </span>
            </div>
            {total > 0 && (
                <div className="h-1.5 w-56 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            )}
        </div>
    );
};

interface AirtimeQueueBadgeProps {
    progress: AirtimeProgressDto | null;
}

/**
 * Компактный индикатор идущей сборки (уголок над таблицей): яркий, но не
 * мешает работать — данные добавляются в живую таблицу по мере поступления
 * (паттерн стриминга user-report), никакого блокирующего оверлея.
 */
export const AirtimeQueueBadge: React.FC<AirtimeQueueBadgeProps> = ({
    progress,
}) => {
    const total = progress?.totalMonths ?? 0;
    const ready = progress?.readyMonths ?? 0;
    const eta = formatEta(progress?.etaSeconds);

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Собираем
            {total > 0 && ` ${ready}/${total} мес`}
            {eta && ` · ${eta}`}
        </span>
    );
};
