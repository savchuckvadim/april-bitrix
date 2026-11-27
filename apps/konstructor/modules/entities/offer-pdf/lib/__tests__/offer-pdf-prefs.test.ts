import { describe, expect, it } from 'vitest';
import { restoreV2, serializeV2 } from '../../../snapshot/lib/v2/serialize';
import { offerPdfActions, offerPdfReducer } from '../../model/OfferPdfSlice';
import {
    OFFER_COMPLECTS_MODE,
    OFFER_DOCUMENT_FORMAT,
    OFFER_PDF_DEFAULT_SETTINGS,
    type OfferPdfState,
    type OfferPdfStylePrefs,
} from '../../model/types';
import {
    mergeOfferPdfSnapshot,
    offerPdfForLibrary,
    offerPdfForSnapshot,
    offerPdfStyleOf,
} from '../offer-pdf-snapshot.util';
import { normalizeOfferPdfPrefs, normalizeOfferPdfStyle } from '../offer-pdf-storage';

const initial: OfferPdfState = offerPdfReducer(undefined, { type: '@@init' });

const iskra: OfferPdfStylePrefs = {
    format: OFFER_DOCUMENT_FORMAT.PDF,
    templateCode: 'iskra',
    palette: null,
    settings: { ...OFFER_PDF_DEFAULT_SETTINGS, withPromo: false },
};

const run = (state: OfferPdfState, ...actions: Parameters<typeof offerPdfReducer>[1][]): OfferPdfState =>
    actions.reduce(offerPdfReducer, state);

describe('стиль КП: чей выбор сильнее', () => {
    it('выбор менеджера ложится на умолчания и уступает правке на экране', () => {
        const manager = run(initial, offerPdfActions.applyManager(iskra));
        expect(manager.origin).toBe('manager');
        expect(manager.prefs.templateCode).toBe('iskra');

        // ответ сервера пришёл после того, как менеджер сменил гамму сам
        const edited = run(
            manager,
            offerPdfActions.setPalette('mint'),
            offerPdfActions.applyManager({ ...iskra, templateCode: 'halo' }),
        );
        expect(edited.prefs.templateCode).toBe('iskra');
        expect(edited.prefs.palette).toBe('mint');
    });

    it('слепок сделки сильнее выбора менеджера, даже если тот пришёл позже', () => {
        const restored = run(
            initial,
            offerPdfActions.applySnapshot({ ...iskra, templateCode: 'facet', palette: 'claret' }),
            offerPdfActions.applyManager(iskra),
        );
        expect(restored.origin).toBe('snapshot');
        expect(restored.prefs.templateCode).toBe('facet');
        expect(restored.prefs.palette).toBe('claret');
    });

    it('новый стиль начинается с первой гаммы', () => {
        const next = run(
            initial,
            offerPdfActions.setPalette('claret'),
            offerPdfActions.selectStyle({ templateCode: 'halo' }),
        );
        expect(next.prefs.palette).toBeNull();
        const withPalette = run(next, offerPdfActions.selectStyle({ templateCode: 'facet', palette: 'claret' }));
        expect(withPalette.prefs).toMatchObject({ templateCode: 'facet', palette: 'claret' });
    });

    it('новая сделка: письмо и номер пустые, стиль остаётся', () => {
        const next = run(
            initial,
            offerPdfActions.applyManager(iskra),
            offerPdfActions.setLetter({ text: 'Текст' }),
            offerPdfActions.setDocumentNumber('17'),
            offerPdfActions.resetDocument(),
        );
        expect(next.prefs.letter).toEqual({ appeal: '', text: '' });
        expect(next.prefs.documentNumber).toBe('');
        expect(next.prefs.templateCode).toBe('iskra');
    });
});

