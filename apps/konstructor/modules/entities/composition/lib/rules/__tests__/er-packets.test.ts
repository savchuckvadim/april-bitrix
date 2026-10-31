import { describe, expect, it } from 'vitest';
import oldInit from '../../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../../catalog';
import type { Composition, CompositionCtx } from '../../../model/types';
import { defaultComposition, normalizeComposition } from '../../../model/types';
import { applyAction, validateComposition } from '../../apply';
import { compositionWeight } from '../../weight';

/**
 * Энциклопедии решений (легаси fillingEr / fillingPketsEr): вес отдельной ЭР
 * 0.5, пакета 1, ЭР внутри пакета 0; обычный комплект — один пакет, Офис —
 * ровно два; снятие ЭР из пакета разваливает его (кроме Офиса).
 */
const catalog = catalogFromOldInit(oldInit);
const ctxFor = (code: string, regionCode?: string): CompositionCtx => ({
    complect: catalog.complects.byCode[code]!,
    catalog,
    regionCode,
});
const compositionFor = (code: string, overrides: Partial<Composition> = {}): Composition => ({
    ...defaultComposition(catalog.complects.byCode[code]!),
    ...overrides,
});
const bare = (code: string, overrides: Partial<Composition> = {}): Composition =>
    compositionFor(code, { infoblocks: [], ers: [], erPackets: [], ersInPacket: [], ...overrides });
const childrenOf = (packet: string) => catalog.infoblocks[packet]!.children;
const codes = (violations: { code: string }[]) => violations.map(item => item.code);

describe('вес ЭР', () => {
    it('отдельная ЭР 0.5, пакет 1, ЭР в пакете 0', () => {
        expect(compositionWeight(bare('buh', { ers: ['erprov', 'ertax'] }), ctxFor('buh'))).toBe(1);
        expect(
            compositionWeight(
                bare('buh', { erPackets: ['perbuh'], ersInPacket: childrenOf('perbuh') }),
                ctxFor('buh'),
            ),
        ).toBe(1);
    });

    it('пакет и отдельные ЭР вместе: 1 + 0.5 за каждую', () => {
        const result = applyAction(
            bare('glavbuh', { erPackets: ['perbuh'], ersInPacket: childrenOf('perbuh') }),
            { kind: 'toggleEr', code: 'ercorp', checked: true },
            ctxFor('glavbuh'),
        );
        expect(result.composition.ers).toEqual(['ercorp']);
        expect(compositionWeight(result.composition, ctxFor('glavbuh'))).toBe(1.5);
    });

    it('ЭР, покрытая пакетом, отдельно не считается', () => {
        const result = applyAction(
            bare('buh', { ers: ['ertax', 'ercorp'] }),
            { kind: 'toggleErPacket', code: 'perbuh', checked: true },
            ctxFor('buh'),
        );
        expect(result.composition.ers).toEqual(['ercorp']);
        expect(result.composition.ersInPacket).toEqual(childrenOf('perbuh'));
        expect(compositionWeight(result.composition, ctxFor('buh'))).toBe(1.5);
    });

    it('Предприятие: все ЭР без пакета — вес 0.5 × 7', () => {
        const ers = ['erprov', 'erxs', 'erzakupki', 'erwroks', 'ertax', 'ercontracts', 'ercorp'];
        expect(compositionWeight(bare('company', { ers }), ctxFor('company'))).toBe(3.5);
    });

    it('Офис: два пакета весят 2, общие ЭР не задваиваются', () => {
        const composition = applyAction(
            bare('office', { erPackets: ['perbuh'], ersInPacket: childrenOf('perbuh') }),
            { kind: 'toggleErPacket', code: 'perur', checked: true },
            ctxFor('office'),
        ).composition;
        expect(composition.erPackets).toEqual(['perbuh', 'perur']);
        expect(new Set(composition.ersInPacket).size).toBe(composition.ersInPacket.length);
        expect(composition.ersInPacket.length).toBeLessThan(10);
        expect(compositionWeight(composition, ctxFor('office'))).toBe(2);
    });
});

describe('пакеты обычного комплекта', () => {
    it('новый пакет заменяет прежний', () => {
        const result = applyAction(
            bare('buh', { erPackets: ['perbuh'], ersInPacket: childrenOf('perbuh') }),
            { kind: 'toggleErPacket', code: 'perur', checked: true },
            ctxFor('buh'),
        );
        expect(result.composition.erPackets).toEqual(['perur']);
        expect(result.composition.ersInPacket).toEqual(childrenOf('perur'));
        expect(result.autoFixes).toHaveLength(1);
    });

    it('снятие пакета снимает его ЭР', () => {
        const result = applyAction(
            bare('buh', { erPackets: ['perbuh'], ersInPacket: childrenOf('perbuh'), ers: ['ercorp'] }),
            { kind: 'toggleErPacket', code: 'perbuh', checked: false },
            ctxFor('buh'),
        );
        expect(result.composition.erPackets).toEqual([]);
        expect(result.composition.ersInPacket).toEqual([]);
        expect(result.composition.ers).toEqual(['ercorp']);
    });

    it('снятие ЭР разваливает пакет: остальные — отдельно по 0.5', () => {
        const result = applyAction(
            bare('buh', { erPackets: ['perbuh'], ersInPacket: childrenOf('perbuh') }),
            { kind: 'toggleEr', code: 'ertax', checked: false },
            ctxFor('buh'),
        );
        expect(result.composition.erPackets).toEqual([]);
        expect(result.composition.ersInPacket).toEqual([]);
        expect(result.composition.ers).toHaveLength(4);
        expect(result.composition.ers).not.toContain('ertax');
        expect(compositionWeight(result.composition, ctxFor('buh'))).toBe(2);
    });
});

