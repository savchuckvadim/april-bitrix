import { EReportType } from '../consts/report-type.consts';

/**
 * Код вкладки в портальных настройках («скрытые вкладки») ↔ тип отчёта.
 * Вкладка «Все» кода не имеет: её скрыть нельзя. «Разборы звонков» — не тип
 * отчёта, её код — REPORT_NAV_CALL_REVIEWS.code (см. report-nav.ts).
 */
export const REPORT_TYPE_TAB_CODES: Record<Exclude<EReportType, EReportType.All>, string> = {
    [EReportType.EVENTS]: 'events',
    [EReportType.CALLINGS]: 'callings',
    [EReportType.MERGED]: 'merged',
    [EReportType.DIGEST]: 'digest',
    [EReportType.FINANCE]: 'finance',
    [EReportType.AI]: 'ai',
};

/** Код вкладки типа отчёта; у «Все» — null (всегда видна). */
export function reportTypeTabCode(type: EReportType): string | null {
    return type === EReportType.All ? null : REPORT_TYPE_TAB_CODES[type];
}

/** Тип отчёта скрыт настройками портала («Все» — никогда). */
export function isReportTypeHidden(type: EReportType, hiddenTabs: readonly string[]): boolean {
    const code = reportTypeTabCode(type);
    return code !== null && hiddenTabs.includes(code);
}

/** Типы отчёта без скрытых порталом; порядок и «Все» сохраняются. */
export function withoutHiddenReportTypes(
    types: readonly EReportType[],
    hiddenTabs: readonly string[],
): EReportType[] {
    return types.filter(type => !isReportTypeHidden(type, hiddenTabs));
}
