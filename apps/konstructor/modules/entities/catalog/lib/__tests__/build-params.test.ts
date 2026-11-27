import { describe, expect, it } from 'vitest';
import oldInit from '../__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../adapters/from-oldinit';
import { filterSuppliesForCurrentKind, resolveRefsForBuildParams } from '../compatibility-matrix';
import { makeCustomSupplyCode, resolveSupply } from '../custom-od.util';

const catalog = catalogFromOldInit(oldInit);

describe('resolveRefsForBuildParams', () => {
    it('новая сборка: первый комплект линейки и поставка нужного вида', () => {
        const refs = resolveRefsForBuildParams(
            catalog,
            { complectType: 'prof', supplyKind: 'proxima' },
            null,
        );
        expect(refs).not.toBeNull();
        expect(catalog.complects.byCode[refs!.complectCode]?.type).toBe('prof');
        expect(resolveSupply(catalog, refs!.supplyCode)?.type).toBe('proxima');
    });

    it('та же линейка — комплект сохраняется, другой доступ — поставка меняется', () => {
        const base = resolveRefsForBuildParams(
            catalog,
            { complectType: 'prof', supplyKind: 'internet' },
            null,
        )!;
        const lastProf = catalog.complects.prof.at(-1)!;
        const next = resolveRefsForBuildParams(
            catalog,
            { complectType: 'prof', supplyKind: 'proxima' },
            { ...base, complectCode: lastProf.code },
        );
        expect(next?.complectCode).toBe(lastProf.code);
        expect(resolveSupply(catalog, next!.supplyCode)?.type).toBe('proxima');
    });

    it('смена линейки сбрасывает комплект на линейку параметров', () => {
        const prof = catalog.complects.prof[0]!;
        const next = resolveRefsForBuildParams(
            catalog,
            { complectType: 'universal', supplyKind: 'internet' },
            { complectCode: prof.code },
        );
        expect(catalog.complects.byCode[next!.complectCode]?.type).toBe(
            'universal',
        );
    });

    it('X-ОД того же вида доступа сохраняется', () => {
        const custom = makeCustomSupplyCode('internet', 37);
        const next = resolveRefsForBuildParams(
            catalog,
            { complectType: 'prof', supplyKind: 'internet' },
            { supplyCode: custom },
        );
        expect(next?.supplyCode).toBe(custom);
    });

    it('вид на старте сменили, поставка прежнего вида — первая подходящая нового', () => {
        const toProxima = resolveRefsForBuildParams(
            catalog,
            { complectType: 'prof', supplyKind: 'proxima' },
            { supplyCode: 'internet_5' },
        );
        const firstProxima = filterSuppliesForCurrentKind(catalog, 'prof', 'proxima_5')[0]!;
        expect(toProxima?.supplyCode).toBe(firstProxima.code);

        const toInternet = resolveRefsForBuildParams(
            catalog,
            { complectType: 'prof', supplyKind: 'internet' },
            { supplyCode: 'proxima_5' },
        );
        const firstInternet = filterSuppliesForCurrentKind(catalog, 'prof', 'internet_5')[0]!;
        expect(toInternet?.supplyCode).toBe(firstInternet.code);
    });
});
