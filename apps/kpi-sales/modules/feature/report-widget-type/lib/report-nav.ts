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

/** «Разборы звонков» скрыты настройками портала (в списке скрытых — её код). */
export function isCallReviewsTabHidden(hiddenTabs: readonly string[]): boolean {
    return hiddenTabs.includes(REPORT_NAV_CALL_REVIEWS.code);
}

/**
 * Где показан ряд вкладок: в отчёте, на странице «Разборов звонков» или на
 * странице настроек отчёта (там ни одна вкладка не активна — все ведут по ссылке).
 */
export type ReportNavPage = 'report' | 'calls' | 'settings';

export type ReportNavItem =
    | { kind: 'type'; type: EReportType; label: string }
    | { kind: 'calls'; label: string };

/**
 * Ряд вкладок: типы отчёта по порядку; «Разборы звонков» — сразу после
 * «AI аналитики», а без неё — в конце. Без права — раздела нет; скрытый
 * настройками портала (`hiddenTabs` содержит его код) — тоже. Типы отчёта
 * сюда приходят уже без скрытых (см. withoutHiddenReportTypes).
 */
export function reportNavItems(
    available: readonly EReportType[],
    canCallReviews: boolean,
    hiddenTabs: readonly string[] = [],
): ReportNavItem[] {
    const showCalls = canCallReviews && !isCallReviewsTabHidden(hiddenTabs);
    const calls: ReportNavItem = { kind: 'calls', label: REPORT_NAV_CALL_REVIEWS.label };
    const items = available.flatMap((type): ReportNavItem[] => {
        const tab: ReportNavItem = { kind: 'type', type, label: REPORT_TYPE_LABELS[type] };
        return showCalls && type === EReportType.AI ? [tab, calls] : [tab];
    });
    if (showCalls && !available.includes(EReportType.AI)) items.push(calls);
    return items;
}

/** Адрес отчёта, открытого на вкладке: `/report?tab=<type>`. */
export function reportTypeHref(type: EReportType): string {
    return `${REPORT_PAGE_PATH}?${REPORT_TYPE_PARAM}=${type}`;
}
