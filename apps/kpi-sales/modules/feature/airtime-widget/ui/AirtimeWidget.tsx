'use client';

import React, { useEffect, useMemo } from 'react';
import { Button } from '@workspace/ui/components/button';
import { RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useAccess, selectEffectiveUser } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import { Preloader } from '@/modules/shared';
import {
    AirtimeQueueBadge,
    AirtimeQueueProgress,
    AirtimeTable,
    AirtimeTruncatedWarning,
    AirtimeUserCard,
    getTeamAirtime,
} from '@/modules/entities/airtime';
import { EntityRatingChart } from '@/modules/feature/report-rating';
import { buildAirtimeRatingDataset } from '../lib/airtime-rating.util';

/**
 * Содержимое блока «Эфирное время». Живёт внутри ReportBlockWrapper:
 * свёрнутый блок размонтирует детей → запрос уходит только при раскрытии
 * (и при смене фильтров, пока блок раскрыт).
 *
 * Бэк собирает месячные партиции в очереди (mode=queue): ответ мгновенный —
 * готовый отчёт из кэша либо queued с прогрессом, частичными данными
 * готовых месяцев и оценкой остатка. Виджет никогда не блокирует страницу:
 * queued с частичными данными — таблица «под стеклом», смена фильтра
 * доступна всегда (устаревшие ответы отсеиваются по requestKey).
 */
export const AirtimeWidget: React.FC = () => {
    const dispatch = useAppDispatch();
    const { status, data, error, progress } = useAppSelector(
        state => state.airtime.team,
    );
    const from = useAppSelector(state => state.report.date.from);
    const to = useAppSelector(state => state.report.date.to);
    const currentUsers = useAppSelector(state => state.department.current);
    // Рядовой менеджер (не руководитель) видит только собственную карточку:
    // командная таблица/рейтинг гейтятся центральным правилом AIRTIME_TEAM
    // (периметр и так режет данные до self — это вторая линия для UI).
    const canTeamView = useAccess(EAccessFeature.AIRTIME_TEAM);
    const effectiveUser = useAppSelector(selectEffectiveUser);
    const idsKey = useMemo(
        () =>
            currentUsers
                .map(user => Number(user.ID))
                .sort((a, b) => a - b)
                .join('_'),
        [currentUsers],
    );

    useEffect(() => {
        if (canTeamView && from && to && idsKey) {
            dispatch(getTeamAirtime());
        }
    }, [dispatch, canTeamView, from, to, idsKey]);

    if (!canTeamView) {
        const selfId = Number(effectiveUser?.ID ?? 0);
        return selfId ? <AirtimeUserCard userId={selfId} /> : null;
    }

    if (status === 'loading' || status === 'idle') {
        return (
            <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
                <Preloader />
                <span>Считаем эфирное время по звонкам…</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-start gap-3 py-6">
                <p className="text-sm text-destructive">
                    {error || 'Не удалось получить эфирное время'}
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() =>
                        dispatch(getTeamAirtime({ forceRefresh: true }))
                    }
                >
                    <RefreshCw className="h-3 w-3" />
                    Пересчитать
                </Button>
            </div>
        );
    }

    const rows = data?.users ?? [];

    // Очередь работает, готовых месяцев ещё нет — прогресс без таблицы.
    if (status === 'queued' && !rows.length) {
        return (
            <div className="py-10">
                <AirtimeQueueProgress progress={progress} />
            </div>
        );
    }

    if (status === 'ready' && !rows.length) {
        return (
            <p className="py-6 text-sm text-muted-foreground">
                Звонков за период не найдено
            </p>
        );
    }

    return (
        <>
            <div className="mb-2 flex items-center justify-end gap-2">
                {/* Сбор идёт: компактный индикатор — таблица живая, данные
                    добавляются по мере поступления (стрим-паттерн user-report) */}
                {status === 'queued' && (
                    <AirtimeQueueBadge progress={progress} />
                )}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={status === 'queued'}
                    onClick={() =>
                        dispatch(getTeamAirtime({ forceRefresh: true }))
                    }
                >
                    <RefreshCw className="h-3 w-3" />
                    Пересчитать
                </Button>
            </div>
            {data?.truncated && <AirtimeTruncatedWarning />}
            <AirtimeTable rows={rows} />
            <EntityRatingChart
                title="Победители — эфирное время"
                dataset={buildAirtimeRatingDataset(rows)}
            />
        </>
    );
};
