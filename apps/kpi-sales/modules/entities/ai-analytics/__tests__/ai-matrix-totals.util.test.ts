import { describe, expect, it } from 'vitest';
import { AI_MATRIX_TEXT } from '../lib/ai-matrix.texts';
import {
    AI_MATRIX_TOTALS_ROW_CLASS,
    AI_MATRIX_TOTALS_ROW_ID,
    buildAiMatrixTotalsTable,
} from '../lib/ai-matrix-totals.util';
import {
    aiMatrixPresentTypes,
    buildAiTypesMatrixFor,
} from '../lib/ai-types-matrix.util';
import { CALL_TYPES, managerName, matrixRows } from './ai-types-matrix-fixtures';

const matrix = buildAiTypesMatrixFor(
    matrixRows(),
    aiMatrixPresentTypes(matrixRows(), CALL_TYPES),
    { managerName, callTypes: CALL_TYPES, mode: 'types' },
);

describe('buildAiMatrixTotalsTable — строка «Итого по отделу»', () => {
    const totals = buildAiMatrixTotalsTable(matrix, {}, AI_MATRIX_TEXT.hint.totalsRow);
    const row = totals.table.data[0];

    it('отдельная таблица с одной строкой id 0, выделенной классом; код с суффиксом', () => {
        expect(totals.table.code).toBe('ai-types-matrix-totals');
        expect(totals.table.data).toHaveLength(1);
        expect(row?.id).toBe(AI_MATRIX_TOTALS_ROW_ID);
        expect(row?.name).toBe('Итого по отделу');
        expect(row?.className).toBe(AI_MATRIX_TOTALS_ROW_CLASS);
        expect(totals.table.columnHints).toBeUndefined();
    });

    it('ячейка — «6,9 из 10», мелко «по 37 звонкам · 2 сотр.»; нехватка — «ещё N»; продажи — суммы', () => {
        const byCode = new Map(row?.actions.map(action => [action.code, action]));
        expect(byCode.get('presentation')).toMatchObject({
            value: 37,
            display: '6,9 из 10',
            tooltip: AI_MATRIX_TEXT.hint.totalsRow,
        });
        expect(totals.annotations.get('0:presentation')?.text).toBe(
            'по 37 звонкам · 2 сотр.',
        );
        expect(byCode.get('cold')?.display).toBe('ещё 5');
        expect(totals.annotations.get('0:cold')?.text).toBe(
            'до оценки · по 3 звонкам · 1 сотр.',
        );
        expect(byCode.get('decision')).toMatchObject({ display: '5,5 из 10' });
        expect(byCode.get('sales_count')).toEqual({
            code: 'sales_count',
            name: 'Продажи, шт.',
            value: 4,
        });
        expect(byCode.get('advance_amount')?.value).toBe(200000);
    });

    it('объяснение бэка у итога важнее общей подсказки строки', () => {
        const withBackend = buildAiTypesMatrixFor(
            matrixRows(),
            aiMatrixPresentTypes(matrixRows(), CALL_TYPES),
            {
                managerName,
                totals: new Map([
                    ['presentation', { n: 40, score: 6.8, managers: 3, explanation: 'Итог бэка.' }],
                ]),
            },
        );
        const table = buildAiMatrixTotalsTable(withBackend, {}, 'Общая подсказка');
        const action = table.table.data[0]?.actions.find(
            item => item.code === 'presentation',
        );
        expect(action?.display).toBe('6,8 из 10');
        expect(action?.tooltip).toBe('Итог бэка.');
        expect(table.annotations.get('0:presentation')?.text).toBe(
            'по 40 звонкам · 3 сотр.',
        );
    });
});
