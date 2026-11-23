import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { complectVariantActions, complectVariantReducer } from '../../../complect-variant/model/ComplectVariantSlice';
import { COMPLECT_MODE, DEFAULT_COMPLECT_COMPOSITION } from '../../../complect-variant/model/dto';
import { findMainRow } from '../../../row-set';
import { skippedVariantsBlocker } from '../../../offer-document/lib/skipped-variants-blocker';
import { recordOf, variantCatalog } from '../../../offer-document/lib/__fixtures__/variant-records';
import {
    OPEN_VARIANT_ID as OPEN_ID,
    OTHER_VARIANT_ID as OTHER_ID,
    contractUnitsState as stateOf,
    twoVariantRecords as twoRecords,
} from '../__fixtures__/contract-units-state';
import { contractGenerateBlocker, selectContractUnits } from '../select-contract-units';

/**
 * Договорные единицы: по одной на участника, когда варианты продаются вместе.
 * Живое состояние (комплект «Бухгалтер») принадлежит открытому варианту 201,
 * слепки вариантов хранят комплект «Юрист».
 */

const titleOf = (complectCode: string) => variantCatalog.complects.byCode[complectCode]!.title;

describe('договорные единицы по режимам', () => {
    it('режим «Только открытый вариант»: единиц нет, договор по живому состоянию', () => {
        const state = stateOf(COMPLECT_MODE.compare, twoRecords());
        expect(selectContractUnits(state)).toEqual({ units: [], skipped: [] });
    });

    it('«Все варианты, каждому свой договор», два участника: по единице на участника', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, twoRecords());
        const { units, skipped } = selectContractUnits(state);
        expect(skipped).toEqual([]);
        expect(units.map(unit => unit.key)).toEqual(['201', '202']);
        expect(units.map(unit => unit.title)).toEqual(['Бухгалтеру', 'Юристу']);
        expect(units.map(unit => unit.variantSmartId)).toEqual([OPEN_ID, OTHER_ID]);
    });

    it('открытый вариант берётся из живого состояния, остальные из слепка', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, twoRecords());
        const [open, other] = selectContractUnits(state).units;
        expect(open?.isOpen).toBe(true);
        expect(open?.general).toBe(state.rowSet.general);
        expect(open?.summary.complect).toBe(titleOf('buh'));
        expect(other?.isOpen).toBe(false);
        expect(other?.general).not.toBe(state.rowSet.general);
        expect(findMainRow(other!.general)?.refs.complectCode).toBe('ur');
        expect(other?.summary.complect).toBe(titleOf('ur'));
    });

    it('шапка единицы: комплект, поставка и вид договора главной строки', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, twoRecords());
        const { summary } = selectContractUnits(state).units[0]!;
        expect(summary).toEqual({
            complect: titleOf('buh'),
            supply: expect.any(String),
            contract: variantCatalog.contracts.byCode['abonYear']!.name,
        });
        expect(summary.supply).not.toBe('—');
    });

    it('«Все варианты одним договором»: единицы те же, что при «Все варианты, каждому свой договор»', () => {
        const multi = selectContractUnits(stateOf(COMPLECT_MODE.multi_contract, twoRecords()));
        const single = selectContractUnits(stateOf(COMPLECT_MODE.single_contract, twoRecords()));
        expect(single.units.map(unit => unit.key)).toEqual(multi.units.map(unit => unit.key));
        expect(single.units.map(unit => unit.summary)).toEqual(multi.units.map(unit => unit.summary));
        expect(single.skipped).toEqual(multi.skipped);
    });

    it('один участник: единиц нет', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, [recordOf(1, OPEN_ID, 'ur')]);
        expect(selectContractUnits(state)).toEqual({ units: [], skipped: [] });
    });

    it('вариантов нет: единиц нет', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, [], null);
        expect(selectContractUnits(state)).toEqual({ units: [], skipped: [] });
    });

    it('вариант в финальной стадии единицей не становится', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, [...twoRecords(), recordOf(3, 203, 'ur')]);
        expect(selectContractUnits(state).units.map(unit => unit.key)).toEqual(['201', '202']);
    });

    it('нет открытого варианта: все единицы из слепков', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, twoRecords(), null);
        const { units } = selectContractUnits(state);
        expect(units.map(unit => unit.isOpen)).toEqual([false, false]);
        expect(units.every(unit => unit.general !== state.rowSet.general)).toBe(true);
    });
});

