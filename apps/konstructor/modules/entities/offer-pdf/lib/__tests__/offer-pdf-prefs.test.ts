import { describe, expect, it } from 'vitest';
import { restoreV2, serializeV2 } from '../../../snapshot/lib/v2/serialize';
import { offerPdfActions, offerPdfReducer } from '../../model/OfferPdfSlice';
import {
    OFFER_DOCUMENT_FORMAT,
    OFFER_PDF_DEFAULT_SETTINGS,
    type OfferPdfState,
    type OfferPdfStylePrefs,
} from '../../model/types';
import { mergeOfferPdfSnapshot, offerPdfForLibrary, offerPdfForSnapshot } from '../offer-pdf-snapshot.util';

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
