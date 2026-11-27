import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { defaultComposition } from '../../../composition';
import { buildGarantRow } from '../row';
import { buildMainRowWithRefs, rebuildRowWithRefs } from '../row/rebuild-row-refs.util';

/**
 * Регион клиента в составе новой и пересобранной строки, переход на другой
 * комплект с прежним наполнением.
 */
const base = catalogFromOldInit(oldInit);
const catalog = {
    ...base,
    // блок региона входит в умолчания комплекта «buh»
    complects: {
        ...base.complects,
        byCode: {
            ...base.complects.byCode,
            buh: {
                ...base.complects.byCode['buh']!,
                defaults: { ...base.complects.byCode['buh']!.defaults, infoblocks: ['rus', 'reg'] },
            },
        },
    },
};
const context = { regionCode: 'stv', withTax: false };
const refs = { complectCode: 'buh', supplyCode: 'internet_1', contractCode: 'internet' };

describe('регион клиента в составе строки', () => {
    it('новая главная строка получает регион клиента, если блок региона в умолчаниях', () => {
        const row = buildMainRowWithRefs(catalog, context, null, refs);
        expect(row?.composition?.regions).toEqual(['stv']);
        expect(row?.composition?.infoblocks).toContain('reg');
    });

    it('смена комплекта даёт состав нового комплекта с регионом клиента', () => {
        const main = buildMainRowWithRefs(catalog, context, null, refs)!;
        const rebuilt = rebuildRowWithRefs(catalog, context, main, { complectCode: 'ur' });
        const composition = rebuilt!.composition!;
        expect(composition.complectCode).toBe('ur');
        // блок региона и регионы состава идут вместе: регион клиента есть там, где блок в умолчаниях
        expect(composition.infoblocks.includes('reg')).toBe(composition.regions.length > 0);
        expect(composition.regions.every(code => code === 'stv')).toBe(true);
    });

    it('переход с keepComposition оставляет собранное наполнение, меняется только комплект', () => {
        const main = buildMainRowWithRefs(catalog, context, null, refs)!;
        const custom = { ...main, composition: { ...main.composition!, regions: ['stv', 'spb'], regionsUnweighted: ['msk'] } };
        const rebuilt = rebuildRowWithRefs(catalog, context, custom, { complectCode: 'ur' }, { keepComposition: true });
        expect(rebuilt?.refs.complectCode).toBe('ur');
        expect(rebuilt?.composition).toEqual({ ...custom.composition, complectCode: 'ur' });
    });

    it('без keepComposition прежний состав заменяется умолчаниями комплекта', () => {
        const garant = buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'k',
            setId: 'general',
            role: 'main',
            ...refs,
            composition: { ...defaultComposition(catalog.complects.byCode['buh']!), regions: ['spb'] },
        })!;
        const rebuilt = rebuildRowWithRefs(catalog, context, garant, { complectCode: 'ur' });
        expect(rebuilt?.composition?.regions).not.toContain('spb');
    });
});
