import { describe, expect, it } from 'vitest';
import {
    OFFER_PARTY_COMPANY_EMPTY,
    OFFER_PARTY_INN_EMPTY,
    OFFER_PARTY_INVOICE_AUTO_NUMBER,
    OFFER_PARTY_INVOICE_DATE_EMPTY,
    OFFER_PARTY_INVOICE_NONE,
    OFFER_PARTY_PROVIDER_EMPTY,
    buildOfferPartyFacts,
    formatInvoiceDate,
    type OfferPartiesInput,
    type OfferPartyFact,
    type OfferPartyFactId,
} from '../offer-parties-summary.util';

const input = (patch: Partial<OfferPartiesInput> = {}): OfferPartiesInput => ({
    recipient: { companyName: 'ООО «Ромашка»', inn: '7701234567' },
    providerName: 'ООО «Гарант-Офис»',
    invoice: { needGeneralInvoice: false, needManyInvoices: false, invoiceDate: '', invoiceNumber: '' },
    ...patch,
});

const fact = (id: OfferPartyFactId, patch: Partial<OfferPartiesInput> = {}): OfferPartyFact => {
    const found = buildOfferPartyFacts(input(patch)).find(item => item.id === id);
    if (!found) throw new Error(`нет строки ${id}`);
    return found;
};

describe('сводка «Кому / От кого / Счёт»', () => {
    it('три строки в порядке: кому, от кого, счёт', () => {
        expect(buildOfferPartyFacts(input()).map(item => item.id)).toEqual(['recipient', 'provider', 'invoice']);
    });

    it('строки ведут к своим карточкам: получатель и поставщик со счётом', () => {
        const facts = buildOfferPartyFacts(input());
        expect(facts.map(item => item.anchor)).toEqual(['recipient', 'sender', 'sender']);
    });
});

describe('Кому', () => {
    it('название и ИНН заполнены — без предупреждений', () => {
        expect(fact('recipient')).toMatchObject({
            label: 'Кому',
            value: 'ООО «Ромашка»',
            isValueWarning: false,
            note: 'ИНН 7701234567',
            isNoteWarning: false,
        });
    });

    it('ИНН пуст — пометка «ИНН не заполнен» с предупреждением', () => {
        const recipient = fact('recipient', { recipient: { companyName: 'ООО «Ромашка»', inn: '' } });
        expect(recipient.note).toBe(OFFER_PARTY_INN_EMPTY);
        expect(recipient.isNoteWarning).toBe(true);
        expect(recipient.isValueWarning).toBe(false);
    });

    it('ИНН из одних пробелов считается пустым', () => {
        const recipient = fact('recipient', { recipient: { companyName: 'ООО «Ромашка»', inn: '   ' } });
        expect(recipient.note).toBe(OFFER_PARTY_INN_EMPTY);
    });

    it('название компании пустое — значение помечено, ИНН при этом показан', () => {
        const recipient = fact('recipient', { recipient: { companyName: '  ', inn: '7701234567' } });
        expect(recipient.value).toBe(OFFER_PARTY_COMPANY_EMPTY);
        expect(recipient.isValueWarning).toBe(true);
        expect(recipient.note).toBe('ИНН 7701234567');
        expect(recipient.isNoteWarning).toBe(false);
    });

    it('нет ни названия, ни ИНН — предупреждены оба', () => {
        const recipient = fact('recipient', { recipient: { companyName: '', inn: '' } });
        expect(recipient).toMatchObject({
            value: OFFER_PARTY_COMPANY_EMPTY,
            isValueWarning: true,
            note: OFFER_PARTY_INN_EMPTY,
            isNoteWarning: true,
        });
    });

    it('лишние пробелы в названии и ИНН срезаются', () => {
        const recipient = fact('recipient', { recipient: { companyName: ' ООО «Ромашка» ', inn: ' 7701234567 ' } });
        expect(recipient.value).toBe('ООО «Ромашка»');
        expect(recipient.note).toBe('ИНН 7701234567');
    });
});

