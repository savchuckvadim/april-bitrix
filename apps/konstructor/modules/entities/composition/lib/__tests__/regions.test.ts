import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit, type Catalog } from '../../../catalog';
import type { Composition, CompositionCtx } from '../../model/types';
import { defaultComposition, normalizeComposition } from '../../model/types';
import { applyAction } from '../apply';
import { mergeCompositions } from '../merge';
import {
    compositionRegionCodes,
    defaultCompositionFor,
    replaceClientRegion,
    withClientRegion,
} from '../regions-edit';
import {
    checkComplectWeight,
    compositionWeight,
    regionWeightSurplus,
} from '../weight';

/**
 * Регионы состава: два списка («считать вес» и «не считать»), вес из каталога,
 * рутовый блок следует за регионами, смена региона клиента.
 */
const base = catalogFromOldInit(oldInit);

/** Каталог с Москвой весом 1: бэк отдаёт так, фикстура старого init — 0.5 для всех */
const catalog: Catalog = {
    ...base,
    regions: {
        items: base.regions.items.map(region =>
            region.code === 'msk' ? { ...region, weight: 1 } : region,
        ),
        byCode: {
            ...base.regions.byCode,
            msk: { ...base.regions.byCode['msk']!, weight: 1 },
        },
    },
};

const complectOf = (code: string) => {
    const complect = catalog.complects.byCode[code];
    if (!complect) throw new Error(`no complect ${code}`);
    return complect;
};
const ctxFor = (code: string, regionCode?: string): CompositionCtx => ({
    complect: complectOf(code),
    catalog,
    regionCode,
});
const compositionFor = (
    code: string,
    overrides: Partial<Composition> = {},
): Composition => ({
    ...defaultComposition(complectOf(code)),
    ...overrides,
});

describe('вес регионов', () => {
    const ctx = ctxFor('classic');

    it('Москва весит 1, остальные 0.5, регион без записи в каталоге 0', () => {
        const only = (regions: string[]) =>
            compositionWeight(
                compositionFor('classic', { infoblocks: [], regions }),
                ctx,
            );
        expect(only(['msk'])).toBe(1);
        expect(only(['stv'])).toBe(0.5);
        expect(only(['msk', 'stv', 'spb'])).toBe(2);
        expect(only(['nowhere'])).toBe(0);
    });

    it('регионы «не считать» и рутовый блок вес не добавляют', () => {
        const composition = compositionFor('classic', {
            infoblocks: ['reg'],
            regions: ['stv'],
            regionsUnweighted: ['msk', 'spb'],
        });
        expect(compositionWeight(composition, ctx)).toBe(0.5);
        expect(
            compositionWeight(
                compositionFor('classic', { infoblocks: ['reg'], regions: [] }),
                ctx,
            ),
        ).toBe(0);
    });
});

describe('вес комплекта с тяжёлым региональным блоком (Москва)', () => {
    /** Состав из одних регионов: вес состава равен весу регионов */
    const regionsOnly = (regions: string[], regionsUnweighted: string[] = []) =>
        compositionFor('classic', {
            infoblocks: ['reg'],
            ers: [],
            erPackets: [],
            regions,
            regionsUnweighted,
        });
    const complect = (type: 'prof' | 'universal', weight: number) => ({
        ...complectOf('classic'),
        type,
        weight,
    });
    const matches = (
        type: 'prof' | 'universal',
        expected: number,
        regions: string[],
        unweighted: string[] = [],
    ) =>
        checkComplectWeight(regionsOnly(regions, unweighted), {
            complect: complect(type, expected),
            catalog,
            regionCode: regions[0],
        }).matches;

    it('надбавка — вес регионов «считать вес» сверх 0.5 каждый: Москва +0.5, остальные 0', () => {
        expect(regionWeightSurplus(['msk'], catalog)).toBe(0.5);
        expect(regionWeightSurplus(['stv', 'spb'], catalog)).toBe(0);
        expect(regionWeightSurplus(['msk', 'stv'], catalog)).toBe(0.5);
        expect(regionWeightSurplus(['nowhere'], catalog)).toBe(0);
    });

    it('ПРОФ с Москвой: вес больше эталона на надбавку блока — не ошибка', () => {
        expect(matches('prof', 0.5, ['msk'])).toBe(true);
        expect(matches('prof', 1, ['msk', 'stv'])).toBe(true);
    });

    it('ПРОФ с Москвой: вес равен эталону — тоже не ошибка', () => {
        expect(matches('prof', 1, ['msk'])).toBe(true);
    });

    it('ПРОФ: вес выше эталона больше надбавки или ниже эталона — ошибка', () => {
        expect(matches('prof', 0.5, ['msk', 'stv'])).toBe(false);
        expect(matches('prof', 1.5, ['msk'])).toBe(false);
    });

    it('ПРОФ без Москвы: вес только точный', () => {
        expect(matches('prof', 0.5, ['stv'])).toBe(true);
        expect(matches('prof', 0.5, ['stv', 'spb'])).toBe(false);
    });

    it('Москва «не считать» надбавки не даёт', () => {
        expect(matches('prof', 0.5, ['stv'], ['msk'])).toBe(true);
        expect(regionWeightSurplus([], catalog)).toBe(0);
    });

    it('Универсал: Москва идёт в общий вес, расхождение с комплектом остаётся (подсказка перейти)', () => {
        expect(matches('universal', 0.5, ['msk'])).toBe(false);
        expect(matches('universal', 1, ['msk'])).toBe(true);
    });
});

