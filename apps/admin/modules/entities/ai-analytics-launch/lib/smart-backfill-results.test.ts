import { describe, expect, it } from 'vitest';
import type { SmartBackfillRunStatus } from '../model';
import {
    isSmartBackfillRunning,
    smartBackfillOutcome,
    smartBackfillPeriod,
    smartBackfillRunText,
    smartBackfillShare,
} from './smart-backfill-results';

const run = (over: Partial<SmartBackfillRunStatus> = {}): SmartBackfillRunStatus => ({
    domain: 'g.bitrix24.ru',
    mode: 'period',
    from: '2026-09-30',
    to: '2026-10-30',
    dryRun: false,
    source: 'admin',
    part: 1,
    candidates: 430,
    done: 100,
    failed: 2,
    missing: 1,
    skipped: 30,
    skippedBy: { noSmartItem: 25, superseded: 5, noPayload: 0 },
    startedAt: '2026-10-30T09:00:00.000Z',
    updatedAt: '2026-10-30T09:20:00.000Z',
    finished: false,
    lastError: null,
    timeBudgetHit: false,
    continuedWith: null,
    ...over,
});

describe('smartBackfillPeriod', () => {
    it('последние 30 дней по сегодня включительно', () => {
        expect(smartBackfillPeriod(new Date(2026, 9, 30, 12))).toEqual({
            from: '2026-09-30',
            to: '2026-10-30',
        });
    });
});

describe('smartBackfillOutcome', () => {
    const base = {
        domain: 'g.bitrix24.ru',
        mode: 'period' as const,
        from: '2026-09-30',
        to: '2026-10-30',
        quota: 150,
        jobId: 'j',
        reason: null,
    };

    it('подсчёт и запуск — разные тексты; отказ — с причиной', () => {
        expect(
            smartBackfillOutcome({ ...base, dryRun: true, dispatched: true }).text,
        ).toContain('Подсчёт поставлен');
        const started = smartBackfillOutcome({ ...base, dryRun: false, dispatched: true });
        expect(started.text).toContain('по 150 карточек');
        expect(started.next).toBeDefined();
        const refused = smartBackfillOutcome({
            ...base,
            dryRun: false,
            dispatched: false,
            jobId: null,
            reason: 'очередь недоступна',
        });
        expect(refused.ok).toBe(false);
        expect(refused.text).toContain('очередь недоступна');
    });
});

describe('статус прогона словами', () => {
    const now = new Date('2026-10-30T09:30:00.000Z');

    it('идёт — свежий незаконченный боевой; подсчёт и старый — нет', () => {
        expect(isSmartBackfillRunning(run(), now)).toBe(true);
        expect(isSmartBackfillRunning(run({ dryRun: true }), now)).toBe(false);
        expect(isSmartBackfillRunning(run({ finished: true }), now)).toBe(false);
        expect(
            isSmartBackfillRunning(run({ updatedAt: '2026-10-30T05:00:00.000Z' }), now),
        ).toBe(false);
        expect(isSmartBackfillRunning(null, now)).toBe(false);
    });

    it('доля — записано к числу карточек без пропущенных; законченный — 1', () => {
        expect(smartBackfillShare(run())).toBeCloseTo(100 / 400);
        expect(smartBackfillShare(run({ finished: true }))).toBe(1);
        expect(smartBackfillShare(run({ candidates: 0, skipped: 0 }))).toBe(0);
    });

    it('текст: период, режим, источник, счётчики и последняя ошибка', () => {
        const text = smartBackfillRunText(run({ lastError: 'HTTP 400' }));
        expect(text).toContain('2026-09-30 — 2026-10-30');
        expect(text).toContain('все карточки периода (кнопка)');
        expect(text).toContain('Часть 1: записано 100 из 400');
        expect(text).toContain('сбоев 2');
        expect(text).toContain('без элемента 1');
        expect(text).toContain('Последняя ошибка: HTTP 400');
        expect(
            smartBackfillRunText(run({ dryRun: true, mode: 'pending', source: 'cron', finished: true })),
        ).toContain('Подсчёт: 400 карточек будет переписано');
        expect(smartBackfillRunText(run({ mode: 'pending', source: 'cron' }))).toContain(
            'только с незаписанными полями (ночная автоматика)',
        );
    });
});
