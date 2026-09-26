import { describe, expect, it } from 'vitest';
import type { AiAboutModel } from '@/modules/entities/ai-analytics';
import {
    AI_ABOUT_DATA_QUALITY,
    AI_ABOUT_ENDPOINT_LABELS,
    AI_ABOUT_RELIABILITY_CATEGORY_LABELS,
    AI_ABOUT_SIGMA_SOURCE_LABELS,
    AI_ABOUT_ESTIMATE_SOURCE_LABELS,
    AI_ABOUT_KIND,
    AI_ABOUT_LAYER_LABELS,
    AI_ABOUT_REASON_LABELS,
    aiAboutEstimates,
    formatAiAboutChainShare,
    formatAiAboutComparableFrom,
    formatAiAboutDate,
    formatAiAboutEstimateValue,
    formatAiAboutKappa,
    formatAiAboutNumber,
    formatAiAboutParamValue,
    formatAiAboutWindow,
    shortAiAboutVersion,
} from '../lib/ai-about.util';

/** Модель портала с оценками κ / φ / λ (санити не отрабатывала). */
const aboutModel = (): AiAboutModel => ({
    modelSnapshotId: 'ais-1',
    monthKey: '2026-08',
    window: ['2026-06', '2026-07', '2026-08'],
    observations: 24,
    managers: 8,
    reused: false,
    generatedAt: '2026-09-01T02:00:00Z',
    paramsVersion: 'v1',
    comparableFrom: null,
    readiness: {
        mode: 'descriptive',
        historyMonths: 3,
        presentations: 80,
        sales: 12,
        comparableFrom: '',
        betaSource: 'none',
        reasons: ['norms-presentations-below-100'],
    },
    kappa: {
        code: 'kappa_edge_late',
        symbol: 'κ',
        title: 'Сила усадки',
        value: 0.35,
        source: 'estimated',
        note: 'по данным 24 менеджер-месяцев',
    },
    phi: {
        code: 'phi_overdispersion',
        symbol: 'φ',
        title: 'Сверхдисперсия',
        value: null,
        source: 'configured',
        note: 'настройка реестра',
    },
    lambda: {
        code: 'lambda_forget',
        symbol: 'λ',
        title: 'Забывание',
        value: 0.8,
        source: 'hybrid',
        note: 'прайор до гейта',
    },
    estimand: { kind: 'rate', reason: 'chain-share-low', chainSharePct: 37.46 },
    sanity: null,
});

describe('словари «Как считаем» — все коды DTO подписаны по-русски', () => {
    it('ручки, слои, классы, причины, источники, качество данных', () => {
        expect(Object.keys(AI_ABOUT_ENDPOINT_LABELS).sort()).toEqual(
            [
                'brief',
                'dossier',
                'manager/style',
                'overview',
                'plan-fact',
                'plan/daily',
            ].sort(),
        );
        expect(Object.keys(AI_ABOUT_LAYER_LABELS).sort()).toEqual(
            ['default', 'hybrid', 'manager', 'portal', 'tenure'].sort(),
        );
        expect(Object.keys(AI_ABOUT_KIND).sort()).toEqual(
            ['configured', 'estimated', 'hybrid'].sort(),
        );
        expect(Object.keys(AI_ABOUT_REASON_LABELS).sort()).toEqual(
            [
                'invalid-value',
                'out-of-range',
                'type-mismatch',
                'unknown-code',
            ].sort(),
        );
        expect(Object.keys(AI_ABOUT_ESTIMATE_SOURCE_LABELS).sort()).toEqual(
            ['configured', 'estimated', 'hybrid'].sort(),
        );
        expect(Object.keys(AI_ABOUT_DATA_QUALITY).sort()).toEqual(
            ['flagged', 'ok', 'unknown'].sort(),
        );
        expect(AI_ABOUT_DATA_QUALITY.flagged.tone).toBe('warning');
        expect(AI_ABOUT_KIND.estimated.tone).toBe('success');
    });
});

