import type { CalculationInfo } from '@/modules/shared/lib/calculation-info/calculation-info';
import type { ReportDataNeeds } from './report-data-needs.util';

/** Сведения о расчёте каждого источника отчёта (null — сервер их не прислал). */
export interface CalculationSources {
    readonly events: CalculationInfo | null;
    readonly callings: CalculationInfo | null;
}

/** Расчёт закрытого периода с корректной датой. */
interface ClosedCalculation {
    generatedAt: string;
    time: number;
}

const toClosedCalculation = (
    info: CalculationInfo | null,
): ClosedCalculation | null => {
    if (!info?.closedPeriod || !info.generatedAt) return null;
    const time = Date.parse(info.generatedAt);
    return Number.isFinite(time)
        ? { generatedAt: info.generatedAt, time }
        : null;
};

/**
 * Что показать в шапке отчёта о расчёте. Возвращает дату расчёта (строка ISO
 * 8601) или null — строку не показывать.
 *
 * Берутся только источники, которые нужны текущей вкладке: «Дайджесту»,
 * «Финансам» и «AI аналитике» источники не нужны — строки у них нет. Строка
 * показывается, если период закрыт хотя бы у одного нужного источника и у
 * него есть дата расчёта; когда таких источников два — берётся более ранняя
 * дата (отчёт устарел настолько, насколько устарела самая старая его часть).
 */
export const resolveCalculatedAt = (
    sources: CalculationSources,
    needs: Pick<ReportDataNeeds, 'events' | 'callings'>,
): string | null => {
    const closed = [
        needs.events ? sources.events : null,
        needs.callings ? sources.callings : null,
    ]
        .map(toClosedCalculation)
        .filter((item): item is ClosedCalculation => item !== null);
    if (!closed.length) return null;

    return closed.reduce((earliest, next) =>
        next.time < earliest.time ? next : earliest,
    ).generatedAt;
};