describe('От кого', () => {
    it('поставщик выбран — его название без предупреждения', () => {
        expect(fact('provider')).toMatchObject({
            label: 'От кого',
            value: 'ООО «Гарант-Офис»',
            isValueWarning: false,
            note: null,
        });
    });

    it('поставщик не выбран — пометка с предупреждением', () => {
        const provider = fact('provider', { providerName: null });
        expect(provider.value).toBe(OFFER_PARTY_PROVIDER_EMPTY);
        expect(provider.isValueWarning).toBe(true);
    });

    it('пустое название поставщика считается невыбранным', () => {
        expect(fact('provider', { providerName: '  ' }).value).toBe(OFFER_PARTY_PROVIDER_EMPTY);
    });
});

describe('Счёт', () => {
    const requested = (patch: Partial<OfferPartiesInput['invoice']>): Partial<OfferPartiesInput> => ({
        invoice: {
            needGeneralInvoice: true,
            needManyInvoices: false,
            invoiceDate: '',
            invoiceNumber: '',
            ...patch,
        },
    });

    it('счёт не просят — «нет», даты и номера в сводке нет', () => {
        const invoice = fact('invoice', {
            invoice: { needGeneralInvoice: false, needManyInvoices: false, invoiceDate: '2026-12-15', invoiceNumber: '12' },
        });
        expect(invoice).toMatchObject({
            label: 'Счёт',
            value: OFFER_PARTY_INVOICE_NONE,
            isValueWarning: false,
            note: null,
            isNoteWarning: false,
        });
    });

    it('есть номер и дата — «№ номер до дата», пометок нет', () => {
        const invoice = fact('invoice', requested({ invoiceNumber: 'А-15', invoiceDate: '2026-12-15' }));
        expect(invoice.value).toBe('№ А-15 до 15.12.2026');
        expect(invoice.note).toBeNull();
        expect(invoice.isNoteWarning).toBe(false);
    });

    it('номера нет, дата есть — номер присвоит нумератор', () => {
        const invoice = fact('invoice', requested({ invoiceDate: '2026-01-05' }));
        expect(invoice.value).toBe(`${OFFER_PARTY_INVOICE_AUTO_NUMBER} до 05.01.2026`);
        expect(invoice.note).toBeNull();
    });

    it('номер есть, даты нет — пометка про срок оплаты с предупреждением', () => {
        const invoice = fact('invoice', requested({ invoiceNumber: '7' }));
        expect(invoice.value).toBe('№ 7');
        expect(invoice.note).toBe(OFFER_PARTY_INVOICE_DATE_EMPTY);
        expect(invoice.isNoteWarning).toBe(true);
    });

    it('нет ни номера, ни даты — нумератор и пометка про срок', () => {
        const invoice = fact('invoice', requested({}));
        expect(invoice.value).toBe(OFFER_PARTY_INVOICE_AUTO_NUMBER);
        expect(invoice.note).toBe(OFFER_PARTY_INVOICE_DATE_EMPTY);
        expect(invoice.isNoteWarning).toBe(true);
    });

    it('счета на все товары без общего счёта тоже считаются запрошенными', () => {
        const invoice = fact(
            'invoice',
            requested({ needGeneralInvoice: false, needManyInvoices: true, invoiceNumber: '3', invoiceDate: '2026-12-15' }),
        );
        expect(invoice.value).toBe('№ 3 до 15.12.2026');
    });

    it('номер из пробелов — номера нет', () => {
        const invoice = fact('invoice', requested({ invoiceNumber: '   ', invoiceDate: '2026-12-15' }));
        expect(invoice.value).toBe(`${OFFER_PARTY_INVOICE_AUTO_NUMBER} до 15.12.2026`);
    });
});

describe('дата срока оплаты', () => {
    it('гггг-мм-дд → дд.мм.гггг', () => {
        expect(formatInvoiceDate('2026-12-15')).toBe('15.12.2026');
    });

    it('пусто и пробелы — пустая строка', () => {
        expect(formatInvoiceDate('')).toBe('');
        expect(formatInvoiceDate('  ')).toBe('');
    });

    it('незнакомый вид остаётся как есть', () => {
        expect(formatInvoiceDate('15.12.2026')).toBe('15.12.2026');
    });
});
