import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { buildWordPreviewRequest } from '../../../offer-template-word/lib/build-word-preview-request';
import {
    OFFER_COMPLECTS_MODE,
    OFFER_DOCUMENT_FORMAT,
    OFFER_PDF_DEFAULT_SETTINGS,
    type OfferPdfSnapshot,
} from '../../../offer-pdf/model/types';
import { createSet } from '../../../row-set';
import {
    buildOfferGenerateRequest,
    buildOfferMultiGenerateRequest,
    offerBlocker,
    offerRequestBlocker,
    offerVariantsFields,
} from '../build-offer-request';
import { selectVariantsPayload } from '../select-variants-payload';
import { skippedVariantsBlocker } from '../skipped-variants-blocker';
import { recordOf, snapshotRowsOf, variantItems } from '../__fixtures__/variant-records';
import {
    rootStateWithVariants,
    rootStateWithVariantsAndTemplate as stateWith,
    twoGarantGeneral,
} from '../__fixtures__/variants-state';

describe('блокер КП по формату', () => {
    it('Word требует выбранный шаблон, PDF обходится без него', () => {
        const state = rootStateWithVariants([recordOf(1, 102, 'buh')], variantItems);
        expect(offerBlocker(state, 'word')).toBe('Выберите шаблон КП');
        expect(offerBlocker(state, 'pdf')).toBeNull();
    });

    it('пропущенный участник блокирует оба формата одним текстом', () => {
        const state = stateWith([recordOf(2, 102, 'buh', '{broken')], variantItems);
        expect(offerBlocker(state, 'pdf')).not.toBeNull();
        expect(offerBlocker(state, 'pdf')).toBe(offerBlocker(state, 'word'));
    });
});

describe('поля вариантов для превью и PDF', () => {
    it('участников нет — пустой объект', () => {
        expect(offerVariantsFields(stateWith([], variantItems))).toEqual({});
    });

    it('участники есть — variants и composition', () => {
        const fields = offerVariantsFields(stateWith([recordOf(1, 102, 'buh')], variantItems));
        expect(fields.variants?.map(variant => variant.variantSmartId)).toEqual([102]);
        expect(fields.composition?.mode).toBe('compare');
    });
});

describe('КП: участники-варианты и блокер', () => {
    it('все участники собираются — блокера нет, варианты уходят в запрос', () => {
        const state = stateWith([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')], variantItems);
        expect(offerRequestBlocker(state)).toBeNull();
        const request = buildOfferMultiGenerateRequest(state);
        expect(request?.variants.map(variant => variant.variantSmartId)).toEqual([102, 104]);
    });

    it('нечитаемый слепок участника блокирует КП и называет вариант', () => {
        const state = stateWith([recordOf(2, 102, 'buh', '{broken')], variantItems);
        expect(offerRequestBlocker(state)).toBe(
            'Вариант «Юристу» нельзя включить в документ: слепок не читается. ' +
                'Откройте вариант и сохраните его заново или отклоните его',
        );
        expect(buildOfferMultiGenerateRequest(state)).toBeNull();
    });

    it('участник без главной строки блокирует КП с названием варианта', () => {
        const state = stateWith(
            [recordOf(1, 102, 'buh', snapshotRowsOf(createSet('general', 'general')))],
            variantItems,
        );
        const blocker = offerRequestBlocker(state);
        expect(blocker).toContain('Вариант «Юристу» нельзя включить в документ');
        expect(blocker).toContain('нет главной строки комплекта');
        expect(buildOfferMultiGenerateRequest(state)).toBeNull();
    });

    it('одиночное тело КП собирается без проверки участников: варианты в него не входят', () => {
        const state = stateWith([recordOf(1, 102, 'buh', '{broken')], variantItems);
        expect(offerRequestBlocker(state)).not.toBeNull();
        expect(buildOfferGenerateRequest(state)).not.toBeNull();
    });

    it('битый слепок варианта в финальной стадии не блокирует КП', () => {
        const state = stateWith([recordOf(1, 101, 'buh'), recordOf(3, 103, 'buh', '{broken')], variantItems);
        expect(offerRequestBlocker(state)).toBeNull();
    });

    it('пока стадии вариантов грузятся, блокер сообщает о загрузке', () => {
        const state = stateWith([recordOf(1, 102, 'buh', '{broken')], variantItems);
        const loading: RootState = {
            ...state,
            complectVariant: { ...state.complectVariant, itemsStatus: 'loading' },
        };
        expect(offerRequestBlocker(loading)).toBe('Варианты КП ещё загружаются');
    });

    it('selectVariantsPayload кэшируется: смена чужого среза стора даёт тот же объект', () => {
        const state = stateWith([recordOf(1, 102, 'buh')], variantItems);
        const other: RootState = { ...state, app: { ...state.app, dealId: 1 } };
        expect(selectVariantsPayload(other)).toBe(selectVariantsPayload(state));
    });
});

describe('skippedVariantsBlocker', () => {
    it('пропущенных нет — null', () => {
        expect(skippedVariantsBlocker([])).toBeNull();
    });

    it('несколько пропущенных: по предложению на вариант, причины у каждого свои', () => {
        const text = skippedVariantsBlocker([
            { variantSmartId: 1, title: 'А', reason: 'snapshotUnreadable' },
            { variantSmartId: 2, title: 'Б', reason: 'noMainRow' },
        ]);
        expect(text).toContain('Вариант «А» нельзя включить в документ: слепок не читается');
        expect(text).toContain('Вариант «Б» нельзя включить в документ: нет главной строки комплекта');
    });
});

describe('КП в Word: наполнение по комплектам', () => {
    /** Менеджер выбрал «по комплектам» в PDF; Word-запросам этот выбор не нужен. */
    const separatePdf: OfferPdfSnapshot = {
        format: OFFER_DOCUMENT_FORMAT.PDF,
        templateCode: 'classic',
        palette: null,
        settings: { ...OFFER_PDF_DEFAULT_SETTINGS, complectsMode: OFFER_COMPLECTS_MODE.SEPARATE },
    };
    const stateOfTwoGarants = () =>
        stateWith(
            [
                recordOf(1, 102, 'buh', snapshotRowsOf(twoGarantGeneral(), separatePdf)),
                recordOf(2, 104, 'buh'),
            ],
            variantItems,
            twoGarantGeneral(),
        );

    it('формирование несёт complects у КП и у участников, способа печати нет', () => {
        const request = buildOfferMultiGenerateRequest(stateOfTwoGarants());
        expect(request?.complects).toHaveLength(2);
        expect(request).not.toHaveProperty('complectsMode');
        expect(request?.variants.map(variant => variant.complects?.length)).toEqual([2, undefined]);
        for (const variant of request?.variants ?? []) expect(variant).not.toHaveProperty('complectsMode');
    });

    it('превью несёт complects у КП и у участников, способа печати нет', () => {
        const request = buildWordPreviewRequest(stateOfTwoGarants());
        expect(request?.complects).toHaveLength(2);
        expect(request).not.toHaveProperty('complectsMode');
        expect(request?.variants?.map(variant => variant.complects?.length)).toEqual([2, undefined]);
        for (const variant of request?.variants ?? []) expect(variant).not.toHaveProperty('complectsMode');
    });

    it('один комплект: поля complects нет ни у формирования, ни у превью', () => {
        const state = stateWith([recordOf(1, 102, 'buh')], variantItems);
        expect(buildOfferMultiGenerateRequest(state)).not.toHaveProperty('complects');
        expect(buildWordPreviewRequest(state)).not.toHaveProperty('complects');
    });
});
