import { describe, expect, it } from 'vitest';
import {
    AI_METRIC_LEGACY_HINT,
    AI_METRIC_LEGACY_LABEL,
    AI_METRIC_LOW_HINT,
    AI_METRIC_THRESHOLDS,
    aiByCallsLabel,
    aiConfidenceReasonLabel,
    aiFewDataHint,
    aiFewDataLabel,
    aiMetricHiddenLabel,
    aiMetricLowHint,
    aiMetricLowHintLines,
    aiMetricLowMax,
    formatAiCallsCount,
    formatAiCallsShort,
    formatAiCi90,
    formatAiCi90Words,
    isAiMetricLegacy,
} from '../lib/ai-metric.util';
import { metric } from './ai-fixtures';

// Неразрывный пробел ru-RU: сравниваем без учёта вида пробелов.
const plain = (value: string) => value.replace(/\s/g, ' ');

describe('ai-metric.util — объём словами, без «n = …»', () => {
    it('«по N звонкам» в дательном падеже', () => {
        expect(plain(aiByCallsLabel(1))).toBe('по 1 звонку');
        expect(plain(aiByCallsLabel(2))).toBe('по 2 звонкам');
        expect(plain(aiByCallsLabel(124))).toBe('по 124 звонкам');
        expect(plain(aiByCallsLabel(21))).toBe('по 21 звонку');
    });

    it('«N звонков» и короткая подпись «N зв.»', () => {
        expect(plain(formatAiCallsCount(7))).toBe('7 звонков');
        expect(plain(formatAiCallsCount(3))).toBe('3 звонка');
        expect(plain(formatAiCallsShort(18))).toBe('18 зв.');
    });

    it('«мало данных: 7 звонков»; без звонков — просто «мало данных»', () => {
        expect(plain(aiFewDataLabel(7))).toBe('мало данных: 7 звонков');
        expect(plain(aiFewDataLabel(3))).toBe('мало данных: 3 звонка');
        expect(aiFewDataLabel(0)).toBe('мало данных');
    });

    it('подсказка к пунктиру — без «n < 20»; у оценок порог 20, у долей 30', () => {
        expect(AI_METRIC_LOW_HINT).toBe(
            'Мало данных для выводов — меньше 20 звонков',
        );
        expect(aiMetricLowHint('rate')).toBe(
            'Мало данных для выводов — меньше 30 звонков',
        );
        expect(aiMetricLowMax('score')).toBe(AI_METRIC_THRESHOLDS.lowScore);
        expect(aiMetricLowMax('rate')).toBe(AI_METRIC_THRESHOLDS.lowRate);
        // Пороги из ответа портала важнее дефолтов реестра.
        expect(aiMetricLowMax('rate', { lowRate: 25 })).toBe(25);
        expect(aiMetricLowHintLines('score').join(' ')).toContain('меньше 20');
        expect(aiMetricLowHintLines('rate', { lowRate: 25 }).join(' ')).toContain(
            'меньше 25',
        );
    });

    it('подсказка к «мало данных» всегда называет порог и что сделать', () => {
        const hint = aiFewDataHint(metric(null, 5));
        expect(hint.title).toBe('Мало данных');
        expect(hint.lines.join(' ')).toContain('не меньше 8');
        expect(hint.lines.join(' ')).toContain('Сейчас: 5 звонков');
        expect(hint.lines.join(' ')).toContain('От 8 до 19');
        expect(hint.lines.join(' ')).toMatch(/Делать ничего не нужно/);
        expect(aiFewDataHint(metric(null, 0)).lines.join(' ')).not.toContain(
            'Сейчас',
        );
        expect(aiFewDataHint(metric(null, 5), 'rate').lines[0]).toMatch(/^Долю/);
        expect(aiFewDataHint(metric(null, 5), 'score', { none: 10 }).lines[0]).toContain(
            'не меньше 10',
        );
        for (const line of hint.lines) expect(line).not.toMatch(/[→×≥≤]|n ?=/);
    });

    it('старый расчёт без оценки — свой бэйдж и подсказка, не «мало данных»', () => {
        const legacy = {
            ...metric(null, 40),
            confidence: { level: 'none' as const, reason: 'legacy-snapshot' },
        };
        expect(isAiMetricLegacy(legacy)).toBe(true);
        expect(aiMetricHiddenLabel(legacy)).toBe(AI_METRIC_LEGACY_LABEL);
        expect(aiFewDataHint(legacy)).toBe(AI_METRIC_LEGACY_HINT);
        expect(AI_METRIC_LEGACY_HINT.lines.join(' ')).toContain('попросите разработчика');
        expect(plain(aiMetricHiddenLabel(metric(null, 5)))).toBe(
            'мало данных: 5 звонков',
        );
    });
});

describe('ai-metric.util — разброс', () => {
    it('«31–55 %» и словами «вероятно от 31 до 55 %»; без границ — пусто', () => {
        expect(formatAiCi90([0.31, 0.55])).toBe('31–55 %');
        expect(formatAiCi90Words([0.31, 0.55])).toBe('вероятно от 31 до 55 %');
        expect(formatAiCi90([0.3])).toBe('');
        expect(formatAiCi90Words(undefined)).toBe('');
    });
});

describe('aiConfidenceReasonLabel — причина пониженного доверия', () => {
    it('известные коды по-русски, пустая — null, незнакомая — нейтрально без кода', () => {
        expect(aiConfidenceReasonLabel('few-data')).toBe(
            'меньше 8 оценённых звонков',
        );
        expect(aiConfidenceReasonLabel('not-enough-data', { none: 10 })).toBe(
            'меньше 10 оценённых звонков',
        );
        expect(aiConfidenceReasonLabel('legacy-snapshot')).toBe(
            'оценка не сохранялась в старом расчёте',
        );
        expect(aiConfidenceReasonLabel('version-changed')).toBe(
            'сменилась версия разбора',
        );
        expect(aiConfidenceReasonLabel(undefined)).toBeNull();
        expect(aiConfidenceReasonLabel('')).toBeNull();
        expect(aiConfidenceReasonLabel('brand-new-reason')).toBe(
            'данных недостаточно',
        );
    });
});
