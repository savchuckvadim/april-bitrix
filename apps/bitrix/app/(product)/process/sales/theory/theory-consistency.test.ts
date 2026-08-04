/**
 * Страница объявлена каноном, поэтому рассказ и конфигуратор обязаны говорить
 * одно и то же. Разъезжаются они молча: кто-то правит рекомендацию в анкете и
 * не вспоминает, что та же мысль записана прозой абзацем в другой папке.
 *
 * Эти тесты ловят ровно такой разъезд.
 */

import { describe, expect, it } from 'vitest';
import { SALES_PRESETS } from '../../_core/constants/presets';
import { SALES_QUESTIONS } from '../../_core/constants/questions';
import type { TheoryBlock, TheoryPageContent } from '../../_core/theory-types';
import { THEORY_FUNNEL } from './constants/funnel';
import { THEORY_INBOUND } from './constants/inbound';

const PAGES: TheoryPageContent[] = [THEORY_INBOUND, THEORY_FUNNEL];

const discourses = (page: TheoryPageContent) =>
    page.blocks.filter(
        (block): block is Extract<TheoryBlock, { kind: 'discourse' }> =>
            block.kind === 'discourse',
    );

const question = (id: string) => SALES_QUESTIONS.find(item => item.id === id);

describe('врезки «Дискурс» ссылаются на существующую конфигурацию', () => {
    for (const page of PAGES) {
        for (const block of discourses(page)) {
            const answers = block.preview?.answers ?? {};

            for (const [questionId, code] of Object.entries(answers)) {
                it(`${page.slug}: «${block.question}» → ${questionId}=${code}`, () => {
                    const found = question(questionId);
                    expect(found, `нет вопроса ${questionId}`).toBeDefined();
                    expect(found?.isActive, 'вопрос выключен').toBe(true);
                    expect(found?.options.map(option => option.code)).toContain(
                        code,
                    );
                });
            }
        }
    }
});

describe('рекомендация в тексте совпадает с рекомендацией в анкете', () => {
    for (const page of PAGES) {
        for (const block of discourses(page)) {
            if (!block.recommendation) continue;

            for (const [questionId, code] of Object.entries(
                block.preview?.answers ?? {},
            )) {
                it(`${page.slug}: ${questionId} рекомендован в обоих местах`, () => {
                    const recommended = question(questionId)?.options.find(
                        option => option.recommended,
                    );
                    expect(recommended?.code).toBe(code);
                });
            }
        }
    }
});

describe('ползунки из текста совпадают с рекомендованным пресетом', () => {
    const recommended = SALES_PRESETS.find(preset => preset.recommended);

    it('рекомендованный пресет ровно один', () => {
        expect(SALES_PRESETS.filter(preset => preset.recommended)).toHaveLength(
            1,
        );
    });

    for (const page of PAGES) {
        for (const block of discourses(page)) {
            const { leadPct, dealPct } = block.preview ?? {};
            if (leadPct === undefined && dealPct === undefined) continue;

            it(`${page.slug}: «${block.question}»`, () => {
                if (leadPct !== undefined) {
                    expect(leadPct).toBe(recommended?.leadPct);
                }
                if (dealPct !== undefined) {
                    expect(dealPct).toBe(recommended?.dealPct);
                }
            });
        }
    }
});

describe('нерешённая развилка не притворяется решённой', () => {
    for (const page of PAGES) {
        for (const block of discourses(page)) {
            it(`${page.slug}: «${block.question}»`, () => {
                // Кнопка «Посмотреть на схеме» обещает готовую конфигурацию.
                // Без рекомендации показывать её нечестно: развилка открыта.
                if (!block.recommendation) {
                    expect(block.preview).toBeUndefined();
                }
                expect(block.positions.length).toBeGreaterThanOrEqual(2);
                expect(block.price.length).toBeGreaterThan(0);
            });
        }
    }
});
