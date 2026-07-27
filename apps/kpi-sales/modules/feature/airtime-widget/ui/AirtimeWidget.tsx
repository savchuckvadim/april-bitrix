'use client';

import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useAccess, selectEffectiveUser } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import { Preloader } from '@/modules/shared';
import {
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
 * Бэк кэширует прошлые полные месяцы ячейками «сотрудник × месяц»
 * (см. back/apps/kpi-report-sales/src/airtime/README.md): повторные
 * запросы за прошлые периоды почти мгновенны, считается живьём только
 * текущий месяц. Долгим может быть лишь ПЕРВЫЙ запрос за период.
 */
export const AirtimeWidget: React.FC = () => {
    const dispatch = useAppDispatch();
    const { status, data, error } = useAppSelector(
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
                <span>
                    Считаем эфирное время по звонкам…
                </span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <p className="py-6 text-sm text-destructive">
                {error || 'Не удалось получить эфирное время'}
            </p>
        );
    }

    const rows = data?.users ?? [];
    if (!rows.length) {
        return (
            <p className="py-6 text-sm text-muted-foreground">
                Звонков за период не найдено
            </p>
        );
    }

    return (
        <>
            {data?.truncated && <AirtimeTruncatedWarning />}
            <AirtimeTable rows={rows} />
            <EntityRatingChart
                title="Победители — эфирное время"
                dataset={buildAirtimeRatingDataset(rows)}
            />
        </>
    );
};
