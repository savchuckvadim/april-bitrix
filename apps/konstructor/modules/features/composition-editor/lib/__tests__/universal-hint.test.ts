import { describe, expect, it } from 'vitest';
import { defaultComposition, type Composition, type CompositionCtx } from '@/modules/entities/composition';
import { describeUniversalHint, formatUniversalHint, universalSwitchTarget } from '../universal-hint.util';
import { regionsCatalog } from '../__fixtures__/regions-catalog';

/**
 * Универсальная линейка фикстуры: Классик 1, Классик+ 1.5, Универсал 2,
 * Универсал+ 3. Блоки rus и pr весят 0.5, регион Москвы 1, остальные 0.5.
 */
const ctxFor = (code: string): CompositionCtx => ({
    complect: regionsCatalog.complects.byCode[code]!,
    catalog: regionsCatalog,
    regionCode: 'stv',
});
const compositionOf = (code: string, patch: Partial<Composition>): Composition => ({
    ...defaultComposition(regionsCatalog.complects.byCode[code]!),
    ...patch,
});

describe('подсказка Универсала при выходе веса за комплект', () => {
    it('вес сошёлся с комплектом — подсказки нет', () => {
        const composition = compositionOf('classic', { infoblocks: ['rus', 'reg'], regions: ['stv'] });
        expect(describeUniversalHint(composition, ctxFor('classic'))).toBeNull();
    });

    it('профессиональная линейка подсказки не даёт', () => {
        const composition = compositionOf('buh', { regions: ['msk', 'stv', 'spb'] });
        expect(describeUniversalHint(composition, ctxFor('buh'))).toBeNull();
    });

    it('вес вырос до следующего комплекта — подсказка называет его и даёт переход', () => {
        // rus 0.5 + Москва 1 + Ставрополь 0.5 = 2 → Универсал
        const composition = compositionOf('classic', { infoblocks: ['rus', 'reg'], regions: ['msk', 'stv'] });
        const hint = describeUniversalHint(composition, ctxFor('classic'));
        expect(hint).toMatchObject({ weight: 2, expected: 1 });
        const target = universalSwitchTarget(hint!);
        expect(target?.code).toBe('universal');
        expect(formatUniversalHint(hint!)).toContain('Подходит «Универсал» (2)');
    });

    it('вес между комплектами — ближайший меньший', () => {
        // rus 0.5 + pr 0.5 + Москва 1 + Ставрополь 0.5 = 2.5 → Универсал (2)
        const composition = compositionOf('classic', {
            infoblocks: ['rus', 'pr', 'reg'],
            regions: ['msk', 'stv'],
        });
        const hint = describeUniversalHint(composition, ctxFor('classic'));
        expect(hint?.weight).toBe(2.5);
        expect(universalSwitchTarget(hint!)?.code).toBe('universal');
    });

    it('вес не дотягивает до следующего комплекта — перехода нет, текст объясняет', () => {
        const composition = compositionOf('universal', {
            infoblocks: ['rus', 'pr', 'reg'],
            regions: ['msk', 'stv'],
        });
        const hint = describeUniversalHint(composition, ctxFor('universal'));
        expect(hint?.target?.code).toBe('universal');
        expect(universalSwitchTarget(hint!)).toBeNull();
        expect(formatUniversalHint(hint!)).toContain('до веса следующего комплекта');
    });

    it('вес меньше самого лёгкого комплекта — цели нет', () => {
        const composition = compositionOf('classic', { infoblocks: ['rus'], regions: [], regionsUnweighted: [] });
        const hint = describeUniversalHint(composition, ctxFor('classic'));
        expect(hint?.target).toBeNull();
        expect(formatUniversalHint(hint!)).toContain('меньше самого лёгкого');
    });
});
