'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { ensureReportData } from '../model/ensure-report-data.thunk';
import { addReportDataDemand } from '../model/report-data-demand';
import type { ReportFlowKind } from '../model/report-queue.util';

/**
 * Заявка на источник данных отчёта на время жизни компонента: события или
 * звонки будут загружены, даже если текущей вкладке они не нужны (страница
 * сотрудника читает командный отчёт, придя с «Дайджеста» или «AI аналитики»).
 * Заявка действует и на более поздние запросы — после применения
 * сохранённого фильтра и по «Применить».
 */
export const useReportDataDemand = (
    kind: ReportFlowKind,
    enabled = true,
): void => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!enabled) return;
        const release = addReportDataDemand(kind);
        dispatch(ensureReportData());
        return release;
    }, [dispatch, kind, enabled]);
};
