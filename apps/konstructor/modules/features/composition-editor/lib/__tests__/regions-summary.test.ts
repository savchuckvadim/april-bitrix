import { describe, expect, it } from 'vitest';
import { defaultComposition, type Composition } from '@/modules/entities/composition';
import { describeRegions } from '../regions-summary.util';
import { regionsCatalog } from '../__fixtures__/regions-catalog';

const compositionWith = (patch: Partial<Composition>): Composition => ({
    ...defaultComposition(regionsCatalog.complects.byCode['classic']!),
    infoblocks: ['rus', 'reg'],
    ...patch,
});

describe('регионы под региональным блоком', () => {
    it('один регион и это регион клиента: название — его законодательство', () => {
        const summary = describeRegions(regionsCatalog, compositionWith({ regions: ['stv'] }), 'stv');
        expect(summary.title).toBe(regionsCatalog.regions.byCode['stv']!.infoblock);
        expect(summary.weight).toBe(0.5);
        expect(summary.details).toBe('');
    });

    it('несколько регионов: общее название, регион клиента и «а также»', () => {
        const summary = describeRegions(regionsCatalog, compositionWith({ regions: ['stv', 'msk'] }), 'stv');
        expect(summary.title).toBe('Региональное законодательство');
        expect(summary.weight).toBe(1.5);
        expect(summary.details).toBe('Ставропольский край · а также: Москва');
    });

    it('регион клиента заменён другим: общее название и перечень', () => {
        const summary = describeRegions(regionsCatalog, compositionWith({ regions: ['msk'] }), 'stv');
        expect(summary.title).toBe('Региональное законодательство');
        expect(summary.weight).toBe(1);
        expect(summary.details).toBe('регионы: Москва');
    });

    it('регион без веса помечен и в вес не входит', () => {
        const summary = describeRegions(
            regionsCatalog,
            compositionWith({ regions: ['stv'], regionsUnweighted: ['msk'] }),
            'stv',
        );
        expect(summary.weight).toBe(0.5);
        expect(summary.details).toBe('Ставропольский край · а также: Москва (без веса)');
    });

    it('единственный регион клиента без веса: название по региону клиента, вес 0', () => {
        const summary = describeRegions(regionsCatalog, compositionWith({ regionsUnweighted: ['stv'] }), 'stv');
        expect(summary.title).toBe(regionsCatalog.regions.byCode['stv']!.infoblock);
        expect(summary.weight).toBe(0);
    });

    it('регионов нет: общее название и нулевой вес', () => {
        const summary = describeRegions(regionsCatalog, compositionWith({}), 'stv');
        expect(summary).toEqual({ title: 'Региональное законодательство', weight: 0, details: '' });
    });
});
