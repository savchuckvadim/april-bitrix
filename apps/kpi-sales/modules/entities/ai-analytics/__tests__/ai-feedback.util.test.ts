import { describe, expect, it } from 'vitest';
import {
    AI_DISAGREE_REASON_MAX,
    clampAiDisagreeReason,
    formatAiDisagreeCounter,
    normalizeAiDisagreeReason,
} from '../lib/ai-feedback.util';

describe('ai-feedback.util — причина «Не согласен»', () => {
    it('лимит — 300 символов', () => {
        expect(AI_DISAGREE_REASON_MAX).toBe(300);
    });

    it('clampAiDisagreeReason обрезает до лимита и не трогает короткое', () => {
        expect(clampAiDisagreeReason('a'.repeat(350))).toHaveLength(300);
        expect(clampAiDisagreeReason('коротко')).toBe('коротко');
        expect(clampAiDisagreeReason('a'.repeat(300))).toHaveLength(300);
    });

    it('normalizeAiDisagreeReason: пустая причина → undefined', () => {
        expect(normalizeAiDisagreeReason(undefined)).toBeUndefined();
        expect(normalizeAiDisagreeReason('')).toBeUndefined();
        expect(normalizeAiDisagreeReason('   \n ')).toBeUndefined();
    });

    it('normalizeAiDisagreeReason: обрезает до 300 и убирает крайние пробелы', () => {
        expect(normalizeAiDisagreeReason('  не так посчитано  ')).toBe(
            'не так посчитано',
        );
        const long = 'б'.repeat(400);
        expect(normalizeAiDisagreeReason(long)).toBe('б'.repeat(300));
    });

    it('normalizeAiDisagreeReason: пробелы за лимитом не спасают пустую причину', () => {
        expect(normalizeAiDisagreeReason(' '.repeat(301))).toBeUndefined();
    });

    it('formatAiDisagreeCounter — «введено / лимит» с учётом обрезки', () => {
        expect(formatAiDisagreeCounter('')).toBe('0 / 300');
        expect(formatAiDisagreeCounter('abc')).toBe('3 / 300');
        expect(formatAiDisagreeCounter('a'.repeat(999))).toBe('300 / 300');
    });
});
