/**
 * Реестр скринов — задание владельцу на съёмку, и оно обязано совпадать с
 * тем, что стоит в главах. Расхождение тихое и дорогое: подпись под рамкой
 * берётся из реестра по идентификатору, поэтому опечатка в id превращает
 * подпись в сам id, а забытая глава в поле `pages` — в скрин, который никто
 * не снимет, потому что в задании его ждут в другом месте.
 */

import { describe, expect, it } from 'vitest';
import type {
    TheoryPageContent,
    TheoryScreen,
} from '../process/_core/theory-types';
import type { AiScreen } from './constants/screens';
import {
    AI_SCREENS_GENERAL,
    AI_SCREENS_PRODUCT,
    AI_SCREENS_SETUP,
    AI_SCREENS_THEORY,
} from './constants/screens';
import { AI_PAGES } from './constants/pages';

const REGISTRY: readonly AiScreen[] = [
    ...AI_SCREENS_THEORY,
    ...AI_SCREENS_GENERAL,
    ...AI_SCREENS_PRODUCT,
    ...AI_SCREENS_SETUP,
];

/** Подпись рамки → идентификатор скрина: блок хранит только подпись. */
const idByLabel = new Map(REGISTRY.map(screen => [screen.what, screen.id]));

/** Рамки стоят и отдельными блоками, и иллюстрациями шагов инструкции. */
const screensOf = (page: TheoryPageContent): TheoryScreen[] =>
    page.blocks.flatMap(block => {
        if (block.kind === 'screen') return [block];
        if (block.kind === 'steps') {
            return block.items.flatMap(item =>
                item.screen ? [item.screen] : [],
            );
        }
        return [];
    });

/** Где реально стоят рамки: идентификатор → slug глав. */
const usage = new Map<string, Set<string>>();
const unresolved: string[] = [];

for (const page of AI_PAGES) {
    for (const screen of screensOf(page)) {
        const id = idByLabel.get(screen.label);
        if (!id) {
            unresolved.push(`${page.slug || 'обзор'}: «${screen.label}»`);
            continue;
        }
        const pages = usage.get(id) ?? new Set<string>();
        pages.add(page.slug);
        usage.set(id, pages);
    }
}

const sorted = (values: Iterable<string>) => [...values].sort();

describe('реестр скринов раздела AI', () => {
    it('идентификаторы не повторяются', () => {
        const ids = REGISTRY.map(screen => screen.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('у каждой записи есть место съёмки, что снять и где стоит', () => {
        for (const screen of REGISTRY) {
            expect(screen.where.length, screen.id).toBeGreaterThan(0);
            expect(screen.what.length, screen.id).toBeGreaterThan(0);
            expect(screen.pages.length, screen.id).toBeGreaterThan(0);
        }
    });

    it('каждая рамка в главах нашлась в реестре', () => {
        expect(unresolved).toEqual([]);
    });

    it('каждый зарегистрированный скрин где-то стоит', () => {
        const orphans = REGISTRY.filter(screen => !usage.has(screen.id)).map(
            screen => screen.id,
        );
        expect(orphans).toEqual([]);
    });

    for (const screen of REGISTRY) {
        it(`«${screen.id}»: список глав совпадает с реальными рамками`, () => {
            expect(sorted(screen.pages)).toEqual(
                sorted(usage.get(screen.id) ?? []),
            );
        });
    }
});
