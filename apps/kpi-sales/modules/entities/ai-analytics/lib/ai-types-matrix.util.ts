import type {
    AiBucketScore,
    AiByTypeWideRow,
    AiCallType,
    AiFinanceTail,
    AiTypeTotals,
} from '../model';
import {
    AI_CALL_TYPE_ORDER,
    aiCallTypeLabel,
    aiCallTypeScoreHint,
} from './ai-call-types.data';
import {
    aiBucketColumnCode,
    aiBucketLabel,
    aiBucketOfColumnCode,
    aiBucketOfType,
    aiBucketScoreSource,
    aiPresentBuckets,
} from './ai-matrix-buckets.util';
import { aiWeightedScore } from './ai-matrix-norm.util';
import {
    AI_MATRIX_EMPTY_CELL,
    aiPlainCell,
    aiScoreCell,
    buildAiMatrix,
    type AiMatrixBackendTotal,
    type AiMatrixBuildOptions,
    type AiMatrixCell,
    type AiMatrixCellOf,
    type AiMatrixColumn,
    type AiMatrixTable,
} from './ai-matrix-table.util';
import { aiTypeTotalToBackend } from './ai-matrix-totals.util';
import { isAiMetricHidden } from './ai-metric.util';

/*
 * Блок «AI: типы звонков» (KPI-вид): менеджер × колонка — оценка крупно,
 * разборов мелко. Два вида колонок: «Корзины» (по умолчанию: Контакт /
 * Презентация / Закрытие + типы вне корзин своей колонкой) и «По типам»
 * (прежние колонки по типам). Хвост продаж — числа из finance строки.
 * Чипы-фильтр скрытых типов (localStorage) режут типы в обоих видах.
 */

export const AI_TYPES_MATRIX_CODE = 'ai-types-matrix';

export type AiTypesMatrixMode = 'buckets' | 'types';
export const AI_TYPES_MATRIX_DEFAULT_MODE: AiTypesMatrixMode = 'buckets';
export const isAiTypesMatrixMode = (value: unknown): value is AiTypesMatrixMode =>
    value === 'buckets' || value === 'types';

/** Хвост продаж из finance строки менеджера (одинаков во всех его строках). */
export const AI_MATRIX_SALES_COLUMNS = [
    { code: 'sales_count', name: 'Продажи, шт.', plain: true },
    { code: 'advance_amount', name: 'Аванс, ₽', plain: true },
    { code: 'monthly_amount', name: 'Мес. чек, ₽', plain: true },
] as const satisfies readonly AiMatrixColumn[];
export type AiMatrixSalesCode =
    (typeof AI_MATRIX_SALES_COLUMNS)[number]['code'];

const FINANCE_PICK: Record<
    AiMatrixSalesCode,
    (finance: AiFinanceTail) => number
> = {
    sales_count: finance => finance.salesCount,
    advance_amount: finance => finance.advanceAmount,
    monthly_amount: finance => finance.monthlyAmount,
};

/** Код колонки хвоста продаж (не тип звонка); по списку, а не `in` — без свойств прототипа. */
export const isAiMatrixSalesCode = (code: string): code is AiMatrixSalesCode =>
    AI_MATRIX_SALES_COLUMNS.some(column => column.code === code);

/** Тип звонка в матрице: код и подпись (settings.callTypes → фолбэк → код). */
export interface AiMatrixType {
    code: string;
    label: string;
    /** Подсказка колонки: тип считается отдельно, в среднюю оценку не входит. */
    hint?: string;
}

/* ---------- Типы: наличие, порядок, скрытые ---------- */

const typeOrderIndex = (code: string): number => {
    const index = (AI_CALL_TYPE_ORDER as readonly string[]).indexOf(code);
    return index === -1 ? AI_CALL_TYPE_ORDER.length : index;
};

/**
 * Типы со звонками за период (Σn > 0 по строкам): порядок подвкладок
 * AI_CALL_TYPE_ORDER (приглашение на мероприятие — своей колонкой с
 * подсказкой «вне средней оценки»), следом прочие (other, irrelevant,
 * неизвестные) в порядке появления.
 */
export const aiMatrixPresentTypes = (
    rows: AiByTypeWideRow[],
    callTypes: AiCallType[],
): AiMatrixType[] => {
    const totals = new Map<string, number>();
    for (const row of rows) {
        const code = row.cell.callType;
        totals.set(code, (totals.get(code) ?? 0) + row.cell.n);
    }
    return [...totals.entries()]
        .map(([code, n], appearance) => ({ code, n, appearance }))
        .filter(item => item.n > 0)
        .sort(
            (a, b) =>
                typeOrderIndex(a.code) - typeOrderIndex(b.code) ||
                a.appearance - b.appearance,
        )
        .map(({ code }) => {
            const hint = aiCallTypeScoreHint(code, callTypes);
            return {
                code,
                label: aiCallTypeLabel(code, callTypes),
                ...(hint ? { hint } : {}),
            };
        });
};

/** Типы после чипов-фильтра: скрытые исключены из таблицы, CSV и рейтингов. */
export const aiMatrixVisibleTypes = (
    types: AiMatrixType[],
    hiddenTypes: readonly string[],
): AiMatrixType[] => types.filter(type => !hiddenTypes.includes(type.code));

