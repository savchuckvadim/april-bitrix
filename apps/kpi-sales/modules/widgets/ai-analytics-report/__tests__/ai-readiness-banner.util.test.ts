import { describe, expect, it } from 'vitest';
import {
    AI_READINESS_HINTS,
    AI_READINESS_PHASE4_GATED_REASON,
    AI_READINESS_PHASE4_REASON,
    type AiReadiness,
} from '@/modules/entities/ai-analytics';
import {
    AI_READINESS_GATED_REASON,
    AI_READINESS_MODE_SHORT,
    AI_READINESS_REASON_CODE,
    AI_SIGMA_SOURCE_LABELS,
    aiReadinessGate,
    buildAiReadinessBanner,
    formatAiReadinessHistory,
    hasAiReadinessReason,
    isAiKnownReadinessReason,
} from '../lib/ai-readiness-banner.util';

const readiness = (overrides: Partial<AiReadiness> = {}): AiReadiness => ({
    mode: 'calibration',
    historyMonths: 1,
    presentations: 12,
    sales: 3,
    comparableFrom: '',
    betaSource: 'none',
    reasons: [],
    ...overrides,
});

describe('aiReadinessGate — число гейта из кода причины', () => {
    it('history-months-below-3 → 3, presentations-below-60 → 60', () => {
        const reasons = ['history-months-below-3', 'presentations-below-60'];
        expect(
            aiReadinessGate(reasons, AI_READINESS_GATED_REASON.HISTORY_MONTHS),
        ).toBe(3);
        expect(
            aiReadinessGate(reasons, AI_READINESS_GATED_REASON.PRESENTATIONS),
        ).toBe(60);
    });

    it('префикс целиком: presentations-below не ловит norms-presentations-below-100', () => {
        const reasons = ['norms-presentations-below-100'];
        expect(
            aiReadinessGate(reasons, AI_READINESS_GATED_REASON.PRESENTATIONS),
        ).toBeNull();
        expect(
            aiReadinessGate(
                reasons,
                AI_READINESS_GATED_REASON.NORMS_PRESENTATIONS,
            ),
        ).toBe(100);
    });

    it('причины нет — null', () => {
        expect(
            aiReadinessGate([], AI_READINESS_GATED_REASON.HISTORY_MONTHS),
        ).toBeNull();
    });
});

describe('isAiKnownReadinessReason — у кода есть свой пункт чек-листа', () => {
    it('коды без гейта и коды с гейтом — известны', () => {
        for (const code of Object.values(AI_READINESS_REASON_CODE)) {
            expect(isAiKnownReadinessReason(code)).toBe(true);
        }
        expect(isAiKnownReadinessReason('history-months-below-3')).toBe(true);
        expect(isAiKnownReadinessReason('norms-presentations-below-100')).toBe(
            true,
        );
    });

    it('новый код бэка — неизвестен', () => {
        expect(isAiKnownReadinessReason('brand-new-reason')).toBe(false);
        expect(isAiKnownReadinessReason('brand-new-below-5')).toBe(false);
    });

    it('Фаза 4: коды ступеней «Прогноз» и «Советы» известны (свои пункты)', () => {
        for (const code of Object.values(AI_READINESS_PHASE4_REASON)) {
            expect(isAiKnownReadinessReason(code)).toBe(true);
        }
        expect(isAiKnownReadinessReason('forecast-shadow-months-below-9')).toBe(
            true,
        );
        expect(
            isAiKnownReadinessReason('recommendations-issued-below-30'),
        ).toBe(true);
        expect(
            aiReadinessGate(
                ['forecast-log-missing', 'forecast-shadow-months-below-9'],
                AI_READINESS_PHASE4_GATED_REASON.FORECAST_SHADOW_MONTHS,
            ),
        ).toBe(9);
    });

    it('Фаза 4: режим советов назван «советы», без «рекомендаций»', () => {
        expect(AI_READINESS_MODE_SHORT.recommendations).toBe('советы');
        expect(
            buildAiReadinessBanner(readiness({ mode: 'forecast' })).title,
        ).toBe('Готовность витрины: прогноз');
    });
});

describe('hasAiReadinessReason', () => {
    it('ищет код среди причин режима', () => {
        const value = readiness({ reasons: ['roster-not-confirmed'] });
        expect(
            hasAiReadinessReason(
                value,
                AI_READINESS_REASON_CODE.ROSTER_NOT_CONFIRMED,
            ),
        ).toBe(true);
        expect(
            hasAiReadinessReason(
                value,
                AI_READINESS_REASON_CODE.NO_PORTAL_MODEL,
            ),
        ).toBe(false);
    });
});

describe('formatAiReadinessHistory', () => {
    it('месяцы, презентации, продажи; сопоставимость — только при дате', () => {
        expect(formatAiReadinessHistory(readiness())).toBe(
            'История разборов: 1 мес. · презентаций: 12 · продаж: 3',
        );
        expect(
            formatAiReadinessHistory(
                readiness({ comparableFrom: '2026-07-15' }),
            ),
        ).toContain('разборы сопоставимы с 15.07.2026');
    });
});

describe('buildAiReadinessBanner — шапка баннера', () => {
    it('заголовок «Готовность витрины: <режим>», строка режима, история', () => {
        const banner = buildAiReadinessBanner(readiness({ mode: 'kpi-only' }));
        expect(banner.title).toBe(
            `Готовность витрины: ${AI_READINESS_MODE_SHORT['kpi-only']}`,
        );
        expect(banner.hint).toBe(AI_READINESS_HINTS['kpi-only']);
        expect(banner.history).toContain('История разборов: 1 мес.');
    });

    it('у каждого режима есть короткое имя', () => {
        for (const name of Object.values(AI_READINESS_MODE_SHORT)) {
            expect(name.length).toBeGreaterThan(0);
        }
    });

    it('причины и счётчик β в шапке не дублируются — их показывает чек-лист', () => {
        const banner = buildAiReadinessBanner(
            readiness({
                reasons: ['roster-not-confirmed'],
                betaCountdown: {
                    seNow: 0.4,
                    presentationsLeft: 40,
                    monthsLeft: 2,
                },
            }),
        );
        expect(Object.keys(banner).sort()).toEqual([
            'hint',
            'history',
            'sigmaSource',
            'title',
        ]);
    });

    it('разброс оценок: measured/configured подписаны по-русски без символов; поля нет — строки нет', () => {
        expect(
            buildAiReadinessBanner(readiness({ sigmaLlmSource: 'measured' }))
                .sigmaSource,
        ).toBe(AI_SIGMA_SOURCE_LABELS.measured);
        expect(
            buildAiReadinessBanner(readiness({ sigmaLlmSource: 'configured' }))
                .sigmaSource,
        ).toContain('по умолчанию');
        for (const label of Object.values(AI_SIGMA_SOURCE_LABELS)) {
            expect(label).not.toMatch(/σ|llm|реестр/i);
        }
        expect(buildAiReadinessBanner(readiness()).sigmaSource).toBeNull();
    });
});
