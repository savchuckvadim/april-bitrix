/**
 * Каркас раздела AI обязан быть согласован сам с собой: вкладка без страницы
 * — битая ссылка в боковом меню, страница без вкладки — недостижимая глава,
 * два одинаковых slug — две вкладки, подсвеченные одновременно.
 *
 * Якоря — контракт с вкладкой «AI аналитика» отчёта KPI: она ведёт по
 * `/ai/<глава>#<id>`, поэтому каждый якорь реестра обязан стоять у заголовка
 * своей главы, а внутри главы якоря не должны повторяться.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { sectionTabPath } from '../process/_core/section/section-definition';
import { AI_ANCHOR_ID_PATTERN, AI_THEORY_ANCHORS } from './constants/anchors';
import { AI_PAGES } from './constants/pages';
import {
    AI_BASE_PATH,
    AI_SECTION,
    AI_TABS,
    aiPageFileName,
} from './constants/section';

const SECTION_DIR = __dirname;

const pageBySlug = (slug: string) => AI_PAGES.find(page => page.slug === slug);

/** Якоря заголовков главы в порядке появления. */
const headingIdsOf = (page: (typeof AI_PAGES)[number]): string[] =>
    page.blocks.flatMap(block =>
        block.kind === 'heading' && block.id ? [block.id] : [],
    );

describe('раздел AI: вкладки', () => {
    it('базовый путь — /ai, вкладок восемнадцать, первая — обзор', () => {
        expect(AI_BASE_PATH).toBe('/ai');
        expect(AI_SECTION.basePath).toBe(AI_BASE_PATH);
        expect(AI_SECTION.tabs).toBe(AI_TABS);
        expect(AI_TABS).toHaveLength(18);
        expect(AI_TABS[0]?.slug).toBe('');
    });

    it('slug каждой вкладки уникален', () => {
        const slugs = AI_TABS.map(tab => tab.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('имена файлов контента не повторяются', () => {
        const names = AI_TABS.map(tab => aiPageFileName(tab.slug));
        expect(new Set(names).size).toBe(names.length);
    });

    for (const tab of AI_TABS) {
        const name = tab.slug || 'обзор';

        it(`«${tab.label}» (${name}): есть подпись и подсказка`, () => {
            expect(tab.label.length).toBeGreaterThan(0);
            expect(tab.hint.length).toBeGreaterThan(0);
        });

        it(`«${tab.label}» (${name}): есть файл контента`, () => {
            const file = path.join(
                SECTION_DIR,
                'constants',
                'pages',
                `${aiPageFileName(tab.slug)}.ts`,
            );
            expect(existsSync(file), file).toBe(true);
        });

        it(`«${tab.label}» (${name}): есть маршрут page.tsx`, () => {
            const route = path.join(
                SECTION_DIR,
                ...tab.slug.split('/'),
                'page.tsx',
            );
            expect(existsSync(route), route).toBe(true);
        });

        it(`«${tab.label}» (${name}): глава в реестре и slug совпадает`, () => {
            const page = pageBySlug(tab.slug);
            expect(page, `нет главы для slug «${tab.slug}»`).toBeDefined();
            expect(page?.title.length).toBeGreaterThan(0);
            expect(page?.description.length).toBeGreaterThan(0);
            expect(page?.blocks.length).toBeGreaterThan(0);
        });
    }
});

describe('раздел AI: главы', () => {
    it('в реестре нет глав без вкладки', () => {
        const slugs = new Set(AI_TABS.map(tab => tab.slug));
        for (const page of AI_PAGES) {
            expect(slugs.has(page.slug), `лишняя глава «${page.slug}»`).toBe(
                true,
            );
        }
    });

    it('у каждой главы есть плашка готовности', () => {
        for (const page of AI_PAGES) {
            const hasReadiness = page.blocks.some(
                block => block.kind === 'readiness',
            );
            expect(hasReadiness, page.slug || 'обзор').toBe(true);
        }
    });
});

describe('раздел AI: якоря заголовков', () => {
    for (const page of AI_PAGES) {
        const name = page.slug || 'обзор';
        const ids = headingIdsOf(page);

        it(`«${name}»: якоря уникальны внутри главы`, () => {
            expect(new Set(ids).size, ids.join(', ')).toBe(ids.length);
        });

        it(`«${name}»: якоря — латиница, цифры и дефис`, () => {
            for (const id of ids) {
                expect(id, `якорь «${id}» в главе «${name}»`).toMatch(
                    AI_ANCHOR_ID_PATTERN,
                );
            }
        });

        it(`«${name}»: у каждого заголовка есть якорь`, () => {
            const headings = page.blocks.filter(
                block => block.kind === 'heading',
            );
            expect(ids).toHaveLength(headings.length);
        });
    }

    it('каждая глава реестра якорей существует', () => {
        const paths = new Set(
            AI_PAGES.map(page => sectionTabPath(AI_SECTION, page.slug)),
        );
        for (const chapterPath of Object.keys(AI_THEORY_ANCHORS)) {
            expect(paths.has(chapterPath), chapterPath).toBe(true);
        }
    });

    for (const [chapterPath, anchors] of Object.entries(AI_THEORY_ANCHORS)) {
        it(`${chapterPath}: каждый якорь реестра стоит у заголовка главы`, () => {
            const page = AI_PAGES.find(
                candidate =>
                    sectionTabPath(AI_SECTION, candidate.slug) === chapterPath,
            );
            expect(page, chapterPath).toBeDefined();
            const ids = new Set(page ? headingIdsOf(page) : []);
            for (const anchor of anchors) {
                expect(ids.has(anchor), `${chapterPath}#${anchor}`).toBe(true);
            }
        });
    }
});