/** Значение localStorage «коды через запятую» → уникальные непустые коды. */
export const parseAiHiddenTypes = (raw: string): string[] => [
    ...new Set(
        raw
            .split(',')
            .map(code => code.trim())
            .filter(Boolean),
    ),
];

export const toggleAiHiddenType = (
    list: readonly string[],
    code: string,
): string[] =>
    list.includes(code) ? list.filter(item => item !== code) : [...list, code];

export const serializeAiHiddenTypes = (list: readonly string[]): string =>
    list.join(',');

/* ---------- Колонки ---------- */

const typeColumn = (type: AiMatrixType): AiMatrixColumn => ({
    code: type.code,
    name: type.label,
    callType: type.code,
    ...(type.hint ? { hint: type.hint } : {}),
});

/**
 * Колонки блока: «по типам» — видимые типы; «корзины» — корзины, в которых
 * есть видимые типы, затем типы вне корзин своей колонкой; хвост продаж.
 */
export const aiTypesMatrixColumns = (
    types: AiMatrixType[],
    mode: AiTypesMatrixMode,
    callTypes: AiCallType[],
): AiMatrixColumn[] => {
    const typeColumns =
        mode === 'types'
            ? types.map(typeColumn)
            : [
                  ...aiPresentBuckets(
                      types.map(type => type.code),
                      callTypes,
                  ).map(bucket => ({
                      code: aiBucketColumnCode(bucket),
                      name: aiBucketLabel(bucket),
                  })),
                  ...types
                      .filter(type => aiBucketOfType(type.code, callTypes) === null)
                      .map(typeColumn),
              ];
    return [...typeColumns, ...AI_MATRIX_SALES_COLUMNS];
};

/* ---------- Ячейки ---------- */

export interface AiTypesMatrixOptions extends AiMatrixBuildOptions {
    /** Вид колонок; по умолчанию — по типам. */
    mode?: AiTypesMatrixMode;
    /** Справочник типов портала (корзины и подписи). */
    callTypes?: AiCallType[];
    /** Точные оценки корзин менеджера (строка обзора); нет — складываются из ячеек. */
    bucketsOf?: (managerId: string) => readonly AiBucketScore[] | null | undefined;
}

const typesCellOf =
    ({ callTypes = [], bucketsOf }: AiTypesMatrixOptions): AiMatrixCellOf =>
    (group, column): AiMatrixCell => {
        if (isAiMatrixSalesCode(column.code)) {
            const finance = group.rows[0]?.finance;
            return aiPlainCell(finance ? FINANCE_PICK[column.code](finance) : 0);
        }
        const bucket = aiBucketOfColumnCode(column.code);
        if (bucket) {
            return aiScoreCell(
                aiBucketScoreSource(
                    group.rows.map(row => row.cell),
                    bucket,
                    callTypes,
                    bucketsOf?.(group.managerId),
                ),
            );
        }
        const cell = group.rows.find(
            row => row.cell.callType === column.code,
        )?.cell;
        if (!cell) return AI_MATRIX_EMPTY_CELL;
        return aiScoreCell({
            n: cell.n,
            score: isAiMetricHidden(cell.score) ? null : cell.score.value,
            explanation: cell.explanation?.text || null,
        });
    };

/** Матрица типов по уже отобранным (видимым) типам — общая для таблицы и рейтингов. */
export const buildAiTypesMatrixFor = (
    rows: AiByTypeWideRow[],
    types: AiMatrixType[],
    options: AiTypesMatrixOptions,
): AiMatrixTable =>
    buildAiMatrix(
        AI_TYPES_MATRIX_CODE,
        rows,
        aiTypesMatrixColumns(types, options.mode ?? 'types', options.callTypes ?? []),
        options,
        typesCellOf(options),
    );

/* ---------- Итоги с бэка для сводной ---------- */

/**
 * Итоги колонок из totalsByType (режим «все типы»): тип — как есть, корзина —
 * сумма разборов и взвешенная оценка типов корзины (сотрудников считаем по
 * строкам). Хвост продаж — суммы по строкам.
 */
export const aiTypesBackendTotals = (
    totalsByType: AiTypeTotals[] | null,
    columns: AiMatrixColumn[],
    callTypes: AiCallType[],
): Map<string, AiMatrixBackendTotal> => {
    const result = new Map<string, AiMatrixBackendTotal>();
    if (!totalsByType) return result;
    for (const column of columns) {
        if (column.plain) continue;
        const bucket = aiBucketOfColumnCode(column.code);
        if (bucket) {
            const parts = totalsByType.filter(
                total => aiBucketOfType(total.callType, callTypes) === bucket,
            );
            if (!parts.length) continue;
            const weighted = aiWeightedScore(
                parts.map(total => ({
                    n: total.n,
                    score: isAiMetricHidden(total.score) ? null : total.score.value,
                })),
            );
            result.set(column.code, {
                n: weighted.n,
                score: weighted.score,
                partial: weighted.score !== null && weighted.scoredN < weighted.n,
            });
            continue;
        }
        const total = totalsByType.find(item => item.callType === column.code);
        if (total) result.set(column.code, aiTypeTotalToBackend(total));
    }
    return result;
};
