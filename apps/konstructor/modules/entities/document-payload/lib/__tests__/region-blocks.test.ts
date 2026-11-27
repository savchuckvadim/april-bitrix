import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit, type Catalog } from '../../../catalog';
import { defaultComposition, type Composition } from '../../../composition';
import { buildComplectGroups } from '../build-complect-groups';

/**
 * Региональное законодательство в документах в форме легаси-фронта
 * (getDocumentInfoblocks): рутовый блок reg с законодательством региона в title,
 * остальные регионы блоками isRegion в группе НПА, вес 0.5 у считающих вес и 0
 * у остальных.
 */
const base = catalogFromOldInit(oldInit);
const mskBase = base.regions.byCode['msk']!;
// каталог, как его отдаёт бэк: Москва весит 1
const catalog: Catalog = {
    ...base,
    regions: {
        items: base.regions.items.map(region => (region.code === 'msk' ? { ...region, weight: 1 } : region)),
        byCode: { ...base.regions.byCode, msk: { ...mskBase, weight: 1 } },
    },
};
const legislation = (code: string) => catalog.regions.byCode[code]!.infoblock;

const compositionOf = (patch: Partial<Composition>): Composition => ({
    ...defaultComposition(catalog.complects.byCode['buh']!),
    infoblocks: ['rus', 'reg'],
    ...patch,
});
const npaOf = (composition: Composition) =>
    buildComplectGroups(catalog, composition).find(group => group.type === 'npa')?.value ?? [];

describe('региональное законодательство в КП', () => {
    it('один регион клиента: законодательство в title рутового блока, отдельного блока региона нет', () => {
        const npa = npaOf(compositionOf({ regions: ['stv'] }));
        expect(npa.map(block => block.code)).toEqual(['rus', 'reg']);
        expect(npa[1]).toMatchObject({
            name: 'Региональное законодательство',
            title: legislation('stv'),
            checked: true,
            isRegion: false,
        });
    });

    it('несколько регионов: остальные — блоки isRegion в НПА со своим законодательством', () => {
        const npa = npaOf(compositionOf({ regions: ['stv', 'spb'], regionsUnweighted: ['kali'] }));
        expect(npa.map(block => block.code)).toEqual(['rus', 'reg', 'spb', 'kali']);
        expect(npa[1]!.title).toBe(legislation('stv'));
        // форма блока региона — как в легаси: name = название региона, title = законодательство
        expect(npa[2]).toMatchObject({
            code: 'spb',
            name: catalog.regions.byCode['spb']!.title,
            title: legislation('spb'),
            description: legislation('spb'),
            checked: true,
            isLa: false,
            isRegion: true,
        });
    });

    it('вес в документе: 0.5 у считающих вес, 0 у остальных; вес Москвы 1 из каталога не уходит', () => {
        const npa = npaOf(compositionOf({ regions: ['stv', 'msk'], regionsUnweighted: ['spb'] }));
        const weightOf = (code: string) => npa.find(block => block.code === code)?.weight;
        expect(weightOf('msk')).toBe(0.5);
        expect(weightOf('spb')).toBe(0);
        expect(catalog.regions.byCode['msk']!.weight).toBe(1);
    });

    it('регион не в списке клиента: рутовый блок несёт первый регион состава', () => {
        const npa = npaOf(compositionOf({ regions: ['msk', 'stv'] }));
        expect(npa.map(block => block.code)).toEqual(['rus', 'reg', 'stv']);
        expect(npa[1]!.title).toBe(legislation('msk'));
    });

    it('единственный регион без веса тоже в рутовом блоке', () => {
        const npa = npaOf(compositionOf({ regionsUnweighted: ['stv'] }));
        expect(npa.map(block => block.code)).toEqual(['rus', 'reg']);
        expect(npa[1]!.title).toBe(legislation('stv'));
    });

    it('регионы без повторов по коду и по названию законодательства', () => {
        const npa = npaOf(compositionOf({ regions: ['stv', 'spb'], regionsUnweighted: ['spb', 'stv'] }));
        expect(npa.map(block => block.code)).toEqual(['rus', 'reg', 'spb']);
    });

    it('рутовый блок снят, регионы остались (слепок до модели регионов): блоки регионов печатаются', () => {
        const npa = npaOf(compositionOf({ infoblocks: ['rus'], regions: ['spb'] }));
        expect(npa.map(block => block.code)).toEqual(['rus', 'spb']);
    });

    it('регионов нет: рутовый блок с названием каталога', () => {
        const npa = npaOf(compositionOf({}));
        expect(npa.map(block => block.code)).toEqual(['rus', 'reg']);
        expect(npa[1]!.title).toBe(catalog.infoblocks['reg']!.name);
    });

    it('регион, которого нет в каталоге, печатается кодом', () => {
        const npa = npaOf(compositionOf({ regions: ['stv', 'nowhere'] }));
        expect(npa.find(block => block.code === 'nowhere')).toMatchObject({ name: 'nowhere', title: 'nowhere' });
    });
});
