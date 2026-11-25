import { EReportType } from '../consts/report-type.consts';

/**
 * Код вкладки в портальных настройках («скрытые вкладки») ↔ тип отчёта.
 * «Разборы звонков» — не тип отчёта, её код — REPORT_NAV_CALL_REVIEWS.code
 * (см. report-nav.ts).
 */
export const REPORT_TYPE_TAB_CODES: Record<EReportType, string> = {
    [EReportType.All]: 'all',
    [EReportType.EVENTS]: 'events',
    [EReportType.CALLINGS]: 'callings',
    [EReportType.MERGED]: 'merged',
    [EReportType.DIGEST]: 'digest',
    [EReportType.FINANCE]: 'finance',
    [EReportType.AI]: 'ai',
};

/** Код вкладки типа отчёта в портальных настройках. */
export function reportTypeTabCode(type: EReportType): string {
    return REPORT_TYPE_TAB_CODES[type];
}

/** Тип отчёта скрыт настройками портала. */
export function isReportTypeHidden(type: EReportType, hiddenTabs: readonly string[]): boolean {
    return hiddenTabs.includes(reportTypeTabCode(type));
}

/**
 * Типы отчёта без скрытых порталом; порядок сохраняется. Скрыть можно любую
 * вкладку, «Все» тоже. Страховка: если настройки скрывают всё, что
 * пользователю доступно, остаётся первая доступная вкладка — ряд не пустеет.
 * Бэк такой набор не сохраняет и при чтении возвращает «Все», но настройку
 * могли поправить мимо страницы настроек.
 */
export function withoutHiddenReportTypes(
    types: readonly EReportType[],
    hiddenTabs: readonly string[],
): EReportType[] {
    const visible = types.filter(type => !isReportTypeHidden(type, hiddenTabs));
    const first = types[0];
    return visible.length > 0 || first === undefined ? visible : [first];
}

/** Куда уйти с недоступной вкладки: первая из доступных; null — доступных нет. */
export function fallbackReportType(available: readonly EReportType[]): EReportType | null {
    return available[0] ?? null;
}
