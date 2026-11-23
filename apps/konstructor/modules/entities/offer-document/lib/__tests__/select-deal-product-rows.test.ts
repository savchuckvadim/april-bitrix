import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import type { ComplectVariantItem } from '../../../complect-variant/lib/api/complect-variant-helper';
import { complectVariantActions, complectVariantReducer } from '../../../complect-variant/model/ComplectVariantSlice';
import {
    COMPLECT_MODE,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from '../../../complect-variant/model/dto';
import { recordOf } from '../__fixtures__/variant-records';
import { rootStateWithVariants } from '../__fixtures__/variants-state';
import { dealProductRowsBlocker, selectDealProductRows } from '../select-deal-product-rows';
import { skippedVariantsBlocker } from '../skipped-variants-blocker';

/**
 * Строки сделки и блокер записи из состояния приложения. Живое состояние
 * (комплект «Бухгалтер») принадлежит открытому варианту 201, слепки хранят «Юриста».
 */

const OPEN_ID = 201;
const OTHER_ID = 202;

const items: ComplectVariantItem[] = [
    { id: OPEN_ID, title: 'Бухгалтеру', stageId: 'DT1:NEW' },
    { id: OTHER_ID, title: 'Юристу', stageId: 'DT1:NEW' },
];

const stateOf = (mode: ComplectMode, records: ComplectVariantRecordDto[]): RootState => {
    const base = rootStateWithVariants(records, items);
    let complectVariant = complectVariantReducer(
        base.complectVariant,
        complectVariantActions.setComposition({ ...DEFAULT_COMPLECT_COMPOSITION, mode }),
    );
    complectVariant = complectVariantReducer(complectVariant, complectVariantActions.setOpenVariant(OPEN_ID));
    return { ...base, complectVariant };
};

const goodRecords = () => [recordOf(1, OPEN_ID, 'ur'), recordOf(2, OTHER_ID, 'ur')];
const brokenRecords = () => [recordOf(1, OPEN_ID, 'ur'), recordOf(2, OTHER_ID, 'ur', '{broken')];

describe('строки сделки из состояния', () => {
    it('«Все варианты, каждому свой договор», два участника: строки обоих, sort сквозной', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, goodRecords());
        const { rows, skipped } = selectDealProductRows(state);

        expect(skipped).toEqual([]);
        expect(rows).toHaveLength(state.rowSet.general.rows.length + 1);
        expect(rows.map(row => row.sort)).toEqual(rows.map((_, index) => index));
    });

    it('режим «Только открытый вариант»: строки живого набора', () => {
        const state = stateOf(COMPLECT_MODE.compare, goodRecords());

        expect(selectDealProductRows(state).rows).toHaveLength(state.rowSet.general.rows.length);
    });

    it('смена чужого среза стора даёт тот же объект', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, goodRecords());
        const other: RootState = { ...state, app: { ...state.app, dealId: 1 } };

        expect(selectDealProductRows(other)).toBe(selectDealProductRows(state));
    });

    it('смена режима пересчитывает строки сделки без пересоздания состояния', () => {
        const together = stateOf(COMPLECT_MODE.multi_contract, goodRecords());
        const single: RootState = {
            ...together,
            complectVariant: complectVariantReducer(
                together.complectVariant,
                complectVariantActions.setComposition({ ...DEFAULT_COMPLECT_COMPOSITION, mode: COMPLECT_MODE.compare }),
            ),
        };
        const liveCount = together.rowSet.general.rows.length;

        expect(selectDealProductRows(together).rows).toHaveLength(liveCount + 1);
        expect(selectDealProductRows(single).rows).toHaveLength(liveCount);
    });

    it('закрытый вариант в режиме «Все варианты» не даёт строк: остаётся один участник и живой набор', () => {
        const base = stateOf(COMPLECT_MODE.multi_contract, goodRecords());
        const closed: RootState = {
            ...base,
            complectVariant: complectVariantReducer(
                base.complectVariant,
                complectVariantActions.itemsLoaded([
                    { id: OPEN_ID, title: 'Бухгалтеру', stageId: 'DT1:NEW' },
                    { id: OTHER_ID, title: 'Юристу', stageId: 'DT1:SUCCESS' },
                ]),
            ),
        };

        expect(selectDealProductRows(closed).rows).toHaveLength(base.rowSet.general.rows.length);
    });
});

describe('блокер записи сделки', () => {
    it('участники собираются: блокера нет', () => {
        expect(dealProductRowsBlocker(stateOf(COMPLECT_MODE.multi_contract, goodRecords()))).toBeNull();
    });

    it('участник не собирается: тот же текст, что у документов', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, brokenRecords());
        const expected = skippedVariantsBlocker(selectDealProductRows(state).skipped);

        expect(expected).toContain('Вариант «Юристу» нельзя включить в документ: слепок не читается');
        expect(dealProductRowsBlocker(state)).toBe(expected);
    });

    it('«Все варианты одним договором»: нечитаемый слепок блокирует так же', () => {
        const state = stateOf(COMPLECT_MODE.single_contract, brokenRecords());

        expect(dealProductRowsBlocker(state)).toContain('Вариант «Юристу» нельзя включить в документ');
    });

    it('режим «Только открытый вариант»: нечитаемый слепок сделку не блокирует', () => {
        expect(dealProductRowsBlocker(stateOf(COMPLECT_MODE.compare, brokenRecords()))).toBeNull();
    });

    it('стадии вариантов ещё грузятся: в режиме «Все варианты» запись ждёт', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, goodRecords());
        const loading: RootState = { ...state, complectVariant: { ...state.complectVariant, itemsStatus: 'loading' } };

        expect(dealProductRowsBlocker(loading)).toContain('Варианты ещё загружаются');
    });

    it('стадии грузятся, режим «Только открытый вариант»: запись не ждёт', () => {
        const state = stateOf(COMPLECT_MODE.compare, goodRecords());
        const loading: RootState = { ...state, complectVariant: { ...state.complectVariant, itemsStatus: 'loading' } };

        expect(dealProductRowsBlocker(loading)).toBeNull();
    });
});