describe('действия над регионами', () => {
    const ctx = ctxFor('classic', 'stv');
    const start = compositionFor('classic', { infoblocks: ['rus'] });

    it('setRegions задаёт оба списка целиком и включает рутовый блок', () => {
        const result = applyAction(
            start,
            {
                kind: 'setRegions',
                counted: ['stv', 'spb'],
                unweighted: ['msk'],
            },
            ctx,
        );
        expect(result.composition.regions).toEqual(['stv', 'spb']);
        expect(result.composition.regionsUnweighted).toEqual(['msk']);
        expect(result.composition.infoblocks).toContain('reg');
    });

    it('код живёт в одном списке: «считать вес» побеждает', () => {
        const result = applyAction(
            start,
            {
                kind: 'setRegions',
                counted: ['stv'],
                unweighted: ['stv', 'msk'],
            },
            ctx,
        );
        expect(result.composition.regions).toEqual(['stv']);
        expect(result.composition.regionsUnweighted).toEqual(['msk']);
    });

    it('toggleRegionWeight переводит регион между списками', () => {
        const withTwo = applyAction(
            start,
            { kind: 'setRegions', counted: ['stv', 'spb'], unweighted: [] },
            ctx,
        ).composition;
        const off = applyAction(
            withTwo,
            { kind: 'toggleRegionWeight', code: 'spb', counted: false },
            ctx,
        );
        expect(off.composition.regions).toEqual(['stv']);
        expect(off.composition.regionsUnweighted).toEqual(['spb']);
        const on = applyAction(
            off.composition,
            { kind: 'toggleRegionWeight', code: 'spb', counted: true },
            ctx,
        );
        expect(on.composition.regions).toEqual(['stv', 'spb']);
        expect(on.composition.regionsUnweighted).toEqual([]);
    });

    it('removeRegion убирает регион из любого списка; рутовый блок живёт, пока есть хоть один регион', () => {
        const composition = applyAction(
            start,
            { kind: 'setRegions', counted: ['stv'], unweighted: ['msk'] },
            ctx,
        ).composition;
        const first = applyAction(
            composition,
            { kind: 'removeRegion', code: 'stv' },
            ctx,
        );
        expect(first.composition.regions).toEqual([]);
        expect(first.composition.regionsUnweighted).toEqual(['msk']);
        expect(first.composition.infoblocks).toContain('reg');
        const last = applyAction(
            first.composition,
            { kind: 'removeRegion', code: 'msk' },
            ctx,
        );
        expect(compositionRegionCodes(last.composition)).toEqual([]);
        expect(last.composition.infoblocks).not.toContain('reg');
    });

    it('добавленный регион по умолчанию считает вес', () => {
        const result = applyAction(
            start,
            { kind: 'toggleRegion', code: 'spb', checked: true },
            ctx,
        );
        expect(result.composition.regions).toEqual(['spb']);
    });

    it('свободный режим держит рутовый блок так же', () => {
        const result = applyAction(
            { ...start, mode: 'free' },
            { kind: 'setRegions', counted: ['stv'], unweighted: [] },
            ctx,
        );
        expect(result.composition.infoblocks).toContain('reg');
        const cleared = applyAction(
            result.composition,
            { kind: 'setRegions', counted: [], unweighted: [] },
            ctx,
        );
        expect(cleared.composition.infoblocks).not.toContain('reg');
    });
});

