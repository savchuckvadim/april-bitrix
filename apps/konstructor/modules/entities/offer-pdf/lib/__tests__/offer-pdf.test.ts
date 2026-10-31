import { describe, expect, it } from 'vitest';
import type { OfferWordByTemplateGenerateDto } from '@workspace/nest-konstructor-api';
import type { RootState } from '@/modules/app/model/store';
import {
    OFFER_DOCUMENT_FORMAT,
    OFFER_PDF_DEFAULT_SETTINGS,
    OFFER_PDF_DESCRIPTION_MODE,
    OFFER_PDF_VIEW_MODE,
} from '../../model/types';
import { offerPdfRequestBlocker, toOfferPdfRequest } from '../build-offer-pdf-request';
import { normalizeOfferPdfPrefs, OFFER_PDF_DEFAULT_PREFS } from '../offer-pdf-storage';

const wordPayload = {
    templateId: '12',
    invoiceTemplateId: '3',
    domain: 'test.bitrix24.ru',
    companyId: '7',
    dealId: '100',
    providerId: 5,
    userId: 1,
    isWord: true,
    withoutQueue: true,
    invoice: { needGeneralInvoice: true, needManyInvoices: false, isByPresentationInvoices: false, invoiceDate: '' },
    recipient: { name: 'Иванов Иван Иванович' },
    manager: { name: 'Мария' },
    rows: [],
} as unknown as OfferWordByTemplateGenerateDto;

const options = {
    templateCode: 'classic',
    settings: { ...OFFER_PDF_DEFAULT_SETTINGS, salePhrase: '  до конца месяца  ' },
    letter: { appeal: ' Уважаемый! ', text: '' },
    documentNumber: ' КП-7 ',
};

describe('запрос КП в PDF', () => {
    it('поля Word-шаблона и счёта не уходят, данные документа — уходят', () => {
        const request = toOfferPdfRequest(wordPayload, options) as unknown as Record<string, unknown>;
        for (const key of ['templateId', 'invoiceTemplateId', 'invoice', 'isWord', 'withoutQueue']) {
            expect(request).not.toHaveProperty(key);
        }
        expect(request.domain).toBe('test.bitrix24.ru');
        expect(request.dealId).toBe('100');
        expect(request.recipient).toEqual({ name: 'Иванов Иван Иванович' });
    });

    it('шаблон, настройки, письмо и номер — обрезаны; пустые — не отправляются', () => {
        const request = toOfferPdfRequest(wordPayload, options);
        expect(request.templateCode).toBe('classic');
        expect(request.settings.salePhrase).toBe('до конца месяца');
        expect(request.letter).toEqual({ appeal: 'Уважаемый!', text: undefined });
        expect(request.documentNumber).toBe('КП-7');

        const empty = toOfferPdfRequest(wordPayload, {
            ...options,
            settings: OFFER_PDF_DEFAULT_SETTINGS,
            letter: { appeal: '', text: '   ' },
            documentNumber: '',
        });
        expect(empty.settings.salePhrase).toBeNull();
        expect(empty.letter).toBeUndefined();
        expect(empty.documentNumber).toBeUndefined();
    });

    it('блокер не требует Word-шаблона, но требует сделку, строку и поставщика', () => {
        const state = {
            app: { domain: 'test.bitrix24.ru', dealId: 100 },
            rowSet: { general: { rows: [] } },
            documentProvider: { current: null },
        } as unknown as RootState;
        expect(offerPdfRequestBlocker(state)).toBe('Нет главной строки: соберите комплект');
        expect(offerPdfRequestBlocker({ ...state, app: { domain: 'x', dealId: null } } as unknown as RootState)).toBe(
            'Сначала сохраните сделку — КП прикрепляется к ней',
        );
    });
});

describe('сохранённые настройки PDF', () => {
    it('мусор и пустота → умолчания', () => {
        expect(normalizeOfferPdfPrefs(null)).toEqual(OFFER_PDF_DEFAULT_PREFS);
        expect(normalizeOfferPdfPrefs('x')).toEqual(OFFER_PDF_DEFAULT_PREFS);
        expect(normalizeOfferPdfPrefs({ format: 'docx', settings: { descriptionMode: 'huge' } })).toEqual(
            OFFER_PDF_DEFAULT_PREFS,
        );
    });

    it('допустимые значения сохраняются', () => {
        const prefs = normalizeOfferPdfPrefs({
            format: OFFER_DOCUMENT_FORMAT.PDF,
            templateCode: 'modern',
            settings: {
                descriptionMode: OFFER_PDF_DESCRIPTION_MODE.BIG,
                viewMode: OFFER_PDF_VIEW_MODE.TABLE,
                withStamps: false,
                salePhrase: 'акция',
            },
            letter: { appeal: 'Привет' },
            documentNumber: '1',
        });
        expect(prefs.format).toBe('pdf');
        expect(prefs.templateCode).toBe('modern');
        expect(prefs.settings).toEqual({
            ...OFFER_PDF_DEFAULT_SETTINGS,
            descriptionMode: 'big',
            viewMode: 'table',
            withStamps: false,
            salePhrase: 'акция',
        });
        expect(prefs.letter).toEqual({ appeal: 'Привет', text: '' });
        expect(prefs.documentNumber).toBe('1');
    });
});
