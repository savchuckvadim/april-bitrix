import { describe, expect, it } from 'vitest';
import type { OfferWordByTemplateGenerateDto } from '@workspace/nest-konstructor-api';
import type { RootState } from '@/modules/app/model/store';
import {
    OFFER_DOCUMENT_FORMAT,
    OFFER_PDF_DEFAULT_SETTINGS,
    OFFER_PDF_DESCRIPTION_MODE,
    OFFER_PDF_VIEW_MODE,
    type OfferPdfTemplateInfo,
} from '../../model/types';
import { offerPdfRequestBlocker, toOfferPdfRequest } from '../build-offer-pdf-request';
import { resolvePalette } from '../offer-pdf-palette.util';
import { offerPdfRequestKey } from '../offer-pdf-request-key';
import { normalizeOfferPdfPrefs, OFFER_PDF_DEFAULT_PREFS } from '../offer-pdf-storage';
import { isOfferPdfToggleDisabled, OFFER_PDF_TOGGLES, visibleOfferPdfToggles } from '../offer-pdf-toggles';

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

const options: Parameters<typeof toOfferPdfRequest>[1] = {
    templateCode: 'classic',
    palette: null,
    settings: { ...OFFER_PDF_DEFAULT_SETTINGS, salePhrase: '  до конца месяца  ' },
    letter: { appeal: ' Уважаемый! ', text: '' },
    documentNumber: ' КП-7 ',
};

/** Стиль из списка бэка: в тесте задаём только то, что проверяем */
const template = (over: Partial<OfferPdfTemplateInfo> & Pick<OfferPdfTemplateInfo, 'code' | 'name'>): OfferPdfTemplateInfo => ({
    description: '',
    hasCover: false,
    hasPromo: false,
    lockedSettings: {},
    palettes: [],
    ...over,
});

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
        expect(request.settings?.salePhrase).toBe('до конца месяца');
        expect(request.letter).toEqual({ appeal: 'Уважаемый!', text: undefined });
        expect(request.documentNumber).toBe('КП-7');
        expect(request.palette).toBeUndefined();
        expect(request.settings?.withCover).toBe(true);
        expect(request.settings?.withPromo).toBe(true);
        expect(toOfferPdfRequest(wordPayload, { ...options, palette: 'claret' }).palette).toBe('claret');

        const empty = toOfferPdfRequest(wordPayload, {
            ...options,
            settings: OFFER_PDF_DEFAULT_SETTINGS,
            letter: { appeal: '', text: '   ' },
            documentNumber: '',
        });
        expect(empty.settings?.salePhrase).toBeNull();
        expect(empty.letter).toBeUndefined();
        expect(empty.documentNumber).toBeUndefined();
    });

    it('письмо включено: settings.withLetter = true, текст письма уходит в запрос', () => {
        const request = toOfferPdfRequest(wordPayload, {
            ...options,
            letter: { appeal: 'Уважаемый!', text: 'Свой текст' },
        });
        expect(request.settings?.withLetter).toBe(true);
        expect(request.letter).toEqual({ appeal: 'Уважаемый!', text: 'Свой текст' });
    });

    it('письмо выключено: settings.withLetter = false, набранный текст письма в запрос не идёт', () => {
        const request = toOfferPdfRequest(wordPayload, {
            ...options,
            settings: { ...OFFER_PDF_DEFAULT_SETTINGS, withLetter: false },
            letter: { appeal: 'Уважаемый!', text: 'Свой текст' },
        });
        expect(request.settings?.withLetter).toBe(false);
        expect(request.letter).toBeUndefined();
    });

    it('флаг письма Word-запроса в PDF-запрос не попадает: у PDF он в settings', () => {
        const request = toOfferPdfRequest({ ...wordPayload, withLetter: false } as OfferWordByTemplateGenerateDto, options);
        expect(request).not.toHaveProperty('withLetter');
    });

    it('скидка: по умолчанию settings.showDiscount = true, выключенная уходит как false', () => {
        expect(OFFER_PDF_DEFAULT_SETTINGS.showDiscount).toBe(true);
        expect(toOfferPdfRequest(wordPayload, options).settings?.showDiscount).toBe(true);
        const hidden = toOfferPdfRequest(wordPayload, {
            ...options,
            settings: { ...OFFER_PDF_DEFAULT_SETTINGS, showDiscount: false },
        });
        expect(hidden.settings?.showDiscount).toBe(false);
    });

    it('скидка меняет ключ превью, а остальной запрос остаётся прежним', () => {
        const shown = toOfferPdfRequest(wordPayload, options);
        const hidden = toOfferPdfRequest(wordPayload, {
            ...options,
            settings: { ...options.settings, showDiscount: false },
        });
        expect(offerPdfRequestKey(hidden)).not.toBe(offerPdfRequestKey(shown));
        expect({ ...hidden, settings: { ...hidden.settings, showDiscount: true } }).toEqual(shown);
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
            templateCode: 'facet',
            palette: 'claret',
            settings: {
                descriptionMode: OFFER_PDF_DESCRIPTION_MODE.BIG,
                viewMode: OFFER_PDF_VIEW_MODE.TABLE,
                withStamps: false,
                salePhrase: 'акция',
                withPromo: false,
            },
            letter: { appeal: 'Привет' },
            documentNumber: '1',
        });
        expect(prefs.format).toBe('pdf');
        expect(prefs.templateCode).toBe('facet');
        expect(prefs.palette).toBe('claret');
        expect(prefs.settings).toEqual({
            ...OFFER_PDF_DEFAULT_SETTINGS,
            descriptionMode: 'big',
            viewMode: 'table',
            withStamps: false,
            salePhrase: 'акция',
            withPromo: false,
        });
        expect(prefs.letter).toEqual({ appeal: 'Привет', text: '' });
        expect(prefs.documentNumber).toBe('1');
    });

    it('слепок и запись кэша без поля withLetter читаются как «с письмом»', () => {
        const old = normalizeOfferPdfPrefs({
            format: OFFER_DOCUMENT_FORMAT.PDF,
            templateCode: 'classic',
            settings: { withStamps: false, withCover: false },
        });
        expect(old.settings.withLetter).toBe(true);
        expect(old.settings.withStamps).toBe(false);
        expect(OFFER_PDF_DEFAULT_PREFS.settings.withLetter).toBe(true);
    });

    it('слепок и запись кэша без поля showDiscount читаются как «показывать скидку»', () => {
        const old = normalizeOfferPdfPrefs({
            format: OFFER_DOCUMENT_FORMAT.PDF,
            templateCode: 'classic',
            settings: { withStamps: false, withLetter: false },
        });
        expect(old.settings.showDiscount).toBe(true);
        expect(old.settings.withLetter).toBe(false);
        expect(OFFER_PDF_DEFAULT_PREFS.settings.showDiscount).toBe(true);
        expect(normalizeOfferPdfPrefs(null).settings.showDiscount).toBe(true);
    });

    it('выключенная скидка сохраняется, мусор в поле читается как «показывать»', () => {
        expect(normalizeOfferPdfPrefs({ settings: { showDiscount: false } }).settings.showDiscount).toBe(false);
        expect(normalizeOfferPdfPrefs({ settings: { showDiscount: true } }).settings.showDiscount).toBe(true);
        expect(normalizeOfferPdfPrefs({ settings: { showDiscount: 'нет' } }).settings.showDiscount).toBe(true);
    });

    it('выключенное письмо сохраняется, мусор в поле читается как «с письмом»', () => {
        expect(normalizeOfferPdfPrefs({ settings: { withLetter: false } }).settings.withLetter).toBe(false);
        expect(normalizeOfferPdfPrefs({ settings: { withLetter: true } }).settings.withLetter).toBe(true);
        expect(normalizeOfferPdfPrefs({ settings: { withLetter: 'нет' } }).settings.withLetter).toBe(true);
    });
});

