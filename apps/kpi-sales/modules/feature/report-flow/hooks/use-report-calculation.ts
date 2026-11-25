'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { resolveCalculatedAt } from '../lib/calculation-notice.util';
import { getReportDataNeeds } from '../lib/report-data-needs.util';

/**
 * Когда рассчитан отчёт текущей вкладки — для строки в шапке. Строка
 * ISO 8601, если отчёт взят из сохранённого расчёта закрытого периода;
 * null — показывать нечего (период открытый, сервер старый, вкладке не
 * нужны события и звонки).
 */
export const useReportCalculatedAt = (): string | null => {
    const events = useAppSelector(state => state.report.calculation);
    const callings = useAppSelector(
        state => state.callingStatistics.calculation,
    );
    const tab = useAppSelector(state => state.reportType.current);

    return useMemo(
        () => resolveCalculatedAt({ events, callings }, getReportDataNeeds(tab)),
        [events, callings, tab],
    );
};
