import { describe, expect, it } from 'vitest';
import { rootStateWith } from '../../../document-payload/lib/__fixtures__/root-state';
import { catalog, compositionOf, garantRowOf, syncedGeneral } from '../../../document-payload/lib/__fixtures__/two-garant-set';
import { COMPLECT_MODE, type ComplectVariantRecordDto } from '../../../complect-variant/model/dto';
import { createSet } from '../../../row-set';
import { recordOf, snapshotRowsOf, variantItems } from '../../../offer-document/lib/__fixtures__/variant-records';
import { rootStateWithVariants } from '../../../offer-document/lib/__fixtures__/variants-state';
import {
    buildInitSupplyRequest,
    buildSupplyReportGenerateRequest,
    supplyReportBlocker,
} from '../build-supply-report-request';

/** Режим «Все варианты»: в заявку и в блокер идут все незакрытые варианты. */
const together = (records: ComplectVariantRecordDto[]) =>
    rootStateWithVariants(records, variantItems, undefined, { mode: COMPLECT_MODE.multi_contract });

/** Режим «Только открытый вариант»: участник один, открытый вариант. */
const oneByOne = (records: ComplectVariantRecordDto[], openVariantSmartId: number | null) =>
    rootStateWithVariants(records, variantItems, undefined, { mode: COMPLECT_MODE.compare, openVariantSmartId });

/** Отчёт о поставке по общему набору: регионы и группы инфоблоков — по наполнению всех комплектов. */
describe('отчёт о поставке: наполнение общего набора', () => {
    const main = garantRowOf('general_main', 'main', 'buh', compositionOf('buh', { infoblocks: ['rus', 'reg'], regions: ['stv'] }));
    const additional = garantRowOf(
        'general_additional',
        'additional',
        'ur',
        compositionOf('ur', { infoblocks: ['rus', 'la', 'reg'], regions: ['spb'] }),
    );

    it('регионы главной и дополнительной строк, инфоблоки без повторов', () => {
        const request = buildSupplyReportGenerateRequest(rootStateWith(syncedGeneral([main, additional])));
        expect(request?.regions.inComplect.map(region => region.name)).toEqual(['stv', 'spb']);
        const codes = request?.complect.flatMap(group => group.value.map(item => item.code)) ?? [];
        expect(codes.filter(code => code === 'rus')).toHaveLength(1);
        expect(codes).toContain('la');
    });

    it('регион клиента несёт полное название законодательства, не название региона', () => {
        const request = buildSupplyReportGenerateRequest(rootStateWith(syncedGeneral([main])));
        expect(request?.region).toMatchObject({ name: 'stv', title: catalog.regions.byCode['stv']!.title });
        expect(request?.region.infoblock).toBe(catalog.regions.byCode['stv']!.infoblock);
    });

    it('регионы без веса уходят в noWidth, регион клиента считает вес', () => {
        const row = garantRowOf(
            'general_main',
            'main',
            'buh',
            compositionOf('buh', { infoblocks: ['rus', 'reg'], regions: ['stv'], regionsUnweighted: ['spb'] }),
        );
        const request = buildSupplyReportGenerateRequest(rootStateWith(syncedGeneral([row])));
        expect(request?.regions.inComplect.map(region => region.name)).toEqual(['stv']);
        expect(request?.regions.noWidth.map(region => region.name)).toEqual(['spb']);
    });
});

describe('отчёт о поставке: участники-варианты', () => {
    it('один участник — variants из одного элемента', () => {
        const state = together([recordOf(1, 102, 'buh')]);
        const request = buildInitSupplyRequest(state, 'https://file', []);
        expect(request?.variants?.map(variant => variant.variantSmartId)).toEqual([102]);
    });

    it('только открытый вариант: в заявку идёт открытый вариант, остальные нет', () => {
        const state = oneByOne([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')], 104);
        const request = buildInitSupplyRequest(state, 'https://file', []);
        expect(request?.variants?.map(variant => variant.variantSmartId)).toEqual([104]);
    });

    it('только открытый вариант, открытого нет: поле variants не отправляется', () => {
        const state = oneByOne([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')], null);
        const request = buildInitSupplyRequest(state, 'https://file', []);
        expect(request).not.toBeNull();
        expect(request?.variants).toBeUndefined();
    });

    it('только открытый вариант: нечитаемый слепок неоткрытого варианта отчёт не блокирует', () => {
        const state = oneByOne([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur', '{broken')], 102);
        expect(supplyReportBlocker(state)).toBeNull();
    });

    it('несколько участников — все уходят в variants', () => {
        const state = together([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')]);
        const request = buildInitSupplyRequest(state, 'https://file', []);
        expect(request?.variants?.map(variant => variant.variantSmartId)).toEqual([102, 104]);
    });

    it('вариантов нет — поле variants не отправляется', () => {
        const state = together([]);
        const request = buildInitSupplyRequest(state, 'https://file', []);
        expect(request).not.toBeNull();
        expect(request?.variants).toBeUndefined();
    });

    it('нечитаемый слепок участника блокирует отчёт с заявкой и называет вариант', () => {
        const state = together([recordOf(1, 102, 'buh', '{broken')]);
        expect(supplyReportBlocker(state)).toBe(
            'Вариант «Юристу» нельзя включить в документ: слепок не читается. ' +
                'Откройте вариант и сохраните его заново или отклоните его',
        );
        expect(buildSupplyReportGenerateRequest(state)).toBeNull();
    });

    it('участник без главной строки блокирует отчёт с заявкой', () => {
        const state = together([recordOf(1, 102, 'buh', snapshotRowsOf(createSet('general', 'general')))]);
        const blocker = supplyReportBlocker(state);
        expect(blocker).toContain('Вариант «Юристу» нельзя включить в документ');
        expect(blocker).toContain('нет главной строки комплекта');
    });

    it('без заявки варианты не уходят никуда и отчёт не блокируется', () => {
        const base = together([recordOf(1, 102, 'buh', '{broken')]);
        const state = { ...base, supplyReport: { ...base.supplyReport, needProcess: false } };
        expect(supplyReportBlocker(state)).toBeNull();
    });

    it('читаемые участники не блокируют отчёт', () => {
        const state = together([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')]);
        expect(supplyReportBlocker(state)).toBeNull();
    });
});
