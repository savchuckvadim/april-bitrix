import { describe, expect, it } from 'vitest';
import {
    AI_METRIC_LOW_HINT,
    aiByCallsLabel,
    aiConfidenceReasonLabel,
    aiFewDataLabel,
    formatAiCallsCount,
    formatAiCallsShort,
    formatAiCi90,
    formatAiCi90Words,
} from '../lib/ai-metric.util';

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

    it('подсказка к пунктиру — без «n < 20»', () => {
        expect(AI_METRIC_LOW_HINT).toBe(
            'Мало данных для выводов — меньше 20 звонков',
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
            'недостаточно наблюдений',
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
