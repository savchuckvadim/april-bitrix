import { describe, expect, it } from 'vitest';
import type { RelatedCrmDetails, RelatedDeal, RelatedLead } from '../model';
import {
    MAX_RELATION_DEALS,
    resolveTaskRelation,
} from './resolve-task-relation';

const deal = (over: Partial<RelatedDeal>): RelatedDeal =>
    ({
        id: 1,
        title: 'Сделка',
        stage: { bitrixId: 'NEW' },
        closed: false,
        ...over,
    }) as RelatedDeal;

const lead = (over: Partial<RelatedLead>): RelatedLead =>
    ({ id: 1, title: 'Лид', ...over }) as RelatedLead;

const details = (over: Partial<RelatedCrmDetails>): RelatedCrmDetails =>
    ({ deals: [], leads: [], contacts: [], ...over }) as RelatedCrmDetails;

describe('resolveTaskRelation', () => {
    it('без details и привязанных возвращает пустую связь', () => {
        expect(
            resolveTaskRelation({
                details: null,
                boundDeals: [],
                dealIds: [1],
                leadIds: [2],
            }),
        ).toEqual({ deals: [], lead: null });
    });

    it('закрытые сделки не попадают в полоски', () => {
        const result = resolveTaskRelation({
            details: details({
                deals: [deal({ id: 1, closed: true }), deal({ id: 2 })],
            }),
            boundDeals: [],
            dealIds: [1],
            leadIds: [],
        });
        expect(result.deals.map(item => item.id)).toEqual([2]);
    });

    it('привязанные к задаче сделки идут первыми, остальные — по свежести', () => {
        const result = resolveTaskRelation({
            details: details({
                deals: [
                    deal({ id: 1, dateCreate: '2026-01-01' }),
                    deal({ id: 2, dateCreate: '2026-03-01' }),
                    deal({ id: 3, dateCreate: '2026-02-01' }),
                ],
            }),
            boundDeals: [],
            dealIds: [3],
            leadIds: [],
        });
        expect(result.deals.map(item => item.id)).toEqual([3, 2, 1]);
    });

    it(`показывает не больше ${MAX_RELATION_DEALS} сделок`, () => {
        const result = resolveTaskRelation({
            details: details({
                deals: [1, 2, 3, 4, 5].map(id => deal({ id })),
            }),
            boundDeals: [],
            dealIds: [],
            leadIds: [],
        });
        expect(result.deals).toHaveLength(MAX_RELATION_DEALS);
    });

    it('лид находится по привязкам задачи', () => {
        const result = resolveTaskRelation({
            details: details({ leads: [lead({ id: 7 }), lead({ id: 8 })] }),
            boundDeals: [],
            dealIds: [],
            leadIds: [8],
        });
        expect(result.lead?.id).toBe(8);
        expect(result.deals).toEqual([]);
    });

    it('привязанная сделка вне графа клиента приходит из boundDeals с пометкой', () => {
        const result = resolveTaskRelation({
            details: details({ deals: [deal({ id: 2 })] }),
            boundDeals: [deal({ id: 25111 })],
            dealIds: [25111],
            leadIds: [],
        });
        expect(result.deals.map(item => item.id)).toEqual([25111, 2]);
        expect(result.deals[0]?.isOutsideClientGraph).toBe(true);
        expect(result.deals[0]?.isTaskBound).toBe(true);
        expect(result.deals[1]?.isOutsideClientGraph).toBeUndefined();
        expect(result.deals[1]?.isTaskBound).toBeUndefined();
    });

    it('пока граф не загружен, привязанная сделка не клеймится несоответствием', () => {
        const result = resolveTaskRelation({
            details: null,
            boundDeals: [deal({ id: 25111 })],
            dealIds: [25111],
            leadIds: [],
        });
        expect(result.deals.map(item => item.id)).toEqual([25111]);
        expect(result.deals[0]?.isOutsideClientGraph).toBeUndefined();
    });

    it('версия из графа предпочитается портальной привязке', () => {
        const result = resolveTaskRelation({
            details: details({
                deals: [deal({ id: 5, title: 'Из графа' })],
            }),
            boundDeals: [deal({ id: 5, title: 'Из портала' })],
            dealIds: [5],
            leadIds: [],
        });
        expect(result.deals).toHaveLength(1);
        expect(result.deals[0]?.title).toBe('Из графа');
        expect(result.deals[0]?.isOutsideClientGraph).toBeUndefined();
    });
});
