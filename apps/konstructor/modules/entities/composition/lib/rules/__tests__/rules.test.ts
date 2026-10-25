import { describe, expect, it } from 'vitest';
import oldInit from '../../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit, getComplectRuleFlags } from '../../../../catalog';
import type { Composition, CompositionCtx } from '../../../model/types';
import { defaultComposition } from '../../../model/types';
import { applyAction, validateComposition } from '../../apply';
import { pickUniversalComplect } from '../../weight';
import { COMPOSITION_RULES } from '../registry';

/**
 * Этап 5: правила по флагам комплекта (complect-rule-flags.ts) и добивка
 * против легаси complect-utils.js — free-блоки, noChanged, isChanging,
 * регионы, ЧекДок ×2, Эксперт PRO, подбор универсала по всей линейке.
 */
const catalog = catalogFromOldInit(oldInit);
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
const compositionFor = (code: string, overrides: Partial<Composition> = {}): Composition => ({
    ...defaultComposition(complectOf(code)),
    ...overrides,
});
const codes = (violations: { code: string }[]) => violations.map(v => v.code);

describe('реестр правил', () => {
    it('каждое действие обрабатывает ровно одно правило, валидаторы без действий есть', () => {
        const kinds = [
            'toggleInfoblock', 'toggleEr', 'toggleErPacket', 'toggleLt', 'toggleFreeBlock',
            'setConsalting', 'toggleStar', 'setAcademy', 'toggleRegion',
            'addLtOtherPacket', 'removeLtOtherPacket', 'toggleLtOtherService', 'renameLtOtherPacket',
        ] as const;
        for (const kind of kinds) {
            expect(COMPOSITION_RULES.filter(rule => rule.actions.includes(kind))).toHaveLength(1);
        }
        expect(COMPOSITION_RULES.some(rule => rule.actions.length === 0 && rule.validate)).toBe(true);
    });

    it('флаги комплектов: дефолт PROF — ровно 2 LT; переопределения по коду', () => {
        expect(getComplectRuleFlags(complectOf('buh'))).toEqual({ exactFreeLt: 2 });
        expect(getComplectRuleFlags(complectOf('office'))).toMatchObject({ minFreeLt: 5, erPacketsRequired: 2 });
        expect(getComplectRuleFlags(complectOf('exzak'))).toMatchObject({ withStar: true, minFreeLt: 5 });
        expect(getComplectRuleFlags(complectOf('classic'))).toEqual({});
    });
});

describe('free-блоки', () => {
    it('online2 не снять, пока в составе арбитражная практика (PROF)', () => {
        const composition = compositionFor('ur', { infoblocks: ['rus', 'la'], freeBlocks: ['online2'] });
        const result = applyAction(
            composition,
            { kind: 'toggleFreeBlock', code: 'online2', checked: false },
            ctxFor('ur'),
        );
        expect(codes(result.violations)).toContain('freeblock/dependency-locked');
        expect(result.composition.freeBlocks).toContain('online2');
    });

    it('без зависимости снимается; в универсале — свободно', () => {
        const prof = applyAction(
            compositionFor('ur', { infoblocks: ['rus'], freeBlocks: ['online2'] }),
            { kind: 'toggleFreeBlock', code: 'online2', checked: false },
            ctxFor('ur'),
        );
        expect(prof.composition.freeBlocks).not.toContain('online2');
        const universal = applyAction(
            compositionFor('classic', { infoblocks: ['rus', 'la'], freeBlocks: ['online2'] }),
            { kind: 'toggleFreeBlock', code: 'online2', checked: false },
            ctxFor('classic'),
        );
        expect(universal.composition.freeBlocks).not.toContain('online2');
    });

    it('включение арбитражной практики добавляет online2, снятие — убирает', () => {
        const on = applyAction(
            compositionFor('ur', { infoblocks: ['rus'] }),
            { kind: 'toggleInfoblock', code: 'la', checked: true },
            ctxFor('ur'),
        );
        expect(on.composition.freeBlocks).toContain('online2');
        const off = applyAction(
            on.composition,
            { kind: 'toggleInfoblock', code: 'la', checked: false },
            ctxFor('ur'),
        );
        expect(off.composition.freeBlocks).not.toContain('online2');
    });
});

