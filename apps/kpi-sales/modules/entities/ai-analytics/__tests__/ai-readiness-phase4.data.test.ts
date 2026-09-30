import { describe, expect, it } from 'vitest';
import {
    AI_READINESS_HINTS,
    AI_READINESS_LABELS,
    AI_READINESS_PHASE4_GATED_REASON,
    AI_READINESS_PHASE4_REASON,
    AI_READINESS_REASON_UNKNOWN,
    formatAiReadinessReason,
    formatAiReadinessReasons,
} from '../lib/ai-readiness.data';

/** Английских кодов, стрелок и формул в клиентских подписях быть не должно. */
const FORBIDDEN = /[a-z]{3,}|→|×|≥|≤|σ|κ|β|рекомендац|рычаг/i;

describe('причины готовности Фазы 4 — ступени «Прогноз» и «Советы»', () => {
    it('коды совпадают с бэком (AI_READINESS_PHASE4_REASON_CODES и причины ручки прогноза)', () => {
        expect(Object.values(AI_READINESS_PHASE4_REASON).sort()).toEqual(
            [
                'forecast-backtest-insufficient',
                'forecast-coverage-outside',
                'forecast-mase-not-below',
                'forecast-stage-disabled',
                'forecast-log-missing',
                'forecast-readiness-below',
                'recommendations-needs-forecast',
                'recommendations-done-share-below',
                'recommendations-disagree-above',
                'recommendations-no-positive-edge',
                'recommendations-goodhart-flags',
                'recommendations-stage-disabled',
                'recommendations-effect-missing',
            ].sort(),
        );
        expect(Object.values(AI_READINESS_PHASE4_GATED_REASON)).toEqual([
            'forecast-shadow-months-below',
            'recommendations-issued-below',
            'recommendations-shares-issued-below',
        ]);
    });

    it('у каждого плоского кода своя русская подпись, не запасная', () => {
        for (const code of Object.values(AI_READINESS_PHASE4_REASON)) {
            const label = formatAiReadinessReason(code);
            expect(label).not.toBe(AI_READINESS_REASON_UNKNOWN);
            expect(label).not.toMatch(FORBIDDEN);
        }
    });

    it('коды с гейтом: число из хвоста попадает в подпись', () => {
        expect(formatAiReadinessReason('forecast-shadow-months-below-9')).toBe(
            'Прогноз копится в тени: для проверки нужно не меньше 9 мес. сверки с фактом',
        );
        expect(formatAiReadinessReason('recommendations-issued-below-30')).toBe(
            'Советов с завершённой проверкой пока меньше 30',
        );
    });

    it('два гейта советов — две разные подписи, а не «с завершённой проверкой меньше 20» и «меньше 8»', () => {
        const labels = formatAiReadinessReasons([
            'recommendations-issued-below-20',
            'recommendations-shares-issued-below-8',
        ]);
        expect(labels).toEqual([
            'Советов с завершённой проверкой пока меньше 20',
            'Выдано советов пока меньше 8 — долю выполненных ещё не считаем',
        ]);
    });

    it('«показ не включён» — «попросите разработчика», без слова «админка»', () => {
        const labels = formatAiReadinessReasons([
            AI_READINESS_PHASE4_REASON.FORECAST_DISABLED,
            AI_READINESS_PHASE4_REASON.RECOMMENDATIONS_DISABLED,
        ]);
        for (const label of labels) {
            expect(label).toContain('попросите разработчика');
            expect(label).not.toMatch(/админк/i);
        }
    });

    it('незнакомый код ступени — нейтральная подпись, не крэш', () => {
        expect(formatAiReadinessReason('forecast-something-new')).toBe(
            AI_READINESS_REASON_UNKNOWN,
        );
    });
});

describe('режимы «Прогноз» и «Советы» — честные подсказки', () => {
    it('гипотеза: правило руководителя — только калькулятор, а не проверка на данных', () => {
        expect(AI_READINESS_HINTS.hypothesis).toContain('калькуляторе');
        expect(AI_READINESS_HINTS.hypothesis).not.toContain('Проверяем');
        expect(AI_READINESS_HINTS.hypothesis).not.toMatch(FORBIDDEN);
    });

    it('прогноз: прошёл проверку на истории и включён', () => {
        expect(AI_READINESS_HINTS.forecast).toContain(
            'прошёл проверку на истории и включён',
        );
        expect(AI_READINESS_LABELS.forecast).not.toMatch(FORBIDDEN);
    });

    it('советы: проверены на ваших данных, без слова «рекомендации»', () => {
        expect(AI_READINESS_HINTS.recommendations).toContain(
            'советы проверены на ваших данных',
        );
        expect(AI_READINESS_LABELS.recommendations).not.toMatch(FORBIDDEN);
        expect(AI_READINESS_HINTS.recommendations).not.toMatch(FORBIDDEN);
    });
});
