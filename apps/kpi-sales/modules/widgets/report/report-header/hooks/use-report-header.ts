'use client';

import { useReport } from '@/modules/entities/report';
import { formatReportPeriod } from '../lib/format-period.util';

/** Отформатированный период текущего отчёта для заголовка. */
export const useReportPeriod = () => {
    const { date } = useReport();
    return formatReportPeriod(date.from || '', date.to || '');
};