describe('noChanged и неизменяемый комплект', () => {
    it('Эксперт в закупках: «Законодательство России» не снимается', () => {
        const result = applyAction(
            compositionFor('exzak', { infoblocks: ['rus', 'reg', 'fac'] }),
            { kind: 'toggleInfoblock', code: 'rus', checked: false },
            ctxFor('exzak'),
        );
        expect(codes(result.violations)).toContain('infoblock/no-changed');
        expect(result.composition.infoblocks).toContain('rus');
    });

    it('isChanging=false → предупреждение, но изменение проходит', () => {
        const complect = { ...complectOf('buh'), isChanging: false };
        const ctx: CompositionCtx = { complect, catalog };
        const composition = { ...defaultComposition(complect), infoblocks: ['rus'] };
        const result = applyAction(
            composition,
            { kind: 'toggleInfoblock', code: 'ot', checked: true },
            ctx,
        );
        expect(result.composition.infoblocks).toContain('ot');
        const warning = result.violations.find(v => v.code === 'complect/not-changing');
        expect(warning?.level).toBe('warning');
        // дефолтный состав предупреждения не даёт
        expect(codes(validateComposition(defaultComposition(complect), ctx))).not.toContain(
            'complect/not-changing',
        );
    });
});

describe('регионы', () => {
    it('тумблер рутового блока тянет текущий регион сборки', () => {
        const on = applyAction(
            compositionFor('classic', { infoblocks: ['rus'] }),
            { kind: 'toggleInfoblock', code: 'reg', checked: true },
            ctxFor('classic', 'stv'),
        );
        expect(on.composition.regions).toEqual(['stv']);
        const off = applyAction(
            on.composition,
            { kind: 'toggleInfoblock', code: 'reg', checked: false },
            ctxFor('classic', 'stv'),
        );
        expect(off.composition.regions).toEqual([]);
    });

    it('добавление региона включает рутовый блок; снятие региона блок не трогает', () => {
        const on = applyAction(
            compositionFor('classic', { infoblocks: ['rus'] }),
            { kind: 'toggleRegion', code: 'stv', checked: true },
            ctxFor('classic'),
        );
        expect(on.composition.infoblocks).toContain('reg');
        const off = applyAction(
            on.composition,
            { kind: 'toggleRegion', code: 'stv', checked: false },
            ctxFor('classic'),
        );
        expect(off.composition.regions).toEqual([]);
        expect(off.composition.infoblocks).toContain('reg');
    });
});

describe('LT по флагам', () => {
    it('ЧекДок (вес 2) занимает оба бесплатных слота обычного PROF', () => {
        const result = applyAction(
            compositionFor('buh', { lt: ['ltcheckdocprem'] }),
            { kind: 'toggleLt', code: 'ltsut', checked: true },
            ctxFor('buh'),
        );
        expect(result.composition.lt).toEqual(['ltcheckdocprem']);
        expect(result.composition.ltInPacket).toEqual(['ltsut']);
    });

    it('Эксперт PRO: при опустошении остаётся Гарант Диск, снятие последнего не блокируется', () => {
        const result = applyAction(
            compositionFor('expert', { lt: ['ltsut'] }),
            { kind: 'toggleLt', code: 'ltsut', checked: false },
            ctxFor('expert'),
        );
        expect(result.composition.lt).toEqual(['ltdisk']);
        expect(codes(result.violations)).not.toContain('lt/two-required');
    });

    it('Эксперт в закупках: минимум 5 — ниже нельзя без платного пакета', () => {
        const result = applyAction(
            compositionFor('exzak', {
                lt: ['ltsut', 'ltconstructor', 'ltdisk', 'ltconnect', 'ltbusiness'],
            }),
            { kind: 'toggleLt', code: 'ltsut', checked: false },
            ctxFor('exzak'),
        );
        expect(codes(result.violations)).toContain('lt/min-five-required');
        expect(result.composition.lt).toHaveLength(5);
    });
});

describe('СТАР по флагу', () => {
    it('withStar: тумблер заблокирован; у остальных переключается', () => {
        const locked = applyAction(
            compositionFor('exzak'),
            { kind: 'toggleStar', checked: true },
            ctxFor('exzak'),
        );
        expect(codes(locked.violations)).toContain('star/locked-for-exzak');
        const free = applyAction(
            compositionFor('buh'),
            { kind: 'toggleStar', checked: true },
            ctxFor('buh'),
        );
        expect(free.composition.star).toBe(true);
    });
});

describe('универсал: подбор по весу на всей линейке', () => {
    it('каждый универсальный комплект находится по своему весу; между ступенями — предыдущая', () => {
        const universals = [...catalog.complects.universal].sort((a, b) => a.weight - b.weight);
        expect(universals.length).toBeGreaterThan(3);
        for (const complect of universals) {
            expect(pickUniversalComplect(complect.weight, universals)?.code).toBe(complect.code);
        }
        for (let i = 0; i < universals.length - 1; i++) {
            const between = (universals[i]!.weight + universals[i + 1]!.weight) / 2;
            expect(pickUniversalComplect(between, universals)?.code).toBe(universals[i]!.code);
        }
        expect(pickUniversalComplect(universals[0]!.weight - 0.5, universals)).toBeNull();
        expect(pickUniversalComplect(universals.at(-1)!.weight + 10, universals)?.code).toBe(
            universals.at(-1)!.code,
        );
    });
});
