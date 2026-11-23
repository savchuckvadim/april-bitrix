import { describe, expect, it, vi } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import {
    complectVariantActions,
    complectVariantReducer,
} from '../../../complect-variant/model/ComplectVariantSlice';
import {
    COMPLECT_MODE,
    COMPLECT_OFFER_INFOBLOCKS,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from '../../../complect-variant/model/dto';
import { mainSetOf, recordOf, variantItems } from '../../../offer-document/lib/__fixtures__/variant-records';
import { rootStateWithVariants } from '../../../offer-document/lib/__fixtures__/variants-state';
import { createSet, upsertRow, type RowSet } from '../../../row-set';
import { OFFER_COMPLECTS_MODE, OFFER_PDF_DEFAULT_SETTINGS } from '../../model/types';
import {
    buildOfferPdfGenerateRequest,
    offerPdfRequestBlocker,
    type OfferPdfRequestOptions,
} from '../build-offer-pdf-request';
import { offerPdfRequestKey } from '../offer-pdf-request-key';

/**
 * PDF-КП, как и Word, делают по одному варианту: участник открытый незакрытый
 * вариант при любом режиме сделки (composition.mode на КП не влияет).
 */
const ALL_MODES: ComplectMode[] = [COMPLECT_MODE.compare, COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract];

/** Состояние с вариантами, режимом сделки и открытым вариантом. */
const stateOf = (
    records: ComplectVariantRecordDto[],
    openVariantSmartId: number | null,
    mode: ComplectMode = COMPLECT_MODE.compare,
    general?: RowSet,
): RootState => rootStateWithVariants(records, variantItems, general, { mode, openVariantSmartId });

/** Живой набор, у которого договор главной строки вне каталога: открытый вариант собрать нельзя. */
const brokenLiveGeneral = (): RowSet => {
    const main = mainSetOf('live', 'buh').rows[0]!;
    return upsertRow(createSet('general', 'general'), {
        ...main,
        refs: { ...main.refs, contractCode: 'no-such-contract' },
    });
};

const withComposition = (state: RootState, composition: typeof DEFAULT_COMPLECT_COMPOSITION): RootState => ({
    ...state,
    complectVariant: complectVariantReducer(state.complectVariant, complectVariantActions.setComposition(composition)),
});

const options: OfferPdfRequestOptions = {
    templateCode: 'classic',
    palette: null,
    settings: OFFER_PDF_DEFAULT_SETTINGS,
    letter: { appeal: '', text: '' },
    documentNumber: '',
};

const WORD_ONLY_FIELDS = ['templateId', 'invoiceTemplateId', 'invoice', 'isWord', 'withoutQueue', 'onlyBitrixSave'];

describe('тело PDF-КП: открытый вариант', () => {
    const records = () => [recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')];

    it.each(ALL_MODES)('режим %s: открытого варианта нет — тело прежнее, без variants и composition, с полями PDF', mode => {
        const request = buildOfferPdfGenerateRequest(stateOf(records(), null, mode), options);
        expect(request).not.toBeNull();
        expect(request).not.toHaveProperty('variants');
        expect(request).not.toHaveProperty('composition');
        expect(request?.templateCode).toBe('classic');
    });

    it.each(ALL_MODES)('режим %s: открытый вариант — один вариант, настройки с режимом compare, поля Word не уходят', mode => {
        const request = buildOfferPdfGenerateRequest(stateOf(records(), 104, mode), options);
        expect(request?.variants?.map(variant => variant.variantSmartId)).toEqual([104]);
        expect(request?.composition).toEqual({ ...DEFAULT_COMPLECT_COMPOSITION, mode: COMPLECT_MODE.compare });
        for (const field of WORD_ONLY_FIELDS) expect(request).not.toHaveProperty(field);
        expect(request?.templateCode).toBe('classic');
    });

    it('способ печати наполнения открытого варианта берётся из живых настроек экрана', () => {
        const request = buildOfferPdfGenerateRequest(stateOf(records(), 104), {
            ...options,
            settings: { ...OFFER_PDF_DEFAULT_SETTINGS, complectsMode: OFFER_COMPLECTS_MODE.SEPARATE },
        });
        expect(request?.variants?.map(variant => variant.complectsMode)).toEqual([OFFER_COMPLECTS_MODE.SEPARATE]);
    });

    it.each(ALL_MODES)('режим %s: открытый вариант закрыт (Отклонён) — тело без variants и composition', mode => {
        const request = buildOfferPdfGenerateRequest(stateOf([recordOf(3, 103, 'buh')], 103, mode), options);
        expect(request).not.toBeNull();
        expect(request).not.toHaveProperty('variants');
    });

    it('Word-шаблон для PDF не нужен: блокера нет и без выбранного шаблона', () => {
        const state = stateOf([recordOf(1, 102, 'buh')], 102);
        expect(state.offerTemplateWord.selectedTemplate).toBeNull();
        expect(offerPdfRequestBlocker(state)).toBeNull();
    });

    it.each(ALL_MODES)('режим %s: открытый вариант, который собрать нельзя, блокирует PDF и называет вариант', mode => {
        const state = stateOf([recordOf(2, 102, 'buh')], 102, mode, brokenLiveGeneral());
        expect(offerPdfRequestBlocker(state)).toBe(
            'Вариант «Юристу» нельзя включить в документ: ' +
                'нет главной строки комплекта, её договора или поставки в каталоге. ' +
                'Откройте вариант и соберите комплект заново или отклоните его',
        );
        expect(buildOfferPdfGenerateRequest(state, options)).toBeNull();
    });

    it('пока стадии вариантов грузятся, PDF ждёт', () => {
        const base = stateOf([recordOf(1, 102, 'buh')], 102);
        const loading: RootState = {
            ...base,
            complectVariant: { ...base.complectVariant, itemsStatus: 'loading' },
        };
        expect(offerPdfRequestBlocker(loading)).toBe('Варианты КП ещё загружаются');
        expect(buildOfferPdfGenerateRequest(loading, options)).toBeNull();
    });

    it.each(ALL_MODES)('режим %s: битый слепок другого варианта PDF не блокирует', mode => {
        const state = stateOf([recordOf(1, 102, 'buh'), recordOf(3, 105, 'buh', '{broken')], 102, mode);
        expect(offerPdfRequestBlocker(state)).toBeNull();
    });
});

describe('смена открытого варианта и настроек сделки пересобирает PDF-запрос', () => {
    const records = () => [recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')];

    const keyOf = (state: RootState): string | null => {
        const request = buildOfferPdfGenerateRequest(state, options);
        return request ? offerPdfRequestKey(request) : null;
    };

    it('тот же состав, запрос собран заново — ключ превью тот же, превью не перезапускается', () => {
        const state = stateOf(records(), 102);
        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            vi.setSystemTime(new Date('2026-11-23T12:00:00.000Z'));
            const first = buildOfferPdfGenerateRequest(state, options);
            vi.setSystemTime(new Date('2026-11-23T12:05:00.000Z'));
            const second = buildOfferPdfGenerateRequest(state, options);
            expect(first).not.toBeNull();
            expect(second).not.toBeNull();
            if (!first || !second) return;
            // метки времени адаптера в запросах различаются; ключ превью их пропускает
            expect(JSON.stringify(second)).not.toBe(JSON.stringify(first));
            expect(offerPdfRequestKey(second)).toBe(offerPdfRequestKey(first));
        } finally {
            vi.useRealTimers();
        }
    });

    it('смена режима сделки запрос и ключ превью не меняет', () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            vi.setSystemTime(new Date('2026-11-23T12:00:00.000Z'));
            const base = stateOf(records(), 102);
            const baseline = buildOfferPdfGenerateRequest(base, options);
            expect(baseline).not.toBeNull();
            for (const mode of ALL_MODES) {
                const changed = withComposition(base, { ...DEFAULT_COMPLECT_COMPOSITION, mode });
                expect(buildOfferPdfGenerateRequest(changed, options)).toEqual(baseline);
                expect(keyOf(changed)).toBe(keyOf(base));
            }
        } finally {
            vi.useRealTimers();
        }
    });

    it('смена открытого варианта меняет запрос при любом режиме', () => {
        for (const mode of ALL_MODES) {
            expect(keyOf(stateOf(records(), 102, mode))).not.toBe(keyOf(stateOf(records(), 104, mode)));
        }
    });

    it('открытого варианта нет, потом он появился — запрос меняется', () => {
        expect(keyOf(stateOf(records(), null))).not.toBe(keyOf(stateOf(records(), 102)));
    });

    it('открытый вариант ушёл в отклонённые — запрос меняется', () => {
        const before = stateOf(records(), 104);
        const rejected = rootStateWithVariants(
            records(),
            [...variantItems, { id: 104, title: 'Отклонён позже', stageId: 'DT1:REJECTED' }],
            undefined,
            { mode: COMPLECT_MODE.compare, openVariantSmartId: 104 },
        );
        expect(keyOf(before)).not.toBe(keyOf(rejected));
    });

    it('печать КП в настройках сделки (инфоблоки) попадает в запрос и меняет ключ превью', () => {
        const base = stateOf(records(), 102);
        const merged = withComposition(base, {
            ...DEFAULT_COMPLECT_COMPOSITION,
            offer: { ...DEFAULT_COMPLECT_COMPOSITION.offer, infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged },
        });
        expect(keyOf(base)).not.toBe(keyOf(merged));
        expect(buildOfferPdfGenerateRequest(merged, options)?.composition?.offer.infoblocks).toBe(
            COMPLECT_OFFER_INFOBLOCKS.merged,
        );
    });
});
