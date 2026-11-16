import { BREAKDOWN_TEXT } from '../consts/ai-analytics-model.const';
import type {
    ModelForecastBreakdownEpisode,
    ModelForecastBreakdownManager,
    ModelForecastBreakdownResult,
} from '../model';
import {
    NO_VALUE,
    formatCount,
    formatDay,
    formatDecimal,
    formatShare,
} from './model-format.util';
import type { ModelMetricView } from './model-view.types';

/*
 * «Разложение прогноза»: из чего сложилась середина прогноза отдела —
 * закрытые продажи, ожидание от открытых сделок, ожидание от новых встреч.
 * Сервер отдаёт сохранённые числа ночного расчёта; здесь только слова.
 * null ≠ 0: слагаемое не сохранено — прочерк, а не ноль.
 */

const T = BREAKDOWN_TEXT;

/** Сделка с заметным вкладом, которая открыта дольше этого, — повод проверить. */
export const BREAKDOWN_OLD_DEAL_DAYS = 90;

/** Строка таблицы менеджеров. */
export interface BreakdownRow {
    managerId: string;
    p50: string;
    done: string;
    pipeline: string;
    newFlow: string;
    naive: string;
    target: string;
    /** «38 встреч · 3,5 в день · конверсия 6 % · успеет закрыться 55 %». */
    inputs: string;
    /** «27 открытых сделок»; прочерк — число не сохранено. */
    openDeals: string;
    /** Сделки с наибольшим вкладом — строками. */
    deals: string[];
    /** Среди них есть давно открытые с вкладом — прогноз может тянуть «хвост». */
    hasOldDeals: boolean;
}

export interface BreakdownView {
    /** «16.11.2026». */
    day: string;
    department: ModelMetricView[];
    rows: BreakdownRow[];
    /** Слагаемые ещё не сохранялись (день до выкладки) — пояснение. */
    note: string | null;
}

const one = (value: number | null | undefined): string =>
    value === null || value === undefined ? NO_VALUE : formatDecimal(value, 1);

const dealLine = (deal: ModelForecastBreakdownEpisode): string =>
    T.deal(
        deal.id ?? T.dealNoKey,
        formatCount(Math.round(deal.ageDays)),
        deal.theta === null ? NO_VALUE : formatShare(deal.theta, 0),
        formatDecimal(deal.expected, 2),
    );

const inputsOf = (manager: ModelForecastBreakdownManager): string => {
    if (
        manager.entryDone === null ||
        manager.entryRate === null ||
        manager.conversion === null ||
        manager.fBar === null
    ) {
        return NO_VALUE;
    }
    return T.inputs(
        formatCount(Math.round(manager.entryDone)),
        formatDecimal(manager.entryRate, 1),
        formatShare(manager.conversion, 1),
        formatShare(manager.fBar, 0),
    );
};

const rowOf = (manager: ModelForecastBreakdownManager): BreakdownRow => ({
    managerId: manager.managerId,
    p50: one(manager.p50),
    done: formatCount(manager.done),
    pipeline: one(manager.pipeline),
    newFlow: one(manager.newFlow),
    naive: one(manager.naive),
    target: one(manager.target),
    inputs: inputsOf(manager),
    openDeals:
        manager.openEpisodes === null
            ? NO_VALUE
            : formatCount(manager.openEpisodes),
    deals: manager.topEpisodes.map(dealLine),
    hasOldDeals: manager.topEpisodes.some(
        deal => deal.ageDays > BREAKDOWN_OLD_DEAL_DAYS && deal.expected > 0,
    ),
});

/** Вид карточки; журнала прогноза нет — null (честная заглушка). */
export function toBreakdownView(
    data: ModelForecastBreakdownResult,
): BreakdownView | null {
    const department = data.department;
    if (department === null || data.day === null) return null;
    const missing =
        department.pipeline === null || department.newFlow === null;
    return {
        day: formatDay(data.day),
        department: [
            {
                label: T.p50,
                value: T.band(
                    one(department.p50),
                    one(department.low),
                    one(department.high),
                ),
                hint: T.p50Hint,
            },
            { label: T.done, value: formatCount(department.done) },
            {
                label: T.pipeline,
                value: one(department.pipeline),
                hint: T.pipelineHint,
            },
            {
                label: T.newFlow,
                value: one(department.newFlow),
                hint: T.newFlowHint,
            },
            { label: T.naive, value: one(department.naive), hint: T.naiveHint },
            { label: T.mean3, value: one(department.mean3) },
            {
                label: T.managers,
                value:
                    department.pipelineUnknown > 0
                        ? T.managersUnknown(
                              formatCount(department.managers),
                              formatCount(department.pipelineUnknown),
                          )
                        : formatCount(department.managers),
                ...(department.pipelineUnknown > 0
                    ? { tone: 'warning' as const }
                    : {}),
            },
        ],
        rows: data.managers.map(rowOf),
        note: missing ? T.partsMissing : null,
    };
}
