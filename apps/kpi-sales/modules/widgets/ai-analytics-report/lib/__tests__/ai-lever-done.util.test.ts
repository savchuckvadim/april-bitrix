import { describe, expect, it } from 'vitest';
import {
    AI_FEEDBACK_OBJECT,
    aiFeedbackObjectLabel,
} from '@/modules/entities/ai-analytics';
import {
    AI_LEVER_DISAGREE_KIND,
    AI_LEVER_DISAGREE_TEXT,
    AI_LEVER_DONE_KIND,
    aiLeverCanMark,
    aiLeverFeedbackObject,
    aiLeverIssuedLine,
    isAiLeverDisagreed,
    isAiLeverDone,
} from '../ai-lever-done.util';
import { aiLeverHintLines, type AiRecommendation } from '../ai-signal.util';
import {
    AI_EVIDENCE_UNKNOWN,
    AI_LEVER,
    AI_LEVER_UNKNOWN,
    aiEvidenceWords,
    aiLeverView,
} from '../ai-lever-view.util';

const KEY = 'quality:q-low:presentation:needs:';

const advice = (over: Partial<AiRecommendation> = {}): AiRecommendation => ({
    lever: 'quality',
    callType: 'presentation',
    section: 'needs',
    cost: 1.5,
    evidence: 'E1',
    basis: [],
    ruleCode: 'q-low',
    key: KEY,
    done: false,
    issuedAt: null,
    ...over,
});

describe('«Сделано» у совета', () => {
    it('объект реакции lever:{менеджер}:{ключ}, вид recommendation_done', () => {
        expect(AI_LEVER_DONE_KIND).toBe('recommendation_done');
        expect(aiLeverFeedbackObject('7', advice())).toBe(`lever:7:${KEY}`);
        expect(AI_FEEDBACK_OBJECT.lever('7', KEY)).toBe(`lever:7:${KEY}`);
    });

    it('отметить можно только совет с ключом (старый ответ без ключа — кнопки нет)', () => {
        expect(aiLeverCanMark(advice())).toBe(true);
        expect(aiLeverCanMark(advice({ key: '' }))).toBe(false);
        const legacy = {
            ...advice(),
            key: undefined,
        } as unknown as AiRecommendation;
        expect(aiLeverCanMark(legacy)).toBe(false);
    });

    it('сделано: из обзора (done) или сразу после записи — оптимистично', () => {
        expect(isAiLeverDone(advice(), null)).toBe(false);
        expect(isAiLeverDone(advice({ done: true }), null)).toBe(true);
        expect(isAiLeverDone(advice(), 'recommendation_done')).toBe(true);
        expect(isAiLeverDone(advice(), 'disagree')).toBe(false);
    });

    it('«Не согласен» у совета — вид disagree на тот же объект lever: (его считает эффект советов)', () => {
        expect(AI_LEVER_DISAGREE_KIND).toBe('disagree');
        expect(AI_LEVER_DISAGREE_TEXT.button).toBe('Не согласен');
        expect(isAiLeverDisagreed('disagree')).toBe(true);
        expect(isAiLeverDisagreed('recommendation_done')).toBe(false);
        expect(isAiLeverDisagreed(null)).toBe(false);
        expect(aiLeverFeedbackObject('7', advice())).not.toBe(
            AI_FEEDBACK_OBJECT.managerRow('7'),
        );
    });

    it('день выдачи — строкой подсказки; нет дня — ничего', () => {
        expect(aiLeverIssuedLine(advice({ issuedAt: '2026-09-07' }))).toBe(
            'Совет выдан 07.09.2026',
        );
        expect(aiLeverIssuedLine(advice())).toBeNull();
    });

    it('подписи — «совет», вид совета словами', () => {
        expect(aiLeverHintLines(advice())[0]).toMatch(/^Совет: Качество — /);
        expect(AI_LEVER.pipeline.label).toBe('Сделки');
    });

    it('незнакомый вид совета и уровень доказательности — нейтрально, не падение', () => {
        expect(aiLeverView('quality')).toBe(AI_LEVER.quality);
        expect(aiLeverView('newLever')).toBe(AI_LEVER_UNKNOWN);
        expect(aiLeverView('toString')).toBe(AI_LEVER_UNKNOWN);
        expect(aiEvidenceWords('E2')).toBe('данные нескольких порталов');
        expect(aiEvidenceWords('E9')).toBe(AI_EVIDENCE_UNKNOWN);
        const unknown = { ...advice(), evidence: 'E9', lever: 'newLever' };
        const lines = aiLeverHintLines(unknown as unknown as AiRecommendation);
        expect(lines[0]).toMatch(/^Совет: Совет — /);
        expect(lines).toContain('Доказательность: не указана');
    });

    it('объект реакции словами: «по совету «Качество»»; битый ключ — «по совету»', () => {
        expect(aiFeedbackObjectLabel(`lever:7:${KEY}`)).toBe(
            'по совету «Качество»',
        );
        expect(aiFeedbackObjectLabel('lever:7:unknown:x:::')).toBe('по совету');
        expect(aiFeedbackObjectLabel('lever:7')).toBe('по совету');
    });
});
