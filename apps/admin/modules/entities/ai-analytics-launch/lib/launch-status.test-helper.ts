import type { LaunchReanalysisRun, LaunchStatus } from '../model';

/** Сводка портала для спек панели: «ничего не сделано» и точечные правки. */
export const DOMAIN = 'gsr.bitrix24.ru';
export const NOW = new Date(2026, 9, 21, 12, 0, 0);

export const launchRun = (
    over: Partial<LaunchReanalysisRun> = {},
): LaunchReanalysisRun => ({
    from: '2026-07-21',
    to: '2026-10-20',
    dryRun: true,
    finished: true,
    stale: false,
    part: 1,
    candidates: 400,
    done: 0,
    failed: 0,
    skipped: 30,
    tokens: 0,
    price: 0,
    updatedAt: '2026-10-21T08:00:00.000Z',
    lastError: null,
    estimatedTokens: 3600000,
    estimatedPrice: 1000,
    estimateMessage: null,
    progressShare: 1,
    ...over,
});

export function launchStatus(
    over: {
        smart?: Partial<LaunchStatus['smart']>;
        pipeline?: Partial<LaunchStatus['pipeline']>;
        forecast?: Partial<LaunchStatus['forecast']>;
        reanalysis?: Partial<LaunchStatus['reanalysis']>;
    } = {},
): LaunchStatus {
    return {
        domain: DOMAIN,
        checkedAt: NOW.toISOString(),
        settings: {
            state: 'done',
            text: 'AI-аналитика и разбор звонков включены.',
            aiAnalyticsEnabled: true,
            callAnalysisEnabled: true,
            pilotSize: 2,
        },
        smart: {
            state: 'todo',
            text: 'Смарту не хватает значений (2).',
            installed: true,
            doorClosed: false,
            eventInvite: false,
            missingValues: [
                'RISK_FLAGS: door_closed',
                'CALL_TYPE: event_invite',
            ],
            ...over.smart,
        },
        pipeline: {
            state: 'todo',
            text: 'История за 24 месяца ещё не догонялась.',
            lastBackfill: null,
            lastMonthly: null,
            lastNightly: null,
            backfillMonths: 0,
            backfillMonthsTarget: 24,
            backfillRunning: false,
            ...over.pipeline,
        },
        forecast: {
            state: 'todo',
            text: 'Проверки точности прогноза ещё не было.',
            status: null,
            monthKey: null,
            generatedAt: null,
            shadowMonths: null,
            shadowMinMonths: null,
            replayedMonths: null,
            reasons: [],
            reasonTexts: [],
            stageEnabled: false,
            recommendationsStageEnabled: false,
            ...over.forecast,
        },
        reanalysis: {
            state: 'todo',
            text: 'Переразбора на портале ещё не было.',
            analysisSince: '2026-07-21',
            run: null,
            ...over.reanalysis,
        },
        cost: {
            state: 'done',
            text: 'Расход модели за 2026-10: 0 токенов, 0 ₽.',
            month: '2026-10',
            tokens: 0,
            price: 0,
            estimated: false,
        },
    };
}
