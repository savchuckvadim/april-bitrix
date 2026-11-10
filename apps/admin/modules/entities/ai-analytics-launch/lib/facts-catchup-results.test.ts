import { describe, expect, it } from 'vitest';
import type { FactsCatchupRunStatus } from '../model';
import {
    factsCatchupDefaultMonth,
    factsCatchupMonthOptions,
    factsCatchupOutcome,
    factsCatchupPeriod,
    factsCatchupRunText,
    factsCatchupShare,
    isFactsCatchupRunning,
} from './facts-catchup-results';

const NOW = new Date(2026, 10, 10, 12, 0, 0);

const run = (over: Partial<FactsCatchupRunStatus> = {}): FactsCatchupRunStatus => ({
    domain: 'g.bitrix24.ru',
    from: '2026-10-01',
    to: '2026-10-31',
    dryRun: false,
    promptVersion: 'facts-v1-2026-11-10',
    part: 2,
    candidates: 120,
    done: 80,
    failed: 2,
    skipped: 300,
    skippedBy: { hasFacts: 290, noAnalysis: 10, noActive: 0 },
    tokens: 56000,
    price: 28.4,
    startedAt: '2026-11-10T06:00:00.000Z',
    updatedAt: '2026-11-10T06:20:00.000Z',
    finished: false,
    lastError: null,
    timeBudgetHit: false,
    continuedWith: null,
    estimate: null,
    total: 200,
    processingMs: 600000,
    etaMinutes: 12,
    concurrency: 3,
    stopped: false,
    ...over,
});

describe('выбор месяца', () => {
    it('текущий месяц первым с пометкой, затем шесть закрытых; по умолчанию прошлый', () => {
        const options = factsCatchupMonthOptions(NOW);

        expect(options[0]).toEqual({ value: '2026-11', label: 'ноябрь 2026 (текущий)' });
        expect(options[1]).toEqual({ value: '2026-10', label: 'октябрь 2026' });
        expect(options).toHaveLength(7);
        expect(factsCatchupDefaultMonth(NOW)).toBe('2026-10');
    });

    it('период закрытого месяца — целиком, текущего — по сегодня', () => {
        expect(factsCatchupPeriod('2026-10', NOW)).toEqual({ from: '2026-10-01', to: '2026-10-31' });
        expect(factsCatchupPeriod('2026-11', NOW)).toEqual({ from: '2026-11-01', to: '2026-11-10' });
    });
});

describe('factsCatchupOutcome', () => {
    const base = {
        domain: 'g.bitrix24.ru',
        from: '2026-10-01',
        to: '2026-10-31',
        dispatched: true,
        jobId: 'j',
        reason: null,
        quota: 500,
    };

    it('подсчёт и догон — разные тексты; отказ — с причиной', () => {
        expect(factsCatchupOutcome({ ...base, dryRun: true }).text).toContain('Подсчёт поставлен в очередь');
        const started = factsCatchupOutcome({ ...base, dryRun: false });
        expect(started.text).toContain('по 500 звонков на часть');
        expect(started.next).toContain('Страницу можно закрыть');
        expect(
            factsCatchupOutcome({ ...base, dryRun: false, dispatched: false, reason: 'нет очереди' }),
        ).toMatchObject({ ok: false, text: 'Не запущено: нет очереди.' });
    });
});

describe('isFactsCatchupRunning и доля', () => {
    it('идёт, пока не закончен, не остановлен и свежее трёх часов', () => {
        const now = new Date('2026-11-10T06:30:00.000Z');
        expect(isFactsCatchupRunning(run(), now)).toBe(true);
        expect(isFactsCatchupRunning(run({ finished: true }), now)).toBe(false);
        expect(isFactsCatchupRunning(run({ stopped: true }), now)).toBe(false);
        expect(isFactsCatchupRunning(run({ dryRun: true }), now)).toBe(false);
        expect(isFactsCatchupRunning(run(), new Date('2026-11-10T10:00:00.000Z'))).toBe(false);
        expect(isFactsCatchupRunning(null, now)).toBe(false);
    });

    it('доля — догнано от всего; законченный — 1; без звонков — 0', () => {
        expect(factsCatchupShare(run())).toBe(0.4);
        expect(factsCatchupShare(run({ finished: true, done: 50 }))).toBe(1);
        expect(factsCatchupShare(run({ total: 0, done: 0 }))).toBe(0);
    });
});

describe('factsCatchupRunText', () => {
    it('подсчёт: сколько без признаков, пропуски по причинам, оценка с итогом', () => {
        const text = factsCatchupRunText(
            run({
                dryRun: true,
                candidates: 120,
                estimate: {
                    basedOnRecords: 3,
                    avgTokens: 700,
                    avgPrice: 0.35,
                    estimatedTokens: 84000,
                    estimatedPrice: 42,
                    message: 'Среднее по 3 недавним догонам фактов: 700 токенов, 0.35 ₽ за звонок.',
                },
            }),
        );

        expect(text).toContain('Подсчёт: без признаков 120 разборов, пропущено 300 (с признаками 290, без разбора 10).');
        expect(text).toContain('Среднее по 3 недавним догонам фактов');
        expect(text).toContain('Итого ≈ 84');
        expect(text).toContain('42 ₽');
    });

    it('подсчёт без оценки — только числа', () => {
        expect(factsCatchupRunText(run({ dryRun: true, candidates: 1 }))).toBe(
            'Подсчёт: без признаков 1 разбор, пропущено 300 (с признаками 290, без разбора 10).',
        );
    });

    it('ход догона: часть, догнано из всего, сбои, осталось, потрачено', () => {
        expect(factsCatchupRunText(run())).toBe(
            'Часть 2: догнано 80 из 200, сбоев 2, осталось ≈ 12 мин, потрачено 28,4 ₽.',
        );
    });

    it('законченный и остановленный прогоны', () => {
        expect(factsCatchupRunText(run({ finished: true, done: 198, failed: 2, price: 70 }))).toBe(
            'Готово: догнано 198 из 200, сбоев 2, потрачено 70 ₽.',
        );
        expect(
            factsCatchupRunText(run({ stopped: true, lastError: 'модель лежит — остановлено после 8 сбоев подряд' })),
        ).toContain('Остановлено после серии сбоев');
    });
});