describe('стиль КП в слепке', () => {
    const edited = run(
        initial,
        offerPdfActions.selectStyle({ templateCode: 'iskra' }),
        offerPdfActions.setLetter({ appeal: 'Уважаемый Иван!' }),
        offerPdfActions.setDocumentNumber('17'),
    );

    it('нетронутые умолчания в слепок не пишутся', () => {
        expect(offerPdfForSnapshot(initial)).toBeNull();
        expect(offerPdfForLibrary(initial)).toBeNull();
    });

    it('сделка хранит письмо и номер, избранное — только стиль', () => {
        expect(offerPdfForSnapshot(edited)).toMatchObject({ templateCode: 'iskra', documentNumber: '17' });
        const library = offerPdfForLibrary(edited);
        expect(library).toMatchObject({ templateCode: 'iskra' });
        expect(library).not.toHaveProperty('letter');
        expect(library).not.toHaveProperty('documentNumber');
    });

    it('заготовка из избранного не трогает письмо и номер сделки', () => {
        const library = offerPdfForLibrary(run(initial, offerPdfActions.selectStyle({ templateCode: 'halo' })));
        const merged = mergeOfferPdfSnapshot(edited.prefs, library);
        expect(merged.templateCode).toBe('halo');
        expect(merged.letter.appeal).toBe('Уважаемый Иван!');
        expect(merged.documentNumber).toBe('17');
    });

    it('слепок v2 возвращает стиль; запись без стиля — без поля', () => {
        const general = { id: 'general', kind: 'general' as const, rows: [], collapsed: false };
        const write = (pdf: ReturnType<typeof offerPdfForSnapshot>) =>
            serializeV2({
                state: {
                    regionCode: null,
                    contractCode: null,
                    supplyCode: null,
                    general,
                    alternative: [],
                    templateId: null,
                    rqId: null,
                    pdf,
                },
                dealId: 1,
                domain: 'd',
                userId: 1,
                savedAt: '2026-11-16T00:00:00.000Z',
            });

        const withPdf = JSON.parse(JSON.stringify(write(offerPdfForSnapshot(edited))));
        expect(restoreV2(withPdf).pdf).toMatchObject({ templateCode: 'iskra', documentNumber: '17' });

        const without = write(null);
        expect(without).not.toHaveProperty('pdf');
        expect(restoreV2(without).pdf).toBeNull();
    });
});

describe('способ печати наполнения комплектов в настройках PDF', () => {
    const separate = run(initial, offerPdfActions.setSettings({ complectsMode: OFFER_COMPLECTS_MODE.SEPARATE }));

    /** Запись до наполнения по комплектам: полей способа печати нет. */
    const legacyStyle = {
        format: 'pdf',
        templateCode: 'iskra',
        palette: null,
        settings: { withPromo: false, salePhrase: 'акция' },
    };

    it('по умолчанию объединённо', () => {
        expect(OFFER_PDF_DEFAULT_SETTINGS.complectsMode).toBe(OFFER_COMPLECTS_MODE.MERGED);
        expect(initial.prefs.settings.complectsMode).toBe(OFFER_COMPLECTS_MODE.MERGED);
        expect(normalizeOfferPdfPrefs(undefined).settings.complectsMode).toBe(OFFER_COMPLECTS_MODE.MERGED);
    });

    it('правка на экране меняет способ печати и оставляет остальные настройки', () => {
        expect(separate.origin).toBe('user');
        expect(separate.prefs.settings).toEqual({
            ...OFFER_PDF_DEFAULT_SETTINGS,
            complectsMode: OFFER_COMPLECTS_MODE.SEPARATE,
        });
    });

    it('запись без поля и значение вне списка читаются как объединённое наполнение', () => {
        expect(normalizeOfferPdfStyle(legacyStyle).settings).toMatchObject({
            withPromo: false,
            salePhrase: 'акция',
            complectsMode: OFFER_COMPLECTS_MODE.MERGED,
        });
        const modeOf = (raw: unknown) => normalizeOfferPdfStyle(raw).settings.complectsMode;
        expect(modeOf({ settings: { complectsMode: 'всё сразу' } })).toBe(OFFER_COMPLECTS_MODE.MERGED);
        expect(modeOf(null)).toBe(OFFER_COMPLECTS_MODE.MERGED);
        expect(modeOf(undefined)).toBe(OFFER_COMPLECTS_MODE.MERGED);
    });

    it('значение попадает в слепок и возвращается при раскладке', () => {
        const pdf = offerPdfForSnapshot(separate);
        expect(pdf?.settings.complectsMode).toBe(OFFER_COMPLECTS_MODE.SEPARATE);

        const general = { id: 'general', kind: 'general' as const, rows: [], collapsed: false };
        const written = serializeV2({
            state: {
                regionCode: null,
                contractCode: null,
                supplyCode: null,
                general,
                alternative: [],
                templateId: null,
                rqId: null,
                pdf,
            },
            dealId: 1,
            domain: 'd',
            userId: 1,
            savedAt: '2026-11-23T00:00:00.000Z',
        });
        const restored = restoreV2(JSON.parse(JSON.stringify(written))).pdf;
        expect(restored?.settings.complectsMode).toBe(OFFER_COMPLECTS_MODE.SEPARATE);

        const laidOut = run(initial, offerPdfActions.applySnapshot(restored!));
        expect(laidOut.origin).toBe('snapshot');
        expect(laidOut.prefs.settings.complectsMode).toBe(OFFER_COMPLECTS_MODE.SEPARATE);
    });

    it('слепок без поля при раскладке даёт объединённое наполнение и сохраняет письмо с номером', () => {
        const edited = run(separate, offerPdfActions.setDocumentNumber('17'));
        const merged = mergeOfferPdfSnapshot(edited.prefs, legacyStyle);
        expect(merged.settings.complectsMode).toBe(OFFER_COMPLECTS_MODE.MERGED);
        expect(merged.templateCode).toBe('iskra');
        expect(merged.documentNumber).toBe('17');
    });

    it('запоминается так же, как стиль: уходит в выбор менеджера и в избранное', () => {
        expect(offerPdfStyleOf(separate.prefs).settings.complectsMode).toBe(OFFER_COMPLECTS_MODE.SEPARATE);
        expect(offerPdfForLibrary(separate)?.settings.complectsMode).toBe(OFFER_COMPLECTS_MODE.SEPARATE);
        // выбор менеджера возвращается из кэша тем же разбором, что слепок
        const cached = normalizeOfferPdfStyle(JSON.parse(JSON.stringify(offerPdfStyleOf(separate.prefs))));
        expect(cached.settings.complectsMode).toBe(OFFER_COMPLECTS_MODE.SEPARATE);
        const manager = run(initial, offerPdfActions.applyManager(cached));
        expect(manager.prefs.settings.complectsMode).toBe(OFFER_COMPLECTS_MODE.SEPARATE);
    });
});

