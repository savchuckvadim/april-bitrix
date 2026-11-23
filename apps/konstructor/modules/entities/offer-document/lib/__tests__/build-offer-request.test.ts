import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
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
import { createSet, upsertRow, type RowSet } from '../../../row-set';
import {
    buildOfferGenerateRequest,
    buildOfferMultiGenerateRequest,
    offerBlocker,
    offerRequestBlocker,
    offerVariantsFields,
} from '../build-offer-request';
import { selectModeVariantsPayload, selectOfferVariantsPayload } from '../select-variants-payload';
import { skippedVariantsBlocker } from '../skipped-variants-blocker';
import { mainSetOf, recordOf, snapshotRowsOf, variantItems } from '../__fixtures__/variant-records';
import {
    rootStateWithVariants,
    rootStateWithVariantsAndTemplate as stateWith,
    twoGarantGeneral,
} from '../__fixtures__/variants-state';

/**
 * КП делают по одному варианту: участник открытый незакрытый вариант при любом
 * режиме сделки (composition.mode на КП не влияет).
 */
const ALL_MODES: ComplectMode[] = [COMPLECT_MODE.compare, COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract];

/** Состояние с вариантами, режимом сделки и открытым вариантом. */
const stateOf = (
    records: ComplectVariantRecordDto[],
    openVariantSmartId: number | null,
    mode: ComplectMode = COMPLECT_MODE.compare,
    general?: RowSet,
): RootState => stateWith(records, variantItems, general, { mode, openVariantSmartId });

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

const idsOf = (variants: readonly { variantSmartId: number | null }[] | undefined) =>
    variants?.map(variant => variant.variantSmartId);

/** Живой набор, у которого договор главной строки вне каталога: открытый вариант собрать нельзя. */
const brokenLiveGeneral = (): RowSet => {
    const main = mainSetOf('live', 'buh').rows[0]!;
    return upsertRow(createSet('general', 'general'), {
        ...main,
        refs: { ...main.refs, contractCode: 'no-such-contract' },
    });
};

describe('блокер КП по формату', () => {
    it('Word требует выбранный шаблон, PDF обходится без него', () => {
        const state = rootStateWithVariants([recordOf(1, 102, 'buh')], variantItems);
        expect(offerBlocker(state, 'word')).toBe('Выберите шаблон КП');
        expect(offerBlocker(state, 'pdf')).toBeNull();
    });

    it.each(ALL_MODES)('режим %s: открытый вариант, который собрать нельзя, блокирует оба формата одним текстом', mode => {
        const state = stateOf([recordOf(2, 102, 'buh')], 102, mode, brokenLiveGeneral());
        expect(offerBlocker(state, 'pdf')).toContain('Вариант «Юристу» нельзя включить в документ');
        expect(offerBlocker(state, 'pdf')).toBe(offerBlocker(state, 'word'));
    });
});

describe('КП: кто идёт в запрос при любом режиме', () => {
    const records = () => [recordOf(1, 101, 'buh'), recordOf(2, 102, 'buh'), recordOf(3, 103, 'buh')];

    // адаптер ставит метки времени при каждой сборке: фиксируем часы, чтобы сравнивать запросы целиком
    beforeAll(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-11-23T12:00:00.000Z'));
    });
    afterAll(() => {
        vi.useRealTimers();
    });

    it.each(ALL_MODES)('режим %s: в запросе один вариант, открытый, настройки с режимом compare', mode => {
        const request = buildOfferMultiGenerateRequest(stateOf(records(), 102, mode));
        expect(idsOf(request?.variants)).toEqual([102]);
        expect(request?.composition).toEqual({ ...DEFAULT_COMPLECT_COMPOSITION, mode: COMPLECT_MODE.compare });
    });

    it('запрос, поля для превью и PDF совпадают при всех трёх режимах', () => {
        const [first, ...rest] = ALL_MODES.map(mode => stateOf(records(), 102, mode));
        const baseline = {
            request: buildOfferMultiGenerateRequest(first!),
            fields: offerVariantsFields(first!),
            preview: buildWordPreviewRequest(first!),
        };
        expect(baseline.request).not.toBeNull();
        for (const state of rest) {
            expect(buildOfferMultiGenerateRequest(state)).toEqual(baseline.request);
            expect(offerVariantsFields(state)).toEqual(baseline.fields);
            expect(buildWordPreviewRequest(state)).toEqual(baseline.preview);
        }
    });

    it.each(ALL_MODES)('режим %s: открытого варианта нет — вариантов в запросе нет, КП по живому состоянию', mode => {
        const state = stateOf(records(), null, mode);
        const request = buildOfferMultiGenerateRequest(state);
        expect(request?.variants).toEqual([]);
        expect(request?.composition).toBeUndefined();
        expect(offerVariantsFields(state)).toEqual({});
    });

    it.each(ALL_MODES)('режим %s: открытый вариант закрыт (Отклонён) — вариантов в запросе нет', mode => {
        const request = buildOfferMultiGenerateRequest(stateOf(records(), 103, mode));
        expect(request?.variants).toEqual([]);
    });

    it('смена режима участников КП не пересчитывает: тот же объект', () => {
        const single = stateOf(records(), 102);
        const before = selectOfferVariantsPayload(single);

        expect(idsOf(before.variants)).toEqual([102]);
        for (const mode of ALL_MODES) {
            expect(selectOfferVariantsPayload(withMode(single, mode))).toBe(before);
        }
    });

    it('смена открытого варианта пересчитывает участника КП и источник его строк', () => {
        const first = stateOf(records(), 101);
        const second = withOpenVariant(first, 102);

        expect(selectOfferVariantsPayload(first).entries.map(entry => [entry.variantSmartId, entry.isOpen])).toEqual([
            [101, true],
        ]);
        expect(selectOfferVariantsPayload(second).entries.map(entry => [entry.variantSmartId, entry.isOpen])).toEqual([
            [102, true],
        ]);
        expect(selectOfferVariantsPayload(withOpenVariant(second, null)).entries).toEqual([]);
    });

    it('участники по режиму и участники КП расходятся: «Все варианты» дают всех незакрытых, КП одного', () => {
        const state = stateOf(records(), 102, COMPLECT_MODE.multi_contract);
        expect(idsOf(selectModeVariantsPayload(state).variants)).toEqual([101, 102]);
        expect(idsOf(selectOfferVariantsPayload(state).variants)).toEqual([102]);
    });
});

