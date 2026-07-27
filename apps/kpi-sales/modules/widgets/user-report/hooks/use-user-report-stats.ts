'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { IUserReportItem } from '@/modules/entities/user-report/type/user-report.type';
import {
    HeadlineStat,
    pickHeadlineStat,
} from '../lib/headline-stat.util';

export interface UserReportStatsData {
    headline: HeadlineStat;
    presentations: number;
    invoices: number;
    sales: number;
}

/**
 * Показатели статистики менеджера: заглавный (зависит от типа отчёта —
 * результативные / исходящие / звонки) + презентации/счета/продажи из
 * его событий. Вся выборка стора и вычисления — здесь.
 */
export const useUserReportStats = (
    report: IUserReportItem[],
    userId: number,
): UserReportStatsData => {
    const reportType = useAppSelector(state => state.reportType.current);
    const teamReport = useAppSelector(state => state.report.report);
    const airtimeData = useAppSelector(state => state.airtime.user.data);

    const eventStats = useMemo(() => {
        const presentations = report.filter(
            item =>
                item.sales_kpi_event_type?.value?.name === 'Презентация' &&
                item.sales_kpi_event_action?.value?.name === 'Состоялся',
        ).length;
        const invoices = report.filter(
            item =>
                item.sales_kpi_event_type?.value?.name === 'Счет' &&
                item.sales_kpi_event_action?.value?.name === 'Отправлен',
        ).length;
        const sales = report.filter(
            item => item.sales_kpi_event_type?.value?.name === 'Продажа',
        ).length;
        return { presentations, invoices, sales };
    }, [report]);

    const headline = useMemo(() => {
        const row = airtimeData?.users.find(
            item => Number(item.user.ID) === userId,
        );
        return pickHeadlineStat(
            reportType,
            teamReport,
            userId,
            row
                ? {
                      outgoingCount: row.outgoing.count,
                      callsCount: row.callsCount,
                  }
                : null,
        );
    }, [reportType, teamReport, airtimeData, userId]);

    return { headline, ...eventStats };
};
