import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { STAR_SUBSERVICES, catalogFromOldInit } from '../../../catalog';
import { defaultComposition } from '../../../composition';
import { buildComplectGroups } from '../build-complect-groups';

/**
 * Документ: LT из наполнения и пакетов LT-other без повторов, Искра с
 * подписью по числу вхождений (легаси handleLtByLtOther), СТАР с подсервисами.
 */
const catalog = catalogFromOldInit(oldInit);
const buh = catalog.complects.byCode['buh']!;

describe('группы документа: LT-other, Искра, СТАР', () => {
    it('сервисы пакетов LT-other попадают в Legal Tech один раз, Искра получает подпись', () => {
        const groups = buildComplectGroups(catalog, {
            ...defaultComposition(buh),
            lt: ['iscra', 'ltsut'],
            ltOther: [
                { id: 'a', services: ['iscra', 'ltsut', 'ltdisk'], alternativeName: null },
                { id: 'b', services: ['iscra_special'], alternativeName: null },
            ],
        });
        const lt = groups.find(group => group.type === 'lt')!;
        const byCode = (code: string) => lt.value.filter(item => item.code === code);
        expect(byCode('ltsut')).toHaveLength(1);
        expect(byCode('ltdisk')).toHaveLength(1);
        expect(byCode('iscra')[0]!.subtitle).toBe('Искра (40 запросов в день)');
        expect(byCode('iscra_special')[0]!.subtitle).toBeNull();
        expect(byCode('ltsut')[0]!.subtitle).toBeNull();
    });

    it('СТАР: пакет и его подсервисы без веса', () => {
        const groups = buildComplectGroups(catalog, { ...defaultComposition(buh), star: true });
        const star = groups.find(group => group.type === 'star')!;
        expect(star.value).toHaveLength(1 + STAR_SUBSERVICES.length);
        expect(star.value[1]).toMatchObject({ code: 'stcalc', weight: 0, checked: true });
        expect(star.value.at(-1)?.code).toBe('ststandart');
    });
});
