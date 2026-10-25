import { describe, expect, it } from 'vitest';
import {
    LAUNCH_STEP_TEXT,
    LAUNCH_TEXT,
} from '../consts/ai-analytics-launch.const';
import type { LaunchBacktest } from '../model';
import { describeLaunchError } from './launch-error';
import { reanalyzeProgress } from './launch-progress';
import {
    backtestVerdict,
    historyOutcome,
    reanalyzeOutcome,
    rebuildOutcome,
    smartOutcome,
} from './launch-results';

const backtest = (over: Partial<LaunchBacktest> = {}): LaunchBacktest => ({
    monthKey: '2026-09',
    generatedAt: '2026-10-02T01:00:00.000Z',
    status: 'pass',
    reasons: [],
    shadowMonths: 10,
    shadowMinMonths: 9,
    replayedMonths: 8,
    months: 6,
    days: 120,
    coverageShare: 0.8,
    coverageCi90: [0.7, 0.9],
    coverageTarget: 0.8,
    maseNaive: 0.8,
    maseNaiveCi90: [0.7, 0.9],
    maseMean3: 0.85,
    maseMean3Ci90: [0.75, 0.95],
    maseMax: 1,
    pinballMean: 1.2,
    ...over,
});

const cache = {
    domain: 'gsr.bitrix24.ru',
    scope: 'all' as const,
    deletedDb: 3,
    deletedRedis: 4,
    message: 'Кэш витрины сброшен.',
};

describe('итоги нажатий словами', () => {
    it('смарт: долитые значения перечислением; сбой полей — не ок с подсказкой', () => {
        const ok = smartOutcome({
            entityTypeId: 1040,
            created: false,
            fieldsAdded: [],
            fieldsExisting: ['UF_CRM_7_SUMMARY'],
            fieldsFailed: [],
            enumItemsAdded: ['UF_CRM_7_RISK_FLAGS: door_closed'],
        });
        expect(ok.ok).toBe(true);
        expect(ok.text).toContain('door_closed');
        expect(ok.next).toBe(LAUNCH_STEP_TEXT.smart.next);
        const failed = smartOutcome({
            entityTypeId: 1040,
            created: true,
            fieldsAdded: ['UF_CRM_7_A'],
            fieldsExisting: [],
            fieldsFailed: ['UF_CRM_7_B'],
        });
        expect(failed.ok).toBe(false);
        expect(failed.text).toContain('Не удалось создать полей: 1');
    });

    it('история: поставленные месяцы и «когда догон закончится»; отказ — причиной словами', () => {
        const ok = historyOutcome({
            domain: 'x',
            monthKeys: ['2024-10', '2026-09'],
            jobs: [
                { jobId: 'a', key: '2024-10', rhythm: 'backfill' },
                { jobId: 'b', key: '2026-09', rhythm: 'backfill' },
            ],
            reason: null,
        });
        expect(ok.text).toContain('2 месяца (2024-10 — 2026-09)');
        expect(ok.text).toContain('по одному месяцу, от старых к свежим');
        expect(ok.next).toContain('Когда догон закончится');
        expect(ok.next).toContain('Восстановить прогноз по истории');
        const refused = historyOutcome({
            domain: 'x',
            monthKeys: [],
            jobs: [],
            reason: 'backfill-range-too-wide',
        });
        expect(refused).toMatchObject({
            ok: false,
            text: 'Больше 24 месяцев за раз ручка не принимает.',
        });
    });

    it('проверка точности: пройдено / мало данных / не пройдено с причинами словами / нет проверки', () => {
        expect(backtestVerdict(backtest()).text).toMatch(/^Пройдено/);
        const few = backtestVerdict(
            backtest({
                status: 'insufficient',
                shadowMonths: 4,
                reasons: ['not-enough-months'],
            }),
        );
        expect(few.ok).toBe(false);
        expect(few.text).toContain('теневых месяцев 4 из 9');
        expect(few.text).toContain('Закрытых месяцев с фактом меньше нужного');
        const fail = backtestVerdict(
            backtest({ status: 'fail', reasons: ['coverage-below'] }),
        );
        expect(fail.text).toContain('Не пройдено');
        expect(fail.text).toContain('Факт попадает в вилку реже цели');
        expect(backtestVerdict(null).ok).toBe(false);
    });

    it('переразбор: подсчёт и запуск — разные тексты; не поставлено — причина', () => {
        const base = {
            domain: 'x',
            from: '2026-07-21',
            to: '2026-10-21',
            jobId: 'j',
            reason: null,
            quota: 300,
        };
        expect(
            reanalyzeOutcome({ ...base, dryRun: true, dispatched: true }).text,
        ).toContain('Подсчёт поставлен');
        expect(
            reanalyzeOutcome({ ...base, dryRun: false, dispatched: true }).text,
        ).toContain('Переразбор запущен');
        expect(
            reanalyzeOutcome({
                ...base,
                dryRun: false,
                dispatched: false,
                jobId: null,
                reason: 'нет очереди',
            }),
        ).toMatchObject({ ok: false, text: 'Не запущено: нет очереди.' });
    });

    it('пересборка: без закрытых месяцев — только кэш и пояснение про ночной прогон', () => {
        const outcome = rebuildOutcome(null, cache);
        expect(outcome.ok).toBe(true);
        expect(outcome.text).toContain('ночной прогон');
        expect(outcome.text).toContain('Кэш витрины сброшен.');
    });
});

describe('describeLaunchError', () => {
    it('400 валидации — тексты из errors с кодом ответа', () => {
        const error = {
            message: 'Request failed',
            response: {
                status: 400,
                data: {
                    resultCode: 1,
                    message: 'Validation failed',
                    errors: ['JSON не разбирается'],
                },
            },
        };
        expect(describeLaunchError(error)).toBe(
            `JSON не разбирается (${LAUNCH_TEXT.errorCode} 400)`,
        );
    });

    it('409 — message ответа; нет ответа по таймауту — свой текст; без объекта — заголовок', () => {
        expect(
            describeLaunchError({
                response: {
                    status: 409,
                    data: { message: 'Проверка не пройдена.' },
                },
            }),
        ).toBe(`Проверка не пройдена. (${LAUNCH_TEXT.errorCode} 409)`);
        expect(
            describeLaunchError({ code: 'ECONNABORTED', message: 'timeout' }),
        ).toBe(LAUNCH_TEXT.noResponse);
        expect(describeLaunchError(new Error('Network Error'))).toBe(
            'Network Error',
        );
        expect(describeLaunchError(null)).toBe(LAUNCH_TEXT.errorTitle);
    });
});

describe('reanalyzeProgress', () => {
    it('первая часть — точная доля; следующие — «≈»; конец — 100 %', () => {
        const first = reanalyzeProgress({
            part: 1,
            candidates: 400,
            done: 100,
            failed: 0,
            price: 60,
            finished: false,
        });
        expect(first.share).toBe(0.25);
        expect(first.countText).toBe('100 из 400');
        const second = reanalyzeProgress({
            part: 2,
            candidates: 100,
            done: 300,
            failed: 2,
            price: 200,
            finished: false,
        });
        expect(second.share).toBe(0.75);
        expect(second.countText).toBe('300 из ≈ 400');
        expect(second.text).toContain('сбоев 2');
        expect(
            reanalyzeProgress({
                part: 2,
                candidates: 0,
                done: 400,
                failed: 0,
                price: 300,
                finished: true,
            }).share,
        ).toBe(1);
    });
});
