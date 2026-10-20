'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    LAUNCH_POLL_MS,
    LAUNCH_STATUS_STALE_MS,
} from '../../consts/ai-analytics-launch.const';
import type { LaunchOutcome, LaunchPeriod } from '../../model';
import { AiAnalyticsLaunchHelper } from '../api/ai-analytics-launch-helper';

export const launchHelper = new AiAnalyticsLaunchHelper();

/** Общий префикс ключей кэша панели запуска. */
export const AI_ANALYTICS_LAUNCH_KEY = ['ai-analytics-launch'] as const;

const statusKey = (domain: string | undefined) =>
    [...AI_ANALYTICS_LAUNCH_KEY, 'status', domain ?? ''] as const;

/** Сводка запуска по домену портала. */
export const useLaunchStatus = (domain: string | undefined) =>
    useQuery({
        queryKey: statusKey(domain),
        queryFn: () => launchHelper.status(domain as string),
        enabled: !!domain,
        staleTime: LAUNCH_STATUS_STALE_MS,
        retry: false,
    });

/**
 * Статус идущего переразбора: опрос раз в 30 секунд, пока страница
 * открыта и вкладка видна (в фоне react-query опрос не ведёт).
 */
export const useReanalyzeProgress = (
    domain: string | undefined,
    period: LaunchPeriod | null,
    polling: boolean,
) =>
    useQuery({
        queryKey: [
            ...AI_ANALYTICS_LAUNCH_KEY,
            'reanalyze',
            domain ?? '',
            period?.from ?? '',
            period?.to ?? '',
        ],
        queryFn: () =>
            launchHelper.reanalyzeStatus(
                domain as string,
                period as LaunchPeriod,
            ),
        enabled: !!domain && period !== null && polling,
        refetchInterval: polling ? LAUNCH_POLL_MS : false,
        refetchIntervalInBackground: false,
        retry: false,
    });

/**
 * Нажатие кнопки шага: выполняет действие и переводит ответ в текст;
 * после успеха перечитывает сводку — галочки обновляются сами.
 */
export const useLaunchAction = (domain: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (run: () => Promise<LaunchOutcome>) => run(),
        onSettled: () =>
            queryClient.invalidateQueries({ queryKey: statusKey(domain) }),
    });
};

/** Перечитать сводку вручную (кнопка «Обновить состояние»). */
export const useRefreshLaunchStatus = (domain: string | undefined) => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: statusKey(domain) });
};
