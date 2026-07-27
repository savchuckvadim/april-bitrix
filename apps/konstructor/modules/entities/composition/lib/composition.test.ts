import { describe, expect, it } from 'vitest';
import oldInit from '../../../../docs/oldinit.json';
import { catalogFromOldInit } from '../../catalog';
import type { Composition, CompositionCtx } from '../model/types';
import { defaultComposition } from '../model/types';
import { applyAction } from '../lib/apply';
import { mergeCompositions } from '../lib/merge';
import { compositionWeight, pickUniversalComplect } from '../lib/weight';

const catalog = catalogFromOldInit(oldInit);

const complectOf = (complectCode: string) => {
    const complect = catalog.complects.byCode[complectCode];
    if (!complect) throw new Error(`no complect ${complectCode}`);
    return complect;
};

const ctxFor = (complectCode: string): CompositionCtx => ({
    complect: complectOf(complectCode),
    catalog,
});

const compositionFor = (
    complectCode: string,
    overrides: Partial<Composition> = {},
): Composition => ({
    ...defaultComposition(complectOf(complectCode)),
    ...overrides,
});

describe('каталог из oldinit', () => {
    it('раскладывает справочники по кодам', () => {
        expect(catalog.complects.prof.length).toBe(12);
        expect(catalog.complects.universal.length).toBe(9);
        expect(catalog.complects.byCode['buh']?.title).toBe('Бухгалтер');
        expect(catalog.supplies.byCode['internet_1']?.coefficient).toBe(1.25);
        expect(catalog.contracts.byCode['abonYear']?.discount).toBe(0.8);
        expect(catalog.contracts.byCode['abonYear']?.durationMonths).toBe(12);
        expect(catalog.services.lt.length).toBeGreaterThan(10);
        expect(catalog.services.consalting.map(s => s.code)).toContain(
            'pkpremium',
        );
    });
});

describe('правила ЭР', () => {
    it('выключение ЭР из пакета разваливает пакет', () => {
        const composition = compositionFor('buh', {
            erPackets: ['perbuh'],
            ersInPacket: [...(catalog.infoblocks['perbuh']?.children ?? [])],
            ers: [],
        });
        const result = applyAction(
            composition,
            { kind: 'toggleEr', code: 'ertax', checked: false },
            ctxFor('buh'),
        );
        expect(result.composition.erPackets).toEqual([]);
        expect(result.composition.ers).toContain('erprov');
        expect(result.composition.ers).not.toContain('ertax');
        expect(result.autoFixes.length).toBeGreaterThan(0);
    });

    it('Офис: нельзя оставить меньше двух пакетов', () => {
        const composition = compositionFor('office', {
            erPackets: ['perbuh', 'perur'],
        });
        const result = applyAction(
            composition,
            { kind: 'toggleErPacket', code: 'perur', checked: false },
            ctxFor('office'),
        );
        expect(
            result.violations.some(
                v => v.code === 'er-packets/office-two-required',
            ),
        ).toBe(true);
        expect(result.composition.erPackets).toEqual(['perbuh', 'perur']);
    });

    it('Офис: третий пакет вытесняет самый старый', () => {
        const composition = compositionFor('office', {
            erPackets: ['perbuh', 'perur'],
        });
        const result = applyAction(
            composition,
            { kind: 'toggleErPacket', code: 'pergos', checked: true },
            ctxFor('office'),
        );
        expect(result.composition.erPackets).toEqual(['perur', 'pergos']);
    });
});

