import { describe, expect, it } from 'vitest';
import { INITIAL_INVOICE_PEEK, type OfferInvoicePeek } from '../../model/types';
import { INVOICE_DEAL_FIELD_CODE, toInvoiceDealValue } from '../invoice-deal-field.util';
import { INVOICE_NUMBER_HINT_UNKNOWN, invoiceNumberHint, providerRqId } from '../invoice-number.util';

const peekOf = (patch: Partial<OfferInvoicePeek>): OfferInvoicePeek => ({ ...INITIAL_INVOICE_PEEK, ...patch });

describe('подпись под номером счёта', () => {
    it('номер уже есть — подписи нет, что бы ни ответил нумератор', () => {
        expect(invoiceNumberHint('А-15', peekOf({ status: 'ready', rqId: 1, value: '7' }))).toBeNull();
        expect(invoiceNumberHint('А-15', peekOf({ status: 'failed', rqId: 1 }))).toBeNull();
    });

    it('номер пуст, нумератор ответил — подпись называет значение нумератора', () => {
        const hint = invoiceNumberHint('', peekOf({ status: 'ready', rqId: 1, value: 'INV-12' }));
        expect(hint).toContain('№ INV-12');
        expect(hint).toContain('нумератор');
    });

    it('пробелы вместо номера — номера нет', () => {
        expect(invoiceNumberHint('   ', peekOf({ status: 'ready', rqId: 1, value: '3' }))).toContain('№ 3');
    });

    it('peek не удался — общая подпись про нумератор', () => {
        expect(invoiceNumberHint('', peekOf({ status: 'failed', rqId: 1 }))).toBe(INVOICE_NUMBER_HINT_UNKNOWN);
        expect(INVOICE_NUMBER_HINT_UNKNOWN).toBe('номер присвоит нумератор при формировании');
    });

    it('ответа ещё нет — подписи нет', () => {
        expect(invoiceNumberHint('', peekOf({ status: 'idle' }))).toBeNull();
        expect(invoiceNumberHint('', peekOf({ status: 'loading', rqId: null }))).toBeNull();
    });
});

describe('набор реквизитов поставщика для нумератора', () => {
    it('id поставщика-строка → число', () => {
        expect(providerRqId({ rqId: '15' })).toBe(15);
    });

    it('реквизиты берутся из rq.id: в списке поставщиков портала rqId пуст или «0»', () => {
        expect(providerRqId({ rq: { id: 3 } })).toBe(3);
        expect(providerRqId({ rqId: '0', rq: { id: 3 } })).toBe(3);
        expect(providerRqId({ rqId: '7', rq: { id: 3 } })).toBe(3);
        expect(providerRqId({ rqId: '7', rq: { id: 0 } })).toBe(7);
        expect(providerRqId({ rqId: '0', rq: null })).toBeNull();
    });

    it('нет поставщика, не число, ноль, дробь — null', () => {
        expect(providerRqId(null)).toBeNull();
        expect(providerRqId(undefined)).toBeNull();
        expect(providerRqId({ rqId: '' })).toBeNull();
        expect(providerRqId({ rqId: 'abc' })).toBeNull();
        expect(providerRqId({ rqId: '0' })).toBeNull();
        expect(providerRqId({ rqId: '1.5' })).toBeNull();
    });
});

describe('поля сделки под счёт', () => {
    it('коды: дата первой оплаты и номер счёта', () => {
        expect(INVOICE_DEAL_FIELD_CODE).toEqual({ invoiceDate: 'first_pay_date', invoiceNumber: 'invoice_number' });
    });

    it('значение для сделки обрезается; пусто — пустая строка', () => {
        expect(toInvoiceDealValue(' 2026-11-01 ')).toBe('2026-11-01');
        expect(toInvoiceDealValue('  ')).toBe('');
    });
});
