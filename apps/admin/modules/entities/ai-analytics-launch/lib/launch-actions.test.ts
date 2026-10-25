import { describe, expect, it, vi } from 'vitest';
import { LAUNCH_RECOMPUTE_STEPS } from '../consts/ai-analytics-launch.const';
import { reanalysisRunPeriod, runLaunchStep } from './launch-actions';
import {
    DOMAIN,
    launchRun,
    launchStatus,
    NOW,
} from './launch-status.test-helper';

const cache = {
    domain: DOMAIN,
    scope: 'all' as const,
    deletedDb: 1,
    deletedRedis: 1,
    message: 'Кэш витрины сброшен.',
};
const backfill = {
    domain: DOMAIN,
    monthKeys: ['2026-07'],
    jobs: [],
    reason: null,
};
const reanalyzeResult = {
    domain: DOMAIN,
    from: '2026-07-21',
    to: '2026-10-21',
    dryRun: true,
    dispatched: true,
    jobId: 'j',
    reason: null,
    quota: 300,
};

function fakeApi() {
    return {
        installSmart: vi.fn(),
        resetCache: vi.fn().mockResolvedValue(cache),
        backfill: vi.fn().mockResolvedValue(backfill),
        restoreForecast: vi.fn().mockResolvedValue({
            domain: DOMAIN,
            job: { jobId: 'r', key: '2026-09', rhythm: 'monthly' },
            forceRefresh: true,
        }),
        checkForecast: vi
            .fn()
            .mockResolvedValue({ domain: DOMAIN, months: 1, items: [] }),
        showForecast: vi.fn().mockResolvedValue({
            domain: DOMAIN,
            forecastStageEnabled: true,
            recommendationsStageEnabled: false,
            changed: ['forecast_stage_enabled'],
            forced: false,
            forecastUrl: '/ai-analytics/model',
            message: 'Прогноз показывается в отчёте.',
        }),
        reanalyze: vi.fn().mockResolvedValue(reanalyzeResult),
    };
}

describe('runLaunchStep — что зовёт кнопка каждого шага', () => {
    it('история — 24 закрытых месяца; восстановление — прошлый месяц с шагами журнала прогноза', async () => {
        const api = fakeApi();
        const context = { domain: DOMAIN, status: launchStatus(), now: NOW };
        await runLaunchStep(api as never, 'history', context);
        // Пересчёт заново (force): иначе очередь молча пропускает месяцы,
        // которые уже догонялись (gsr 21.10.2026: «1 из 9»).
        expect(api.backfill).toHaveBeenCalledWith(
            DOMAIN,
            { from: '2024-10', to: '2026-09' },
            true,
        );
        const restore = await runLaunchStep(
            api as never,
            'forecast-restore',
            context,
        );
        expect(api.restoreForecast).toHaveBeenCalledWith(DOMAIN, '2026-09');
        expect(restore.text).toContain('2026-09');
        expect(LAUNCH_RECOMPUTE_STEPS).toContain('forecast-log-replay');
    });

    it('показать прогноз — force только по ссылке разработчика', async () => {
        const api = fakeApi();
        await runLaunchStep(api as never, 'forecast-show', {
            domain: DOMAIN,
            status: undefined,
            now: NOW,
        });
        expect(api.showForecast).toHaveBeenLastCalledWith(DOMAIN, false);
        await runLaunchStep(api as never, 'forecast-show', {
            domain: DOMAIN,
            status: undefined,
            now: NOW,
            force: true,
        });
        expect(api.showForecast).toHaveBeenLastCalledWith(DOMAIN, true);
    });

    it('подсчёт — с первого дня разборов по сегодня; запуск — тот же период, что у подсчёта', async () => {
        const api = fakeApi();
        await runLaunchStep(api as never, 'reanalyze-count', {
            domain: DOMAIN,
            status: launchStatus({
                reanalysis: { analysisSince: '2026-08-01' },
            }),
            now: NOW,
        });
        expect(api.reanalyze).toHaveBeenLastCalledWith(
            DOMAIN,
            { from: '2026-08-01', to: '2026-10-21' },
            true,
        );

        const counted = launchStatus({
            reanalysis: {
                run: launchRun({ from: '2026-07-21', to: '2026-10-20' }),
            },
        });
        await runLaunchStep(api as never, 'reanalyze-run', {
            domain: DOMAIN,
            status: counted,
            now: NOW,
        });
        expect(api.reanalyze).toHaveBeenLastCalledWith(
            DOMAIN,
            { from: '2026-07-21', to: '2026-10-20' },
            false,
        );
    });

    it('пересборка — догон закрытых месяцев периода и сброс кэша; без закрытых — только кэш', async () => {
        const api = fakeApi();
        const finished = launchStatus({
            reanalysis: { run: launchRun({ dryRun: false, finished: true }) },
        });
        const outcome = await runLaunchStep(api as never, 'rebuild', {
            domain: DOMAIN,
            status: finished,
            now: NOW,
        });
        expect(api.backfill).toHaveBeenCalledWith(
            DOMAIN,
            { from: '2026-07', to: '2026-09' },
            true,
        );
        expect(api.resetCache).toHaveBeenCalledWith(DOMAIN);
        expect(outcome.text).toContain('Кэш витрины сброшен.');

        const thisMonth = launchStatus({
            reanalysis: {
                run: launchRun({
                    dryRun: false,
                    finished: true,
                    from: '2026-10-01',
                    to: '2026-10-20',
                }),
            },
        });
        const api2 = fakeApi();
        await runLaunchStep(api2 as never, 'rebuild', {
            domain: DOMAIN,
            status: thisMonth,
            now: NOW,
        });
        expect(api2.backfill).not.toHaveBeenCalled();
        expect(api2.resetCache).toHaveBeenCalledTimes(1);
    });

    it('reanalysisRunPeriod: без прогона — период подсчёта', () => {
        expect(reanalysisRunPeriod(undefined, NOW)).toEqual({
            from: '2026-07-21',
            to: '2026-10-21',
        });
    });
});
