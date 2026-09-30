import { describe, expect, it } from 'vitest';
import type { AiAboutModel } from '@/modules/entities/ai-analytics';
import {
    AI_ABOUT_DATA_QUALITY,
    AI_ABOUT_ENDPOINT_LABELS,
    AI_ABOUT_ESTIMATE_SOURCE_LABELS,
    AI_ABOUT_KIND,
    AI_ABOUT_LAYER_LABELS,
    AI_ABOUT_NO_MODEL_TEXT,
    AI_ABOUT_REASON_LABELS,
    AI_ABOUT_SIGMA_SOURCE_LABELS,
    aiAboutEstimates,
    aiAboutModelReasonText,
    formatAiAboutChainShare,
    formatAiAboutComparableFrom,
    formatAiAboutDate,
    formatAiAboutEstimateValue,
    formatAiAboutMonth,
    formatAiAboutNumber,
    formatAiAboutObservations,
    formatAiAboutParamValue,
    formatAiAboutWindow,
} from '../lib/ai-about.util';

/** Модель портала с тремя оценками (проверка качества не проводилась). */
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
        note: 'по данным 24 наблюдений',
    },
    phi: {
        code: 'phi_overdispersion',
        symbol: 'φ',
        title: 'Разброс',
        value: null,
        source: 'configured',
        note: 'значение по умолчанию',
    },
    lambda: {
        code: 'lambda_forget',
        symbol: 'λ',
        title: 'Забывание',
        value: 0.8,
        source: 'hybrid',
        note: 'пока данных мало',
    },
    estimand: { kind: 'rate', reason: 'chain-share-low', chainSharePct: 37.46 },
    sanity: null,
});

const JARGON = /реестр|прайор|гейт|×|\(rate\)|\(prob\)|плацебо|протечк|σ|κ|λ/i;

describe('словари «Как считаем» — все коды DTO подписаны по-русски', () => {
    it('разделы, слои, типы, причины, источники, качество данных', () => {
        expect(Object.keys(AI_ABOUT_ENDPOINT_LABELS).sort()).toEqual(
            [
                'brief',
                'dossier',
                'forecast',
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

    it('подписи без жаргона и технических кодов', () => {
        const texts = [
            ...Object.values(AI_ABOUT_ENDPOINT_LABELS),
            ...Object.values(AI_ABOUT_LAYER_LABELS),
            ...Object.values(AI_ABOUT_KIND).map(kind => kind.label),
            ...Object.values(AI_ABOUT_REASON_LABELS),
            ...Object.values(AI_ABOUT_ESTIMATE_SOURCE_LABELS),
            ...Object.values(AI_ABOUT_DATA_QUALITY).map(item => item.label),
            ...Object.values(AI_ABOUT_SIGMA_SOURCE_LABELS),
        ];
        for (const text of texts) expect(text).not.toMatch(JARGON);
        expect(AI_ABOUT_LAYER_LABELS.default).toBe('по умолчанию');
        expect(AI_ABOUT_ENDPOINT_LABELS.overview).toBe(
            'Обзор по менеджерам и типам звонков',
        );
        expect(AI_ABOUT_DATA_QUALITY.unknown.label).toBe(
            'проверка качества данных не проводилась',
        );
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
    it('порядок усадка → разброс → забывание; значение null → «—»', () => {
        const codes = aiAboutEstimates(aboutModel()).map(
            estimate => estimate.code,
        );
        expect(codes).toEqual([
            'kappa_edge_late',
            'phi_overdispersion',
            'lambda_forget',
        ]);
        expect(formatAiAboutEstimateValue(null)).toBe('—');
        expect(formatAiAboutEstimateValue(0.5)).toMatch(/^0[.,]5$/);
    });

    it('доля связки округляется до десятых', () => {
        expect(formatAiAboutChainShare(37.46)).toMatch(/^37[.,]5 %$/);
        expect(formatAiAboutChainShare(100)).toBe('100 %');
    });

    it('причина отсутствия модели: текст бэка по-русски — как есть, код — нейтрально', () => {
        expect(aiAboutModelReasonText('Модель ещё не считалась')).toBe(
            'Модель ещё не считалась',
        );
        expect(aiAboutModelReasonText('no-model')).toBe(AI_ABOUT_NO_MODEL_TEXT);
        expect(aiAboutModelReasonText(null)).toBe(AI_ABOUT_NO_MODEL_TEXT);
    });
});

describe('даты, окно и месяц', () => {
    it('formatAiAboutDate: полная дата с годом; пусто и мусор — «—»', () => {
        expect(formatAiAboutDate('2026-09-07')).toBe('07.09.2026');
        expect(formatAiAboutDate('2026-09-07T10:00:00Z')).toBe('07.09.2026');
        expect(formatAiAboutDate('')).toBe('—');
        expect(formatAiAboutDate(null)).toBe('—');
        expect(formatAiAboutDate('garbage')).toBe('—');
    });

    it('formatAiAboutWindow: пусто, один месяц, диапазон словами с числом месяцев', () => {
        expect(formatAiAboutWindow([])).toBe('—');
        expect(formatAiAboutWindow(['2026-08'])).toBe('август 2026');
        expect(formatAiAboutWindow(['2026-06', '2026-07', '2026-08'])).toBe(
            'июнь – август 2026 (3 мес.)',
        );
    });

    it('месяц модели словами и наблюдения со склонением', () => {
        expect(formatAiAboutMonth('2026-09')).toBe('сентябрь 2026');
        expect(formatAiAboutObservations(24)).toBe(
            '24 наблюдения (менеджер за месяц)',
        );
        expect(formatAiAboutObservations(1)).toBe(
            '1 наблюдение (менеджер за месяц)',
        );
        expect(formatAiAboutObservations(11)).toBe(
            '11 наблюдений (менеджер за месяц)',
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
});
