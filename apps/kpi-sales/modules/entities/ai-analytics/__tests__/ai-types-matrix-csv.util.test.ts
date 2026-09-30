import { describe, expect, it } from 'vitest';
import type { RTableProps } from '@workspace/april-ui';
import { buildAiMatrixCsvRows } from '../lib/ai-types-matrix-csv.util';
import type { AiMatrixAnnotation } from '../lib/ai-matrix-table.util';
import { buildAiTypesMatrixTable } from '../lib/ai-types-matrix.util';
import { buildAiSectionsMatrixTable } from '../lib/ai-sections-matrix.util';
import {
    CALL_TYPES,
    managerName,
    matrixRows,
} from './ai-types-matrix-fixtures';

describe('buildAiMatrixCsvRows — строки CSV матриц AI', () => {
    it('после каждого счётчика — «… — оценка»: мало данных словами, без звонков пусто; хвост продаж без оценок', () => {
        const matrix = buildAiTypesMatrixTable({
            rows: matrixRows(),
            callTypes: CALL_TYPES,
            hiddenTypes: ['other'],
            managerName,
        });
        const rows = buildAiMatrixCsvRows(matrix.table, matrix.annotations);
        expect(rows[0]).toEqual([
            'Менеджер',
            'Холодный',
            'Холодный — оценка',
            'Презентация',
            'Презентация — оценка',
            'Решение',
            'Решение — оценка',
            'Продажи, шт.',
            'Аванс, ₽',
            'Мес. чек, ₽',
        ]);
        expect(rows[1]).toEqual([
            matrix.table.data[0]?.name,
            '3',
            'мало данных',
            '12',
            '6.4',
            '0',
            '',
            '3',
            '150000',
            '42000',
        ]);
        expect(rows).toHaveLength(matrix.table.data.length + 1);
        // Исходная таблица не мутирована.
        expect(matrix.table.data[0]?.actions).toHaveLength(6);
    });

    it('своя подпись оценки для матрицы разделов', () => {
        const matrix = buildAiSectionsMatrixTable(
            matrixRows(),
            'presentation',
            { managerName },
        );
        const rows = buildAiMatrixCsvRows(
            matrix.table,
            matrix.annotations,
            'средняя',
        );
        expect(rows[0]?.slice(1)).toEqual([
            'Приветствие',
            'Приветствие — средняя',
            'Выявление потребностей',
            'Выявление потребностей — средняя',
            'Закрытие',
            'Закрытие — средняя',
            'Все разборы',
            'Все разборы — средняя',
        ]);
        expect(rows[2]?.slice(1)).toEqual([
            '0',
            '',
            '20',
            '6',
            '8',
            '7.5',
            '25',
            '7.1',
        ]);
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
            ['1:cold', { text: 'оценка 5', score: 5 }],
        ]);
        expect(buildAiMatrixCsvRows(table, annotations)).toEqual([
            ['Менеджер', 'Холодный', 'Холодный — оценка'],
            ['Без id', '2', ''],
        ]);
        expect(
            buildAiMatrixCsvRows({ ...table, data: [] }, annotations),
        ).toEqual([]);
    });
});
