import type { AiAnalyticsLaunchHelper } from './api/ai-analytics-launch-helper';
import {
    closedMonthsOf,
    historyRange,
    lastClosedMonth,
    reanalysisPeriod,
} from './launch-period';
import {
    cacheOutcome,
    checkOutcome,
    historyOutcome,
    reanalyzeOutcome,
    rebuildOutcome,
    restoreOutcome,
    showOutcome,
    smartOutcome,
} from './launch-results';
import type {
    LaunchOutcome,
    LaunchPeriod,
    LaunchStatus,
    LaunchStepCode,
} from '../model';

/**
 * Что делает кнопка каждого шага: какие ручки зовёт и с какими периодами.
 * Периоды считаются здесь же (владелец ничего не вводит); helper
 * передаётся снаружи — в спеке его заменяет подделка.
 */
type LaunchApi = Pick<
    AiAnalyticsLaunchHelper,
    | 'installSmart'
    | 'resetCache'
    | 'backfill'
    | 'restoreForecast'
    | 'checkForecast'
    | 'showForecast'
    | 'reanalyze'
>;

export interface LaunchActionContext {
    domain: string;
    status: LaunchStatus | undefined;
    now: Date;
    /** Только для «Показать прогноз»: в обход проверки (разработчик). */
    force?: boolean;
}

/** Период запуска переразбора — тот же, что у последнего подсчёта. */
export function reanalysisRunPeriod(
    status: LaunchStatus | undefined,
    now: Date,
): LaunchPeriod {
    const run = status?.reanalysis.run ?? null;
    return run
        ? { from: run.from, to: run.to }
        : reanalysisPeriod(status?.reanalysis.analysisSince, now);
}

export async function runLaunchStep(
    api: LaunchApi,
    code: LaunchStepCode,
    context: LaunchActionContext,
): Promise<LaunchOutcome> {
    const { domain, status, now } = context;
    switch (code) {
        case 'smart':
            return smartOutcome(await api.installSmart(domain));
        case 'cache':
            return cacheOutcome(await api.resetCache(domain));
        case 'history':
            return historyOutcome(
                await api.backfill(domain, historyRange(now)),
            );
        case 'forecast-restore': {
            const monthKey = lastClosedMonth(now);
            return restoreOutcome(
                await api.restoreForecast(domain, monthKey),
                monthKey,
            );
        }
        case 'forecast-check':
            return checkOutcome(await api.checkForecast(domain));
        case 'forecast-show':
            return showOutcome(
                await api.showForecast(domain, context.force === true),
            );
        case 'reanalyze-count':
            return reanalyzeOutcome(
                await api.reanalyze(
                    domain,
                    reanalysisPeriod(status?.reanalysis.analysisSince, now),
                    true,
                ),
            );
        case 'reanalyze-run':
            return reanalyzeOutcome(
                await api.reanalyze(
                    domain,
                    reanalysisRunPeriod(status, now),
                    false,
                ),
            );
        case 'rebuild': {
            const months = closedMonthsOf(
                reanalysisRunPeriod(status, now),
                now,
            );
            const backfill = months ? await api.backfill(domain, months) : null;
            return rebuildOutcome(backfill, await api.resetCache(domain));
        }
    }
}
