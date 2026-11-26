/**
 * Колонки планов в таблицах отчёта и строках Excel: колонка плана стоит
 * вплотную слева от своего факта. Связь — только по коду факта (factKey
 * каталога планов: innerCode события или id бакета звонков, так же, как
 * `code` колонок таблиц и `id` колонок Excel), никогда по названию. Нет
 * колонки факта (скрыта «Колонками», нет действия на портале) — нет и
 * колонки плана. Свои названия портала — только в подписи и подсказке.
 */
import {
    callingLabelKey,
    eventLabelKey,
    planLabelKey,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import type { PlanPeriodType } from '../model';
import type {
    EnabledPlanIndicator,
    PlanAchievementRow,
} from './plan-achievement.util';
import {
    PLAN_COLUMN_FACT_SOURCES,
    PLAN_COLUMN_LABEL_PREFIX,
    PLAN_COLUMNS_FLAG,
    PLAN_COLUMNS_TAB_SOURCES,
    type PlanColumnFactSource,
    type PlanColumnsFlags,
    type PlanColumnsTab,
} from './plan-columns.consts';
import { PLAN_PERIOD_LABELS } from './plans.data';

/** Колонка плана включённого показателя. */
export interface PlanColumnSpec {
    /** Код планового показателя. */
    planCode: string;
    /** Код колонки факта: innerCode события или id бакета звонков строкой. */
    factKey: string;
    factSource: PlanColumnFactSource;
    /** Код колонки плана и ключ её своего названия: `plan:<код>`. */
    labelKey: string;
    /** Ключ своего названия факта: `ev:<innerCode>` или `call:<id>`. */
    factLabelKey: string;
    /** Индекс показателя в indicators — у ячейки достижения тот же индекс. */
    indicatorIndex: number;
    periodType: PlanPeriodType;
}

/** Когда у таблицы есть колонки планов. */
export interface PlanColumnsGate {
    /** Публичная страница: планов на ней нет. */
    isPublic: boolean;
    /** Доступ к планам (PLANS_VIEW). */
    canView: boolean;
    /**
     * Видит планы всех (PLANS_VIEW_ALL). Колонки планов — только у него:
     * у рядового в колонке был бы один свой план, а итог колонки (и строка
     * «Итого» в Excel) читался бы как план всех. Рядовой свой план видит,
     * как раньше, подписью под фактом.
     */
    canViewAll: boolean;
    /** Флаги таблиц из настроек вида отчёта портала. */
    flags: PlanColumnsFlags;
    /** Коды плановых показателей, чью колонку не выводить. */
    hiddenCodes: readonly string[];
}

/**
 * Значение колонки плана: число — план на выбранный период (целое);
 * null — сотруднику план не задан («—»); undefined — сотрудник вне
 * области видимости (рядовой видит только свой план) — пустая ячейка.
 */
export type PlanColumnValue = number | null | undefined;

const isColumnFactSource = (source: string): source is PlanColumnFactSource =>
    (PLAN_COLUMN_FACT_SOURCES as readonly string[]).includes(source);

/**
 * Колонки планов по включённым показателям: только с фактом в событиях
 * или звонках (из sources), кроме скрытых настройкой портала.
 */
export const planColumnSpecs = (
    indicators: readonly EnabledPlanIndicator[],
    hiddenCodes: readonly string[],
    sources: readonly PlanColumnFactSource[] = PLAN_COLUMN_FACT_SOURCES,
): PlanColumnSpec[] => {
    const hidden = new Set(hiddenCodes);
    return indicators.flatMap((indicator, indicatorIndex) => {
        const source = indicator.factSource;
        if (
            !isColumnFactSource(source) ||
            !sources.includes(source) ||
            hidden.has(indicator.code)
        ) {
            return [];
        }
        return [
            {
                planCode: indicator.code,
                factKey: indicator.factKey,
                factSource: source,
                labelKey: planLabelKey(indicator.code),
                factLabelKey:
                    source === 'calling'
                        ? callingLabelKey(indicator.factKey)
                        : eventLabelKey(indicator.factKey),
                indicatorIndex,
                periodType: indicator.periodType,
            },
        ];
    });
};

/**
 * Колонки планов таблицы: пусто на публичной странице, без доступа к
 * планам всех сотрудников (PLANS_VIEW_ALL) и при выключенном флаге таблицы
 * в настройках портала. Личный
 * тумблер блока «Планы» сюда не входит: колонки — настройка портала.
 */
export const tablePlanColumnSpecs = (
    tab: PlanColumnsTab,
    indicators: readonly EnabledPlanIndicator[],
    gate: PlanColumnsGate,
): PlanColumnSpec[] =>
    gate.isPublic ||
    !gate.canView ||
    !gate.canViewAll ||
    !gate.flags[PLAN_COLUMNS_FLAG[tab]]
        ? []
        : planColumnSpecs(
              indicators,
              gate.hiddenCodes,
              PLAN_COLUMNS_TAB_SOURCES[tab],
          );

/** Название факта для показа: своё по ключу факта, иначе исходное. */
const factDisplayName = (
    spec: PlanColumnSpec,
    factName: string,
    labelOf: IndicatorLabeler,
): string => labelOf(spec.factLabelKey, factName);

/**
 * Подпись колонки плана: своё название по `plan:<код>`, иначе
 * «План: <название факта>» (с учётом своего названия факта).
 */
export const planColumnLabel = (
    spec: PlanColumnSpec,
    factName: string,
    labelOf: IndicatorLabeler,
): string =>
    labelOf(
        spec.labelKey,
        `${PLAN_COLUMN_LABEL_PREFIX}${factDisplayName(spec, factName, labelOf)}`,
    );

/** Подсказка к шапке колонки плана (в Excel — заметка к шапке). */
export const planColumnHint = (
    spec: PlanColumnSpec,
    factName: string,
    labelOf: IndicatorLabeler,
): string =>
    `План по показателю «${factDisplayName(spec, factName, labelOf)}» ` +
    `(${PLAN_PERIOD_LABELS[spec.periodType]}), пересчитан на выбранный период`;

/**
 * Вставка колонок планов в колонки строки: перед каждой колонкой факта,
 * у которой есть колонка плана, — колонка плана, вплотную слева. Порядок
 * прочих колонок не меняется, входной массив — тоже. Работает для любых
 * колонок (RTable, Excel): код факта и колонку плана даёт вызывающий.
 */
export const insertPlanColumns = <T>(
    columns: readonly T[],
    factKeyOf: (column: T) => string | undefined,
    specs: readonly PlanColumnSpec[],
    planColumnOf: (spec: PlanColumnSpec, fact: T) => T,
): T[] => {
    const byFact = new Map<string, PlanColumnSpec[]>();
    specs.forEach(spec =>
        byFact.set(spec.factKey, [...(byFact.get(spec.factKey) ?? []), spec]),
    );
    return columns.flatMap(column => {
        const factKey = factKeyOf(column);
        const own = factKey === undefined ? undefined : byFact.get(factKey);
        return own
            ? [...own.map(spec => planColumnOf(spec, column)), column]
            : [column];
    });
};

/** Достижение по сотрудникам области видимости: userId → строка. */
export const achievementByUser = (
    rows: readonly PlanAchievementRow[],
): ReadonlyMap<number, PlanAchievementRow> =>
    new Map(rows.map(row => [row.userId, row]));

/**
 * План сотрудника на выбранный период, до целого. Строки нет (сотрудник
 * вне области видимости) — undefined; план не задан — null.
 */
export const planCellValue = (
    spec: PlanColumnSpec,
    row: PlanAchievementRow | undefined,
): PlanColumnValue => {
    if (!row) return undefined;
    const plan = row.cells[spec.indicatorIndex]?.plan ?? null;
    return plan === null ? null : Math.round(plan);
};

/**
 * Итог колонки плана — сумма планов сотрудников области видимости (тех
 * же целых, что в строках). Никого в области видимости — undefined;
 * ни у кого нет плана — null.
 */
export const planTotalValue = (
    spec: PlanColumnSpec,
    rows: readonly (PlanAchievementRow | undefined)[],
): PlanColumnValue => {
    const values = rows
        .map(row => planCellValue(spec, row))
        .filter((value): value is number | null => value !== undefined);
    if (!values.length) return undefined;
    const plans = values.filter((value): value is number => value !== null);
    return plans.length ? plans.reduce((sum, value) => sum + value, 0) : null;
};
