import type { UnknownAction } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import type { ComplectVariantItem } from '../lib/api/complect-variant-helper';
import {
    complectVariantActions,
    complectVariantReducer,
    selectModeVariantParticipants,
    selectOfferComposition,
    selectOfferVariantParticipants,
    type ComplectVariantState,
} from './ComplectVariantSlice';
import {
    COMPLECT_MODE,
    COMPLECT_OFFER_INFOBLOCKS,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from './dto';

/**
 * Два селектора участников. КП (selectOfferVariantParticipants) режим сделки не
 * читает: участник открытый незакрытый вариант при любом режиме. Договор,
 * отчёт о поставке, заявка поставки и товары сделки (selectModeVariantParticipants)
 * следуют режиму, открытому варианту, записям и стадиям элементов.
 */

const record = (variantSmartId: number): ComplectVariantRecordDto =>
    ({ id: variantSmartId * 10, variantSmartId }) as ComplectVariantRecordDto;

const items: ComplectVariantItem[] = [
    { id: 1, title: 'Первый', stageId: 'DT1:NEW' },
    { id: 2, title: 'Второй', stageId: 'DT1:CURRENT' },
    { id: 3, title: 'Третий', stageId: 'DT1:REJECTED' },
];

type State = { complectVariant: ComplectVariantState };

const stateOf = (): State => {
    let complectVariant = complectVariantReducer(undefined, { type: 'init' });
    complectVariant = complectVariantReducer(
        complectVariant,
        complectVariantActions.loaded({ records: [record(1), record(2), record(3)], composition: null }),
    );
    complectVariant = complectVariantReducer(complectVariant, complectVariantActions.itemsLoaded(items));
    return { complectVariant };
};

const apply = (state: State, action: UnknownAction): State => ({
    complectVariant: complectVariantReducer(state.complectVariant, action),
});

const withMode = (state: State, mode: ComplectMode): State =>
    apply(state, complectVariantActions.setComposition({ ...DEFAULT_COMPLECT_COMPOSITION, mode }));

const modeIdsOf = (state: State) => selectModeVariantParticipants(state).map(item => item.variantSmartId);
const offerIdsOf = (state: State) => selectOfferVariantParticipants(state).map(item => item.variantSmartId);

const ALL_MODES = [COMPLECT_MODE.compare, COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract];

describe('участники КП', () => {
    it('настройки сделки не заданы, открытого варианта нет: участников нет', () => {
        expect(offerIdsOf(stateOf())).toEqual([]);
    });

    it.each(ALL_MODES)('режим %s: участник открытый вариант, смена открытого пересчитывает', mode => {
        const first = apply(withMode(stateOf(), mode), complectVariantActions.setOpenVariant(1));
        const second = apply(first, complectVariantActions.setOpenVariant(2));

        expect(offerIdsOf(first)).toEqual([1]);
        expect(offerIdsOf(second)).toEqual([2]);
        expect(offerIdsOf(apply(second, complectVariantActions.setOpenVariant(null)))).toEqual([]);
    });

    it.each(ALL_MODES)('режим %s: открытый вариант в финальной стадии (Отклонён) не участвует', mode => {
        const state = apply(withMode(stateOf(), mode), complectVariantActions.setOpenVariant(3));
        expect(offerIdsOf(state)).toEqual([]);
    });

    it('смена режима не пересчитывает участников: тот же массив', () => {
        const single = apply(stateOf(), complectVariantActions.setOpenVariant(2));
        const before = selectOfferVariantParticipants(single);

        for (const mode of ALL_MODES) {
            expect(selectOfferVariantParticipants(withMode(single, mode))).toBe(before);
        }
    });

    it('стадии элементов пришли позже: закрытый вариант выпадает', () => {
        const open = apply(stateOf(), complectVariantActions.setOpenVariant(2));
        const closed = apply(
            open,
            complectVariantActions.itemsLoaded([
                { id: 1, title: 'Первый', stageId: 'DT1:NEW' },
                { id: 2, title: 'Второй', stageId: 'DT1:SUCCESS' },
                { id: 3, title: 'Третий', stageId: 'DT1:REJECTED' },
            ]),
        );

        expect(offerIdsOf(open)).toEqual([2]);
        expect(offerIdsOf(closed)).toEqual([]);
    });
});

describe('настройки сделки для КП', () => {
    it.each(ALL_MODES)('режим %s: в КП уходит compare, остальное как в сделке', mode => {
        const state = withMode(stateOf(), mode);
        expect(selectOfferComposition(state)).toEqual({ ...DEFAULT_COMPLECT_COMPOSITION, mode: COMPLECT_MODE.compare });
    });

    it('смена режима даёт тот же объект: запрос КП и ключ превью не пересобираются', () => {
        const base = stateOf();
        const before = selectOfferComposition(base);

        for (const mode of ALL_MODES) {
            expect(selectOfferComposition(withMode(base, mode))).toBe(before);
        }
    });

    it('смена печати КП или открытого варианта в настройках даёт новый объект', () => {
        const base = withMode(stateOf(), COMPLECT_MODE.multi_contract);
        const before = selectOfferComposition(base);
        const merged = apply(
            base,
            complectVariantActions.setComposition({
                ...DEFAULT_COMPLECT_COMPOSITION,
                mode: COMPLECT_MODE.multi_contract,
                offer: { ...DEFAULT_COMPLECT_COMPOSITION.offer, infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged },
            }),
        );
        const reopened = apply(
            base,
            complectVariantActions.setComposition({
                ...DEFAULT_COMPLECT_COMPOSITION,
                mode: COMPLECT_MODE.multi_contract,
                openVariantSmartId: 2,
            }),
        );

        expect(selectOfferComposition(merged)).not.toBe(before);
        expect(selectOfferComposition(reopened)).not.toBe(before);
    });
});

describe('участники документов по режиму', () => {
    it('настройки сделки не заданы — «Только открытый вариант», открытого варианта нет: участников нет', () => {
        expect(modeIdsOf(stateOf())).toEqual([]);
    });

    it('«Только открытый вариант»: участник открытый вариант, смена открытого пересчитывает', () => {
        const state = stateOf();
        const first = apply(state, complectVariantActions.setOpenVariant(1));
        const second = apply(first, complectVariantActions.setOpenVariant(2));

        expect(modeIdsOf(first)).toEqual([1]);
        expect(modeIdsOf(second)).toEqual([2]);
        expect(modeIdsOf(apply(second, complectVariantActions.setOpenVariant(null)))).toEqual([]);
    });

    it('«Только открытый вариант»: открытый вариант в финальной стадии (Отклонён) не участвует', () => {
        const state = apply(stateOf(), complectVariantActions.setOpenVariant(3));
        expect(modeIdsOf(state)).toEqual([]);
    });

    it('смена режима пересчитывает участников при том же открытом варианте', () => {
        const single = apply(stateOf(), complectVariantActions.setOpenVariant(1));

        expect(modeIdsOf(single)).toEqual([1]);
        expect(modeIdsOf(withMode(single, COMPLECT_MODE.multi_contract))).toEqual([1, 2]);
        expect(modeIdsOf(withMode(single, COMPLECT_MODE.single_contract))).toEqual([1, 2]);
        expect(modeIdsOf(withMode(withMode(single, COMPLECT_MODE.multi_contract), COMPLECT_MODE.compare))).toEqual([
            1,
        ]);
    });

    it('«Все варианты»: открытый вариант на состав не влияет', () => {
        const together = withMode(stateOf(), COMPLECT_MODE.multi_contract);

        expect(modeIdsOf(together)).toEqual([1, 2]);
        expect(modeIdsOf(apply(together, complectVariantActions.setOpenVariant(2)))).toEqual([1, 2]);
    });

    it('стадии элементов пришли позже: закрытый вариант выпадает без смены режима', () => {
        const together = withMode(stateOf(), COMPLECT_MODE.multi_contract);
        const reopened = apply(
            together,
            complectVariantActions.itemsLoaded([
                { id: 1, title: 'Первый', stageId: 'DT1:SUCCESS' },
                { id: 2, title: 'Второй', stageId: 'DT1:CURRENT' },
                { id: 3, title: 'Третий', stageId: 'DT1:DRAFT' },
            ]),
        );

        expect(modeIdsOf(reopened)).toEqual([2, 3]);
    });

    it('кэшируется: чужое изменение слайса отдаёт тот же массив', () => {
        const state = withMode(stateOf(), COMPLECT_MODE.multi_contract);
        const busy = apply(state, complectVariantActions.busy(true));

        expect(selectModeVariantParticipants(busy)).toBe(selectModeVariantParticipants(state));
    });
});
