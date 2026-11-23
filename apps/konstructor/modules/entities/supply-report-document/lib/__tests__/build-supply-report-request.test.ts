import { describe, expect, it } from 'vitest';
import { rootStateWith } from '../../../document-payload/lib/__fixtures__/root-state';
import { compositionOf, garantRowOf, syncedGeneral } from '../../../document-payload/lib/__fixtures__/two-garant-set';
import { createSet } from '../../../row-set';
import { recordOf, snapshotRowsOf, variantItems } from '../../../offer-document/lib/__fixtures__/variant-records';
import { rootStateWithVariants } from '../../../offer-document/lib/__fixtures__/variants-state';
import {
    buildInitSupplyRequest,
    buildSupplyReportGenerateRequest,
    supplyReportBlocker,
} from '../build-supply-report-request';

/** Отчёт о поставке по общему набору: регионы и группы инфоблоков — по наполнению всех комплектов. */
describe('отчёт о поставке: наполнение общего набора', () => {
    const main = garantRowOf('general_main', 'main', 'buh', compositionOf('buh', { infoblocks: ['rus'], regions: ['stv'] }));
    const additional = garantRowOf(
        'general_additional',
        'additional',
        'ur',
        compositionOf('ur', { infoblocks: ['rus', 'la'], regions: ['spb'] }),
    );

    it('регионы главной и дополнительной строк, инфоблоки без повторов', () => {
        const request = buildSupplyReportGenerateRequest(rootStateWith(syncedGeneral([main, additional])));
        expect(request?.regions.inComplect.map(region => region.name)).toEqual(['stv', 'spb']);
        const codes = request?.complect.flatMap(group => group.value.map(item => item.code)) ?? [];
        expect(codes.filter(code => code === 'rus')).toHaveLength(1);
        expect(codes).toContain('la');
    });
});

describe('отчёт о поставке: участники-варианты', () => {
    it('один участник — variants из одного элемента', () => {
        const state = rootStateWithVariants([recordOf(1, 102, 'buh')], variantItems);
        const request = buildInitSupplyRequest(state, 'https://file', []);
        expect(request?.variants?.map(variant => variant.variantSmartId)).toEqual([102]);
    });

    it('несколько участников — все уходят в variants', () => {
        const state = rootStateWithVariants([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')], variantItems);
        const request = buildInitSupplyRequest(state, 'https://file', []);
        expect(request?.variants?.map(variant => variant.variantSmartId)).toEqual([102, 104]);
    });

    it('вариантов нет — поле variants не отправляется', () => {
        const state = rootStateWithVariants([], variantItems);
        const request = buildInitSupplyRequest(state, 'https://file', []);
        expect(request).not.toBeNull();
        expect(request?.variants).toBeUndefined();
    });

    it('нечитаемый слепок участника блокирует отчёт с заявкой и называет вариант', () => {
        const state = rootStateWithVariants([recordOf(1, 102, 'buh', '{broken')], variantItems);
        expect(supplyReportBlocker(state)).toBe(
            'Вариант «Юристу» нельзя включить в документ: слепок не читается. ' +
                'Откройте вариант и сохраните его заново или отклоните его',
        );
        expect(buildSupplyReportGenerateRequest(state)).toBeNull();
    });

    it('участник без главной строки блокирует отчёт с заявкой', () => {
        const state = rootStateWithVariants(
            [recordOf(1, 102, 'buh', snapshotRowsOf(createSet('general', 'general')))],
            variantItems,
        );
        const blocker = supplyReportBlocker(state);
        expect(blocker).toContain('Вариант «Юристу» нельзя включить в документ');
        expect(blocker).toContain('нет главной строки комплекта');
    });

    it('без заявки варианты не уходят никуда и отчёт не блокируется', () => {
        const base = rootStateWithVariants([recordOf(1, 102, 'buh', '{broken')], variantItems);
        const state = { ...base, supplyReport: { ...base.supplyReport, needProcess: false } };
        expect(supplyReportBlocker(state)).toBeNull();
    });

    it('читаемые участники не блокируют отчёт', () => {
        const state = rootStateWithVariants([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')], variantItems);
        expect(supplyReportBlocker(state)).toBeNull();
    });
});