describe('Офис: ровно два пакета', () => {
    const office = () => bare('office', {
        erPackets: ['perbuh', 'perur'],
        ersInPacket: [...new Set([...childrenOf('perbuh'), ...childrenOf('perur')])],
    });

    it('снятие пакета подставляет оставшийся', () => {
        const result = applyAction(
            office(),
            { kind: 'toggleErPacket', code: 'perur', checked: false },
            ctxFor('office'),
        );
        expect(result.composition.erPackets).toEqual(['perbuh', 'pergos']);
        expect(result.composition.ersInPacket).toEqual(
            [...new Set([...childrenOf('perbuh'), ...childrenOf('pergos')])],
        );
        expect(result.autoFixes).toHaveLength(1);
    });

    it('третий пакет вытесняет самый старый', () => {
        const result = applyAction(
            office(),
            { kind: 'toggleErPacket', code: 'pergos', checked: true },
            ctxFor('office'),
        );
        expect(result.composition.erPackets).toEqual(['perur', 'pergos']);
    });

    it('ЭР из пакета не снимается, пакет не разваливается', () => {
        const before = office();
        const result = applyAction(
            before,
            { kind: 'toggleEr', code: 'ertax', checked: false },
            ctxFor('office'),
        );
        expect(codes(result.violations)).toContain('er-packets/office-er-in-packet');
        expect(result.composition).toEqual(before);
    });

    it('отдельную ЭР вне пакетов добавить и снять можно', () => {
        const added = applyAction(
            office(),
            { kind: 'toggleEr', code: 'ergos', checked: true },
            ctxFor('office'),
        );
        expect(added.composition.ers).toEqual(['ergos']);
        const removed = applyAction(
            added.composition,
            { kind: 'toggleEr', code: 'ergos', checked: false },
            ctxFor('office'),
        );
        expect(removed.composition.ers).toEqual([]);
    });
});

describe('без правил', () => {
    it('лимитов нет, ersInPacket остаётся производным', () => {
        const result = applyAction(
            bare('buh', { mode: 'free', erPackets: ['perbuh'], ersInPacket: childrenOf('perbuh') }),
            { kind: 'toggleErPacket', code: 'perur', checked: true },
            ctxFor('buh'),
        );
        expect(result.composition.erPackets).toEqual(['perbuh', 'perur']);
        expect(result.composition.ersInPacket).toEqual(
            [...new Set([...childrenOf('perbuh'), ...childrenOf('perur')])],
        );
        expect(codes(result.violations)).toContain('er-packets/too-many');
    });

    it('снятие ЭР разваливает пакет и в Офисе, с подсветкой', () => {
        const result = applyAction(
            bare('office', {
                mode: 'free',
                erPackets: ['perbuh', 'perur'],
                ersInPacket: [...new Set([...childrenOf('perbuh'), ...childrenOf('perur')])],
            }),
            { kind: 'toggleEr', code: 'ertax', checked: false },
            ctxFor('office'),
        );
        expect(result.composition.erPackets).toEqual(['perur']);
        expect(codes(result.violations)).toContain('er-packets/office-count');
    });

    it('подсветка числа пакетов — и у восстановленного состава', () => {
        const violations = validateComposition(
            compositionFor('buh', { erPackets: ['perbuh', 'perur'] }),
            ctxFor('buh'),
        );
        expect(codes(violations)).toContain('er-packets/too-many');
    });
});

describe('слепок v2 с прежними умолчаниями init', () => {
    it('пакет убирается из отдельных ЭР, состав без повторов', () => {
        const stale = compositionFor('buh', {
            ers: ['perbuh', 'ercorp'],
            erPackets: ['perbuh'],
            ersInPacket: ['ertax', 'ertax'],
        });
        const normalized = normalizeComposition(stale);
        expect(normalized.ers).toEqual(['ercorp']);
        expect(normalized.ersInPacket).toEqual(['ertax']);
    });
});

describe('вес регионов', () => {
    const regional = (regions: string[]) => bare('buh', { infoblocks: ['reg'], regions });

    it('рутовый блок без регионов — 0.5', () => {
        expect(compositionWeight(regional([]), ctxFor('buh', 'rstv'))).toBe(0.5);
    });

    it('текущий регион в составе не считается дважды', () => {
        expect(compositionWeight(regional(['rstv']), ctxFor('buh', 'rstv'))).toBe(0.5);
    });

    it('чужой регион — плюс 0.5 к рутовому', () => {
        expect(compositionWeight(regional(['msk']), ctxFor('buh', 'rstv'))).toBe(1);
    });

    it('тумблер рутового блока не меняет вес сверх него', () => {
        const off = applyAction(
            regional([]),
            { kind: 'toggleInfoblock', code: 'reg', checked: false },
            ctxFor('buh', 'rstv'),
        );
        const on = applyAction(
            off.composition,
            { kind: 'toggleInfoblock', code: 'reg', checked: true },
            ctxFor('buh', 'rstv'),
        );
        expect(compositionWeight(on.composition, ctxFor('buh', 'rstv'))).toBe(0.5);
    });
});
