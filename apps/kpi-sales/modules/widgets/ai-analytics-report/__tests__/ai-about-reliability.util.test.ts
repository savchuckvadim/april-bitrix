import { describe, expect, it } from 'vitest';
import type { AiAboutReliability } from '@/modules/entities/ai-analytics';
import {
    AI_ABOUT_ENDPOINT_LABELS,
    AI_ABOUT_RELIABILITY_CATEGORY_FALLBACK,
    AI_ABOUT_RELIABILITY_CATEGORY_LABELS,
    AI_ABOUT_SIGMA_SOURCE_LABELS,
    aiAboutReliabilityCategoryLabel,
    formatAiAboutAgreementPct,
    formatAiAboutKappa,
    formatAiAboutReliabilityLine,
    formatAiAboutReliableHeader,
} from '../lib/ai-about.util';

/** Итог повторных разборов: 20 пар из нужных 30, возражения измерены. */
const reliability = (
    overrides: Partial<AiAboutReliability> = {},
): AiAboutReliability => ({
    promptVersion: 'p3',
    pairs: 20,
    withinQuota: true,
    sigmaLlm: { value: 0.35, source: 'measured', measured: 0.35, n: 20, minPairs: 30 },
    kappaMin: 0.6,
    categories: [],
    objectionsF1: 0.82,
    generatedAt: '2026-09-01T02:00:00Z',
    ...overrides,
});

describe('надёжность оценок AI', () => {
    it('согласие двумя знаками; null — «не измерено»; совпадение — в процентах', () => {
        expect(formatAiAboutKappa(0.4567)).toBe('0,46');
        expect(formatAiAboutKappa(1)).toBe('1,00');
        expect(formatAiAboutKappa(null)).toBe('не измерено');
        expect(formatAiAboutAgreementPct(0.82)).toBe('82 %');
        expect(formatAiAboutAgreementPct(null)).toBe('не измерено');
    });

    it('строка надёжности без версии, символов и кодов', () => {
        expect(formatAiAboutReliabilityLine(reliability())).toBe(
            'Разброс оценок AI: 0,35 (по 20 парам из нужных 30) · совпадение по возражениям 82 %',
        );
        const configured = formatAiAboutReliabilityLine(
            reliability({
                sigmaLlm: {
                    value: 0.5,
                    source: 'configured',
                    measured: null,
                    n: 3,
                    minPairs: 30,
                },
                objectionsF1: null,
            }),
        );
        expect(configured).toBe(
            'Разброс оценок AI: 0,50 (по умолчанию: пока по 3 парам из нужных 30) · совпадение по возражениям не измерено',
        );
        expect(configured).not.toMatch(/σ|κ|F1|p3/);
    });

    it('заголовок надёжности и поля разбора; незнакомое поле — нейтрально', () => {
        expect(formatAiAboutReliableHeader(0.6)).toMatch(
            /^Надёжно \(согласие не ниже 0[.,]6\)$/,
        );
        for (const code of [
            'callType',
            'productive',
            'refusalCategory',
            'coachingPriority',
            'nextStepSet',
        ]) {
            expect(AI_ABOUT_RELIABILITY_CATEGORY_LABELS[code]).toBeTruthy();
        }
        expect(aiAboutReliabilityCategoryLabel('zzz')).toBe(
            AI_ABOUT_RELIABILITY_CATEGORY_FALLBACK,
        );
        expect(AI_ABOUT_SIGMA_SOURCE_LABELS.measured).toBe(
            'по повторным разборам',
        );
        expect(AI_ABOUT_ENDPOINT_LABELS['plan-fact']).toBeTruthy();
        expect(AI_ABOUT_ENDPOINT_LABELS.dossier).toBeTruthy();
    });
});
