import { describe, expect, it } from 'vitest';
import type { InitV2Data } from '../../model/dto';
import { catalogFromInitV2 } from '../adapters/from-init-v2';
import { hasPortalRegions, selectableRegions } from '../portal-regions.util';

/**
 * Адаптер init и выбор регионов. Умолчания ЭР проверяются на форме, которую
 * присылал бэк до исправления: пакеты в ers, повторы, пустые children.
 */
const complect = (tag: string, codes: Record<string, string[]>) => ({
    tag,
    name: tag,
    number: 0,
    type: 'prof',
    title: tag,
    fullTitle: tag,
    shortTitle: tag,
    weight: 0,
    isChanging: true,
    withConsalting: false,
    codes: { filling: [], ers: [], packetsEr: [], ersInPacket: [], ...codes },
});

const packetGroup = {
    code: 'per',
    groupName: 'Пакеты',
    type: 'er',
    productType: 'garant',
    value: ['perbuh', 'perur'].map(code => ({
        code,
        name: code,
        weight: 1,
        isFree: false,
        isLa: false,
        parent: [],
        children: [],
    })),
};

const catalogOf = (data: unknown) => catalogFromInitV2(data as InitV2Data);

const staleInit = {
    complects: {
        prof: [
            complect('buh', { ers: ['perbuh'], packetsEr: ['perbuh'], ersInPacket: ['ertax', 'erprov'] }),
            complect('office', {
                ers: ['perbuh', 'perur'],
                packetsEr: ['perbuh', 'perur'],
                ersInPacket: ['ertax', 'erprov', 'erprov', 'ercorp'],
            }),
        ],
        universal: [],
    },
    infoblocks: [packetGroup],
};

describe('init: умолчания ЭР', () => {
    it('пакет не попадает в отдельные ЭР, состав без повторов', () => {
        const { complects } = catalogOf(staleInit);
        expect(complects.byCode['buh']!.defaults.ers).toEqual([]);
        expect(complects.byCode['buh']!.defaults.erPackets).toEqual(['perbuh']);
        expect(complects.byCode['office']!.defaults.ersInPacket).toEqual(['ertax', 'erprov', 'ercorp']);
    });

    it('пустой состав пакета берётся из комплекта с этим единственным пакетом', () => {
        const { infoblocks } = catalogOf(staleInit);
        expect(infoblocks['perbuh']!.children).toEqual(['ertax', 'erprov']);
        // у perur нет комплекта с ним одним: Офис содержит два пакета
        expect(infoblocks['perur']!.children).toEqual([]);
    });

    it('состав пакета из init важнее', () => {
        const withChildren = {
            ...staleInit,
            infoblocks: [
                {
                    ...packetGroup,
                    value: [{ ...packetGroup.value[0], children: ['erxs'] }],
                },
            ],
        };
        expect(catalogOf(withChildren).infoblocks['perbuh']!.children).toEqual(['erxs']);
    });
});

describe('регионы для выбора', () => {
    const region = (code: string, inPortal: boolean) => ({
        code,
        title: code,
        abs: 1,
        tax: 0,
        taxAbs: 0,
        infoblock: '',
        weight: 0.5,
        inPortal,
    });
    const regions = [region('msk', false), region('rstv', true), region('kmv', true)];
    const codes = (items: { code: string }[]) => items.map(item => item.code);

    it('по умолчанию — портальные', () => {
        expect(codes(selectableRegions(regions, { showAll: false, currentCode: null }))).toEqual(['rstv', 'kmv']);
    });

    it('текущий регион вне портала остаётся в списке', () => {
        expect(codes(selectableRegions(regions, { showAll: false, currentCode: 'msk' }))).toEqual([
            'msk',
            'rstv',
            'kmv',
        ]);
    });

    it('полный список — по запросу', () => {
        expect(selectableRegions(regions, { showAll: true, currentCode: null })).toHaveLength(3);
    });

    it('портал без привязок видит весь справочник', () => {
        const unbound = [region('msk', false), region('rstv', false)];
        expect(hasPortalRegions(unbound)).toBe(false);
        expect(selectableRegions(unbound, { showAll: false, currentCode: null })).toHaveLength(2);
    });
});
