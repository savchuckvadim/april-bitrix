import { describe, expect, it } from 'vitest';
import type { DuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { isOwnCandidate } from './duplicate-context';

const context = (over: Partial<DuplicateContext>): DuplicateContext => ({
    from: null,
    companyId: null,
    leadId: null,
    dealId: null,
    hasCompany: false,
    ...over,
});

describe('isOwnCandidate', () => {
    it('сделка контекста — не дубль; чужая сделка — дубль', () => {
        const ctx = context({ dealId: 25111 });
        expect(isOwnCandidate({ entityType: 'DEAL', id: 25111 }, ctx)).toBe(
            true,
        );
        expect(isOwnCandidate({ entityType: 'DEAL', id: 999 }, ctx)).toBe(
            false,
        );
    });

    it('тип обязан совпадать: лид с id сделки — дубль', () => {
        const ctx = context({ dealId: 10 });
        expect(isOwnCandidate({ entityType: 'LEAD', id: 10 }, ctx)).toBe(false);
    });

    it('компания и лид контекста отфильтровываются', () => {
        const ctx = context({ companyId: 7, leadId: 3 });
        expect(isOwnCandidate({ entityType: 'COMPANY', id: 7 }, ctx)).toBe(
            true,
        );
        expect(isOwnCandidate({ entityType: 'LEAD', id: 3 }, ctx)).toBe(true);
        expect(isOwnCandidate({ entityType: 'CONTACT', id: 7 }, ctx)).toBe(
            false,
        );
    });
});