describe('гамма стиля', () => {
    const facet = template({
        code: 'facet',
        name: 'Грань',
        palettes: [
            { code: 'garant', name: 'Синий Гаранта', swatch: '#1F4E9C' },
            { code: 'claret', name: 'Бордо', swatch: '#9E1F2E' },
        ],
    });

    it('выбранная у стиля есть — она, нет или не выбрана — первая', () => {
        expect(resolvePalette(facet, 'claret')).toBe('claret');
        expect(resolvePalette(facet, 'mint')).toBe('garant');
        expect(resolvePalette(facet, null)).toBe('garant');
    });

    it('у стиля без гамм и пока список стилей не пришёл — без гаммы', () => {
        expect(resolvePalette(template({ code: 'classic', name: 'Классический' }), 'claret')).toBeNull();
        expect(resolvePalette(null, 'claret')).toBeNull();
    });
});

describe('переключатели страниц', () => {
    const keys = (template: Parameters<typeof visibleOfferPdfToggles>[0]) =>
        visibleOfferPdfToggles(template).map(toggle => toggle.key);

    it('титульный и промо — только у стилей, где эти страницы есть', () => {
        const base = { code: 'iskra', name: 'Искра' } as const;
        expect(keys(template({ ...base, hasCover: true, hasPromo: true }))).toEqual([
            'withCover',
            'withPromo',
            'withStamps',
            'withManager',
            'isPriceFirst',
            'showDiscount',
        ]);
        expect(keys(template({ ...base, hasCover: true }))).toEqual([
            'withCover',
            'withStamps',
            'withManager',
            'isPriceFirst',
            'showDiscount',
        ]);
        expect(keys(null)).toEqual(['withStamps', 'withManager', 'isPriceFirst', 'showDiscount']);
    });

    it('«Показывать скидку» есть у любого стиля, подписан и не закрыт выключенным письмом', () => {
        const discount = visibleOfferPdfToggles(null).find(toggle => toggle.key === 'showDiscount');
        expect(discount?.label).toBe('Показывать скидку');
        expect(discount?.onlyIf).toBeUndefined();
        expect(discount?.needsLetter).toBeUndefined();
        expect(discount && isOfferPdfToggleDisabled(discount, { withLetter: false })).toBe(false);
    });

    it('блок под письмом подписан «Печать и подпись», ключ настройки прежний', () => {
        const stamps = visibleOfferPdfToggles(null).find(toggle => toggle.key === 'withStamps');
        expect(stamps?.label).toBe('Печать и подпись');
        expect(stamps?.hint).toBe('Блок под письмом: должность, подпись и печать поставщика');
    });

    it('переключателя письма среди страниц нет: он стоит у карточки письма', () => {
        expect(OFFER_PDF_TOGGLES.map(toggle => toggle.key)).not.toContain('withLetter');
    });

    it('печать и подпись закрыты, когда письма нет; остальные переключатели открыты', () => {
        const withLetter = { withLetter: true };
        const noLetter = { withLetter: false };
        for (const toggle of OFFER_PDF_TOGGLES) {
            expect(isOfferPdfToggleDisabled(toggle, withLetter)).toBe(false);
            expect(isOfferPdfToggleDisabled(toggle, noLetter)).toBe(toggle.key === 'withStamps');
        }
    });
});
