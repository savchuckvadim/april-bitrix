import { describe, expect, it } from 'vitest';
import { AI_DEAL_MOVEMENT_TEXT } from '../ai-deal-movement.texts';

/* Правило владельца: по-русски, без кодов, формул, стрелок и «админки». */
const FORBIDDEN =
    /[→×≥≤σκβ↑↓]|n ?=|админк|значимо|рычаг|вилк|в тени|периметр|p90|snapshot|снапшот|_/i;

const flatten = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [];
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (value && typeof value === 'object') return Object.values(value).flatMap(flatten);
    return [];
};

describe('ai-deal-movement.texts — тексты подвкладки «Движение сделок»', () => {
    const T = AI_DEAL_MOVEMENT_TEXT;

    it('все тексты по-русски, без кодов и запрещённых слов', () => {
        const texts = [
            ...flatten(T),
            T.deals.statusMany(3),
            T.deals.limitedMore(2),
            T.matrix.progressTitle(4),
        ];
        expect(texts.length).toBeGreaterThan(30);
        for (const text of texts) {
            expect(text).not.toMatch(FORBIDDEN);
            expect(text).toMatch(/[а-яё]/i);
        }
    });

    it('у каждого уровня продвижения есть пояснение', () => {
        for (const level of [1, 2, 3, 4, 5]) {
            expect(T.matrix.progressHints[level]?.length).toBeGreaterThan(10);
        }
    });

    it('403 — ровно тот текст, что в постановке', () => {
        expect(T.state.forbidden).toBe('Раздел доступен руководителям');
    });
});
