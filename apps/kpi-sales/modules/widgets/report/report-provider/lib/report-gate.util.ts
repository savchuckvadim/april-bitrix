import type { ReportDataNeeds } from '@/modules/feature/report-flow';

/** Источник данных отчёта, способный блокировать страницу. */
export type ReportGateSource = NonNullable<ReportDataNeeds['blocking']>;

/** Состояние источника: идёт ли загрузка, приходил ли ответ, есть ли данные. */
export interface ReportGateSourceState {
    isLoading: boolean;
    isFetched: boolean;
    hasData: boolean;
}

export interface ReportGate {
    /** Блокирующий источник ещё считается (или ответа не было) — нужна заставка. */
    isPending: boolean;
    /** Данные для показа есть (у вкладки без блокирующего источника — всегда). */
    hasData: boolean;
}

/**
 * Что показывает каркас страницы: страницу блокирует только главный
 * источник вкладки (карта нужд, getReportDataNeeds). Вкладка без такого
 * источника не показывает ни заставку, ни «нет данных» — её содержимое
 * рисуется сразу.
 */
export const resolveReportGate = (
    blocking: ReportDataNeeds['blocking'],
    sources: Record<ReportGateSource, ReportGateSourceState>,
): ReportGate => {
    if (blocking === null) return { isPending: false, hasData: true };
    const source = sources[blocking];
    return {
        isPending: source.isLoading || !source.isFetched,
        hasData: source.hasData,
    };
};
