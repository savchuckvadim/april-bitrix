import { describe, expect, it } from 'vitest';
import {
    COMPLECT_MODE,
    COMPLECT_OFFER_INFOBLOCKS,
    DEFAULT_COMPLECT_COMPOSITION,
    complectVariantActions,
    type ComplectComposition,
    type ComplectMode,
} from '@/modules/entities/complect-variant';
import { contractDocumentActions } from '@/modules/entities/contract-document';
import { wordTemplatePdfPreviewAC } from '@/modules/entities/offer-template-word';
import { supplyReportActions } from '@/modules/entities/supply-report-document';
import { setupStore } from '../store';

/**
 * Слушатели настоящего стора на смену режима вариантов: превью КП режим не
 * трогает, готовые результаты договора и отчёта о поставке он делает
 * устаревшими.
 */

const compositionOf = (mode: ComplectMode): ComplectComposition => ({ ...DEFAULT_COMPLECT_COMPOSITION, mode });

/** Стор с готовым превью КП, готовым договором (живым и единицы) и готовым отчётом. */
const readyStore = () => {
    const store = setupStore();
    store.dispatch(wordTemplatePdfPreviewAC.setPreviewPatch({ previewPhase: 'ready' }));
    store.dispatch(
        contractDocumentActions.generateDone({ link: 'https://doc', documentName: 'Договор', savedToDisk: true }),
    );
    store.dispatch(
        contractDocumentActions.unitGenerateDone({
            key: '201',
            link: 'https://unit',
            documentName: 'Договор 201',
            savedToDisk: true,
        }),
    );
    store.dispatch(supplyReportActions.generateDone({ link: 'https://report', rpaId: 5 }));
    return store;
};

const flush = () => Promise.resolve();

describe('смена режима вариантов в сторе', () => {
    it.each([COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract])(
        'compare → %s: превью КП не устаревает, результаты договора и отчёта сброшены',
        async mode => {
            const store = readyStore();
            store.dispatch(complectVariantActions.setComposition(compositionOf(mode)));
            await flush();

            const state = store.getState();
            expect(state.wordTemplatePdfPreview.needUpdate).toBe(false);
            expect(state.contractDocument.generate.status).toBe('idle');
            expect(state.contractDocument.units['201']?.generate.status).toBe('idle');
            expect(state.supplyReport.generate.status).toBe('idle');
        },
    );

    it('«Все варианты одним договором» ↔ «каждому свой договор»: результаты тоже сбрасываются', async () => {
        const store = setupStore();
        store.dispatch(complectVariantActions.setComposition(compositionOf(COMPLECT_MODE.single_contract)));
        store.dispatch(supplyReportActions.generateDone({ link: 'https://report', rpaId: null }));
        store.dispatch(complectVariantActions.setComposition(compositionOf(COMPLECT_MODE.multi_contract)));
        await flush();

        expect(store.getState().supplyReport.generate.status).toBe('idle');
    });

    it('запись настроек без смены режима результаты не трогает', async () => {
        const store = readyStore();
        store.dispatch(
            complectVariantActions.setComposition({
                ...DEFAULT_COMPLECT_COMPOSITION,
                openVariantSmartId: 7,
            }),
        );
        await flush();

        const state = store.getState();
        expect(state.contractDocument.generate.status).toBe('done');
        expect(state.supplyReport.generate.status).toBe('done');
    });

    it('смена печати КП в настройках сделки превью устаревает, режим при этом прежний', async () => {
        const store = readyStore();
        store.dispatch(
            complectVariantActions.setComposition({
                ...DEFAULT_COMPLECT_COMPOSITION,
                offer: { ...DEFAULT_COMPLECT_COMPOSITION.offer, infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged },
            }),
        );
        await flush();

        expect(store.getState().wordTemplatePdfPreview.needUpdate).toBe(true);
        expect(store.getState().contractDocument.generate.status).toBe('done');
    });

    it('смена открытого варианта превью устаревает, результаты договора и отчёта остаются', async () => {
        const store = readyStore();
        store.dispatch(complectVariantActions.setOpenVariant(7));
        await flush();

        expect(store.getState().wordTemplatePdfPreview.needUpdate).toBe(true);
        expect(store.getState().contractDocument.generate.status).toBe('done');
    });
});
