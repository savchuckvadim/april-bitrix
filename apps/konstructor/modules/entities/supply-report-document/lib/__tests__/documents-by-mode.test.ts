import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../../catalog';
import { COMPLECT_MODE, type ComplectMode } from '../../../complect-variant/model/dto';
import {
    OPEN_VARIANT_ID,
    OTHER_VARIANT_ID,
    twoVariantRecords,
    unitItems,
} from '../../../contract-document/lib/__fixtures__/contract-units-state';
import { selectContractUnits } from '../../../contract-document/lib/select-contract-units';
import { buildOfferMultiGenerateRequest } from '../../../offer-document/lib/build-offer-request';
import { selectDealProductRows } from '../../../offer-document/lib/select-deal-product-rows';
import { rootStateWithVariantsAndTemplate } from '../../../offer-document/lib/__fixtures__/variants-state';
import { buildProductRows } from '../../../row-set';
import { buildInitSupplyRequest, supplyReportBlocker } from '../build-supply-report-request';

/**
 * Один режим сделки (composition.mode) на все документы. КП идёт по открытому
 * варианту при любом режиме, а договор, заявка поставки (init-supply), отчёт о
 * поставке и товары сделки следуют режиму. Два незакрытых варианта: открытый
 * 201 и второй 202.
 */

const ALL_MODES: ComplectMode[] = [COMPLECT_MODE.compare, COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract];
const TOGETHER_MODES: ComplectMode[] = [COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract];

/** Состояние с двумя вариантами, режимом сделки, открытым вариантом 201 и выбранным Word-шаблоном КП. */
const stateOf = (mode: ComplectMode, records = twoVariantRecords()): RootState =>
    rootStateWithVariantsAndTemplate(records, unitItems, undefined, { mode, openVariantSmartId: OPEN_VARIANT_ID });

const offerIds = (state: RootState) =>
    buildOfferMultiGenerateRequest(state)?.variants.map(variant => variant.variantSmartId);

const supplyIds = (state: RootState) =>
    buildInitSupplyRequest(state, 'https://file', [])?.variants?.map(variant => variant.variantSmartId);

describe('КП не зависит от режима сделки', () => {
    it.each(ALL_MODES)('режим %s: в КП один вариант, открытый', mode => {
        expect(offerIds(stateOf(mode))).toEqual([OPEN_VARIANT_ID]);
    });
});

describe('документы по режиму «Только открытый вариант»', () => {
    const state = () => stateOf(COMPLECT_MODE.compare);

    it('договор: единиц нет, договор по живому состоянию', () => {
        expect(selectContractUnits(state()).units).toEqual([]);
    });

    it('заявка поставки: в variants один вариант, открытый', () => {
        expect(supplyIds(state())).toEqual([OPEN_VARIANT_ID]);
    });

    it('товары сделки: строки живого набора', () => {
        const current = state();
        expect(selectDealProductRows(current).rows).toEqual(buildProductRows(current.rowSet.general, selectCatalog(current)));
    });
});

describe.each(TOGETHER_MODES)('документы по режиму «Все варианты» (%s)', mode => {
    const state = () => stateOf(mode);

    it('договор: по единице на каждый незакрытый вариант', () => {
        expect(selectContractUnits(state()).units.map(unit => unit.key)).toEqual([
            String(OPEN_VARIANT_ID),
            String(OTHER_VARIANT_ID),
        ]);
    });

    it('заявка поставки: в variants все незакрытые варианты', () => {
        expect(supplyIds(state())).toEqual([OPEN_VARIANT_ID, OTHER_VARIANT_ID]);
    });

    it('товары сделки: строки обоих вариантов, больше, чем у живого набора', () => {
        const current = state();
        const live = buildProductRows(current.rowSet.general, selectCatalog(current));
        expect(selectDealProductRows(current).rows.length).toBeGreaterThan(live.length);
    });

    it('отчёт о поставке: нечитаемый слепок второго варианта блокирует отчёт с заявкой', () => {
        const broken = stateOf(mode, [twoVariantRecords()[0]!, { ...twoVariantRecords()[1]!, rows: '{broken' }]);
        expect(supplyReportBlocker(broken)).toContain('Вариант «Юристу» нельзя включить в документ');
    });
});

describe('отчёт о поставке по режиму «Только открытый вариант»', () => {
    it('нечитаемый слепок второго варианта отчёт не блокирует', () => {
        const records = [twoVariantRecords()[0]!, { ...twoVariantRecords()[1]!, rows: '{broken' }];
        expect(supplyReportBlocker(stateOf(COMPLECT_MODE.compare, records))).toBeNull();
    });
});
