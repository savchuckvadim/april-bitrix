import { describe, expect, it } from 'vitest';
import type { RTableProps } from '@workspace/april-ui';
import { buildAiMatrixCsvRows } from '../lib/ai-types-matrix-csv.util';
import type { AiMatrixAnnotation } from '../lib/ai-matrix-table.util';
import { buildAiMatrixTotalsTable } from '../lib/ai-matrix-totals.util';
import { buildAiSectionsMatrixTable } from '../lib/ai-sections-matrix.util';
import {
    aiMatrixPresentTypes,
    aiMatrixVisibleTypes,
    buildAiTypesMatrixFor,
} from '../lib/ai-types-matrix.util';
import {
    CALL_TYPES,
    managerName,
    matrixRows,
    matrixRowsWithInvites,
} from './ai-types-matrix-fixtures';

const typesMatrix = (rows = matrixRows(), hidden: string[] = []) =>
    buildAiTypesMatrixFor(
        rows,
        aiMatrixVisibleTypes(aiMatrixPresentTypes(rows, CALL_TYPES), hidden),
        { managerName, callTypes: CALL_TYPES, mode: 'types' },
    );

describe('buildAiMatrixCsvRows — строки CSV матриц AI', () => {
    it('у колонки-оценки две колонки — оценка и разборов; «ещё N до оценки» вместо нуля; продажи как есть', () => {
        const matrix = typesMatrix(matrixRows(), ['other']);
        const rows = buildAiMatrixCsvRows(matrix.table, matrix.annotations);
        expect(rows[0]).toEqual([
            'Менеджер',
            'Холодный — оценка',
            'Холодный — разборов',
            'Презентация — оценка',
            'Презентация — разборов',
            'Решение — оценка',
            'Решение — разборов',
            'Продажи, шт.',
            'Аванс, ₽',
            'Мес. чек, ₽',
        ]);
        expect(rows[1]).toEqual([
            'Иванов Иван',
            'ещё 5 до оценки',
            '3',
            '6.4',
            '12',
            '',
            '0',
            '3',
            '150000',
            '42000',
        ]);
        expect(rows).toHaveLength(matrix.table.data.length + 1);
        // Исходная таблица не мутирована.
        expect(matrix.table.data[0]?.actions).toHaveLength(6);
    });

    it('колонка вне средней оценки помечена в шапке, оценка у неё своя', () => {
        const matrix = typesMatrix(matrixRowsWithInvites(), ['other', 'cold', 'decision']);
        const rows = buildAiMatrixCsvRows(matrix.table, matrix.annotations);
        expect(rows[0]?.slice(3, 5)).toEqual([
            'Мероприятие (вне средней оценки) — оценка',
            'Мероприятие (вне средней оценки) — разборов',
        ]);
        expect(rows[1]?.slice(3, 5)).toEqual(['4.1', '9']);
    });

    it('своя подпись оценки для матрицы разделов; строка итогов без шапки', () => {
        const matrix = buildAiSectionsMatrixTable(matrixRows(), 'presentation', {
            managerName,
        });
        const rows = buildAiMatrixCsvRows(matrix.table, matrix.annotations, 'средняя');
        expect(rows[0]?.slice(1)).toEqual([
            'Приветствие — средняя',
            'Приветствие — разборов',
            'Выявление потребностей — средняя',
            'Выявление потребностей — разборов',
            'Закрытие — средняя',
            'Закрытие — разборов',
            'Итог — средняя',
            'Итог — разборов',
        ]);
        expect(rows[2]?.slice(1)).toEqual(['', '0', '6', '20', '7.5', '8', '7.1', '25']);

        const totals = buildAiMatrixTotalsTable(matrix);
        const totalsRows = buildAiMatrixCsvRows(
            totals.table,
            totals.annotations,
            'средняя',
            false,
        );
        expect(totalsRows).toHaveLength(1);
        expect(totalsRows[0]?.slice(0, 3)).toEqual(['Итого по отделу', '4.2', '10']);
    });

    it('строка без id — оценки пустые; пустая таблица — нет строк', () => {
        const table: RTableProps = {
            code: 'ai',
            firstCellName: 'Менеджер',
            data: [
                {
                    name: 'Без id',
                    actions: [{ name: 'Холодный', value: 2, code: 'cold' }],
                },
            ],
        };
        const annotations = new Map<string, AiMatrixAnnotation>([
            ['1:cold', { text: 'по 2 звонкам', score: 5, n: 2, remaining: 0 }],
        ]);
        expect(buildAiMatrixCsvRows(table, annotations)).toEqual([
            ['Менеджер', 'Холодный — оценка', 'Холодный — разборов'],
            ['Без id', '', '2'],
        ]);
        expect(buildAiMatrixCsvRows({ ...table, data: [] }, annotations)).toEqual([]);
    });
});
