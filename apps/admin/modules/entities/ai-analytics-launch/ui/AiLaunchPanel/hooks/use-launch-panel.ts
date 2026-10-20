'use client';

import { useEffect, useState } from 'react';
import {
    reanalysisRunPeriod,
    runLaunchStep,
} from '../../../lib/launch-actions';
import { describeLaunchError } from '../../../lib/launch-error';
import { reanalysisPeriod } from '../../../lib/launch-period';
import {
    buildLaunchSteps,
    isReanalysisRunning,
    type LaunchSessionState,
} from '../../../lib/launch-steps';
import {
    launchHelper,
    useLaunchAction,
    useLaunchStatus,
    useReanalyzeProgress,
    useRefreshLaunchStatus,
} from '../../../lib/hooks';
import type { LaunchOutcome, LaunchStepCode } from '../../../model';

export interface LaunchStepResult {
    outcome?: LaunchOutcome;
    error?: string;
}

/** Запас на расхождение часов браузера и сервера при сравнении моментов. */
const CLOCK_SKEW_MS = 2 * 60 * 1000;

/** Чего ждёт опрос: подсчёта или боевого прогона, начатого в этом сеансе. */
interface Awaiting {
    mode: 'count' | 'run';
    /** Момент нажатия: статус старше — это прошлый прогон, не наш. */
    since: string;
}

/**
 * Состояние панели запуска: сводка, шаги, итоги нажатий в этом сеансе и
 * опрос статуса переразбора раз в 30 секунд, пока он идёт (или пока ждём
 * начатый отсюда подсчёт / запуск). Закончился — сводка перечитывается.
 */
export function useLaunchPanel(domain: string | undefined) {
    const status = useLaunchStatus(domain);
    const action = useLaunchAction(domain);
    const refresh = useRefreshLaunchStatus(domain);
    const [results, setResults] = useState<
        Partial<Record<LaunchStepCode, LaunchStepResult>>
    >({});
    const [activeCode, setActiveCode] = useState<LaunchStepCode | null>(null);
    const [awaiting, setAwaiting] = useState<Awaiting | null>(null);
    const now = new Date();

    // Другой портал — чужие итоги и ожидания не должны висеть.
    useEffect(() => {
        setResults({});
        setAwaiting(null);
    }, [domain]);

    const session: LaunchSessionState = {
        cacheReset:
            results.cache?.outcome?.ok === true ||
            results.rebuild?.outcome !== undefined,
        rebuilt: results.rebuild?.outcome?.ok === true,
    };
    const steps = buildLaunchSteps(status.data, session, now);

    const run = status.data?.reanalysis.run ?? null;
    const running = isReanalysisRunning(run);
    const progressPeriod =
        awaiting?.mode === 'count'
            ? reanalysisPeriod(status.data?.reanalysis.analysisSince, now)
            : reanalysisRunPeriod(status.data, now);
    const polling = !!domain && (running || awaiting !== null);
    const progress = useReanalyzeProgress(domain, progressPeriod, polling);
    const polledRun = progress.data?.run ?? null;

    useEffect(() => {
        if (!polledRun?.finished) return;
        const fresh =
            awaiting === null || polledRun.updatedAt >= awaiting.since;
        const countDone = awaiting?.mode === 'count' && polledRun.dryRun;
        const runDone =
            (awaiting?.mode === 'run' || running) && !polledRun.dryRun;
        if (fresh && (countDone || runDone)) {
            setAwaiting(null);
            void refresh();
        }
        // Реагируем только на новый статус опроса.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [polledRun?.updatedAt, polledRun?.finished]);

    const runStep = (code: LaunchStepCode, force = false): void => {
        if (!domain) return;
        const startedAt = new Date();
        setActiveCode(code);
        action.mutate(
            () =>
                runLaunchStep(launchHelper, code, {
                    domain,
                    status: status.data,
                    now: startedAt,
                    force,
                }),
            {
                onSuccess: outcome => {
                    setResults(current => ({
                        ...current,
                        [code]: { outcome },
                    }));
                    if (
                        outcome.ok &&
                        (code === 'reanalyze-count' || code === 'reanalyze-run')
                    ) {
                        setAwaiting({
                            mode: code === 'reanalyze-count' ? 'count' : 'run',
                            since: new Date(
                                startedAt.getTime() - CLOCK_SKEW_MS,
                            ).toISOString(),
                        });
                    }
                },
                onError: error =>
                    setResults(current => ({
                        ...current,
                        [code]: { error: describeLaunchError(error) },
                    })),
                onSettled: () => setActiveCode(null),
            },
        );
    };

    const progressRun =
        polledRun && !polledRun.dryRun
            ? polledRun
            : run && !run.dryRun
              ? run
              : null;

    return {
        status,
        steps,
        results,
        activeCode,
        busy: action.isPending,
        runStep,
        refresh,
        progressRun,
        countPeriod: reanalysisPeriod(
            status.data?.reanalysis.analysisSince,
            now,
        ),
    };
}
