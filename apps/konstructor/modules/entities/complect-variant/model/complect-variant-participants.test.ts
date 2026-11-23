import type { UnknownAction } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import type { ComplectVariantItem } from '../lib/api/complect-variant-helper';
import {
    complectVariantActions,
    complectVariantReducer,
    selectVariantParticipants,
    type ComplectVariantState,
} from './ComplectVariantSlice';
import {
    COMPLECT_MODE,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from './dto';

/**
 * Селектор участников читает режим сделки, открытый вариант, записи и стадии
 * элементов: смена любого из них пересчитывает участников для КП, PDF,
 * договора, товаров сделки и заявки поставки (все берут его результат).
 */

const record = (variantSmartId: number): ComplectVariantRecordDto =>
    ({ id: variantSmartId * 10, variantSmartId }) as ComplectVariantRecordDto;

const items: ComplectVariantItem[] = [
    { id: 1, title: 'Первый', stageId: 'DT1:NEW' },
    { id: 2, title: 'Второй', stageId: 'DT1:CURRENT' },
    { id: 3, title: 'Третий', stageId: 'DT1:REJECTED' },
];

const stateOf = (): { complectVariant: ComplectVariantState } => {
    let complectVariant = complectVariantReducer(undefined, { type: 'init' });
    complectVariant = complectVariantReducer(
        complectVariant,
        complectVariantActions.loaded({ records: [record(1), record(2), record(3)], composition: null }),
    );
    complectVariant = complectVariantReducer(complectVariant, complectVariantActions.itemsLoaded(items));
    return { complectVariant };
};

const apply = (
    state: { complectVariant: ComplectVariantState },
    action: UnknownAction,
) => ({ complectVariant: complectVariantReducer(state.complectVariant, action) });

const withMode = (state: { complectVariant: ComplectVariantState }, mode: ComplectMode) =>
    apply(state, complectVariantActions.setComposition({ ...DEFAULT_COMPLECT_COMPOSITION, mode }));

const idsOf = (state: { complectVariant: ComplectVariantState }) =>
    selectVariantParticipants(state).map(item => item.variantSmartId);

describe('селектор участников документов', () => {
    it('настройки сделки не заданы — «по одному», открытого варианта нет: участников нет', () => {
        expect(idsOf(stateOf())).toEqual([]);
    });

    it('«по одному»: участник открытый вариант, смена открытого варианта пересчитывает', () => {
        const state = stateOf();
        const first = apply(state, complectVariantActions.setOpenVariant(1));
        const second = apply(first, complectVariantActions.setOpenVariant(2));

        expect(idsOf(first)).toEqual([1]);
        expect(idsOf(second)).toEqual([2]);
        expect(idsOf(apply(second, complectVariantActions.setOpenVariant(null)))).toEqual([]);
    });

    it('«по одному»: открытый вариант в финальной стадии (Отклонён) не участвует', () => {
        const state = apply(stateOf(), complectVariantActions.setOpenVariant(3));
        expect(idsOf(state)).toEqual([]);
    });

    it('смена режима пересчитывает участников при том же открытом варианте', () => {
        const single = apply(stateOf(), complectVariantActions.setOpenVariant(1));

        expect(idsOf(single)).toEqual([1]);
        expect(idsOf(withMode(single, COMPLECT_MODE.multi_contract))).toEqual([1, 2]);
        expect(idsOf(withMode(single, COMPLECT_MODE.single_contract))).toEqual([1, 2]);
        expect(idsOf(withMode(withMode(single, COMPLECT_MODE.multi_contract), COMPLECT_MODE.compare))).toEqual([1]);
    });

    it('«вместе»: открытый вариант на состав не влияет', () => {
        const together = withMode(stateOf(), COMPLECT_MODE.multi_contract);

        expect(idsOf(together)).toEqual([1, 2]);
        expect(idsOf(apply(together, complectVariantActions.setOpenVariant(2)))).toEqual([1, 2]);
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

        expect(idsOf(reopened)).toEqual([2, 3]);
    });

    it('кэшируется: чужое изменение слайса отдаёт тот же массив', () => {
        const state = withMode(stateOf(), COMPLECT_MODE.multi_contract);
        const busy = apply(state, complectVariantActions.busy(true));

        expect(selectVariantParticipants(busy)).toBe(selectVariantParticipants(state));
    });
});
