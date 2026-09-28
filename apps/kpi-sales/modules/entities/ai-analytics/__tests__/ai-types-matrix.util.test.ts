import { describe, expect, it } from 'vitest';
import { AI_MATRIX_FEW_DATA } from '../lib/ai-matrix-table.util';
import {
    aiMatrixPresentTypes,
    aiMatrixVisibleTypes,
    buildAiTypesMatrixTable,
    parseAiHiddenTypes,
    serializeAiHiddenTypes,
    toggleAiHiddenType,
} from '../lib/ai-types-matrix.util';
import {
    AI_SECTIONS_MATRIX_ALL,
    aiMatrixSections,
    buildAiSectionsMatrixTable,
} from '../lib/ai-sections-matrix.util';
import { cell, wideRow } from './ai-fixtures';
import {
    CALL_TYPES,
    managerName,
    matrixRows,
} from './ai-types-matrix-fixtures';

const codes = (items: { code: string }[]): string[] =>
    items.map(item => item.code);

describe('aiMatrixPresentTypes — типы со звонками и их порядок', () => {
    it('порядок подвкладок, other в конце; подписи — портал, иначе фолбэк', () => {
        const types = aiMatrixPresentTypes(matrixRows(), CALL_TYPES);
        expect(codes(types)).toEqual([
            'cold',
            'presentation',
            'decision',
            'other',
        ]);
        expect(types.map(type => type.label)).toEqual([
            'Холодный',
            'Презентация',
            'Решение',
            'Прочее',
        ]);
    });

    it('тип без звонков у всех менеджеров не попадает в список', () => {
        const rows = [
            ...matrixRows(),
            wideRow({ cell: cell({ callType: 'payment', n: 0 }) }),
        ];
        expect(codes(aiMatrixPresentTypes(rows, CALL_TYPES))).not.toContain(
            'payment',
        );
        expect(aiMatrixPresentTypes([], CALL_TYPES)).toEqual([]);
    });

    it('скрытые типы исключаются из видимых', () => {
        const types = aiMatrixPresentTypes(matrixRows(), CALL_TYPES);
        expect(codes(aiMatrixVisibleTypes(types, ['cold', 'other']))).toEqual([
            'presentation',
            'decision',
        ]);
    });
});

describe('скрытые типы — localStorage', () => {
    it('parse: разделитель запятая, пробелы и дубли отбрасываются', () => {
        expect(parseAiHiddenTypes('cold, other,,cold')).toEqual([
            'cold',
            'other',
        ]);
        expect(parseAiHiddenTypes('')).toEqual([]);
    });

    it('toggle добавляет и снимает код, не мутируя список; serialize — через запятую', () => {
        const initial = ['cold'];
        const added = toggleAiHiddenType(initial, 'other');
        expect(added).toEqual(['cold', 'other']);
        expect(initial).toEqual(['cold']);
        expect(toggleAiHiddenType(added, 'cold')).toEqual(['other']);
        expect(serializeAiHiddenTypes(added)).toBe('cold,other');
    });
});

describe('buildAiTypesMatrixTable — «AI: типы звонков»', () => {
    const build = (hiddenTypes: string[] = [], userIds?: ReadonlySet<number>) =>
        buildAiTypesMatrixTable({
            rows: matrixRows(),
            callTypes: CALL_TYPES,
            hiddenTypes,
            managerName,
            userIds,
        });

    it('строка на менеджера: id, имя, счётчики по типам и хвост продаж', () => {
        const { table, columns } = build();
        expect(table.code).toBe('ai-types-matrix');
        expect(table.firstCellName).toBe('Менеджер');
        expect(table.data.map(row => [row.id, row.name])).toEqual([
            [7, 'Иванов Иван'],
            [3, 'Петров Пётр'],
        ]);
        expect(codes(columns)).toEqual([
            'cold',
            'presentation',
            'decision',
            'other',
            'sales_count',
            'advance_amount',
            'monthly_amount',
        ]);
        const first = table.data[0];
        expect(first?.actions.map(action => action.code)).toEqual(
            codes(columns),
        );
        expect(first?.actions.map(action => action.value)).toEqual([
            3, 12, 0, 2, 3, 150000, 42000,
        ]);
        expect(first?.actions.map(action => action.name).slice(4)).toEqual([
            'Продажи, шт.',
            'Аванс, ₽',
            'Мес. чек, ₽',
        ]);
        expect(table.data[1]?.actions.map(action => action.value)).toEqual([
            0, 25, 9, 0, 1, 50000, 10000,
        ]);
    });

    it('аннотации: оценка при достаточном n, «мало данных» без числа, без звонков — нет', () => {
        const { annotations } = build();
        expect(annotations.get('7:presentation')).toEqual({
            text: 'оценка 6,4',
            score: 6.4,
        });
        expect(annotations.get('7:cold')).toEqual({
            text: 'мало данных',
            score: null,
        });
        expect(annotations.get('3:decision')?.text).toBe('оценка 5,5');
        expect(annotations.has('7:decision')).toBe(false);
        expect(annotations.has('3:cold')).toBe(false);
        expect(annotations.has('7:sales_count')).toBe(false);
    });

    it('скрытые типы уходят из колонок и аннотаций; хвост продаж остаётся', () => {
        const { table, annotations, columns } = build(['cold', 'other']);
        expect(codes(columns)).toEqual([
            'presentation',
            'decision',
            'sales_count',
            'advance_amount',
            'monthly_amount',
        ]);
        expect(table.data[0]?.actions.map(action => action.value)).toEqual([
            12, 0, 3, 150000, 42000,
        ]);
        expect(annotations.has('7:cold')).toBe(false);
        expect(annotations.has('7:presentation')).toBe(true);
    });

    it('userIds оставляет только менеджеров секции; без строк — пустая таблица с хвостом продаж', () => {
        expect(build([], new Set([3])).table.data.map(row => row.id)).toEqual([
            3,
        ]);
        const empty = buildAiTypesMatrixTable({
            rows: [],
            callTypes: CALL_TYPES,
            hiddenTypes: [],
            managerName,
        });
        expect(empty.table.data).toEqual([]);
        expect(codes(empty.columns)).toEqual([
            'sales_count',
            'advance_amount',
            'monthly_amount',
        ]);
    });
});

