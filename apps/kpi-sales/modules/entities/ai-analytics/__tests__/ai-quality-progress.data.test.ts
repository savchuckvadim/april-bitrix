import { describe, expect, it } from 'vitest';
import {
    AI_QUALITY_PROGRESS_TEXT,
    AI_QUALITY_PROGRESS_TONE,
    aiQualityProgressTone,
    formatAiProgress5,
} from '../lib/ai-quality-progress.data';

describe('ai-quality-progress.data', () => {
    it('тон клетки: сильная — успех, «купил бы и без менеджера» — предупреждение, незнакомое — спокойный', () => {
        expect(aiQualityProgressTone('strong')).toBe('success');
        expect(aiQualityProgressTone('progress_no_quality')).toBe('warning');
        expect(aiQualityProgressTone('weak')).toBe('destructive');
        expect(aiQualityProgressTone(null)).toBe('muted');
        expect(aiQualityProgressTone('something_old')).toBe('muted');
        expect(Object.keys(AI_QUALITY_PROGRESS_TONE)).toHaveLength(4);
    });

    it('продвижение 1–5 с одним знаком и «из 5»; пусто — прочерк', () => {
        expect(formatAiProgress5(4.125)).toBe('4,1 из 5');
        expect(formatAiProgress5(5)).toBe('5 из 5');
        expect(formatAiProgress5(null)).toBe('—');
    });

    it('тексты по-русски без кодов; пороги словами', () => {
        expect(AI_QUALITY_PROGRESS_TEXT.thresholds(6, 4)).toBe(
            'Качество — оценка от 6 из 10; движение сделки — продвижение от 4 из 5.',
        );
        const texts = [
            AI_QUALITY_PROGRESS_TEXT.title,
            AI_QUALITY_PROGRESS_TEXT.description,
            AI_QUALITY_PROGRESS_TEXT.empty,
            ...Object.values(AI_QUALITY_PROGRESS_TEXT.columns),
            ...AI_QUALITY_PROGRESS_TEXT.nHint.lines,
            ...AI_QUALITY_PROGRESS_TEXT.positionHint.lines,
        ];
        for (const text of texts) {
            expect(text.trim()).not.toBe('');
            expect(text).not.toMatch(/[a-z]{3,}_[a-z]+/);
        }
    });
});
