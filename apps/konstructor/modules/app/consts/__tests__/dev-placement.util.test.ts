import { describe, expect, it } from 'vitest';
import { buildDevPlacement } from '../dev-placement.util';

describe('placement dev-режима', () => {
    it('по умолчанию — вкладка сделки', () => {
        expect(buildDevPlacement({ dealId: 37898, companyId: 32442, kind: '' })).toEqual({
            placement: 'CRM_DEAL_DETAIL_TAB',
            options: { ID: 37898 },
        });
    });

    it('company — вкладка компании с ID компании', () => {
        expect(buildDevPlacement({ dealId: 37898, companyId: 32442, kind: 'company' })).toEqual({
            placement: 'CRM_COMPANY_DETAIL_TAB',
            options: { ID: 32442 },
        });
    });

    it('без ID сделки пустой выбор берёт компанию', () => {
        expect(buildDevPlacement({ dealId: 0, companyId: 32442, kind: '' })).toEqual({
            placement: 'CRM_COMPANY_DETAIL_TAB',
            options: { ID: 32442 },
        });
    });

    it('явно выбранной карточке нужен её ID: чужой не подставляется', () => {
        expect(buildDevPlacement({ dealId: 37898, companyId: 0, kind: 'company' })).toBeNull();
        expect(buildDevPlacement({ dealId: 0, companyId: 32442, kind: 'deal' })).toBeNull();
    });

    it('неизвестное значение читается как пустое; ничего не задано — null', () => {
        expect(buildDevPlacement({ dealId: 5, companyId: 0, kind: 'lead' })?.placement).toBe(
            'CRM_DEAL_DETAIL_TAB',
        );
        expect(buildDevPlacement({ dealId: 0, companyId: 0, kind: '' })).toBeNull();
    });
});