describe('buildAiSectionsMatrixTable — «AI: разделы оценки по типу»', () => {
    it('разделы: порядок первой строки, затем объединение по остальным', () => {
        expect(aiMatrixSections(matrixRows(), 'presentation')).toEqual([
            { code: 'GREETING', title: 'Приветствие' },
            { code: 'NEEDS', title: 'Выявление потребностей' },
            { code: 'CLOSING', title: 'Закрытие' },
        ]);
        expect(aiMatrixSections(matrixRows(), 'cold')).toEqual([]);
    });

    it('колонки — разделы + «Все разборы»; ячейка — n раздела, сводная — n типа', () => {
        const { table, sections, columns } = buildAiSectionsMatrixTable(
            matrixRows(),
            'presentation',
            { managerName },
        );
        expect(table.code).toBe('ai-sections-matrix');
        expect(codes(sections)).toEqual(['GREETING', 'NEEDS', 'CLOSING']);
        expect(codes(columns)).toEqual(['GREETING', 'NEEDS', 'CLOSING', 'all']);
        expect(columns[3]).toEqual(AI_SECTIONS_MATRIX_ALL);
        expect(table.data.map(row => row.id)).toEqual([7, 3]);
        expect(table.data[0]?.actions.map(action => action.value)).toEqual([
            10, 3, 0, 12,
        ]);
        expect(table.data[1]?.actions.map(action => action.value)).toEqual([
            0, 20, 8, 25,
        ]);
    });

    it('аннотации: средняя раздела, «мало данных», отсутствующий раздел — нет; сводная — оценка типа', () => {
        const { annotations } = buildAiSectionsMatrixTable(
            matrixRows(),
            'presentation',
            { managerName },
        );
        expect(annotations.get('7:GREETING')).toEqual({
            text: '4,2',
            score: 4.2,
        });
        expect(annotations.get('7:NEEDS')).toEqual({
            text: AI_MATRIX_FEW_DATA,
            score: null,
        });
        expect(annotations.has('7:CLOSING')).toBe(false);
        expect(annotations.get('3:NEEDS')?.text).toBe('6');
        expect(annotations.get('3:CLOSING')?.text).toBe('7,5');
        expect(annotations.get('7:all')).toEqual({
            text: 'оценка 6,4',
            score: 6.4,
        });
        expect(annotations.get('3:all')?.text).toBe('оценка 7,1');
    });

    it('тип без разделов: только сводная колонка; строки других типов не мешают', () => {
        const { table, annotations, columns } = buildAiSectionsMatrixTable(
            matrixRows(),
            'cold',
            { managerName },
        );
        expect(codes(columns)).toEqual(['all']);
        expect(table.data.map(row => row.actions[0]?.value)).toEqual([3, 0]);
        expect(annotations.get('7:all')?.text).toBe('мало данных');
        expect(annotations.has('3:all')).toBe(false);
    });

    it('userIds ограничивает строки секцией', () => {
        const { table } = buildAiSectionsMatrixTable(
            matrixRows(),
            'presentation',
            {
                managerName,
                userIds: new Set([7]),
            },
        );
        expect(table.data.map(row => row.id)).toEqual([7]);
    });
});