describe('formatAiAboutParamValue — значение с единицей', () => {
    it('число с единицей и без; дробь по-русски', () => {
        expect(formatAiAboutParamValue(8, 'шт.')).toBe('8 шт.');
        expect(formatAiAboutParamValue(0.35, '')).toMatch(/^0[.,]35$/);
        expect(formatAiAboutParamValue(12, '  ')).toBe('12');
    });

    it('булево — да / нет без единицы', () => {
        expect(formatAiAboutParamValue(true, 'флаг')).toBe('да');
        expect(formatAiAboutParamValue(false, '')).toBe('нет');
    });

    it('строка обрезается по краям и получает единицу', () => {
        expect(formatAiAboutParamValue('  weekly ', 'период')).toBe(
            'weekly период',
        );
    });

    it('число: не больше трёх знаков после запятой, тысячи разделены', () => {
        expect(formatAiAboutNumber(1234.56789)).toMatch(/^1\s?234[.,]568$/);
        expect(formatAiAboutNumber(2)).toBe('2');
    });
});

describe('оценки модели', () => {
    it('порядок κ, φ, λ и значение null → «—»', () => {
        const symbols = aiAboutEstimates(aboutModel()).map(
            estimate => estimate.symbol,
        );
        expect(symbols).toEqual(['κ', 'φ', 'λ']);
        expect(formatAiAboutEstimateValue(null)).toBe('—');
        expect(formatAiAboutEstimateValue(0.5)).toMatch(/^0[.,]5$/);
    });

    it('доля сцепки округляется до десятых', () => {
        expect(formatAiAboutChainShare(37.46)).toMatch(/^37[.,]5 %$/);
        expect(formatAiAboutChainShare(100)).toBe('100 %');
    });
});

describe('даты, окно и версия', () => {
    it('formatAiAboutDate: полная дата с годом; пусто — «—»; мусор — как есть', () => {
        expect(formatAiAboutDate('2026-09-07')).toBe('07.09.2026');
        expect(formatAiAboutDate('2026-09-07T10:00:00Z')).toBe('07.09.2026');
        expect(formatAiAboutDate('')).toBe('—');
        expect(formatAiAboutDate(null)).toBe('—');
        expect(formatAiAboutDate('garbage')).toBe('garbage');
    });

    it('formatAiAboutWindow: пусто, один месяц, диапазон с числом месяцев', () => {
        expect(formatAiAboutWindow([])).toBe('—');
        expect(formatAiAboutWindow(['2026-08'])).toBe('2026-08');
        expect(formatAiAboutWindow(['2026-06', '2026-07', '2026-08'])).toBe(
            '2026-06 – 2026-08 (3 мес.)',
        );
    });

    it('formatAiAboutComparableFrom: null/пусто — ряд не рвался', () => {
        expect(formatAiAboutComparableFrom(null)).toBe(
            'ряд параметров не рвался',
        );
        expect(formatAiAboutComparableFrom('')).toBe(
            'ряд параметров не рвался',
        );
        expect(formatAiAboutComparableFrom('2026-05-01')).toBe(
            'сравнимая история с 01.05.2026',
        );
    });

    it('shortAiAboutVersion: короткая как есть, sha256 — префикс с многоточием', () => {
        expect(shortAiAboutVersion('v1')).toBe('v1');
        const sha = 'a'.repeat(64);
        expect(shortAiAboutVersion(sha)).toBe(`${'a'.repeat(12)}…`);
    });
});

describe('надёжность оценщика (Фаза 3, П7)', () => {
    it('κ двумя знаками с запятой; null — «не измерено»', () => {
        expect(formatAiAboutKappa(0.4567)).toBe('0,46');
        expect(formatAiAboutKappa(1)).toBe('1,00');
        expect(formatAiAboutKappa(null)).toBe('не измерено');
    });

    it('поля повторного прогона и источники σ_llm подписаны по-русски', () => {
        for (const code of [
            'callType',
            'productive',
            'refusalCategory',
            'coachingPriority',
            'nextStepSet',
        ]) {
            expect(AI_ABOUT_RELIABILITY_CATEGORY_LABELS[code]).toBeTruthy();
        }
        expect(AI_ABOUT_SIGMA_SOURCE_LABELS.measured).toContain('измерена');
        expect(AI_ABOUT_SIGMA_SOURCE_LABELS.configured).toContain('реестра');
        expect(AI_ABOUT_ENDPOINT_LABELS['plan-fact']).toBeTruthy();
        expect(AI_ABOUT_ENDPOINT_LABELS.dossier).toBeTruthy();
    });
});
