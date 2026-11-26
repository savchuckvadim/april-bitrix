import { describe, expect, it } from 'vitest';
import type { IBXDeal } from '@bitrix/index';
import type { SalesFunnelScope } from '@/modules/entities/portal';
import {
    pickCompanyDeal,
    resolvePlacementEntity,
} from '../placement-entity.util';

const deal = (overrides: Partial<IBXDeal>): IBXDeal =>
    ({
        ID: 1,
        TITLE: 'Сделка',
        CATEGORY_ID: '0',
        STAGE_ID: 'NEW',
        COMPANY_ID: '10',
        COMMENTS: '',
        ASSIGNED_BY_ID: '1',
        CREATED_BY_ID: '1',
        ...overrides,
    }) as IBXDeal;

describe('resolvePlacementEntity', () => {
    it('сделка: CRM_DEAL_DETAIL_TAB с ID', () => {
        expect(
            resolvePlacementEntity({
                placement: 'CRM_DEAL_DETAIL_TAB',
                options: { ID: '129487' },
            }),
        ).toEqual({ kind: 'deal', id: 129487 });
    });

    it('компания: CRM_COMPANY_DETAIL_TAB', () => {
        expect(
            resolvePlacementEntity({
                placement: 'CRM_COMPANY_DETAIL_TAB',
                options: { ID: 95817 },
            }),
        ).toEqual({ kind: 'company', id: 95817 });
    });

    it('без id, без options или чужой placement — null', () => {
        expect(
            resolvePlacementEntity({ placement: 'CRM_DEAL_DETAIL_TAB', options: {} }),
        ).toBeNull();
        expect(resolvePlacementEntity({ placement: 'DEFAULT', options: null })).toBeNull();
        expect(
            resolvePlacementEntity({ placement: 'CRM_LEAD_DETAIL_TAB', options: { ID: 5 } }),
        ).toBeNull();
    });
});


describe('pickCompanyDeal: открытая сделка «ОП Основная»', () => {
    // sales_base на портале — воронка 34; финальные стадии — успех, провал, «Не состоялась», «Не ЦА»
    const FUNNEL: SalesFunnelScope = {
        categoryId: 34,
        finalStageIds: new Set(['C34:WON', 'C34:LOSE', 'C34:APOLOGY', 'C34:NOT_CA']),
    };
    const open = (overrides: Partial<IBXDeal>): IBXDeal =>
        deal({
            CATEGORY_ID: '34',
            STAGE_ID: 'C34:PREPARATION',
            CLOSED: 'N',
            STAGE_SEMANTIC_ID: 'P',
            ...overrides,
        });

    it('берёт открытую сделку воронки sales_base', () => {
        const deals = [open({ ID: 7, DATE_CREATE: '2026-03-10T10:00:00+03:00' })];
        expect(pickCompanyDeal(deals, FUNNEL)?.ID).toBe(7);
    });

    it('из нескольких открытых берёт самую свежую', () => {
        const deals = [
            open({ ID: 1, DATE_CREATE: '2026-01-10T10:00:00+03:00' }),
            open({ ID: 2, DATE_CREATE: '2026-05-10T10:00:00+03:00' }),
            open({ ID: 3, DATE_CREATE: '2026-03-10T10:00:00+03:00' }),
        ];
        expect(pickCompanyDeal(deals, FUNNEL)?.ID).toBe(2);
    });

    it('закрытая сделка не берётся, даже если свежее открытой', () => {
        const deals = [
            open({ ID: 1, DATE_CREATE: '2026-01-10T10:00:00+03:00' }),
            open({ ID: 2, CLOSED: 'Y', DATE_CREATE: '2026-05-10T10:00:00+03:00' }),
        ];
        expect(pickCompanyDeal(deals, FUNNEL)?.ID).toBe(1);
    });

    it('сделка другой воронки не берётся', () => {
        const deals = [
            open({ ID: 1, CATEGORY_ID: '12', STAGE_ID: 'C12:NEW' }),
            open({ ID: 2, CATEGORY_ID: '0', STAGE_ID: 'NEW' }),
        ];
        expect(pickCompanyDeal(deals, FUNNEL)).toBeNull();
    });

    it.each([
        ['успех', 'C34:WON', 'S'],
        ['провал', 'C34:LOSE', 'F'],
        ['«Не состоялась»', 'C34:APOLOGY', 'F'],
        ['«Не ЦА»', 'C34:NOT_CA', 'F'],
    ])('финальная стадия «%s» не берётся и без отметки CLOSED', (_title, stageId, semantic) => {
        const finished = open({ ID: 1, STAGE_ID: stageId, STAGE_SEMANTIC_ID: semantic });
        expect(pickCompanyDeal([finished], FUNNEL)).toBeNull();
    });

    it('финальная стадия отсекается и по списку стадий воронки, если семантики в ответе нет', () => {
        const noSemantics = deal({
            ID: 1,
            CATEGORY_ID: '34',
            STAGE_ID: 'C34:APOLOGY',
            CLOSED: 'N',
        });
        expect(pickCompanyDeal([noSemantics], FUNNEL)).toBeNull();
    });

    it('любая нефинальная стадия подходит, ответственный не важен', () => {
        const deals = [
            open({ ID: 1, STAGE_ID: 'C34:NEW', ASSIGNED_BY_ID: '99' }),
            open({ ID: 2, STAGE_ID: 'C34:DOCUMENTS', ASSIGNED_BY_ID: '5', DATE_CREATE: '2026-02-01T10:00:00+03:00' }),
        ];
        expect(pickCompanyDeal(deals, FUNNEL)?.ID).toBe(2);
    });

    it('числовая CATEGORY_ID из ответа тоже совпадает с воронкой', () => {
        const numeric = open({ ID: 4, CATEGORY_ID: 34 as unknown as string });
        expect(pickCompanyDeal([numeric], FUNNEL)?.ID).toBe(4);
    });

    it('подходящих нет — null; сделок нет — null; воронка портала неизвестна — null', () => {
        expect(pickCompanyDeal([], FUNNEL)).toBeNull();
        expect(pickCompanyDeal([open({ ID: 1, CLOSED: 'Y' })], FUNNEL)).toBeNull();
        expect(pickCompanyDeal([open({ ID: 1 })], null)).toBeNull();
    });
});
