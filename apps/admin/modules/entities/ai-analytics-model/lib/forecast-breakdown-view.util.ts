import { BREAKDOWN_TEXT } from '../consts/ai-analytics-model.const';
import type {
    ModelForecastBreakdownDepartment,
    ModelForecastBreakdownEpisode,
    ModelForecastBreakdownManager,
    ModelForecastBreakdownResult,
    ModelForecastMethod,
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
 * «Разложение прогноза»: из чего сложилась середина прогноза отдела.
 * С 18.11.2026 — закрыто + от проведённых презентаций + от новых, открытые
 * сделки — справочно; дни до этого — старый расчёт по звонкам (закрыто +
 * открытые сделки + новые звонки). Сервер отдаёт сохранённые числа ночного
 * расчёта; здесь только слова. null ≠ 0: слагаемое не сохранено — прочерк.
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
    /** Входы расчёта одной строкой; прочерк — не сохранены. */
    inputs: string;
    /** «27 открытых сделок»; прочерк — число не сохранено. */
    openDeals: string;
    /** От презентаций: ожидание от сделок справочно; иначе null. */
    dealsReference: string | null;
    /** Сделки с наибольшим вкладом — строками. */
    deals: string[];
    /** Среди них есть давно открытые с вкладом — прогноз может тянуть «хвост». */
    hasOldDeals: boolean;
}

/** Подписи столбцов: зависят от метода расчёта дня. */
export interface BreakdownColumns {
    pipeline: string;
    newFlow: string;
    inputs: string;
    deals: string;
}

export interface BreakdownView {
    /** «16.11.2026». */
    day: string;
    department: ModelMetricView[];
    columns: BreakdownColumns;
    rows: BreakdownRow[];
    /** Пояснение под отделом (старый расчёт, слагаемые не сохранены); null — нет. */
    note: string | null;
}

const one = (value: number | null | undefined): string =>
    value === null || value === undefined ? NO_VALUE : formatDecimal(value, 1);

const isFlowMethod = (method: ModelForecastMethod): boolean =>
    method === 'presentations-v2';

const dealLine = (deal: ModelForecastBreakdownEpisode): string =>
    T.deal(
        deal.id ?? T.dealNoKey,
        formatCount(Math.round(deal.ageDays)),
        deal.theta === null ? NO_VALUE : formatShare(deal.theta, 0),
        formatDecimal(deal.expected, 2),
    );

/** Входы старого расчёта: звонки, темп, доля в продажу, зрелость. */
const legacyInputsOf = (manager: ModelForecastBreakdownManager): string => {
    if (
        manager.entryDone === null ||
        manager.entryRate === null ||
        manager.conversion === null ||
        manager.fBar === null
    ) {
        return NO_VALUE;
    }
    return T.legacyInputs(
        formatCount(Math.round(manager.entryDone)),
        formatDecimal(manager.entryRate, 1),
        formatShare(manager.conversion, 1),
        formatShare(manager.fBar, 0),
    );
};

/** Входы расчёта от презентаций; по своим продажам — средние продажи. */
const inputsOf = (manager: ModelForecastBreakdownManager): string => {
    const flow = manager.flow;
    if (flow === null) return legacyInputsOf(manager);
    if (flow.source === 'sales-history') {
        return T.inputsBySales(
            one(flow.salesMean),
            formatShare(flow.remainingShare, 0),
        );
    }
    return T.inputs(
        formatCount(Math.round(flow.presentationsDone)),
        formatDecimal(flow.presentationsRate, 1),
        formatShare(flow.salesPerPresentation, 1),
        formatShare(flow.sameMonthShare, 0),
        formatShare(flow.remainingShare, 0),
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
    dealsReference: isFlowMethod(manager.method)
        ? T.dealsReference(one(manager.deals))
        : null,
    deals: manager.topEpisodes.map(dealLine),
    hasOldDeals: manager.topEpisodes.some(
        deal => deal.ageDays > BREAKDOWN_OLD_DEAL_DAYS && deal.expected > 0,
    ),
});

/** Строка «менеджеров в расчёте» с пометкой о неполных данных. */
function managersMetric(
    department: ModelForecastBreakdownDepartment,
): ModelMetricView {
    const total = formatCount(department.managers);
    const bySales = department.flow?.salesHistoryManagers ?? 0;
    if (isFlowMethod(department.method)) {
        return bySales > 0
            ? {
                  label: T.managers,
                  value: T.managersBySales(total, formatCount(bySales)),
                  tone: 'warning',
              }
            : { label: T.managers, value: total };
    }
    return department.pipelineUnknown > 0
        ? {
              label: T.managers,
              value: T.managersUnknown(
                  total,
                  formatCount(department.pipelineUnknown),
              ),
              tone: 'warning',
          }
        : { label: T.managers, value: total };
}

/** Подбор от презентаций: доля продаж, задержка, какие презентации. */
function flowMetrics(
    department: ModelForecastBreakdownDepartment,
): ModelMetricView[] {
    const flow = department.flow;
    if (flow === null) return [];
    if (flow.status === 'not-applicable') {
        return [
            {
                label: T.salesPerPresentation,
                value: T.notMarked,
                tone: 'warning',
            },
        ];
    }
    return [
        {
            label: T.salesPerPresentation,
            value: formatShare(flow.q, 1),
            hint: T.salesPerPresentationHint,
        },
        {
            label: T.lag,
            value: flow.lagEstimated ? T.lagEstimated : T.lagDefault,
        },
        ...(flow.entry === null
            ? []
            : [
                  {
                      label: T.entry,
                      value:
                          flow.entry === 'presentation'
                              ? T.entryAll
                              : T.entryUniq,
                  },
              ]),
    ];
}

/** Подписи слагаемых и столбцов по методу дня. */
const columnsOf = (flowMethod: boolean): BreakdownColumns =>
    flowMethod
        ? {
              pipeline: T.pipeline,
              newFlow: T.newFlow,
              inputs: T.inputsTitle,
              deals: T.dealsTitle,
          }
        : {
              pipeline: T.legacyPipeline,
              newFlow: T.legacyNewFlow,
              inputs: T.legacyInputsTitle,
              deals: T.legacyDealsTitle,
          };

/** Пояснение под отделом: слагаемые не сохранены или старый расчёт. */
const noteOf = (
    department: ModelForecastBreakdownDepartment,
    flowMethod: boolean,
): string | null => {
    if (department.pipeline === null || department.newFlow === null) {
        return T.partsMissing;
    }
    return flowMethod ? null : T.legacyNote;
};

/** Вид карточки; журнала прогноза нет — null (честная заглушка). */
export function toBreakdownView(
    data: ModelForecastBreakdownResult,
): BreakdownView | null {
    const department = data.department;
    if (department === null || data.day === null) return null;
    const flowMethod = isFlowMethod(department.method);
    const columns = columnsOf(flowMethod);
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
                label: columns.pipeline,
                value: one(department.pipeline),
                hint: flowMethod ? T.pipelineHint : T.legacyPipelineHint,
            },
            {
                label: columns.newFlow,
                value: one(department.newFlow),
                hint: flowMethod ? T.newFlowHint : T.legacyNewFlowHint,
            },
            { label: T.naive, value: one(department.naive), hint: T.naiveHint },
            { label: T.mean3, value: one(department.mean3) },
            managersMetric(department),
            ...flowMetrics(department),
        ],
        columns,
        rows: data.managers.map(rowOf),
        note: noteOf(department, flowMethod),
    };
}