describe('КП: открытый вариант и блокер', () => {
    it.each(ALL_MODES)('режим %s: открытый вариант собирается — блокера нет, вариант уходит в запрос', mode => {
        const state = stateOf([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')], 104, mode);
        expect(offerRequestBlocker(state)).toBeNull();
        expect(idsOf(buildOfferMultiGenerateRequest(state)?.variants)).toEqual([104]);
    });

    it.each(ALL_MODES)('режим %s: открытый вариант без договора в каталоге блокирует КП и называет вариант', mode => {
        const state = stateOf([recordOf(2, 102, 'buh')], 102, mode, brokenLiveGeneral());
        expect(offerRequestBlocker(state)).toBe(
            'Вариант «Юристу» нельзя включить в документ: ' +
                'нет главной строки комплекта, её договора или поставки в каталоге. ' +
                'Откройте вариант и соберите комплект заново или отклоните его',
        );
        expect(buildOfferMultiGenerateRequest(state)).toBeNull();
    });

    it.each(ALL_MODES)('режим %s: нечитаемый слепок другого варианта КП не блокирует', mode => {
        const state = stateOf([recordOf(1, 102, 'buh'), recordOf(2, 105, 'buh', '{broken')], 102, mode);
        expect(offerRequestBlocker(state)).toBeNull();
        expect(idsOf(buildOfferMultiGenerateRequest(state)?.variants)).toEqual([102]);
    });

    it.each(ALL_MODES)('режим %s: слепок без главной строки у другого варианта КП не блокирует', mode => {
        const empty = snapshotRowsOf(createSet('general', 'general'));
        const state = stateOf([recordOf(1, 102, 'buh'), recordOf(2, 105, 'buh', empty)], 102, mode);
        expect(offerRequestBlocker(state)).toBeNull();
    });

    it('битый слепок варианта в финальной стадии не блокирует КП', () => {
        const state = stateOf([recordOf(1, 101, 'buh'), recordOf(3, 103, 'buh', '{broken')], 101);
        expect(offerRequestBlocker(state)).toBeNull();
    });

    it('одиночное тело КП собирается без проверки участника: вариант в него не входит', () => {
        const state = stateOf([recordOf(1, 102, 'buh')], 102);
        expect(buildOfferGenerateRequest(state)).not.toBeNull();
        expect(buildOfferGenerateRequest(state)).not.toHaveProperty('variants');
    });

    it('пока стадии вариантов грузятся, блокер сообщает о загрузке', () => {
        const state = stateOf([recordOf(1, 102, 'buh')], 102);
        const loading: RootState = {
            ...state,
            complectVariant: { ...state.complectVariant, itemsStatus: 'loading' },
        };
        expect(offerRequestBlocker(loading)).toBe('Варианты КП ещё загружаются');
    });

    it('selectOfferVariantsPayload кэшируется: смена чужого среза стора даёт тот же объект', () => {
        const state = stateOf([recordOf(1, 102, 'buh')], 102);
        const other: RootState = { ...state, app: { ...state.app, dealId: 1 } };
        expect(selectOfferVariantsPayload(other)).toBe(selectOfferVariantsPayload(state));
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
    // слепок открытого варианта устарел (одна строка с настройками PDF), набор берётся из живого состояния
    const stateOfTwoGarants = (mode: ComplectMode = COMPLECT_MODE.compare) =>
        stateOf(
            [recordOf(1, 102, 'buh', snapshotRowsOf(mainSetOf('v1', 'buh'), separatePdf)), recordOf(2, 104, 'buh')],
            102,
            mode,
            twoGarantGeneral(),
        );

    it.each(ALL_MODES)('режим %s: формирование несёт complects у КП и у открытого варианта, способа печати нет', mode => {
        const request = buildOfferMultiGenerateRequest(stateOfTwoGarants(mode));
        expect(request?.complects).toHaveLength(2);
        expect(request).not.toHaveProperty('complectsMode');
        expect(request?.variants.map(variant => variant.complects?.length)).toEqual([2]);
        for (const variant of request?.variants ?? []) expect(variant).not.toHaveProperty('complectsMode');
    });

    it.each(ALL_MODES)('режим %s: превью несёт complects у КП и у открытого варианта, способа печати нет', mode => {
        const request = buildWordPreviewRequest(stateOfTwoGarants(mode));
        expect(request?.complects).toHaveLength(2);
        expect(request).not.toHaveProperty('complectsMode');
        expect(request?.variants?.map(variant => variant.complects?.length)).toEqual([2]);
        for (const variant of request?.variants ?? []) expect(variant).not.toHaveProperty('complectsMode');
    });

    it('один комплект: поля complects нет ни у формирования, ни у превью', () => {
        const state = stateOf([recordOf(1, 102, 'buh')], 102);
        expect(buildOfferMultiGenerateRequest(state)).not.toHaveProperty('complects');
        expect(buildWordPreviewRequest(state)).not.toHaveProperty('complects');
    });
});
