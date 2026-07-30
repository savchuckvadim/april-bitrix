'use client';

import React from 'react';
import type { AirtimeProgressDto } from '@workspace/nest-kpi-report-sales-api';
import { Preloader } from '@/modules/shared';
import { formatEta } from '../lib/queue-flow.util';

interface AirtimeQueueProgressProps {
    progress: AirtimeProgressDto | null;
    className?: string;
}

/**
 * Индикатор сборки партиций: «готово N из M месяцев», полоса прогресса и
 * оценка остатка от бэка. Чистая вёрстка — данные приходят из слайса.
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

interface AirtimeQueueOverlayProps {
    progress: AirtimeProgressDto | null;
}

/**
 * «Стекло» поверх частичной таблицы: данные готовых месяцев видны, но
 * явно помечены как неполные, сверху — прогресс сборки. Родитель должен
 * иметь position: relative.
 */
export const AirtimeQueueOverlay: React.FC<AirtimeQueueOverlayProps> = ({
    progress,
}) => (
    <div className="absolute inset-0 z-10 flex items-start justify-center rounded-md bg-background/60 backdrop-blur-[1.5px]">
        <div className="mt-10 rounded-lg border bg-popover px-5 py-4 shadow-sm">
            <AirtimeQueueProgress progress={progress} />
            <p className="mt-2 text-center text-xs text-muted-foreground">
                Ниже — частичные данные уже собранных месяцев
            </p>
        </div>
    </div>
);
