import { describe, expect, it } from 'vitest';
import {
    NO_PORTAL_QUOTA,
    countPortalScopedInvoiceTemplates,
    invoiceTemplateQuota,
    invoiceTemplateQuotaHint,
    maxPortalInvoiceTemplates,
} from '../invoice-template-quota.util';
import { makeTemplate } from './fixtures';

describe('invoice-template-quota.util', () => {
    it('максимум: число поставщиков плюс один общий', () => {
        expect(maxPortalInvoiceTemplates(0)).toBe(1);
        expect(maxPortalInvoiceTemplates(3)).toBe(4);
    });

    it('отрицательное число поставщиков не уменьшает максимум ниже одного', () => {
        expect(maxPortalInvoiceTemplates(-2)).toBe(1);
    });

    it('считаются шаблоны портала и поставщиков этого портала', () => {
        const templates = [
            makeTemplate({ id: 'a', visibility: 'portal', portalId: '7' }),
            makeTemplate({
                id: 'b',
                visibility: 'provider',
                portalId: '7',
                agentId: '3',
            }),
        ];

        expect(countPortalScopedInvoiceTemplates(templates, 7)).toBe(2);
        expect(countPortalScopedInvoiceTemplates(templates, '7')).toBe(2);
    });

    it('архивные, общие и чужого портала не считаются', () => {
        const templates = [
            makeTemplate({ id: 'a', isArchived: true }),
            makeTemplate({ id: 'b', visibility: 'public', portalId: null }),
            makeTemplate({ id: 'c', portalId: '8' }),
        ];

        expect(countPortalScopedInvoiceTemplates(templates, 7)).toBe(0);
    });

    it('место есть, пока шаблонов меньше максимума', () => {
        const templates = [makeTemplate({ id: 'a' })];

        expect(invoiceTemplateQuota(templates, 7, 1)).toEqual({
            count: 1,
            max: 2,
            canCreate: true,
        });
    });

    it('при поставщиках 2 и трёх шаблонах портала квота исчерпана', () => {
        const templates = [
            makeTemplate({ id: 'a' }),
            makeTemplate({ id: 'b', visibility: 'provider', agentId: '1' }),
            makeTemplate({ id: 'c', visibility: 'provider', agentId: '2' }),
        ];

        expect(invoiceTemplateQuota(templates, 7, 2)).toEqual({
            count: 3,
            max: 3,
            canCreate: false,
        });
    });

    it('без поставщиков можно один шаблон портала', () => {
        expect(invoiceTemplateQuota([], 7, 0).canCreate).toBe(true);
        expect(
            invoiceTemplateQuota([makeTemplate({ id: 'a' })], 7, 0).canCreate,
        ).toBe(false);
    });

    it('нет портала: квоты нет и добавить нельзя', () => {
        expect(invoiceTemplateQuota([], null, 3)).toBe(NO_PORTAL_QUOTA);
        expect(invoiceTemplateQuota([], undefined, 3).canCreate).toBe(false);
        expect(invoiceTemplateQuota([], '', 3).canCreate).toBe(false);
    });

    it('подсказка называет заполнение и правило', () => {
        expect(invoiceTemplateQuotaHint({ count: 1, max: 3, canCreate: true })).toBe(
            'Шаблонов портала: 1 из 3. Не больше числа поставщиков плюс один общий.',
        );
    });
});
