import { describe, expect, it } from 'vitest';
import type { IBXDeal } from '@bitrix/index';
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

describe('pickCompanyDeal', () => {
    it('открытая и самая свежая выигрывает у закрытых и старых', () => {
        const deals = [
            deal({ ID: 1, CLOSED: 'N', DATE_CREATE: '2026-01-10T10:00:00+03:00' }),
            deal({ ID: 2, CLOSED: 'Y', DATE_CREATE: '2026-05-10T10:00:00+03:00' }),
            deal({ ID: 3, CLOSED: 'N', DATE_CREATE: '2026-03-10T10:00:00+03:00' }),
        ];
        expect(pickCompanyDeal(deals)?.ID).toBe(3);
    });

    it('открытых нет — самая свежая закрытая', () => {
        const deals = [
            deal({ ID: 1, CLOSED: 'Y', DATE_CREATE: '2026-01-10T10:00:00+03:00' }),
            deal({ ID: 2, CLOSED: 'Y', DATE_CREATE: '2026-05-10T10:00:00+03:00' }),
        ];
        expect(pickCompanyDeal(deals)?.ID).toBe(2);
    });

    it('сделок нет — null', () => {
        expect(pickCompanyDeal([])).toBeNull();
    });
});
