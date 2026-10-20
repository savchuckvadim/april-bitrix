import { describe, expect, it } from 'vitest';
import { AI_CALL_TYPE_ALL } from '../lib/ai-call-types.data';
import { AI_MATRIX_TEXT } from '../lib/ai-matrix.texts';
import {
    AI_SECTIONS_MATRIX_ALL,
    aiMatrixSections,
    aiSectionsBackendTotals,
    aiSectionsMatrixColumns,
    aiSectionsRelevance,
    buildAiSectionsMatrixTable,
} from '../lib/ai-sections-matrix.util';
import { metric, typeTotals } from './ai-fixtures';
import {
    CALL_TYPES,
    managerName,
    matrixRows,
    section,
} from './ai-types-matrix-fixtures';

const codes = (items: { code: string }[]): string[] =>
    items.map(item => item.code);

describe('aiMatrixSections — разделы по ходу разговора', () => {
    it('порядок AI_CALL_SECTION_CODES, а не появления; незнакомый код — в конце', () => {
        expect(aiMatrixSections(matrixRows(), 'presentation')).toEqual([
            { code: 'GREETING', title: 'Приветствие' },
            { code: 'NEEDS', title: 'Выявление потребностей' },
            { code: 'CLOSING', title: 'Закрытие' },
        ]);
        const rows = matrixRows();
        rows[0]!.cell.sections.unshift(section('CUSTOM', 'Своё', 5, 9));
        expect(codes(aiMatrixSections(rows, 'presentation'))).toEqual([
            'GREETING',
            'NEEDS',
            'CLOSING',
            'CUSTOM',
        ]);
        expect(aiMatrixSections(matrixRows(), 'cold')).toEqual([]);
    });

    it('«все типы» — разделы по типам с корзиной (прочее не входит)', () => {
        expect(
            codes(aiMatrixSections(matrixRows(), AI_CALL_TYPE_ALL, CALL_TYPES)),
        ).toEqual(['GREETING', 'NEEDS', 'CLOSING']);
    });
});

describe('buildAiSectionsMatrixTable — один тип', () => {
    const matrix = buildAiSectionsMatrixTable(matrixRows(), 'presentation', {
        managerName,
    });

    it('колонки — разделы + «Итог»; value = оценённых звонков, крупно средняя', () => {
        expect(matrix.table.code).toBe('ai-sections-matrix');
        expect(codes(matrix.sections)).toEqual(['GREETING', 'NEEDS', 'CLOSING']);
        expect(codes(matrix.columns)).toEqual(['GREETING', 'NEEDS', 'CLOSING', 'all']);
        expect(matrix.columns[3]).toEqual(AI_SECTIONS_MATRIX_ALL);
        expect(AI_SECTIONS_MATRIX_ALL.name).toBe(AI_MATRIX_TEXT.sectionsTotal);
        expect(matrix.table.data.map(row => row.id)).toEqual([7, 3]);
        expect(matrix.table.data[0]?.actions.map(action => action.value)).toEqual([
            10, 3, 0, 12,
        ]);
        expect(matrix.table.data[0]?.actions.map(action => action.display)).toEqual([
            '4,2',
            'ещё 5',
            '—',
            '6,4',
        ]);
        expect(matrix.table.data[1]?.actions.map(action => action.display)).toEqual([
            '—',
            '6',
            '7,5',
            '7,1',
        ]);
    });

    it('аннотации: средняя раздела с объёмом, «до оценки», итог — оценка типа', () => {
        const { annotations } = matrix;
        expect(annotations.get('7:GREETING')).toEqual({
            text: 'предварительно · по 10 звонкам',
            score: 4.2,
            n: 10,
            remaining: 0,
        });
        expect(annotations.get('7:NEEDS')).toMatchObject({ score: null, remaining: 5 });
        expect(annotations.has('7:CLOSING')).toBe(false);
        expect(annotations.get('3:NEEDS')?.text).toBe('по 20 звонкам');
        expect(annotations.get('7:all')).toMatchObject({ score: 6.4, n: 12 });
        // Норма раздела NEEDS — 6 (единственная оценка), Петров около среднего.
        const needs = matrix.table.data[1]?.actions.find(a => a.code === 'NEEDS');
        expect(needs?.tooltip).toBe('Около среднего по отделу (6).');
        expect(matrix.totals.get('NEEDS')).toMatchObject({
            n: 23,
            score: 6,
            managers: 2,
            partial: true,
        });
    });

    it('тип без разделов: только «Итог»; userIds и строки других типов не мешают', () => {
        const cold = buildAiSectionsMatrixTable(matrixRows(), 'cold', { managerName });
        expect(codes(cold.columns)).toEqual(['all']);
        expect(cold.table.data.map(row => row.actions[0]?.display)).toEqual([
            'ещё 5',
            '—',
        ]);
        const onlyPetrov = buildAiSectionsMatrixTable(matrixRows(), 'presentation', {
            managerName,
            userIds: new Set([3]),
        });
        expect(onlyPetrov.table.data.map(row => row.id)).toEqual([3]);
    });
});

