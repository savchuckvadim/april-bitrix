import { describe, expect, it } from 'vitest';
import { buildClientIdentity } from '../client-identity.util';

const card = {
    company: { title: 'ООО Ромашка', href: '/crm/company/details/1/' },
    deal: { label: 'Сделка № 37844', href: '/crm/deal/details/37844/' },
};

describe('buildClientIdentity', () => {
    it('большой экран — компания и сделка рядом', () => {
        const view = buildClientIdentity(card, { isSmall: false, openedFrom: 'deal' });
        expect(view.identity.title).toBe('ООО Ромашка');
        expect(view.deal?.label).toBe('Сделка № 37844');
    });

    it('вкладка сделки — только компания', () => {
        const view = buildClientIdentity(card, { isSmall: true, openedFrom: 'deal' });
        expect(view.identity.kindLabel).toBe('Компания');
        expect(view.deal).toBeNull();
    });

    it('вкладка компании — только сделка', () => {
        const view = buildClientIdentity(card, { isSmall: true, openedFrom: 'company' });
        expect(view.identity).toEqual({
            title: 'Сделка № 37844',
            href: '/crm/deal/details/37844/',
            kindLabel: 'Сделка',
        });
        expect(view.deal).toBeNull();
    });
});
