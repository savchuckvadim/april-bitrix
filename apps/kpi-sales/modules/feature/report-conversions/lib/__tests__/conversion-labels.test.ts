import { describe, expect, it } from 'vitest';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import type { ReportData } from '@/modules/entities/report';
import { createIndicatorLabeler } from '@/modules/shared/lib/indicator-labels';
import { buildStepDefs } from '../conversion-calc.util';
import { getDatasetForScope } from '../conversion-dataset.util';

/*
 * Шаги конверсий берут названия из датасета scope: свои названия портала
 * ставятся после отбора по исходным (выбор «Колонки» объединённого).
 */

const REPORT = [
    {
        id: 1,
        user: { ID: 1, NAME: 'Иван', LAST_NAME: 'Иванов' },
        userName: 'Иван Иванов',
        kpi: [
            {
                id: 'presentation_done',
                action: { innerCode: 'presentation_done', name: 'Презентация  проведена' },
                count: 3,
            },
        ],
    },
] as unknown as ReportData[];

const CALLINGS = [
    {
        userId: 1,
        user: { ID: 1, NAME: 'Иван', LAST_NAME: 'Иванов' },
        callings: [{ id: 30, action: 'Звонки > 30 сек', count: 12 }],
    },
] as unknown as ReportCallingData[];

const SELECTION = {
    selectedUsers: [],
    selectedActions: ['Звонки > 30 сек', 'Презентация  проведена'],
};

describe('getDatasetForScope — свои названия', () => {
    it('выбор по исходным названиям, шаги конверсий — со своими', () => {
        const labelOf = createIndicatorLabeler({ 'call:30': 'Дозвоны' });
        const dataset = getDatasetForScope('merged', REPORT, CALLINGS, SELECTION, labelOf);

        expect(buildStepDefs(dataset, ['30', 'presentation_done'], 'chain')).toEqual([
            {
                fromCode: '30',
                fromName: 'Дозвоны',
                toCode: 'presentation_done',
                toName: 'Презентация проведена',
            },
        ]);
        expect(dataset.rows[0]?.values).toEqual({ '30': 12, presentation_done: 3 });
    });

    it('без функции названий — исходные без лишних пробелов', () => {
        const dataset = getDatasetForScope('kpi', REPORT, CALLINGS);
        expect(dataset.actions.map(action => action.name)).toEqual([
            'Презентация проведена',
        ]);
    });
});
