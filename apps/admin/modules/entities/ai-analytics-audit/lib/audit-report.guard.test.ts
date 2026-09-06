import { describe, expect, it } from 'vitest';
import type { AiAnalyticsAuditResultDto } from '@workspace/nest-admin-api';
import { isAuditReportLike, toAuditResult } from './audit-report.guard';

/** Минимальный отчёт в форме AuditReport бэка (пустое окно). */
const REPORT = {
    meta: {
        domain: 'april.bitrix24.ru',
        timeZone: 'Europe/Moscow',
        months: ['2026-08', '2026-09'],
        generatedAt: '2026-09-06',
    },
    rules: {
        cellMinN: 8,
        cellShareMinPct: 30,
        shortCallSec: 300,
        shortShareMaxPct: 40,
    },
    totals: {
        fetchedTranscriptions: 0,
        outsideWindow: 0,
        calls: 0,
        withManager: 0,
        analyzed: 0,
    },
    coverage: [],
    pivots: [],
    analyzedInCellsPct: null,
    analyzedByManagerMonthPct: null,
    noise: [],
    duration: {
        n: 0,
        missing: 0,
        p10: null,
        p50: null,
        p90: null,
        shortCount: 0,
        shortPct: null,
    },
    durationByMonth: [],
    versions: [],
    fields: {
        analyzed: 0,
        nextStep: {
            set: 0,
            withDate: 0,
            withDatePctOfAnalyzed: null,
            withDatePctOfSet: null,
        },
        sections: {
            callsWithAny: 0,
            callsWithAnyPct: null,
            total: 0,
            withAlternatives: 0,
            withAlternativesPct: null,
        },
        objections: {
            callsWithObjections: 0,
            total: 0,
            withQuote: 0,
            withQuotePct: null,
        },
    },
    depth: [],
    recommendation: {
        lowerThresholds: false,
        cheapShortContour: false,
        lines: ['Разборов в окне нет — пороги оставить.'],
    },
};

const dto = (report: unknown): AiAnalyticsAuditResultDto => ({
    domain: 'april.bitrix24.ru',
    generatedAt: '2026-09-06T04:10:00.000Z',
    months: 2,
    timeZone: 'Europe/Moscow',
    fromSnapshot: false,
    source: 'admin',
    markdown: '# Аудит',
    report: report as AiAnalyticsAuditResultDto['report'],
    about: {
        title: 'Аудит',
        purpose: '',
        sources: [],
        notDoing: [],
        computes: [],
        resultSections: [],
        recommendationRule: '',
        storage: '',
        access: '',
        howToRun: [],
    },
});

describe('isAuditReportLike: форма отчёта аудита', () => {
    it('отчёт бэка проходит проверку', () => {
        expect(isAuditReportLike(REPORT)).toBe(true);
    });

    it('без meta.months, totals.calls или recommendation.lines — не отчёт', () => {
        expect(
            isAuditReportLike({ ...REPORT, meta: { ...REPORT.meta, months: '' } }),
        ).toBe(false);
        expect(isAuditReportLike({ ...REPORT, totals: {} })).toBe(false);
        expect(isAuditReportLike({ ...REPORT, recommendation: {} })).toBe(false);
    });

    it('не-объекты отсеиваются', () => {
        expect(isAuditReportLike(null)).toBe(false);
        expect(isAuditReportLike([])).toBe(false);
        expect(isAuditReportLike('report')).toBe(false);
    });
});

describe('toAuditResult: сужение generated-конверта', () => {
    it('валидный report остаётся тем же объектом, конверт — без изменений', () => {
        const result = toAuditResult(dto(REPORT));

        expect(result.report).toBe(REPORT);
        expect(result.domain).toBe('april.bitrix24.ru');
        expect(result.fromSnapshot).toBe(false);
    });

    it('чужая форма report — понятная ошибка с доменом', () => {
        expect(() => toAuditResult(dto({ foo: 'bar' }))).toThrow(
            /april\.bitrix24\.ru/,
        );
    });
});
