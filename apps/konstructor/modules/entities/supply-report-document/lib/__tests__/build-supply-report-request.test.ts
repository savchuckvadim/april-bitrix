import { describe, expect, it } from 'vitest';
import { rootStateWith } from '../../../document-payload/lib/__fixtures__/root-state';
import { compositionOf, garantRowOf, syncedGeneral } from '../../../document-payload/lib/__fixtures__/two-garant-set';
import { buildSupplyReportGenerateRequest } from '../build-supply-report-request';

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
