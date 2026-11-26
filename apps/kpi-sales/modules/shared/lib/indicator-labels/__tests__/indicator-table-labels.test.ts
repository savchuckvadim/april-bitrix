import { describe, expect, it } from 'vitest';
import type { RTableProps } from '@workspace/april-ui';
import {
    createIndicatorLabeler,
    indicatorColumnLabel,
    labelTableData,
    labelTableRows,
} from '..';

const labelOf = createIndicatorLabeler({
    'ev:presentation_done': 'Встреча',
    'ev:presentation_plan': 'Встреча',
    'call:30': 'Дозвоны',
});

const TABLE: RTableProps = {
    code: 'report',
    firstCellName: 'Менеджер',
    data: [
        {
            id: 1,
            name: 'Иванов Иван',
            actions: [
                { name: 'План  Презентация', value: 4, code: 'presentation_plan' },
                { name: 'Презентация', value: 3, code: 'presentation_done' },
                { name: 'Звонки > 30 сек', value: 12, code: '30' },
                { name: ' Звонок', value: 7, code: 'call_done' },
            ],
        },
    ],
};

describe('indicatorColumnLabel', () => {
    it('по коду: событие — ev:, бакет — call:', () => {
        expect(
            indicatorColumnLabel({ name: 'Презентация', code: 'presentation_done' }, labelOf),
        ).toBe('Встреча');
        expect(indicatorColumnLabel({ name: 'Звонки > 30 сек', code: '30' }, labelOf)).toBe(
            'Дозвоны',
        );
    });

    it('колонка без кода — как есть', () => {
        expect(indicatorColumnLabel({ name: 'Оценка  разбора' }, labelOf)).toBe(
            'Оценка  разбора',
        );
    });
});

describe('labelTableRows / labelTableData', () => {
    it('меняются только названия: значения, коды и порядок прежние', () => {
        const result = labelTableData(TABLE, labelOf);

        expect(result.code).toBe('report');
        expect(result.firstCellName).toBe('Менеджер');
        expect(result.data[0]?.actions).toEqual([
            { name: 'Встреча', value: 4, code: 'presentation_plan' },
            { name: 'Встреча', value: 3, code: 'presentation_done' },
            { name: 'Дозвоны', value: 12, code: '30' },
            { name: 'Звонок', value: 7, code: 'call_done' },
        ]);
    });

    it('два показателя с одинаковым своим названием оба остаются', () => {
        const names = labelTableRows(TABLE.data, labelOf)[0]?.actions.map(
            action => action.name,
        );
        expect(names?.filter(name => name === 'Встреча')).toHaveLength(2);
    });

    it('входная таблица не изменяется', () => {
        const before = JSON.stringify(TABLE);
        labelTableData(TABLE, labelOf);
        expect(JSON.stringify(TABLE)).toBe(before);
    });
});
