import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import type { ReportData } from '@/modules/entities/report';

export interface HeadlineStat {
    label: string;
    value: number;
}

/** Счётчики звонков менеджера из эфирного времени (для merged/callings). */
export interface HeadlineAirtime {
    outgoingCount: number;
    callsCount: number;
}

/**
 * «Заглавный» показатель статистики вместо «Всего событий»:
 * — merged → исходящие звонки (эфирное время),
 * — callings → всего звонков,
 * — иначе (события/все) → результативные коммуникации (result_communication_done)
 *   из командного KPI-отчёта по пользователю.
 */
export const pickHeadlineStat = (
    reportType: EReportType,
    teamReport: ReportData[],
    userId: number,
    airtime: HeadlineAirtime | null,
): HeadlineStat => {
    if (reportType === EReportType.MERGED) {
        return {
            label: 'Исходящие звонки',
            value: airtime?.outgoingCount ?? 0,
        };
    }
    if (reportType === EReportType.CALLINGS) {
        return { label: 'Звонков', value: airtime?.callsCount ?? 0 };
    }

    const userRow = teamReport.find(row => Number(row.user.ID) === userId);
    const value =
        userRow?.kpi.find(
            kpi => kpi.action.innerCode === 'result_communication_done',
        )?.count ?? 0;
    return { label: 'Результативные', value };
};
