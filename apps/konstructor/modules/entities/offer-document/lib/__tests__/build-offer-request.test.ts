import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { buildWordPreviewRequest } from '../../../offer-template-word/lib/build-word-preview-request';
import {
    OFFER_COMPLECTS_MODE,
    OFFER_DOCUMENT_FORMAT,
    OFFER_PDF_DEFAULT_SETTINGS,
    type OfferPdfSnapshot,
} from '../../../offer-pdf/model/types';
import { complectVariantActions, complectVariantReducer } from '../../../complect-variant/model/ComplectVariantSlice';
import {
    COMPLECT_MODE,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from '../../../complect-variant/model/dto';
import { createSet, type RowSet } from '../../../row-set';
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

/** Режим «вместе»: в документы идут все незакрытые варианты. */
const together = (records: ComplectVariantRecordDto[], general?: RowSet): RootState =>
    stateWith(records, variantItems, general, { mode: COMPLECT_MODE.multi_contract });

/** Режим «по одному»: в документы идёт открытый вариант. */
const oneByOne = (records: ComplectVariantRecordDto[], openVariantSmartId: number | null): RootState =>
    stateWith(records, variantItems, undefined, { mode: COMPLECT_MODE.compare, openVariantSmartId });

const withMode = (state: RootState, mode: ComplectMode): RootState => ({
    ...state,
    complectVariant: complectVariantReducer(
        state.complectVariant,
        complectVariantActions.setComposition({ ...DEFAULT_COMPLECT_COMPOSITION, mode }),
    ),
});

const withOpenVariant = (state: RootState, openVariantSmartId: number | null): RootState => ({
    ...state,
    complectVariant: complectVariantReducer(
        state.complectVariant,
        complectVariantActions.setOpenVariant(openVariantSmartId),
    ),
});

describe('блокер КП по формату', () => {
    it('Word требует выбранный шаблон, PDF обходится без него', () => {
        const state = rootStateWithVariants([recordOf(1, 102, 'buh')], variantItems);
        expect(offerBlocker(state, 'word')).toBe('Выберите шаблон КП');
        expect(offerBlocker(state, 'pdf')).toBeNull();
    });

    it('пропущенный участник блокирует оба формата одним текстом', () => {
        const state = together([recordOf(2, 102, 'buh', '{broken')]);
        expect(offerBlocker(state, 'pdf')).not.toBeNull();
        expect(offerBlocker(state, 'pdf')).toBe(offerBlocker(state, 'word'));
    });
});

describe('поля вариантов для превью и PDF', () => {
    it('участников нет — пустой объект', () => {
        expect(offerVariantsFields(together([]))).toEqual({});
    });

    it('участники есть — variants и composition', () => {
        const fields = offerVariantsFields(together([recordOf(1, 102, 'buh')]));
        expect(fields.variants?.map(variant => variant.variantSmartId)).toEqual([102]);
        expect(fields.composition?.mode).toBe(COMPLECT_MODE.multi_contract);
    });

    it('по одному без открытого варианта — пустой объект, хотя варианты в сделке есть', () => {
        const state = oneByOne([recordOf(1, 101, 'buh'), recordOf(2, 102, 'buh')], null);
        expect(offerVariantsFields(state)).toEqual({});
    });

    it('по одному с открытым вариантом — один участник и настройки сделки', () => {
        const state = oneByOne([recordOf(1, 101, 'buh'), recordOf(2, 102, 'buh')], 102);
        const fields = offerVariantsFields(state);
        expect(fields.variants?.map(variant => variant.variantSmartId)).toEqual([102]);
        expect(fields.composition?.mode).toBe(COMPLECT_MODE.compare);
    });
});

describe('КП: кто идёт в запрос в зависимости от режима', () => {
    const records = () => [recordOf(1, 101, 'buh'), recordOf(2, 102, 'buh'), recordOf(3, 103, 'buh')];

    it('по одному с открытым вариантом: в запросе один вариант, открытый', () => {
        const request = buildOfferMultiGenerateRequest(oneByOne(records(), 102));
        expect(request?.variants.map(variant => variant.variantSmartId)).toEqual([102]);
        expect(request?.composition?.mode).toBe(COMPLECT_MODE.compare);
    });

    it('по одному без открытого варианта: вариантов в запросе нет, КП по живому состоянию', () => {
        const request = buildOfferMultiGenerateRequest(oneByOne(records(), null));
        expect(request?.variants).toEqual([]);
        expect(request?.composition).toBeUndefined();
    });

    it('по одному: открытый вариант закрыт (Отклонён) — вариантов в запросе нет', () => {
        const request = buildOfferMultiGenerateRequest(oneByOne(records(), 103));
        expect(request?.variants).toEqual([]);
    });

    it('вместе: в запросе все участники, закрытый вариант не входит', () => {
        const request = buildOfferMultiGenerateRequest(together(records()));
        expect(request?.variants.map(variant => variant.variantSmartId)).toEqual([101, 102]);
        expect(request?.composition?.mode).toBe(COMPLECT_MODE.multi_contract);
    });

    it('смена режима пересчитывает участников КП без пересоздания состояния', () => {
        const single = oneByOne(records(), 102);
        const both = withMode(single, COMPLECT_MODE.multi_contract);

        expect(selectVariantsPayload(single).variants.map(variant => variant.variantSmartId)).toEqual([102]);
        expect(selectVariantsPayload(both).variants.map(variant => variant.variantSmartId)).toEqual([101, 102]);
        expect(
            selectVariantsPayload(withMode(both, COMPLECT_MODE.compare)).variants.map(
                variant => variant.variantSmartId,
            ),
        ).toEqual([102]);
    });

    it('смена открытого варианта пересчитывает участника КП и источник его строк', () => {
        const first = oneByOne(records(), 101);
        const second = withOpenVariant(first, 102);

        expect(selectVariantsPayload(first).entries.map(entry => [entry.variantSmartId, entry.isOpen])).toEqual([
            [101, true],
        ]);
        expect(selectVariantsPayload(second).entries.map(entry => [entry.variantSmartId, entry.isOpen])).toEqual([
            [102, true],
        ]);
        expect(selectVariantsPayload(withOpenVariant(second, null)).entries).toEqual([]);
    });

    it('вместе: открытый вариант идёт из живого состояния, остальные из слепков', () => {
        const state = withOpenVariant(together(records()), 101);
        expect(selectVariantsPayload(state).entries.map(entry => [entry.variantSmartId, entry.isOpen])).toEqual([
            [101, true],
            [102, false],
        ]);
    });
});

describe('КП: участники-варианты и блокер', () => {
    it('все участники собираются — блокера нет, варианты уходят в запрос', () => {
        const state = together([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')]);
        expect(offerRequestBlocker(state)).toBeNull();
        const request = buildOfferMultiGenerateRequest(state);
        expect(request?.variants.map(variant => variant.variantSmartId)).toEqual([102, 104]);
    });

    it('нечитаемый слепок участника блокирует КП и называет вариант', () => {
        const state = together([recordOf(2, 102, 'buh', '{broken')]);
        expect(offerRequestBlocker(state)).toBe(
            'Вариант «Юристу» нельзя включить в документ: слепок не читается. ' +
                'Откройте вариант и сохраните его заново или отклоните его',
        );
        expect(buildOfferMultiGenerateRequest(state)).toBeNull();
    });

    it('участник без главной строки блокирует КП с названием варианта', () => {
        const state = together([recordOf(1, 102, 'buh', snapshotRowsOf(createSet('general', 'general')))]);
        const blocker = offerRequestBlocker(state);
        expect(blocker).toContain('Вариант «Юристу» нельзя включить в документ');
        expect(blocker).toContain('нет главной строки комплекта');
        expect(buildOfferMultiGenerateRequest(state)).toBeNull();
    });

    it('одиночное тело КП собирается без проверки участников: варианты в него не входят', () => {
        const state = together([recordOf(1, 102, 'buh', '{broken')]);
        expect(offerRequestBlocker(state)).not.toBeNull();
        expect(buildOfferGenerateRequest(state)).not.toBeNull();
    });

    it('битый слепок варианта в финальной стадии не блокирует КП', () => {
        const state = together([recordOf(1, 101, 'buh'), recordOf(3, 103, 'buh', '{broken')]);
        expect(offerRequestBlocker(state)).toBeNull();
    });

    it('пока стадии вариантов грузятся, блокер сообщает о загрузке', () => {
        const state = together([recordOf(1, 102, 'buh', '{broken')]);
        const loading: RootState = {
            ...state,
            complectVariant: { ...state.complectVariant, itemsStatus: 'loading' },
        };
        expect(offerRequestBlocker(loading)).toBe('Варианты КП ещё загружаются');
    });

    it('selectVariantsPayload кэшируется: смена чужого среза стора даёт тот же объект', () => {
        const state = together([recordOf(1, 102, 'buh')]);
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
        together(
            [
                recordOf(1, 102, 'buh', snapshotRowsOf(twoGarantGeneral(), separatePdf)),
                recordOf(2, 104, 'buh'),
            ],
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
        const state = together([recordOf(1, 102, 'buh')]);
        expect(buildOfferMultiGenerateRequest(state)).not.toHaveProperty('complects');
        expect(buildWordPreviewRequest(state)).not.toHaveProperty('complects');
    });
});
