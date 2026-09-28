import type { AiByTypeWideRow, AiCallType, AiFinanceTail } from '../model';
import { AI_CALL_TYPE_ORDER, aiCallTypeLabel } from './ai-call-types.data';
import {
    AI_MATRIX_EMPTY_CELL,
    aiMatrixScoreAnnotation,
    buildAiMatrix,
    type AiMatrixCellOf,
    type AiMatrixColumn,
    type AiMatrixManagerOptions,
    type AiMatrixTable,
} from './ai-matrix-table.util';

/*
 * Блок «AI: типы звонков» (KPI-вид): менеджер × тип звонка — число
 * разборов с подстрокой-оценкой типа, хвост продаж (finance строки
 * менеджера) и чипы-фильтр скрытых типов (localStorage). Общая сборка
 * матрицы — ai-matrix-table.util.
 */

export const AI_TYPES_MATRIX_CODE = 'ai-types-matrix';

/** Хвост продаж из finance строки менеджера (одинаков во всех его строках). */
export const AI_MATRIX_SALES_COLUMNS = [
    { code: 'sales_count', name: 'Продажи, шт.' },
    { code: 'advance_amount', name: 'Аванс, ₽' },
    { code: 'monthly_amount', name: 'Мес. чек, ₽' },
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
}

export interface AiTypesMatrixInput extends AiMatrixManagerOptions {
    rows: AiByTypeWideRow[];
    /** Справочник типов портала (settings.callTypes) для подписей. */
    callTypes: AiCallType[];
    /** Коды типов, снятых чипами-фильтром (localStorage). */
    hiddenTypes: readonly string[];
}

/* ---------- Типы: наличие, порядок, скрытые ---------- */

const typeOrderIndex = (code: string): number => {
    const index = (AI_CALL_TYPE_ORDER as readonly string[]).indexOf(code);
    return index === -1 ? AI_CALL_TYPE_ORDER.length : index;
};

/**
 * Типы со звонками за период (Σn > 0 по строкам): порядок подвкладок
 * AI_CALL_TYPE_ORDER, следом прочие (other, irrelevant, неизвестные) в
 * порядке появления.
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
        .map(({ code }) => ({ code, label: aiCallTypeLabel(code, callTypes) }));
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

/* ---------- Таблица ---------- */

const typeColumns = (types: AiMatrixType[]): AiMatrixColumn[] => [
    ...types.map(type => ({ code: type.code, name: type.label })),
    ...AI_MATRIX_SALES_COLUMNS,
];

const typesCell: AiMatrixCellOf = (group, column) => {
    if (isAiMatrixSalesCode(column.code)) {
        const finance = group.rows[0]?.finance;
        return finance
            ? { value: FINANCE_PICK[column.code](finance), annotation: null }
            : AI_MATRIX_EMPTY_CELL;
    }
    const cell = group.rows.find(
        row => row.cell.callType === column.code,
    )?.cell;
    return cell
        ? {
              value: cell.n,
              annotation: aiMatrixScoreAnnotation(cell.score, cell.n),
          }
        : AI_MATRIX_EMPTY_CELL;
};

/** Матрица типов по уже отобранным (видимым) типам — общая для таблицы и рейтингов. */
export const buildAiTypesMatrixFor = (
    rows: AiByTypeWideRow[],
    types: AiMatrixType[],
    options: AiMatrixManagerOptions,
): AiMatrixTable =>
    buildAiMatrix(
        AI_TYPES_MATRIX_CODE,
        rows,
        typeColumns(types),
        options,
        typesCell,
    );

/** Строки — менеджеры периметра, колонки — видимые типы (n + оценка) и хвост продаж. */
export const buildAiTypesMatrixTable = ({
    rows,
    callTypes,
    hiddenTypes,
    ...options
}: AiTypesMatrixInput): AiMatrixTable =>
    buildAiTypesMatrixFor(
        rows,
        aiMatrixVisibleTypes(
            aiMatrixPresentTypes(rows, callTypes),
            hiddenTypes,
        ),
        options,
    );
