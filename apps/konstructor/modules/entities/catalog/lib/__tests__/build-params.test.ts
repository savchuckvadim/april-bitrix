import { describe, expect, it } from 'vitest';
import oldInit from '../__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../adapters/from-oldinit';
import { resolveRefsForBuildParams } from '../compatibility-matrix';
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
});