describe('buildAiSectionsMatrixTable — «все типы»', () => {
    const matrix = buildAiSectionsMatrixTable(matrixRows(), AI_CALL_TYPE_ALL, {
        managerName,
        callTypes: CALL_TYPES,
    });

    it('«Итог» складывается из типов с корзиной: Σn и взвешенная оценка, прочее не входит', () => {
        // Иванов: презентация 12 (6,4) + холодный 3 (без оценки) + решение 0; прочее 2 — вне.
        expect(matrix.annotations.get('7:all')).toMatchObject({ score: 6.4, n: 15 });
        expect(
            matrix.table.data[0]?.actions.find(a => a.code === 'all')?.tooltip,
        ).toContain(AI_MATRIX_TEXT.hint.partialScore);
        // Петров: презентация 25 (7,1) + решение 9 (5,5) → 6,7 по 34.
        expect(matrix.annotations.get('3:all')).toMatchObject({ score: 6.7, n: 34 });
    });

    it('разделы суммируются по типам; с одной частью — как у типа', () => {
        expect(matrix.annotations.get('3:NEEDS')).toMatchObject({ score: 6, n: 20 });
        expect(matrix.table.data[0]?.actions[0]?.display).toBe('4,2');
    });
});

describe('итоги с бэка и важность разделов', () => {
    const totalsByType = [
        typeTotals({
            callType: 'presentation',
            n: 40,
            score: metric(6.8, 40),
            managers: 3,
            sections: [
                {
                    ...section('NEEDS', 'Выявление потребностей', 6.1, 30),
                    avgRelevance: 90,
                    explanation: { text: 'Текст раздела.', basis: [], evidenceCallIds: [] },
                },
            ],
        }),
        typeTotals({
            callType: 'decision',
            bucket: 'closing',
            n: 10,
            score: metric(5.2, 10),
            managers: 2,
            sections: [{ ...section('NEEDS', 'Выявление потребностей', 5, 10), avgRelevance: 50 }],
        }),
    ];
    const columns = aiSectionsMatrixColumns([
        { code: 'NEEDS', title: 'Выявление потребностей' },
    ]);

    it('один тип: «Итог» и разделы как есть, с объяснением бэка', () => {
        const totals = aiSectionsBackendTotals(totalsByType, 'presentation', columns);
        expect(totals.get('all')).toMatchObject({ n: 40, score: 6.8, managers: 3 });
        expect(totals.get('NEEDS')).toEqual({
            n: 30,
            score: 6.1,
            explanation: 'Текст раздела.',
        });
        expect(aiSectionsBackendTotals(totalsByType, 'cold', columns).size).toBe(0);
        expect(aiSectionsBackendTotals(null, 'presentation', columns).size).toBe(0);
    });

    it('«все типы»: суммы и взвешенные оценки по типам с корзиной, без объяснения', () => {
        const totals = aiSectionsBackendTotals(
            totalsByType,
            AI_CALL_TYPE_ALL,
            columns,
            CALL_TYPES,
        );
        // (6,8·40 + 5,2·10) / 50 = 6,48 → 6,5.
        expect(totals.get('all')).toEqual({ n: 50, score: 6.5, partial: false });
        // (6,1·30 + 5·10) / 40 = 5,825 → 5,8.
        expect(totals.get('NEEDS')).toEqual({ n: 40, score: 5.8 });
    });

    it('важность раздела: для типа — как у бэка; для всех типов — взвешенно по n', () => {
        expect(
            aiSectionsRelevance(totalsByType, 'presentation').get('NEEDS'),
        ).toBe(90);
        // (90·30 + 50·10) / 40 = 80.
        expect(
            aiSectionsRelevance(totalsByType, AI_CALL_TYPE_ALL, CALL_TYPES).get('NEEDS'),
        ).toBe(80);
        expect(aiSectionsRelevance(null, 'presentation').size).toBe(0);
    });
});
