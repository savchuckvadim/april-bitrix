import { describe, expect, it } from 'vitest';
import {
    buildPickerRows,
    draftToAction,
    draftWeight,
    filterCounts,
    isDraftChanged,
    pickerRegions,
    setDraftRegionCounted,
    toggleDraftRegion,
    type RegionsDraft,
} from '../regions-picker.util';
import { regionsCatalog } from '../__fixtures__/regions-catalog';

const all = regionsCatalog.regions.items;
const empty: RegionsDraft = { counted: [], unweighted: [] };
const codesOf = (rows: { region: { code: string } }[]) => rows.map(row => row.region.code);

describe('черновик окна «Регионы»', () => {
    it('добавленный регион по умолчанию считает вес', () => {
        expect(toggleDraftRegion(empty, 'spb')).toEqual({ counted: ['spb'], unweighted: [] });
    });

    it('повторное нажатие снимает регион из любого списка', () => {
        expect(toggleDraftRegion({ counted: ['spb'], unweighted: [] }, 'spb')).toEqual(empty);
        expect(toggleDraftRegion({ counted: [], unweighted: ['spb'] }, 'spb')).toEqual(empty);
    });

    it('«считать вес» переводит отмеченный регион между списками', () => {
        const off = setDraftRegionCounted({ counted: ['spb', 'stv'], unweighted: [] }, 'spb', false);
        expect(off).toEqual({ counted: ['stv'], unweighted: ['spb'] });
        expect(setDraftRegionCounted(off, 'spb', true)).toEqual({ counted: ['stv', 'spb'], unweighted: [] });
    });

    it('у неотмеченного региона вес не переключается', () => {
        expect(setDraftRegionCounted(empty, 'spb', false)).toBe(empty);
    });

    it('вес черновика: Москва 1, остальные 0.5, без веса 0', () => {
        expect(draftWeight({ counted: ['msk', 'stv', 'spb'], unweighted: ['kali'] }, regionsCatalog)).toBe(2);
    });

    it('изменён ли черновик — без учёта порядка', () => {
        const initial = { counted: ['msk', 'stv'], unweighted: ['spb'] };
        expect(isDraftChanged({ counted: ['stv', 'msk'], unweighted: ['spb'] }, initial)).toBe(false);
        expect(isDraftChanged({ counted: ['stv'], unweighted: ['spb'] }, initial)).toBe(true);
        expect(isDraftChanged({ counted: ['msk', 'stv', 'spb'], unweighted: [] }, initial)).toBe(true);
    });

    it('сохранение — одно действие setRegions с обоими списками', () => {
        expect(draftToAction({ counted: ['stv'], unweighted: ['msk'] })).toEqual({
            kind: 'setRegions',
            counted: ['stv'],
            unweighted: ['msk'],
        });
    });
});

describe('список регионов окна', () => {
    it('по умолчанию — регионы портала плюс регион клиента', () => {
        const regions = pickerRegions(all, { showAll: false, clientRegionCode: 'stv', selectedCodes: [] });
        expect(regions.map(region => region.code).sort()).toEqual(['msk', 'stv']);
    });

    it('отмеченный регион вне портала остаётся в списке', () => {
        const regions = pickerRegions(all, { showAll: false, clientRegionCode: 'stv', selectedCodes: ['spb'] });
        expect(regions.map(region => region.code)).toContain('spb');
    });

    it('«Все регионы»: весь справочник, регионы портала первыми', () => {
        const regions = pickerRegions(all, { showAll: true, clientRegionCode: 'stv', selectedCodes: [] });
        expect(regions).toHaveLength(all.length);
        expect(
            regions
                .slice(0, 2)
                .map(region => region.code)
                .sort(),
        ).toEqual(['msk', 'stv']);
    });

    it('портал без привязок видит весь справочник', () => {
        const noPortal = all.map(region => ({ ...region, inPortal: false }));
        expect(pickerRegions(noPortal, { showAll: false, clientRegionCode: null, selectedCodes: [] })).toHaveLength(
            all.length,
        );
    });
});

describe('поиск и фильтры', () => {
    const draft: RegionsDraft = { counted: ['stv'], unweighted: ['msk'] };
    const rows = (query: string, filter: Parameters<typeof buildPickerRows>[3]) =>
        codesOf(buildPickerRows(all, draft, query, filter));

    it('поиск по названию без учёта регистра', () => {
        expect(rows('ставроп', 'all')).toEqual(['stv']);
        expect(rows('МОСК', 'all').sort()).toEqual(['mobl', 'msk']);
    });

    it('поиск по названию законодательства', () => {
        expect(rows('Законодательство города Москвы', 'all')).toContain('msk');
    });

    it('фильтры: отмеченные, считать вес, не считать', () => {
        expect(rows('', 'selected').sort()).toEqual(['msk', 'stv']);
        expect(rows('', 'counted')).toEqual(['stv']);
        expect(rows('', 'unweighted')).toEqual(['msk']);
    });

    it('фильтр и поиск работают вместе', () => {
        expect(rows('моск', 'counted')).toEqual([]);
        expect(rows('моск', 'unweighted')).toEqual(['msk']);
    });

    it('число на чипах', () => {
        expect(filterCounts(draft)).toEqual({ all: null, selected: 2, counted: 1, unweighted: 1 });
    });
});
