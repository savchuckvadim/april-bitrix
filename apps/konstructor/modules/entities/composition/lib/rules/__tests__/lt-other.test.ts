import { describe, expect, it } from 'vitest';
import oldInit from '../../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../../catalog';
import type { Composition, CompositionCtx, LtOtherPacket } from '../../../model/types';
import { defaultComposition, normalizeComposition } from '../../../model/types';
import { applyAction } from '../../apply';
import { mergeCompositions } from '../../merge';
import { allLtServiceCodes, ltServiceCount, ltServiceSubtitle } from '../../lt-count';
import { ltOtherPacketTitle, resolveLtOtherPackage } from '../lt-other';

/**
 * Этап 9: пакеты LT-other в наполнении (легаси modules/legal-tech-other) и
 * счётчик Искры (legacy computeIscraCounts).
 */
const catalog = catalogFromOldInit(oldInit);
const buh = catalog.complects.byCode['buh']!;
const ctx = (serviceDepartment = false): CompositionCtx => ({ complect: buh, catalog, serviceDepartment });
const base = (overrides: Partial<Composition> = {}): Composition => ({
    ...defaultComposition(buh),
    ...overrides,
});
const codes = (violations: { code: string }[]) => violations.map(item => item.code);
// нарушения самого правила: вес состава против эталона (weight/mismatch) здесь не при чём
const ltOtherCodes = (violations: { code: string }[]) =>
    codes(violations).filter(code => code.startsWith('lt-other/'));
const packetOf = (id: string, services: string[], alternativeName: string | null = null): LtOtherPacket => ({
    id,
    services,
    alternativeName,
});

describe('пакеты LT-other', () => {
    it('добавить → отметить сервисы → пакет по весу 2; неполный вес подсвечивается, не блокирует', () => {
        let result = applyAction(base(), { kind: 'addLtOtherPacket', id: 'p1' }, ctx());
        expect(result.composition.ltOther).toEqual([packetOf('p1', [])]);
        expect(codes(result.violations)).toContain('lt-other/empty:p1');

        result = applyAction(
            result.composition,
            { kind: 'toggleLtOtherService', id: 'p1', code: 'ltsut', checked: true },
            ctx(),
        );
        expect(result.composition.ltOther[0]!.services).toEqual(['ltsut']);
        expect(codes(result.violations)).toContain('lt-other/invalid-packet-weight:p1');

        result = applyAction(
            result.composition,
            { kind: 'toggleLtOtherService', id: 'p1', code: 'ltdisk', checked: true },
            ctx(),
        );
        expect(ltOtherCodes(result.violations)).toEqual([]);
        expect(resolveLtOtherPackage(catalog, result.composition.ltOther[0]!)?.code).toBe('ltpackSmall');
    });

    it('средний пакет (вес 4): сервисному отделу — да, продажам — только без правил', () => {
        const medium = packetOf('m', ['ltsut', 'ltdisk', 'ltconnect', 'ltbusiness']);
        expect(resolveLtOtherPackage(catalog, medium)).toBeNull();
        expect(resolveLtOtherPackage(catalog, medium, { serviceDepartment: true })?.weight).toBe(4);
        expect(resolveLtOtherPackage(catalog, medium, { mode: 'free' })?.weight).toBe(4);

        const sales = applyAction(
            base({ ltOther: [medium] }),
            { kind: 'renameLtOtherPacket', id: 'm', name: '  Свой пакет ' },
            ctx(),
        );
        expect(sales.composition.ltOther[0]!.alternativeName).toBe('Свой пакет');
        expect(sales.violations.map(item => item.message).join()).toContain('только сервисному отделу');
        expect(ltOtherPacketTitle(sales.composition.ltOther[0]!, null)).toBe('Свой пакет');

        const service = applyAction(base({ ltOther: [medium] }), { kind: 'renameLtOtherPacket', id: 'm', name: '' }, ctx(true));
        expect(service.composition.ltOther[0]!.alternativeName).toBeNull();
        expect(ltOtherCodes(service.violations)).toEqual([]);

        const free = applyAction(
            base({ mode: 'free', ltOther: [medium] }),
            { kind: 'toggleLtOtherService', id: 'm', code: 'ltsut', checked: true },
            ctx(),
        );
        expect(ltOtherCodes(free.violations)).toEqual([]);
    });

    it('удаление пакета; мердж наполнений не дублирует пакеты по id', () => {
        const removed = applyAction(
            base({ ltOther: [packetOf('a', ['ltsut']), packetOf('b', ['ltdisk'])] }),
            { kind: 'removeLtOtherPacket', id: 'a' },
            ctx(),
        );
        expect(removed.composition.ltOther.map(packet => packet.id)).toEqual(['b']);

        const merged = mergeCompositions([
            base({ ltOther: [packetOf('a', ['ltsut', 'ltdisk'])] }),
            base({ ltOther: [packetOf('a', ['ltsut', 'ltdisk']), packetOf('c', ['ltconnect'])] }),
        ]);
        expect(merged?.ltOther.map(packet => packet.id)).toEqual(['a', 'c']);
    });

    it('состав старого слепка без ltOther получает пустой список', () => {
        const legacy = { ...base(), ltOther: undefined } as unknown as Composition;
        expect(normalizeComposition(legacy).ltOther).toEqual([]);
        expect(normalizeComposition(base())).toEqual(base());
    });
});

describe('Искра: вхождения и подпись', () => {
    it('считает наполнение и каждый пакет LT-other; подпись — от двух вхождений', () => {
        const composition = base({
            lt: ['iscra'],
            ltOther: [packetOf('a', ['iscra', 'ltsut']), packetOf('b', ['iscra_special'])],
        });
        expect(ltServiceCount(composition, 'iscra')).toBe(2);
        expect(ltServiceCount(composition, 'iscra_special')).toBe(1);
        expect(ltServiceCount(composition, 'ltdisk')).toBe(0);
        expect(allLtServiceCodes(composition)).toEqual(['iscra', 'ltsut', 'iscra_special']);

        expect(ltServiceSubtitle({ code: 'iscra', name: 'Искра' }, 2)).toBe('Искра (40 запросов в день)');
        expect(ltServiceSubtitle({ code: 'iscra_special', name: 'Искра Специальная версия' }, 3)).toBe(
            'Искра Специальная версия (60 запросов в день)',
        );
        expect(ltServiceSubtitle({ code: 'iscra', name: 'Искра' }, 1)).toBeNull();
        expect(ltServiceSubtitle({ code: 'ltsut', name: 'Сутяжник' }, 3)).toBeNull();
    });
});
