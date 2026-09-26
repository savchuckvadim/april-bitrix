import { describe, expect, it } from 'vitest';
import { GOLDEN_SET_TEXT } from '../consts/ai-analytics-audit.const';
import type {
    AiAnalyticsGoldenSetEntry,
    AiAnalyticsGoldenSetRunResult,
} from '../model';
import { isValidGoldenQuota } from './audit-months.util';
import {
    buildGoldenSetEntryView,
    buildGoldenSetRunView,
    formatGoldenPairs,
    formatGoldenSigma,
    parseGoldenQuota,
    sortGoldenSetEntries,
} from './golden-set.util';

const entry = (
    overrides: Partial<AiAnalyticsGoldenSetEntry> = {},
): AiAnalyticsGoldenSetEntry => ({
    id: 'ais-1',
    periodKey: 'a1b2c3d4e5f60718',
    promptVersion: 'focus-v2.3-2026-09-25',
    pairs: 120,
    quota: 300,
    withinQuota: true,
    sigmaLlm: 0.4321,
    sigmaSource: 'measured',
    generatedAt: '2026-09-25T03:00:00.000Z',
    ...overrides,
});

describe('golden-set.util — набор test-retest', () => {
    it('σ_llm двумя знаками с запятой, пары — «N из M»', () => {
        expect(formatGoldenSigma(0.4321)).toBe('0,43');
        expect(formatGoldenPairs(120, 300)).toBe('120 из 300');
    });

    it('запись → строка: бейджи квоты и источника σ_llm, дата по-русски', () => {
        const view = buildGoldenSetEntryView(entry());
        expect(view.pairs).toBe('120 из 300');
        expect(view.quota).toEqual({
            label: GOLDEN_SET_TEXT.withinQuota,
            tone: 'success',
        });
        expect(view.sigmaSource).toEqual({
            label: GOLDEN_SET_TEXT.sigmaMeasured,
            tone: 'success',
        });
        expect(view.generatedAt).toMatch(/^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/);

        const over = buildGoldenSetEntryView(
            entry({ withinQuota: false, sigmaSource: 'configured' }),
        );
        expect(over.quota.tone).toBe('warning');
        expect(over.sigmaSource).toEqual({
            label: GOLDEN_SET_TEXT.sigmaConfigured,
            tone: 'muted',
        });
    });

    it('записи сортируются свежими первыми, исходный массив не меняется', () => {
        const older = entry({ id: 'old', generatedAt: '2026-08-01T00:00:00Z' });
        const newer = entry({ id: 'new', generatedAt: '2026-09-01T00:00:00Z' });
        const source = [older, newer];
        expect(sortGoldenSetEntries(source).map(item => item.id)).toEqual([
            'new',
            'old',
        ]);
        expect(source[0]?.id).toBe('old');
    });

    it('ответ запуска: поставлена — info с id и квотой; нет — warning с причиной бэка', () => {
        const dispatched: AiAnalyticsGoldenSetRunResult = {
            domain: 'april.bitrix24.ru',
            dispatched: true,
            jobId: 'job-7',
            reason: null,
            quota: 300,
        };
        const view = buildGoldenSetRunView(dispatched);
        expect(view.tone).toBe('info');
        expect(view.message).toContain('job-7');
        expect(view.message).toContain('300');

        const refused = buildGoldenSetRunView({
            ...dispatched,
            dispatched: false,
            jobId: null,
            reason: 'очередь недоступна',
        });
        expect(refused.tone).toBe('warning');
        expect(refused.message).toBe('очередь недоступна');
        expect(
            buildGoldenSetRunView({ ...refused, ...dispatched, dispatched: false, reason: null })
                .message,
        ).toBe(GOLDEN_SET_TEXT.runUnavailable);
    });

    it('квота: пусто — undefined (умолчание бэка), число в 10–1000 валидно, иное — нет', () => {
        expect(parseGoldenQuota('')).toBeUndefined();
        expect(parseGoldenQuota(' ')).toBeUndefined();
        expect(parseGoldenQuota('300')).toBe(300);
        expect(Number.isNaN(parseGoldenQuota('abc'))).toBe(true);
        expect(isValidGoldenQuota(10)).toBe(true);
        expect(isValidGoldenQuota(1000)).toBe(true);
        expect(isValidGoldenQuota(9)).toBe(false);
        expect(isValidGoldenQuota(1001)).toBe(false);
        expect(isValidGoldenQuota(10.5)).toBe(false);
    });
});