describe('участник, которого собрать нельзя', () => {
    const brokenRecords = () => [recordOf(1, OPEN_ID, 'ur'), recordOf(2, OTHER_ID, 'ur', '{broken')];

    it('уходит в skipped, остальные единицы собираются', () => {
        const { units, skipped } = selectContractUnits(stateOf(COMPLECT_MODE.multi_contract, brokenRecords()));
        expect(units.map(unit => unit.key)).toEqual(['201']);
        expect(skipped).toEqual([{ variantSmartId: OTHER_ID, title: 'Юристу', reason: 'snapshotUnreadable' }]);
    });

    it('блокирует формирование тем же текстом, что в КП', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, brokenRecords());
        const expected = skippedVariantsBlocker(selectContractUnits(state).skipped);
        expect(expected).toContain('Вариант «Юристу» нельзя включить в документ: слепок не читается');
        expect(contractGenerateBlocker(state)).toBe(expected);
    });

    it('режим «Только открытый вариант»: нечитаемый слепок не мешает договору по живому состоянию', () => {
        const state = stateOf(COMPLECT_MODE.compare, brokenRecords());
        expect(contractGenerateBlocker(state)).toBeNull();
    });
});

describe('блокер экрана договора', () => {
    it('участники собираются: блокера нет', () => {
        expect(contractGenerateBlocker(stateOf(COMPLECT_MODE.multi_contract, twoRecords()))).toBeNull();
    });

    it('стадии вариантов ещё грузятся: в режиме «Все варианты» блокер ждёт загрузки', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, twoRecords());
        const loading: RootState = { ...state, complectVariant: { ...state.complectVariant, itemsStatus: 'loading' } };
        expect(contractGenerateBlocker(loading)).toBe('Варианты ещё загружаются');
    });

    it('стадии грузятся, режим «Только открытый вариант»: договор по живому состоянию не ждёт', () => {
        const state = stateOf(COMPLECT_MODE.compare, twoRecords());
        const loading: RootState = { ...state, complectVariant: { ...state.complectVariant, itemsStatus: 'loading' } };
        expect(contractGenerateBlocker(loading)).toBeNull();
    });

    it('блокер самого договора (нет поставщика) главнее проверок вариантов', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, twoRecords());
        const withoutProvider: RootState = { ...state, documentProvider: { ...state.documentProvider, current: null } };
        expect(contractGenerateBlocker(withoutProvider)).toBe('Выберите поставщика');
    });
});

describe('selectContractUnits кэшируется', () => {
    it('смена чужого среза стора даёт тот же объект', () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, twoRecords());
        const other: RootState = { ...state, app: { ...state.app, dealId: 1 } };
        expect(selectContractUnits(other)).toBe(selectContractUnits(state));
    });

    it('смена режима пересобирает единицы', () => {
        const multi = stateOf(COMPLECT_MODE.multi_contract, twoRecords());
        const compare: RootState = {
            ...multi,
            complectVariant: complectVariantReducer(
                multi.complectVariant,
                complectVariantActions.setComposition({ ...DEFAULT_COMPLECT_COMPOSITION, mode: COMPLECT_MODE.compare }),
            ),
        };
        expect(selectContractUnits(multi).units).toHaveLength(2);
        expect(selectContractUnits(compare).units).toHaveLength(0);
    });

    it('смена режима с «Только открытый вариант» на «Все варианты» возвращает единицы', () => {
        const compare = stateOf(COMPLECT_MODE.compare, twoRecords());
        const together: RootState = {
            ...compare,
            complectVariant: complectVariantReducer(
                compare.complectVariant,
                complectVariantActions.setComposition({
                    ...DEFAULT_COMPLECT_COMPOSITION,
                    mode: COMPLECT_MODE.single_contract,
                }),
            ),
        };
        expect(selectContractUnits(compare).units).toHaveLength(0);
        expect(selectContractUnits(together).units.map(unit => unit.key)).toEqual(['201', '202']);
    });

    it('смена открытого варианта перекладывает источник набора единицы', () => {
        const first = stateOf(COMPLECT_MODE.multi_contract, twoRecords());
        const second: RootState = {
            ...first,
            complectVariant: complectVariantReducer(
                first.complectVariant,
                complectVariantActions.setOpenVariant(OTHER_ID),
            ),
        };
        expect(selectContractUnits(first).units.map(unit => unit.isOpen)).toEqual([true, false]);
        expect(selectContractUnits(second).units.map(unit => unit.isOpen)).toEqual([false, true]);
        expect(selectContractUnits(second).units[1]?.general).toBe(second.rowSet.general);
    });
});
