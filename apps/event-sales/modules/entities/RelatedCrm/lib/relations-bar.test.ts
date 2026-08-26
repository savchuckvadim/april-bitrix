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

    it('из двух sales_base главная — сделка встройки, даже более ранняя (бэк двигает её)', () => {
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
            currentDealId: 1,
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

    // todo2508-02 №1: лид «нового стиля» без компании — граф сделку не видит,
    // единственный источник — привязка задачи (taskDeals).
    it('лид без компании: сделка привязки задачи становится главной', () => {
        const view = buildRelationsBar({
            deals: [],
            boundDeals: [
                deal(25359, {
                    stage: { bitrixId: 'C1:NEW', categoryCode: 'sales_base' },
                } as Partial<RelatedDeal>),
            ],
            mode: 'baseOnly',
        });
        expect(view.main?.kind).toBe('deal');
        expect(view.main?.id).toBe(25359);
    });

    it('привязка без sales_base всё равно даёт главную полоску', () => {
        const view = buildRelationsBar({
            boundDeals: [deal(7)],
            mode: 'baseOnly',
        });
        expect(view.main?.id).toBe(7);
    });

    it('привязка задачи не дублирует сделку графа — версия графа богаче', () => {
        const view = buildRelationsBar({
            deals: [deal(1, { title: 'Из графа' })],
            boundDeals: [deal(1, { title: 'Из привязки' }), deal(2)],
            currentDealId: 1,
        });
        expect(view.main?.id).toBe(1);
        expect(view.main?.title).toBe('Из графа');
        expect(view.minis.map(item => item.id)).toEqual([2]);
    });

    it('закрытая сделка привязки в строку не идёт', () => {
        const view = buildRelationsBar({
            boundDeals: [deal(3, { closed: true })],
        });
        expect(view.main).toBeNull();
    });
});

/** Сделка с ответственным — для правила владения. */
const ownedDeal = (
    id: number,
    responsibleId: number,
    extra: Partial<RelatedDeal> = {},
): RelatedDeal =>
    deal(id, {
        responsible: { id: responsibleId, name: `Менеджер ${responsibleId}` },
        ...extra,
    } as Partial<RelatedDeal>);

describe('buildRelationsBar: правило владения (2508)', () => {
    it('чужая открытая главной не становится: главной остаётся закрытая сделка контекста', () => {
        const view = buildRelationsBar({
            deals: [deal(1, { closed: true }), ownedDeal(2, 77)],
            currentDealId: 1,
            currentUserId: 5,
        });
        expect(view.main?.id).toBe(1);
        expect(view.minis.map(item => item.id)).toEqual([2]);
        expect(view.notice).toEqual({
            kind: 'foreignOpen',
            deal: expect.objectContaining({ id: 2 }),
        });
    });

    it('закрытого контекста нет в данных (includeClosed=false) — главной нет, чужая миниатюрой', () => {
        const view = buildRelationsBar({
            deals: [ownedDeal(2, 77)],
            currentDealId: 1,
            currentDealClosed: true,
            currentUserId: 5,
        });
        expect(view.main).toBeNull();
        expect(view.minis.map(item => item.id)).toEqual([2]);
        expect(view.notice?.kind).toBe('foreignOpen');
    });

    it('контекст закрыт, есть СВОЯ открытая — автопереключение + инфо-хинт', () => {
        const view = buildRelationsBar({
            deals: [deal(1, { closed: true }), ownedDeal(2, 5)],
            currentDealId: 1,
            currentUserId: 5,
        });
        expect(view.main?.id).toBe(2);
        expect(view.notice).toEqual({
            kind: 'ownOpenSwitch',
            deal: expect.objectContaining({ id: 2 }),
        });
    });

    it('своя открытая при живых чужих: автовыбор игнорирует чужие, хинта нет', () => {
        const view = buildRelationsBar({
            deals: [
                ownedDeal(2, 77, { dateCreate: '2026-08-01' }),
                ownedDeal(3, 5, { dateCreate: '2026-01-01' }),
            ],
            currentUserId: 5,
        });
        expect(view.main?.id).toBe(3);
        expect(view.minis.map(item => item.id)).toEqual([2]);
        expect(view.notice).toBeNull();
    });

    it('чужая sales_base не перебивает свою обычную', () => {
        const view = buildRelationsBar({
            deals: [
                ownedDeal(2, 77, {
                    stage: { bitrixId: 'C1:NEW', categoryCode: 'sales_base' },
                } as Partial<RelatedDeal>),
                ownedDeal(3, 5),
            ],
            currentUserId: 5,
        });
        expect(view.main?.id).toBe(3);
    });

    it('открытая сделка контекста главная и без владения — контекст выбрал менеджер', () => {
        const view = buildRelationsBar({
            deals: [ownedDeal(1, 77)],
            currentDealId: 1,
            currentUserId: 5,
        });
        expect(view.main?.id).toBe(1);
        // Хинт «у клиента чужая открытая» про сам контекст не нужен.
        expect(view.notice).toBeNull();
    });

    it('без ответственного сделка считается своей (fail-open привязок)', () => {
        const view = buildRelationsBar({
            deals: [deal(2)],
            currentUserId: 5,
        });
        expect(view.main?.id).toBe(2);
        expect(view.notice).toBeNull();
    });

    it('пользователь фрейма неизвестен — правило выключено, поведение прежнее', () => {
        const view = buildRelationsBar({
            deals: [ownedDeal(2, 77)],
        });
        expect(view.main?.id).toBe(2);
        expect(view.notice).toBeNull();
    });

    it('контекст открыт — инфо-хинта о переключении нет, даже если главная другая', () => {
        const view = buildRelationsBar({
            deals: [
                ownedDeal(1, 5),
                ownedDeal(2, 5, {
                    stage: { bitrixId: 'C1:NEW', categoryCode: 'sales_base' },
                } as Partial<RelatedDeal>),
            ],
            currentDealId: 1,
            currentDealClosed: false,
            currentUserId: 5,
        });
        expect(view.main?.id).toBe(2);
        expect(view.notice).toBeNull();
    });
});
