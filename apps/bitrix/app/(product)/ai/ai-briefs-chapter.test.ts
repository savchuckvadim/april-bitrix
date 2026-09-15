/**
 * Глава «Брифы» и переезд калибровки.
 *
 * Глава — единственное место, где обе формы показываются клиенту, поэтому
 * молча потерять одну из них нельзя. Переезд проверяем с той же строгостью:
 * старый адрес обязан отвечать редиректом, печатный бриф — остаться живым, а
 * меню «Как мы работаем» — не вести на страницу, которой там больше нет.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HOW_NAV_ITEMS } from '../how-we-work/constants/nav';
import {
    AI_CALIBRATION_PATH,
    AI_SECTION_PATH,
    CALIBRATION_BRIEF_FILE,
    CALIBRATION_BRIEF_PATH,
} from '../how-we-work/constants/calibration-contacts';
import { AI_PAGE } from '../how-we-work/constants/pages/ai';
import type { TheoryBlock } from '../process/_core/theory-types';
import { AI_BRIEFS } from './constants/pages/briefs';

const SECTION_DIR = __dirname;
const PRODUCT_DIR = path.resolve(SECTION_DIR, '..');

const blocksOf = <K extends TheoryBlock['kind']>(kind: K) =>
    AI_BRIEFS.blocks.filter(
        (block): block is Extract<TheoryBlock, { kind: K }> =>
            block.kind === kind,
    );

describe('глава «Брифы»', () => {
    it('стоит на своём slug и имеет заголовок с подводкой', () => {
        expect(AI_BRIEFS.slug).toBe('briefs');
        expect(AI_BRIEFS.title.length).toBeGreaterThan(0);
        expect(AI_BRIEFS.description.length).toBeGreaterThan(0);
    });

    it('текста в главе от двенадцати блоков — это не заглушка', () => {
        expect(AI_BRIEFS.blocks.length).toBeGreaterThanOrEqual(12);
    });

    it('показывает обе формы: общий бриф и оценку звонка', () => {
        expect(
            blocksOf('questionnaire').map(block => block.questionnaireId),
        ).toEqual(['calibration', 'call-review']);
    });

    it('ведёт на печатную версию брифа и на файл для скачивания', () => {
        const links = blocksOf('links').flatMap(block => block.items);
        const print = links.find(link => link.href === CALIBRATION_BRIEF_PATH);
        const file = links.find(
            link => link.href === CALIBRATION_BRIEF_FILE.href,
        );
        expect(print, 'нет ссылки на печатную версию').toBeDefined();
        expect(file?.download, 'файл должен скачиваться, а не открываться').toBe(
            true,
        );
    });

    it('честно говорит, что загрузки файла нет', () => {
        const dangers = blocksOf('danger').map(block => block.text);
        expect(dangers.join(' ')).toContain('Загрузку аудиофайла');
    });

    it('объясняет, что происходит после отправки', () => {
        expect(blocksOf('steps')[0]?.items.length).toBeGreaterThanOrEqual(3);
    });

    it('несёт плашку готовности', () => {
        expect(blocksOf('readiness').length).toBeGreaterThan(0);
    });

    it('не обещает эффекта и не говорит «значимо»', () => {
        const text = JSON.stringify(AI_BRIEFS);
        ['значимо', 'гарантир', 'повысит продажи'].forEach(word =>
            expect(text.toLowerCase(), word).not.toContain(word),
        );
    });
});

describe('переезд калибровки', () => {
    const redirectPage = path.join(
        PRODUCT_DIR,
        'how-we-work',
        'calibration',
        'page.tsx',
    );

    it('страница-редиректа существует и ведёт на /ai/calibration', () => {
        expect(existsSync(redirectPage), redirectPage).toBe(true);
        const source = readFileSync(redirectPage, 'utf8');
        expect(source).toContain('permanentRedirect');
        expect(source).toContain('AI_CALIBRATION_PATH');
        expect(AI_CALIBRATION_PATH).toBe('/ai/calibration');
    });

    it('глава «Калибровка» в разделе AI на месте', () => {
        expect(
            existsSync(path.join(SECTION_DIR, 'calibration', 'page.tsx')),
        ).toBe(true);
    });

    it('печатный бриф остался рабочим маршрутом', () => {
        expect(CALIBRATION_BRIEF_PATH).toBe('/how-we-work/calibration/brief');
        expect(
            existsSync(
                path.join(
                    PRODUCT_DIR,
                    'how-we-work',
                    'calibration',
                    'brief',
                    'page.tsx',
                ),
            ),
        ).toBe(true);
    });

    it('меню «Как мы работаем» больше не ведёт на калибровку', () => {
        expect(HOW_NAV_ITEMS.map(item => item.slug)).not.toContain(
            'calibration',
        );
    });

    it('страница «ИИ-анализ» ссылается на раздел AI', () => {
        expect(AI_PAGE.cta?.href).toBe(AI_SECTION_PATH);
        expect(AI_SECTION_PATH).toBe('/ai');
    });
});