describe('сопроводительное письмо в настройках PDF', () => {
    const noLetter = run(initial, offerPdfActions.setSettings({ withLetter: false }));

    /** Запись до отключаемого письма: поля withLetter нет. */
    const legacyStyle = {
        format: 'pdf',
        templateCode: 'iskra',
        palette: null,
        settings: { withPromo: false, salePhrase: 'акция' },
    };

    it('по умолчанию письмо есть', () => {
        expect(OFFER_PDF_DEFAULT_SETTINGS.withLetter).toBe(true);
        expect(initial.prefs.settings.withLetter).toBe(true);
        expect(normalizeOfferPdfPrefs(undefined).settings.withLetter).toBe(true);
    });

    it('правка на экране выключает письмо и оставляет остальные настройки', () => {
        expect(noLetter.origin).toBe('user');
        expect(noLetter.prefs.settings).toEqual({ ...OFFER_PDF_DEFAULT_SETTINGS, withLetter: false });
    });

    it('набранный текст письма остаётся в состоянии, пока письмо выключено', () => {
        const typed = run(
            initial,
            offerPdfActions.setLetter({ text: 'Свой текст' }),
            offerPdfActions.setSettings({ withLetter: false }),
        );
        const back = run(typed, offerPdfActions.setSettings({ withLetter: true }));
        expect(back.prefs.letter.text).toBe('Свой текст');
    });

    it('запись без поля читается как «с письмом»', () => {
        expect(normalizeOfferPdfStyle(legacyStyle).settings.withLetter).toBe(true);
        expect(normalizeOfferPdfStyle(null).settings.withLetter).toBe(true);
    });

    it('попадает в слепок и возвращается при раскладке', () => {
        const pdf = offerPdfForSnapshot(noLetter);
        expect(pdf?.settings.withLetter).toBe(false);

        const general = { id: 'general', kind: 'general' as const, rows: [], collapsed: false };
        const written = serializeV2({
            state: {
                regionCode: null,
                contractCode: null,
                supplyCode: null,
                general,
                alternative: [],
                templateId: null,
                rqId: null,
                pdf,
            },
            dealId: 1,
            domain: 'd',
            userId: 1,
            savedAt: '2026-11-27T00:00:00.000Z',
        });
        const restored = restoreV2(JSON.parse(JSON.stringify(written))).pdf;
        expect(restored?.settings.withLetter).toBe(false);

        const laidOut = run(initial, offerPdfActions.applySnapshot(restored!));
        expect(laidOut.origin).toBe('snapshot');
        expect(laidOut.prefs.settings.withLetter).toBe(false);
    });

    it('слепок без поля при раскладке возвращает письмо', () => {
        const merged = mergeOfferPdfSnapshot(noLetter.prefs, legacyStyle);
        expect(merged.settings.withLetter).toBe(true);
    });

    it('запоминается так же, как стиль: уходит в выбор менеджера и в избранное', () => {
        expect(offerPdfStyleOf(noLetter.prefs).settings.withLetter).toBe(false);
        expect(offerPdfForLibrary(noLetter)?.settings.withLetter).toBe(false);
        const cached = normalizeOfferPdfStyle(JSON.parse(JSON.stringify(offerPdfStyleOf(noLetter.prefs))));
        expect(cached.settings.withLetter).toBe(false);
        const manager = run(initial, offerPdfActions.applyManager(cached));
        expect(manager.prefs.settings.withLetter).toBe(false);
    });
});
