import { describe, expect, it } from 'vitest';
import {
    AI_READINESS_LABELS,
    AI_READINESS_REASON_LABELS,
    type AiReadiness,
} from '@/modules/entities/ai-analytics';
import {
    AI_BETA_SOURCE_LABELS,
    AI_READINESS_REASON_CODE,
    AI_SIGMA_SOURCE_LABELS,
    AI_READINESS_REASON_HINTS,
    buildAiReadinessBanner,
    buildAiReadinessReasons,
    formatAiReadinessHistory,
    hasAiReadinessReason,
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

describe('buildAiReadinessReasons — подписи и подсказки причин', () => {
    it('коды → русские подписи, дубли схлопнуты, порядок бэка', () => {
        const items = buildAiReadinessReasons([
            'no-portal-model',
            'presentations-below-60',
            'no-portal-model',
        ]);
        expect(items.map(item => item.code)).toEqual([
            'no-portal-model',
            'presentations-below-60',
        ]);
        expect(items[0]?.label).toBe(
            AI_READINESS_REASON_LABELS['no-portal-model'],
        );
        expect(items[1]?.label).toBe('Разобранных презентаций меньше 60');
    });

    it('особые коды несут подсказку «что делать», гейты — нет', () => {
        const [model, gate] = buildAiReadinessReasons([
            AI_READINESS_REASON_CODE.NO_PORTAL_MODEL,
            'history-months-below-3',
        ]);
        expect(model?.hint).toContain('не построил модель портала');
        expect(model?.hint).toContain('после первого расчёта');
        expect(gate?.hint).toBeNull();
    });

    it('у всех особых кодов есть подсказка', () => {
        for (const code of Object.values(AI_READINESS_REASON_CODE)) {
            expect(AI_READINESS_REASON_HINTS[code]).toBeTruthy();
            expect(AI_READINESS_REASON_LABELS[code]).toBeTruthy();
        }
    });

    it('roster-not-confirmed — единственная причина с кнопкой подтверждения', () => {
        const items = buildAiReadinessReasons([
            'roster-not-confirmed',
            'hypothesis-not-set',
            'calendar-not-imported',
        ]);
        expect(items.map(item => item.confirmRoster)).toEqual([
            true,
            false,
            false,
        ]);
        expect(items[1]?.hint).toContain('гипотезу');
        expect(items[2]?.hint).toContain('календарь');
    });

    it('undefined и пустой список — без причин', () => {
        expect(buildAiReadinessReasons(undefined)).toEqual([]);
        expect(buildAiReadinessReasons([])).toEqual([]);
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

describe('buildAiReadinessBanner — модель баннера', () => {
    it('kpi-only: предупреждение, без счётчика β', () => {
        const banner = buildAiReadinessBanner(
            readiness({ mode: 'kpi-only', betaCountdown: null }),
        );
        expect(banner.title).toBe(AI_READINESS_LABELS['kpi-only']);
        expect(banner.tone).toBe('warning');
        expect(banner.countdown).toBeNull();
        expect(banner.betaSource).toBe(AI_BETA_SOURCE_LABELS.none);
    });

    it('счётчик β и источник связи «качество → исход» подписаны по-русски', () => {
        const banner = buildAiReadinessBanner(
            readiness({
                mode: 'norms',
                betaSource: 'hypothesis',
                betaCountdown: {
                    seNow: 0.4,
                    presentationsLeft: 40,
                    monthsLeft: 2,
                },
            }),
        );
        expect(banner.tone).toBe('success');
        expect(banner.countdown).toContain('40 презентаций');
        expect(banner.countdown).toContain('2 месяца');
        expect(banner.betaSource).toContain('по гипотезе');
    });

    it('гейт β пройден: источник data, счётчика нет', () => {
        const banner = buildAiReadinessBanner(
            readiness({ mode: 'hypothesis', betaSource: 'data' }),
        );
        expect(banner.countdown).toBeNull();
        expect(banner.betaSource).toContain('по данным');
        expect(banner.reasons).toEqual([]);
    });
});

describe('buildAiReadinessBanner — источник σ_llm (Фаза 3, П7)', () => {
    it('measured/configured подписаны по-русски; поле не пришло — строки нет', () => {
        expect(
            buildAiReadinessBanner(readiness({ sigmaLlmSource: 'measured' }))
                .sigmaSource,
        ).toBe(AI_SIGMA_SOURCE_LABELS.measured);
        expect(
            buildAiReadinessBanner(readiness({ sigmaLlmSource: 'configured' }))
                .sigmaSource,
        ).toContain('реестра');
        expect(buildAiReadinessBanner(readiness()).sigmaSource).toBeNull();
    });
});