describe('состав по умолчанию с регионом клиента', () => {
    it('блок региона в умолчаниях комплекта → регион клиента считает вес', () => {
        const complect = { ...complectOf('classic') };
        complect.defaults = {
            ...complect.defaults,
            infoblocks: ['rus', 'reg'],
        };
        const composition = defaultCompositionFor(complect, 'stv');
        expect(composition.regions).toEqual(['stv']);
        expect(composition.regionsUnweighted).toEqual([]);
    });

    it('без блока региона в умолчаниях регионов нет', () => {
        const complect = { ...complectOf('classic') };
        complect.defaults = { ...complect.defaults, infoblocks: ['rus'] };
        expect(defaultCompositionFor(complect, 'stv').regions).toEqual([]);
    });

    it('withClientRegion не трогает состав, где регионы уже есть', () => {
        const composition = compositionFor('classic', {
            infoblocks: ['reg'],
            regionsUnweighted: ['msk'],
        });
        expect(withClientRegion(composition, 'stv')).toBe(composition);
    });
});

describe('смена региона клиента', () => {
    const stateWith = (overrides: Partial<Composition>) =>
        compositionFor('classic', { infoblocks: ['reg'], ...overrides });

    it('старый регион клиента заменяется новым в том же списке', () => {
        const counted = replaceClientRegion(
            stateWith({ regions: ['stv', 'spb'] }),
            'stv',
            'msk',
        );
        expect(counted.regions).toEqual(['msk', 'spb']);
        const unweighted = replaceClientRegion(
            stateWith({ regions: ['spb'], regionsUnweighted: ['stv'] }),
            'stv',
            'msk',
        );
        expect(unweighted.regions).toEqual(['spb']);
        expect(unweighted.regionsUnweighted).toEqual(['msk']);
    });

    it('новый регион убирается из соседнего списка', () => {
        const result = replaceClientRegion(
            stateWith({ regions: ['stv'], regionsUnweighted: ['msk'] }),
            'stv',
            'msk',
        );
        expect(result.regions).toEqual(['msk']);
        expect(result.regionsUnweighted).toEqual([]);
        const reverse = replaceClientRegion(
            stateWith({ regions: ['msk'], regionsUnweighted: ['stv'] }),
            'stv',
            'msk',
        );
        expect(reverse.regions).toEqual([]);
        expect(reverse.regionsUnweighted).toEqual(['msk']);
    });

    it('регион клиента уже был среди прочих — дубль не появляется', () => {
        const result = replaceClientRegion(
            stateWith({ regions: ['stv', 'msk'] }),
            'stv',
            'msk',
        );
        expect(result.regions).toEqual(['msk']);
    });

    it('без старого региона в составе состав не меняется', () => {
        const composition = stateWith({ regions: ['spb'] });
        expect(replaceClientRegion(composition, 'stv', 'msk')).toBe(
            composition,
        );
    });

    it('блок региона включён, регионов нет (старый слепок) — встаёт новый регион клиента', () => {
        const result = replaceClientRegion(stateWith({}), 'stv', 'msk');
        expect(result.regions).toEqual(['msk']);
    });
});

describe('слепки и объединение', () => {
    it('старый слепок без списка «не считать» читается', () => {
        const legacy = {
            ...compositionFor('classic', { regions: ['stv', 'stv'] }),
        } as Partial<Composition>;
        delete legacy.regionsUnweighted;
        const normalized = normalizeComposition(legacy as Composition);
        expect(normalized.regions).toEqual(['stv']);
        expect(normalized.regionsUnweighted).toEqual([]);
    });

    it('мердж объединяет оба списка без повторов; считающий вес побеждает', () => {
        const first = compositionFor('classic', {
            regions: ['stv'],
            regionsUnweighted: ['msk'],
        });
        const second = compositionFor('classic', {
            regions: ['msk', 'spb'],
            regionsUnweighted: ['stv', 'kali'],
        });
        const merged = mergeCompositions([first, second]);
        expect(merged?.regions).toEqual(['stv', 'msk', 'spb']);
        expect(merged?.regionsUnweighted).toEqual(['kali']);
    });
});
