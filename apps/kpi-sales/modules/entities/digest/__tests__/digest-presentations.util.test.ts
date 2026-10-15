import { describe, expect, it } from 'vitest';
import type { DigestPresentation } from '../model';
import {
    bucketPresentationsByHour,
    complectStats,
    EMPTY_PRES_FILTER,
    filterPresentations,
    presentationClientTitle,
    summarizePresentations,
} from '../lib/digest-presentations.util';

export const presentation = (overrides: Partial<DigestPresentation> = {}): DigestPresentation => ({
    dealId: 1,
    title: 'Презентация',
    stageCode: 'spres_success',
    stageName: 'Проведена',
    dayStatus: 'held',
    assignedId: 7,
    planAuthorId: null,
    planDate: '2026-10-14 10:00:00',
    planCreatedAt: '2026-10-12 09:00:00',
    doneDate: '2026-10-14 10:30:00',
    createdAt: '2026-10-12 09:00:00',
    movedAt: '2026-10-14 10:30:00',
    hour: 10,
    plannedAtStart: true,
    spontaneous: false,
    company: { id: 5, title: 'Ромашка' },
    contact: null,
    lead: null,
    baseDeal: null,
    complectName: 'Юрист',
    complectSource: 'base',
    sum: 100,
    productNames: [],
    planComment: null,
    reportComment: null,
    noresultReason: null,
    history: [],
    ...overrides,
});

const items = [
    presentation({ dealId: 1 }),
    presentation({ dealId: 2, dayStatus: 'notHeld', hour: 11, complectName: null, sum: 0 }),
    presentation({ dealId: 3, dayStatus: 'held', plannedAtStart: false, spontaneous: true, company: null, lead: { id: 9, title: 'Заявка' }, complectName: 'Офис', sum: 50, hour: 15 }),
    presentation({ dealId: 4, dayStatus: 'plannedNext', plannedAtStart: false, assignedId: 8, hour: 9 }),
    presentation({ dealId: 5, dayStatus: 'held', complectName: 'Юрист', sum: 70, assignedId: 8, hour: 10 }),
];

describe('filterPresentations', () => {
    it('по сотруднику, статусам, компании и инициативе', () => {
        expect(filterPresentations(items, EMPTY_PRES_FILTER)).toHaveLength(5);
        expect(filterPresentations(items, { ...EMPTY_PRES_FILTER, userId: 8 }).map(i => i.dealId)).toEqual([4, 5]);
        expect(
            filterPresentations(items, { ...EMPTY_PRES_FILTER, statuses: new Set(['held']) }).map(i => i.dealId),
        ).toEqual([1, 3, 5]);
        expect(filterPresentations(items, { ...EMPTY_PRES_FILTER, company: 'without' }).map(i => i.dealId)).toEqual([3]);
        expect(
            filterPresentations(items, { ...EMPTY_PRES_FILTER, initiative: 'spontaneous' }).map(i => i.dealId),
        ).toEqual([3]);
    });
});

describe('summarizePresentations', () => {
    it('исходы, план на день, конверсия плана, сумма проведённых', () => {
        const summary = summarizePresentations(items);
        expect(summary).toEqual(
            expect.objectContaining({
                total: 5,
                plannedAtStart: 3,
                held: 3,
                notHeld: 1,
                plannedNext: 1,
                spontaneous: 1,
                withCompany: 4,
                heldSum: 220,
            }),
        );
        // Из трёх стоявших на день проведены две (1 и 5).
        expect(summary.planConversion).toBeCloseTo(2 / 3);
    });
});

describe('complectStats / bucketPresentationsByHour / presentationClientTitle', () => {
    it('комплекты только проведённых, по убыванию количества', () => {
        expect(complectStats(items)).toEqual([
            { name: 'Юрист', count: 2, sum: 170 },
            { name: 'Офис', count: 1, sum: 50 },
        ]);
    });

    it('часы: стек по статусам и презентации часа', () => {
        const { buckets, itemsByHour } = bucketPresentationsByHour(items);
        expect(buckets[10]!.values).toEqual({ held: 2 });
        expect(buckets[11]!.values).toEqual({ notHeld: 1 });
        expect(itemsByHour[10]!.map(i => i.dealId)).toEqual([1, 5]);
    });

    it('клиент: компания, иначе лид', () => {
        expect(presentationClientTitle(items[0]!)).toBe('Ромашка');
        expect(presentationClientTitle(items[2]!)).toBe('Лид: Заявка');
        expect(presentationClientTitle({ company: null, lead: null, contact: null })).toBe('Без клиента');
    });
});
