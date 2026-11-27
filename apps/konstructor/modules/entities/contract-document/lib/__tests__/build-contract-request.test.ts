import { describe, expect, it } from 'vitest';
import { rootStateWith } from '../../../document-payload/lib/__fixtures__/root-state';
import {
    catalog,
    compositionOf,
    garantRowOf,
    syncedGeneral,
} from '../../../document-payload/lib/__fixtures__/two-garant-set';
import { buildContractGenerateRequest, buildSpecificationFormRequest } from '../build-contract-request';

/**
 * Договор по общему набору: регионы и Legal Tech собираются из объединённого
 * наполнения всех комплектов набора, дополнительные комплекты учтены наравне
 * с главным.
 */

const nameOf = (code: string) => catalog.services.lt.find(service => service.code === code)!.name;
const smallPacketName = catalog.services.ltPackages.find(pkg => pkg.weight === 2)!.fullName;

const main = garantRowOf(
    'general_main',
    'main',
    'buh',
    compositionOf('buh', { infoblocks: ['rus', 'reg'], lt: ['ltsut'], regions: ['stv'] }),
);
const additional = garantRowOf(
    'general_additional',
    'additional',
    'ur',
    compositionOf('ur', {
        infoblocks: ['la', 'reg'],
        lt: ['ltconstructor'],
        regions: ['spb'],
        ltOther: [{ id: 'extra', services: ['ltdisk', 'ltconnect'], alternativeName: null }],
    }),
);

describe('договор: наполнение общего набора', () => {
    const state = rootStateWith(syncedGeneral([main, additional]));

    it('регионы: главной и дополнительной строк', () => {
        const request = buildContractGenerateRequest(state);
        expect(request?.regions.inComplect.map(region => region.name)).toEqual(['stv', 'spb']);
    });

    it('Legal Tech: бесплатные сервисы и платный пакет дополнительной строки', () => {
        const lt = buildSpecificationFormRequest(state)?.lt;
        expect(lt?.freeServices).toEqual([nameOf('ltsut'), nameOf('ltconstructor')]);
        expect(lt?.paidPackets).toEqual([
            { name: smallPacketName, services: [nameOf('ltdisk'), nameOf('ltconnect')] },
        ]);
    });

    it('группы инфоблоков договора включают блоки обеих строк', () => {
        const codes = buildContractGenerateRequest(state)?.complect.flatMap(group => group.value.map(item => item.code));
        // регион главной строки идёт в рутовом блоке, регион второй — блоком рядом
        expect(codes).toEqual(expect.arrayContaining(['rus', 'la', 'reg', 'spb']));
    });

    it('набор с одной строкой Гаранта: регионы только её', () => {
        const single = rootStateWith(syncedGeneral([main]));
        expect(buildContractGenerateRequest(single)?.regions.inComplect.map(region => region.name)).toEqual(['stv']);
        expect(buildSpecificationFormRequest(single)?.lt.paidPackets).toEqual([]);
    });
});
