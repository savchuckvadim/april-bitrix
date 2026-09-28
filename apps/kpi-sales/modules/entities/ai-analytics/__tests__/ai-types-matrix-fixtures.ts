import type {
    AiByTypeWideRow,
    AiCallType,
    AiCellSection,
    AiFinanceTail,
} from '../model';
import { cell, metric, wideRow } from './ai-fixtures';

/* Фикстуры матриц KPI-вида (срез «все типы × wide»): два менеджера, четыре типа. */

const NAMES: Record<string, string> = {
    '7': 'Иванов Иван',
    '3': 'Петров Пётр',
};

export const managerName = (id: string): string => NAMES[id] ?? id;

/** Раздел рубрики ячейки: средняя (null — мало данных) и число оценённых звонков. */
export const section = (
    code: string,
    title: string,
    avgScore: number | null,
    n: number,
): AiCellSection => ({
    section: code,
    title,
    avgScore,
    n,
    avgRelevance: 1,
    explanation: { text: '', basis: [], evidenceCallIds: [] },
});

/** Справочник типов портала: подписи cold/presentation с бэка, остальные — фолбэк. */
export const CALL_TYPES: AiCallType[] = [
    {
        code: 'cold',
        title: 'Холодный',
        tone: 'event-cold',
        bucket: 'contact',
        kpiPrimaryEventTypeCode: null,
    },
    {
        code: 'presentation',
        title: 'Презентация',
        tone: 'event-pres',
        bucket: 'presentation',
        kpiPrimaryEventTypeCode: null,
    },
];

const finance = (
    salesCount: number,
    advanceAmount: number,
    monthlyAmount: number,
): AiFinanceTail => ({
    ...wideRow().finance,
    salesCount,
    advanceAmount,
    monthlyAmount,
});

const row = (
    managerId: string,
    fin: AiFinanceTail,
    callType: string,
    n: number,
    score: number | null,
    sections: AiCellSection[] = [],
): AiByTypeWideRow =>
    wideRow({
        managerId,
        finance: fin,
        cell: cell({
            callType,
            title: callType,
            n,
            score: metric(score, n),
            sections,
        }),
    });

/**
 * Менеджер 7: презентация 12 (оценка 6,4; разделы GREETING 4,2/10, NEEDS —/3),
 * холодный 3 (мало данных), решение 0, прочее 2; продажи 3 / 150 000 / 42 000.
 * Менеджер 3: презентация 25 (7,1; NEEDS 6/20, CLOSING 7,5/8), холодный 0,
 * решение 9 (5,5); продажи 1 / 50 000 / 10 000.
 */
export const matrixRows = (): AiByTypeWideRow[] => {
    const f7 = finance(3, 150000, 42000);
    const f3 = finance(1, 50000, 10000);
    return [
        row('7', f7, 'presentation', 12, 6.4, [
            section('GREETING', 'Приветствие', 4.2, 10),
            section('NEEDS', 'Выявление потребностей', null, 3),
        ]),
        row('7', f7, 'cold', 3, 5),
        row('7', f7, 'decision', 0, null),
        row('7', f7, 'other', 2, null),
        row('3', f3, 'presentation', 25, 7.1, [
            section('NEEDS', 'Выявление потребностей', 6, 20),
            section('CLOSING', 'Закрытие', 7.5, 8),
        ]),
        row('3', f3, 'cold', 0, null),
        row('3', f3, 'decision', 9, 5.5),
    ];
};
