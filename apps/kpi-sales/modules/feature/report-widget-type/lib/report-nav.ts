import {
    EReportType,
    REPORT_PAGE_PATH,
    REPORT_TYPE_LABELS,
    REPORT_TYPE_PARAM,
} from '../consts/report-type.consts';

/** Раздел «Разборы звонков» в ряду вкладок: не тип отчёта, а переход на страницу `/calls`. */
export const REPORT_NAV_CALL_REVIEWS = {
    code: 'call_reviews',
    label: 'Разборы звонков',
} as const;

/** Где показан ряд вкладок: в отчёте или на странице «Разборов звонков». */
export type ReportNavPage = 'report' | 'calls';

export type ReportNavItem =
    | { kind: 'type'; type: EReportType; label: string }
    | { kind: 'calls'; label: string };

/**
 * Ряд вкладок: типы отчёта по порядку; «Разборы звонков» — сразу после
 * «AI аналитики», а без неё — в конце. Без права — раздела нет.
 */
export function reportNavItems(
    available: readonly EReportType[],
    canCallReviews: boolean,
): ReportNavItem[] {
    const calls: ReportNavItem = { kind: 'calls', label: REPORT_NAV_CALL_REVIEWS.label };
    const items = available.flatMap((type): ReportNavItem[] => {
        const tab: ReportNavItem = { kind: 'type', type, label: REPORT_TYPE_LABELS[type] };
        return canCallReviews && type === EReportType.AI ? [tab, calls] : [tab];
    });
    if (canCallReviews && !available.includes(EReportType.AI)) items.push(calls);
    return items;
}

/** Адрес отчёта, открытого на вкладке: `/report?tab=<type>`. */
export function reportTypeHref(type: EReportType): string {
    return `${REPORT_PAGE_PATH}?${REPORT_TYPE_PARAM}=${type}`;
}
