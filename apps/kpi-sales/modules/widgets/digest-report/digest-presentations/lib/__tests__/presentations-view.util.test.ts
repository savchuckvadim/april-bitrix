import { describe, expect, it } from 'vitest';
import type { DigestPresentation } from '@/modules/entities/digest';
import type { EnabledPlanIndicator } from '@/modules/feature/plans';
import {
    buildPresEmployeeRows,
    buildPresRatings,
    presentationsIndicator,
    totalPresRow,
} from '../presentations-view.util';

const pres = (overrides: Partial<DigestPresentation>): DigestPresentation =>
    ({
        dealId: 1,
        dayStatus: 'held',
        assignedId: 7,
        plannedAtStart: true,
        spontaneous: false,
        company: { id: 1, title: 'A' },
        complectName: null,
        sum: 0,
        ...overrides,
    }) as DigestPresentation;

const indicator = {
    code: 'presentations_done',
    unit: 'count',
    factSource: 'kpi',
    factKey: 'presentation_done',
    defaultName: 'Презентации',
    displayName: 'Презентации',
    periodType: 'month',
} as EnabledPlanIndicator;

describe('presentationsIndicator', () => {
    it('находит показатель по ключу факта', () => {
        expect(presentationsIndicator([indicator])?.code).toBe('presentations_done');
        expect(presentationsIndicator([])).toBeNull();
    });
});

describe('buildPresEmployeeRows / totalPresRow / buildPresRatings', () => {
    const items = [
        pres({ dealId: 1, assignedId: 7 }),
        pres({ dealId: 2, assignedId: 7, complectName: 'Юрист', sum: 100 }),
        pres({ dealId: 3, assignedId: 7, dayStatus: 'notHeld' }),
        pres({ dealId: 4, assignedId: 8, plannedAtStart: false }),
    ];
    const names = new Map([[7, 'Анна'], [8, 'Иван'], [9, 'Пётр']]);
    // 93 в месяц / 31 день = 3 в день.
    const rows = buildPresEmployeeRows(
        items,
        [7, 8, 9],
        id => names.get(id) ?? '',
        indicator,
        { 7: { presentations_done: 93 }, 9: { presentations_done: 31 } },
        '2026-10-14',
    );

    it('план руководителя на день, исполнение, конверсия плана CRM, комплекты', () => {
        const anna = rows.find(row => row.userId === 7)!;
        expect(anna.managerPlan).toBe(3);
        expect(anna.summary.held).toBe(2);
        expect(anna.planExecution).toBeCloseTo(2 / 3);
        expect(anna.summary.planConversion).toBeCloseTo(2 / 3);
        expect(anna.complects).toEqual(['Юрист']);
        // Без презентаций, но с планом — строка есть (исполнение 0).
        const petr = rows.find(row => row.userId === 9)!;
        expect(petr.summary.total).toBe(0);
        expect(petr.planExecution).toBe(0);
        expect(rows.find(row => row.userId === 8)!.managerPlan).toBeNull();
    });

    it('итого: Σ планов только заданных; рейтинги по убыванию', () => {
        expect(totalPresRow(rows)).toEqual({ managerPlan: 4, planExecution: 3 / 4 });
        const [execution, conversion, held] = buildPresRatings(rows);
        expect(execution!.entries.map(e => e.userId)).toEqual([7, 9]);
        expect(conversion!.entries.map(e => e.userId)).toEqual([7]);
        expect(held!.entries.map(e => [e.userId, e.rank])).toEqual([
            [7, 1],
            [8, 2],
        ]);
    });
});
