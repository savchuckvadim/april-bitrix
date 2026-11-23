import { describe, expect, it, vi } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import {
    complectVariantActions,
    complectVariantReducer,
} from '../../../complect-variant/model/ComplectVariantSlice';
import {
    COMPLECT_MODE,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectVariantRecordDto,
} from '../../../complect-variant/model/dto';
import { recordOf, variantItems } from '../../../offer-document/lib/__fixtures__/variant-records';
import { rootStateWithVariants } from '../../../offer-document/lib/__fixtures__/variants-state';
import { OFFER_PDF_DEFAULT_SETTINGS } from '../../model/types';
import {
    buildOfferPdfGenerateRequest,
    offerPdfRequestBlocker,
    type OfferPdfRequestOptions,
} from '../build-offer-pdf-request';
import { offerPdfRequestKey } from '../offer-pdf-request-key';

/** Режим «вместе»: в запрос идут все незакрытые варианты. */
const together = (records: ComplectVariantRecordDto[]): RootState =>
    rootStateWithVariants(records, variantItems, undefined, { mode: COMPLECT_MODE.multi_contract });

/** Режим «по одному»: в запрос идёт открытый вариант. */
const oneByOne = (records: ComplectVariantRecordDto[], openVariantSmartId: number | null): RootState =>
    rootStateWithVariants(records, variantItems, undefined, { mode: COMPLECT_MODE.compare, openVariantSmartId });

const options: OfferPdfRequestOptions = {
    templateCode: 'classic',
    palette: null,
    settings: OFFER_PDF_DEFAULT_SETTINGS,
    letter: { appeal: '', text: '' },
    documentNumber: '',
};

const WORD_ONLY_FIELDS = ['templateId', 'invoiceTemplateId', 'invoice', 'isWord', 'withoutQueue', 'onlyBitrixSave'];

describe('тело PDF-КП: участники-варианты', () => {
    it('участников нет — тело прежнее: без variants и composition, с полями PDF', () => {
        const state = together([]);
        const request = buildOfferPdfGenerateRequest(state, options);
        expect(request).not.toBeNull();
        expect(request).not.toHaveProperty('variants');
        expect(request).not.toHaveProperty('composition');
        expect(request?.templateCode).toBe('classic');
    });

    it('участники есть — variants и composition на месте, поля Word не уходят', () => {
        const state = together([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')]);
        const request = buildOfferPdfGenerateRequest(state, options);
        expect(request?.variants?.map(variant => variant.variantSmartId)).toEqual([102, 104]);
        expect(request?.composition).toEqual({ ...DEFAULT_COMPLECT_COMPOSITION, mode: COMPLECT_MODE.multi_contract });
        for (const field of WORD_ONLY_FIELDS) expect(request).not.toHaveProperty(field);
        expect(request?.templateCode).toBe('classic');
    });

    it('по одному с открытым вариантом — в теле один вариант, открытый', () => {
        const state = oneByOne([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')], 104);
        const request = buildOfferPdfGenerateRequest(state, options);
        expect(request?.variants?.map(variant => variant.variantSmartId)).toEqual([104]);
        expect(request?.composition?.mode).toBe(COMPLECT_MODE.compare);
    });

    it('по одному без открытого варианта — тело без variants и composition', () => {
        const state = oneByOne([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')], null);
        const request = buildOfferPdfGenerateRequest(state, options);
        expect(request).not.toBeNull();
        expect(request).not.toHaveProperty('variants');
        expect(request).not.toHaveProperty('composition');
    });

    it('Word-шаблон для PDF не нужен: блокера нет и без выбранного шаблона', () => {
        const state = together([recordOf(1, 102, 'buh')]);
        expect(state.offerTemplateWord.selectedTemplate).toBeNull();
        expect(offerPdfRequestBlocker(state)).toBeNull();
    });

    it('участник, которого собрать нельзя, блокирует PDF и называет вариант', () => {
        const state = together([recordOf(2, 102, 'buh', '{broken')]);
        expect(offerPdfRequestBlocker(state)).toBe(
            'Вариант «Юристу» нельзя включить в документ: слепок не читается. ' +
                'Откройте вариант и сохраните его заново или отклоните его',
        );
        expect(buildOfferPdfGenerateRequest(state, options)).toBeNull();
    });

    it('пока стадии вариантов грузятся, PDF ждёт', () => {
        const base = together([recordOf(1, 102, 'buh')]);
        const loading: RootState = {
            ...base,
            complectVariant: { ...base.complectVariant, itemsStatus: 'loading' },
        };
        expect(offerPdfRequestBlocker(loading)).toBe('Варианты КП ещё загружаются');
        expect(buildOfferPdfGenerateRequest(loading, options)).toBeNull();
    });

    it('битый слепок отклонённого варианта PDF не блокирует', () => {
        const state = together([recordOf(1, 101, 'buh'), recordOf(3, 103, 'buh', '{broken')]);
        expect(offerPdfRequestBlocker(state)).toBeNull();
    });
});

describe('смена участников и настроек сделки пересобирает PDF-запрос', () => {
    const keyOf = (state: RootState): string | null => {
        const request = buildOfferPdfGenerateRequest(state, options);
        return request ? offerPdfRequestKey(request) : null;
    };

    it('тот же состав, запрос собран заново — ключ превью тот же, превью не перезапускается', () => {
        const state = together([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')]);
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

    it('ещё один участник — другой запрос, значит и другой ключ превью', () => {
        const one = together([recordOf(1, 102, 'buh')]);
        const two = together([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')]);
        expect(keyOf(one)).not.toBe(keyOf(two));
    });

    it('участник ушёл в отклонённые — запрос меняется', () => {
        const records = [recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')];
        const before = together(records);
        const rejected = rootStateWithVariants(
            records,
            [...variantItems, { id: 104, title: 'Отклонён позже', stageId: 'DT1:REJECTED' }],
            undefined,
            { mode: COMPLECT_MODE.multi_contract },
        );
        expect(keyOf(before)).not.toBe(keyOf(rejected));
    });

    it('смена открытого варианта в режиме «по одному» меняет запрос', () => {
        const records = [recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')];
        expect(keyOf(oneByOne(records, 102))).not.toBe(keyOf(oneByOne(records, 104)));
    });

    it('режим сборки из настроек сделки попадает в запрос', () => {
        const base = oneByOne([recordOf(1, 102, 'buh')], 102);
        const multi: RootState = {
            ...base,
            complectVariant: complectVariantReducer(
                base.complectVariant,
                complectVariantActions.setComposition({
                    ...DEFAULT_COMPLECT_COMPOSITION,
                    mode: COMPLECT_MODE.multi_contract,
                }),
            ),
        };
        expect(keyOf(base)).not.toBe(keyOf(multi));
        expect(buildOfferPdfGenerateRequest(multi, options)?.composition?.mode).toBe(COMPLECT_MODE.multi_contract);
    });
});