describe('правила LT', () => {
    it('обычный PROF: нельзя опуститься ниже 2 бесплатных', () => {
        const composition = compositionFor('buh', {
            lt: ['ltsut', 'ltconstructor'],
        });
        const result = applyAction(
            composition,
            { kind: 'toggleLt', code: 'ltsut', checked: false },
            ctxFor('buh'),
        );
        expect(result.violations.some(v => v.code === 'lt/two-required')).toBe(
            true,
        );
        expect(result.composition.lt).toEqual(['ltsut', 'ltconstructor']);
    });

    it('обычный PROF: сверх 2 уходит в платный пакет', () => {
        const composition = compositionFor('buh', {
            lt: ['ltsut', 'ltconstructor'],
        });
        const result = applyAction(
            composition,
            { kind: 'toggleLt', code: 'ltdisk', checked: true },
            ctxFor('buh'),
        );
        expect(result.composition.lt).toEqual(['ltsut', 'ltconstructor']);
        expect(result.composition.ltInPacket).toEqual(['ltdisk']);
    });

    it('офис: при падении ниже 5 поднимает сервис из пакета', () => {
        const composition = compositionFor('office', {
            lt: ['ltsut', 'ltconstructor', 'ltdisk', 'ltconnect', 'ltbusiness'],
            ltInPacket: ['ltdocmail'],
        });
        const result = applyAction(
            composition,
            { kind: 'toggleLt', code: 'ltsut', checked: false },
            ctxFor('office'),
        );
        expect(result.composition.lt).toHaveLength(5);
        expect(result.composition.lt).toContain('ltdocmail');
        expect(result.composition.ltInPacket).toEqual([]);
    });

    it('универсал: всё платно, вес пакета валидируется', () => {
        const composition = compositionFor('maximum', {
            mode: 'rules',
            lt: [],
            ltInPacket: ['ltsut'],
        });
        const result = applyAction(
            composition,
            { kind: 'toggleLt', code: 'ltconstructor', checked: true },
            ctxFor('maximum'),
        );
        expect(result.composition.lt).toEqual([]);
        expect(result.composition.ltInPacket).toEqual([
            'ltsut',
            'ltconstructor',
        ]);
        // вес 2 → Малый пакет, нарушения нет
        expect(
            result.violations.some(v => v.code === 'lt/invalid-packet-weight'),
        ).toBe(false);
    });

    it('вес пакета 3 — «LT собран неверно»', () => {
        const composition = compositionFor('maximum', {
            ltInPacket: ['ltsut', 'ltconstructor', 'ltdisk'],
        });
        const result = applyAction(
            composition,
            { kind: 'toggleLt', code: 'ltconnect', checked: false },
            ctxFor('maximum'),
        );
        expect(
            result.violations.some(v => v.code === 'lt/invalid-packet-weight'),
        ).toBe(true);
    });
});

describe('консалтинг', () => {
    it('sovex добавляет свои freeblocks и убирает twoconsalting', () => {
        const composition = compositionFor('buh', {
            freeBlocks: ['praim', 'twoconsalting'],
        });
        const result = applyAction(
            composition,
            { kind: 'setConsalting', code: 'sovex' },
            ctxFor('buh'),
        );
        expect(result.composition.consalting).toBe('sovex');
        expect(result.composition.freeBlocks).toContain('pbcaonsalting');
        expect(result.composition.freeBlocks).toContain('orallyconsalting');
        expect(result.composition.freeBlocks).not.toContain('twoconsalting');
    });

    it('консалтинговый freeblock нельзя включить вручную', () => {
        const composition = compositionFor('buh');
        const result = applyAction(
            composition,
            { kind: 'toggleFreeBlock', code: 'pbcaonsalting', checked: true },
            ctxFor('buh'),
        );
        expect(
            result.violations.some(v => v.code === 'freeblock/consalting-only'),
        ).toBe(true);
    });
});

describe('free-режим', () => {
    it('нарушения не блокируют изменение', () => {
        const composition = compositionFor('office', {
            mode: 'free',
            erPackets: ['perbuh', 'perur'],
        });
        const result = applyAction(
            composition,
            { kind: 'toggleErPacket', code: 'perur', checked: false },
            ctxFor('office'),
        );
        // изменение применилось, «ровно 2 пакета» не мешает
        expect(result.composition.erPackets).toEqual(['perbuh']);
    });
});

describe('вес и подбор универсала', () => {
    it('считает вес состава', () => {
        const composition = compositionFor('classic', {
            infoblocks: ['rus'],
            regions: ['msk'],
        });
        // rus 0.5 + регион 0.5 + рутовый блок 0.5
        expect(compositionWeight(composition, ctxFor('classic'))).toBe(1.5);
    });

    it('подбирает универсальный комплект по весу', () => {
        const universals = catalog.complects.universal;
        expect(pickUniversalComplect(1, universals)?.code).toBe('classic');
        expect(pickUniversalComplect(2, universals)?.code).toBe('universal');
        // перелёт между ступенями — предыдущая ступень
        expect(pickUniversalComplect(2.5, universals)?.code).toBe('universal');
        // меньше минимума — null
        expect(pickUniversalComplect(0.5, universals)).toBeNull();
    });
});

describe('мердж наполнений general-строк', () => {
    it('объединяет составы без повторов', () => {
        const first = compositionFor('buh', {
            infoblocks: ['rus', 'bbb'],
            lt: ['ltsut'],
            consalting: 'sovex',
        });
        const second = compositionFor('ur', {
            infoblocks: ['rus', 'bbu'],
            lt: ['ltsut', 'ltdisk'],
            consalting: 'pkpremium',
        });
        const merged = mergeCompositions([first, second]);
        expect(merged?.infoblocks).toEqual(['rus', 'bbb', 'bbu']);
        expect(merged?.lt).toEqual(['ltsut', 'ltdisk']);
        expect(merged?.consalting).toBe('pkpremium');
    });
});
