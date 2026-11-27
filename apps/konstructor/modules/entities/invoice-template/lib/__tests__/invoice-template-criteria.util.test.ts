import { describe, expect, it } from 'vitest';
import { RQ_TYPE } from '../../../bx-rq/model/types';
import {
    ANY_CRITERIA_LABEL,
    INVOICE_CLIENT_TYPE_CODES,
    INVOICE_CLIENT_TYPE_OPTIONS,
    INVOICE_SUPPLY_TYPE_CODES,
    INVOICE_SUPPLY_TYPE_LABELS,
    buildResolveInvoiceParams,
    clientTypeOfRq,
    formatCriteriaList,
    invoiceClientTypeLabel,
    invoiceSupplyTypeLabel,
} from '../invoice-template-criteria.util';

describe('подписи критериев', () => {
    it('подписи типов клиента как в админке, включая адвокатов', () => {
        expect(invoiceClientTypeLabel('org_state')).toBe('Бюджетная организация');
        expect(invoiceClientTypeLabel('org')).toBe('Организация');
        expect(invoiceClientTypeLabel('ip')).toBe('ИП');
        expect(invoiceClientTypeLabel('fiz')).toBe('Физлицо');
        expect(invoiceClientTypeLabel('advokat')).toBe('Адвокатское образование');
    });

    it('подписи типов поставки', () => {
        expect(invoiceSupplyTypeLabel('internet')).toBe('Интернет');
        expect(invoiceSupplyTypeLabel('proxima')).toBe('Проксима');
    });

    it('неизвестный код показывается как есть', () => {
        expect(invoiceClientTypeLabel('new_type')).toBe('new_type');
        expect(invoiceSupplyTypeLabel('cloud')).toBe('cloud');
    });

    it('у каждого кода есть подпись, порядок опций совпадает с порядком кодов', () => {
        expect(INVOICE_CLIENT_TYPE_OPTIONS.map(option => option.value)).toEqual([
            ...INVOICE_CLIENT_TYPE_CODES,
        ]);
        for (const code of INVOICE_SUPPLY_TYPE_CODES) {
            expect(INVOICE_SUPPLY_TYPE_LABELS[code]).toBeTruthy();
        }
    });
});

describe('formatCriteriaList', () => {
    it('пустое, null и undefined значат «Любой»', () => {
        expect(formatCriteriaList([], invoiceClientTypeLabel)).toBe(
            ANY_CRITERIA_LABEL,
        );
        expect(formatCriteriaList(null, invoiceClientTypeLabel)).toBe('Любой');
        expect(formatCriteriaList(undefined, invoiceClientTypeLabel)).toBe(
            'Любой',
        );
    });

    it('список подписывается через запятую', () => {
        expect(
            formatCriteriaList(['org_state', 'ip'], invoiceClientTypeLabel),
        ).toBe('Бюджетная организация, ИП');
    });
});

describe('clientTypeOfRq: тип шапки в код бэка', () => {
    it('все типы шапки переводятся', () => {
        expect(clientTypeOfRq(RQ_TYPE.ORGANIZATION)).toBe('org');
        expect(clientTypeOfRq(RQ_TYPE.BUDGET)).toBe('org_state');
        expect(clientTypeOfRq(RQ_TYPE.IP)).toBe('ip');
        expect(clientTypeOfRq(RQ_TYPE.FIZ)).toBe('fiz');
    });

    it('тип не задан: null, подстановки «организация» нет', () => {
        expect(clientTypeOfRq(null)).toBeNull();
        expect(clientTypeOfRq(undefined)).toBeNull();
    });
});

describe('buildResolveInvoiceParams', () => {
    const base = {
        domain: 'gsr.bitrix24.ru',
        providerId: null,
        clientType: null,
        supplyType: null,
    };

    it('без признаков уходит один домен', () => {
        expect(buildResolveInvoiceParams(base)).toEqual({
            domain: 'gsr.bitrix24.ru',
        });
    });

    it('заданные признаки уходят все', () => {
        expect(
            buildResolveInvoiceParams({
                ...base,
                providerId: 42,
                clientType: 'ip',
                supplyType: 'proxima',
            }),
        ).toEqual({
            domain: 'gsr.bitrix24.ru',
            providerId: 42,
            clientType: 'ip',
            supplyType: 'proxima',
        });
    });

    it('поставщик 0 и меньше не отправляется: бэк возьмёт шаблоны без поставщика', () => {
        expect(buildResolveInvoiceParams({ ...base, providerId: 0 })).toEqual({
            domain: 'gsr.bitrix24.ru',
        });
        expect(buildResolveInvoiceParams({ ...base, providerId: -1 })).toEqual({
            domain: 'gsr.bitrix24.ru',
        });
    });
});
