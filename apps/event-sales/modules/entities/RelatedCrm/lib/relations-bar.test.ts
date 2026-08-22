import { describe, expect, it } from 'vitest';
import { buildRelationsBar } from './relations-bar';
import type { RelatedDeal, RelatedLead } from '../model';

const deal = (id: number, extra: Partial<RelatedDeal> = {}): RelatedDeal =>
    ({
        id,
        title: `Сделка ${id}`,
        closed: false,
        stage: { id: 'C1:NEW', name: 'Новая' },
        ...extra,
    }) as RelatedDeal;

const lead = (id: number): RelatedLead =>
    ({ id, title: `Заявка ${id}`, statusId: 'NEW' }) as RelatedLead;

describe('buildRelationsBar', () => {
    it('главная — сделка встройки, остальные миниатюрами', () => {
        const view = buildRelationsBar({
            deals: [deal(1), deal(2)],
            leads: [lead(9)],
            currentDealId: 2,
        });
        expect(view.main?.id).toBe(2);
        expect(view.minis.map(item => item.id)).toEqual([1, 9]);
        expect(view.hidden).toEqual([]);
    });

    it('открытая sales_base главнее сделки встройки', () => {
        const view = buildRelationsBar({
            deals: [
                deal(1, {
                    stage: { bitrixId: 'C1:NEW', categoryCode: 'sales_base' },
                } as Partial<RelatedDeal>),
                deal(2),
            ],
            currentDealId: 2,
        });
        expect(view.main?.id).toBe(1);
        expect(view.minis.map(item => item.id)).toEqual([2]);
    });

    it('из нескольких sales_base главная — самая свежая', () => {
        const view = buildRelationsBar({
            deals: [
                deal(1, {
                    dateCreate: '2026-01-01',
                    stage: { bitrixId: 'C1:NEW', categoryCode: 'sales_base' },
                } as Partial<RelatedDeal>),
                deal(2, {
                    dateCreate: '2026-08-01',
                    stage: { bitrixId: 'C1:WON', categoryCode: 'sales_base' },
                } as Partial<RelatedDeal>),
            ],
        });
        expect(view.main?.id).toBe(2);
    });

    it('без сделки контекста берёт самую свежую открытую', () => {
        const view = buildRelationsBar({
            deals: [
                deal(1, { dateCreate: '2026-01-01' }),
                deal(2, { dateCreate: '2026-08-01' }),
            ],
        });
        expect(view.main?.id).toBe(2);
    });

    it('закрытые сделки не показываем вовсе', () => {
        const view = buildRelationsBar({
            deals: [deal(1, { closed: true }), deal(2)],
            currentDealId: 1,
        });
        expect(view.main?.id).toBe(2);
        expect(view.minis).toEqual([]);
    });

    it('больше четырёх полосок — лишние в туман', () => {
        const view = buildRelationsBar({
            deals: [deal(1), deal(2), deal(3), deal(4)],
            leads: [lead(9), lead(10)],
            currentDealId: 1,
        });
        expect(view.main?.id).toBe(1);
        expect(view.minis).toHaveLength(3);
        expect(view.hidden).toEqual(['Заявка 9', 'Заявка 10']);
    });

    it('связей нет — показывать нечего', () => {
        const view = buildRelationsBar({});
        expect(view.main).toBeNull();
        expect(view.minis).toEqual([]);
    });

    it('baseOnly — только главная полоска', () => {
        const view = buildRelationsBar({
            deals: [deal(1), deal(2)],
            leads: [lead(9)],
            currentDealId: 1,
            mode: 'baseOnly',
        });
        expect(view.main?.id).toBe(1);
        expect(view.minis).toEqual([]);
        expect(view.hidden).toEqual([]);
    });

    it('baseLead — главная и заявки, прочие сделки не показываем', () => {
        const view = buildRelationsBar({
            deals: [deal(1), deal(2)],
            leads: [lead(9)],
            currentDealId: 1,
            mode: 'baseLead',
        });
        expect(view.main?.id).toBe(1);
        expect(view.minis.map(item => item.kind)).toEqual(['lead']);
    });

    it('deals — только сделки, заявок нет', () => {
        const view = buildRelationsBar({
            deals: [deal(1), deal(2)],
            leads: [lead(9)],
            currentDealId: 1,
            mode: 'deals',
        });
        expect(view.minis.map(item => item.id)).toEqual([2]);
    });

    it('сделок нет — крупной полоской идёт заявка', () => {
        const view = buildRelationsBar({ leads: [lead(9), lead(10)] });
        expect(view.main?.kind).toBe('lead');
        expect(view.main?.id).toBe(9);
        expect(view.minis.map(item => item.id)).toEqual([10]);
    });

    it('закрытые заявки в строку не идут', () => {
        const view = buildRelationsBar({
            deals: [deal(1)],
            leads: [
                { id: 9, title: 'Ушла', statusSemanticId: 'S' } as never,
                lead(10),
            ],
            currentDealId: 1,
        });
        expect(view.minis.map(item => item.id)).toEqual([10]);
    });
});
